import { NextResponse } from "next/server";
import { getNextAlarmISO, isCurrentAlarmMinute, normalizeTime } from "@/lib/alarm-time";
import {
  listUsersReadyForAlarm,
  listUsersWithAlarmPreferences,
  updateUserNextAlarmTime,
} from "@/lib/firestore-rest";

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
      if (!user.phone) {
        skipped.push({ id: user.id, reason: "missing_phone" });
      } else if (!pathwayId) {
        skipped.push({ id: user.id, reason: "missing_pathway_id" });
      } else {
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
            triggered.push(user.id);
          }
        } catch (err) {
          skipped.push({ id: user.id, reason: "bland_call_error" });
          console.error("Error triggering bland call:", err);
        }
      }

      // Reschedule from user's preferred time + timezone so we stay consistent with DB.
      const tz = typeof user.timezone === "string" ? user.timezone : "UTC";
      const pref = normalizeTime(user.time, tz);
      const nextAlarmTime = pref
        ? getNextAlarmISO(pref.hours, pref.minutes, pref.timezone, new Date())
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await updateUserNextAlarmTime(user.id, nextAlarmTime);
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
