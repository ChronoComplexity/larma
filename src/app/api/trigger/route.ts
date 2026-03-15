import { NextResponse } from "next/server";
import {
  DEFAULT_SNOOZE_MINUTES,
  getLocalDateKey,
  getNextAlarmISO,
  isCurrentAlarmMinute,
  normalizeTime,
} from "@/lib/alarm-time";
import {
  getUserDailyLog,
  listUsersReadyForAlarm,
  listUsersWithAlarmPreferences,
  updateUserDailyLog,
  updateUserFields,
} from "@/lib/firestore-rest";

function clampHealth(value: number): number {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const CRON_SECRET = process.env.CRON_SECRET || process.env.BLAND_API_KEY;

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const scheduledUsers = await listUsersReadyForAlarm(nowIso);
    const fallbackCandidates = await listUsersWithAlarmPreferences();
    const usersById = new Map(scheduledUsers.map((user) => [user.id, user]));
    let dueByFallbackCount = 0;

    for (const user of fallbackCandidates) {
      if (usersById.has(user.id)) continue;

      const tz = typeof user.timezone === "string" ? user.timezone : "UTC";
      const pref = normalizeTime(user.time, tz);
      if (!pref) continue;

      if (!isCurrentAlarmMinute(pref.hours, pref.minutes, pref.timezone, now)) continue;

      // Self-heal older docs whose derived nextAlarmTime was computed incorrectly.
      const expectedNextAlarm = getNextAlarmISO(pref.hours, pref.minutes, pref.timezone, now);
      if (user.nextAlarmTime !== expectedNextAlarm) {
        usersById.set(user.id, user);
        dueByFallbackCount += 1;
      }
    }

    const users = Array.from(usersById.values());
    const triggered: string[] = [];
    const skipped: Array<{ id: string; reason: string }> = [];
    const pathwayId =
      process.env.BLAND_PATHWAY_ID || process.env.NEXT_PUBLIC_BLAND_PATHWAY_ID;

    for (const user of users) {
      const tz = typeof user.timezone === "string" ? user.timezone : "UTC";
      const pref = normalizeTime(user.time, tz);
      let shouldRepeatUntilCheckIn = false;

      if (!user.phone) {
        skipped.push({ id: user.id, reason: "missing_phone" });
      } else if (!pathwayId) {
        skipped.push({ id: user.id, reason: "missing_pathway_id" });
      } else {
        const timezone = pref?.timezone || tz;
        const dateKey = getLocalDateKey(now, timezone);
        const dailyLog = await getUserDailyLog(user.id, dateKey);
        const isFollowUpCall =
          Boolean(dailyLog && !dailyLog.checkedInAt && dailyLog.triggeredCallTimes.length > 0);
        const penalty = isFollowUpCall
          ? dailyLog?.lastResponseIsSnooze === false
            ? 15
            : 10
          : 0;

        try {
          const res = await fetch("https://api.bland.ai/v1/calls", {
            method: "POST",
            headers: {
              Authorization: process.env.BLAND_API_KEY || "",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone_number: user.phone,
              pathway_id: pathwayId,
            }),
          });
          const blandRes: unknown = await res.json();
          if (!res.ok) {
            skipped.push({ id: user.id, reason: "bland_call_failed" });
            console.error("Failed to trigger bland call for user", user.id, blandRes);
          } else {
            await updateUserDailyLog(user.id, dateKey, {
              date: dateKey,
              timezone,
              triggeredCallTimes: [...(dailyLog?.triggeredCallTimes || []), nowIso],
              responseTimes: dailyLog?.responseTimes || [],
              snoozeResponseTimes: dailyLog?.snoozeResponseTimes || [],
              wakeUpResponseTimes: dailyLog?.wakeUpResponseTimes || [],
              snoozeCount: (dailyLog?.snoozeCount || 0) + (isFollowUpCall ? 1 : 0),
              checkedInAt: dailyLog?.checkedInAt,
              lastResponseAt: dailyLog?.lastResponseAt,
              lastResponseIsSnooze: dailyLog?.lastResponseIsSnooze,
            });

            if (penalty > 0) {
              await updateUserFields(user.id, {
                health: clampHealth((user.health ?? 100) - penalty),
              });
            }

            shouldRepeatUntilCheckIn = true;
            triggered.push(user.id);
          }
        } catch (err) {
          skipped.push({ id: user.id, reason: "bland_call_error" });
          console.error("Error triggering bland call:", err);
        }
      }

      const nextAlarmTime =
        shouldRepeatUntilCheckIn
          ? new Date(
              now.getTime() +
                (user.snoozeMinutes || DEFAULT_SNOOZE_MINUTES) * 60 * 1000
            ).toISOString()
          : pref
            ? getNextAlarmISO(pref.hours, pref.minutes, pref.timezone, new Date())
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await updateUserFields(user.id, { nextAlarmTime });
    }

    return NextResponse.json({
      success: true,
      count: triggered.length,
      triggered,
      dueCount: users.length,
      dueByNextAlarmCount: scheduledUsers.length,
      dueByFallbackCount,
      skipped,
    });
  } catch (error: unknown) {
    console.error("Trigger error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
