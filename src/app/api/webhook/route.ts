import { NextResponse } from "next/server";
import { getLocalDateKey, normalizeTime } from "@/lib/alarm-time";
import {
  findUserByPhone,
  getUserDailyLog,
  updateUserDailyLog,
} from "@/lib/firestore-rest";

function parseIsSnooze(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret = process.env.BLAND_SNOOZE_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "BLAND_SNOOZE_WEBHOOK_SECRET is not configured." },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      phone_number?: unknown;
      is_snooze?: unknown;
    };
    const phoneNumber =
      typeof body.phone_number === "string" ? body.phone_number.trim() : "";
    const isSnooze = parseIsSnooze(body.is_snooze);

    if (!phoneNumber) {
      return NextResponse.json({ error: "phone_number is required." }, { status: 400 });
    }

    if (isSnooze == null) {
      return NextResponse.json({ error: "is_snooze is required." }, { status: 400 });
    }

    const user = await findUserByPhone(phoneNumber);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const timezone =
      normalizeTime(user.time, user.timezone || "UTC")?.timezone ||
      user.timezone ||
      "UTC";
    const dateKey = getLocalDateKey(now, timezone);
    const currentLog = await getUserDailyLog(user.id, dateKey);

    await updateUserDailyLog(user.id, dateKey, {
      date: dateKey,
      timezone,
      triggeredCallTimes: currentLog?.triggeredCallTimes || [],
      responseTimes: [...(currentLog?.responseTimes || []), nowIso],
      snoozeResponseTimes: isSnooze
        ? [...(currentLog?.snoozeResponseTimes || []), nowIso]
        : currentLog?.snoozeResponseTimes || [],
      wakeUpResponseTimes: isSnooze
        ? currentLog?.wakeUpResponseTimes || []
        : [...(currentLog?.wakeUpResponseTimes || []), nowIso],
      snoozeCount: currentLog?.snoozeCount || 0,
      checkedInAt: currentLog?.checkedInAt,
      lastResponseAt: nowIso,
      lastResponseIsSnooze: isSnooze,
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      isSnooze,
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
