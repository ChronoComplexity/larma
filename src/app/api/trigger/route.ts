import { NextResponse } from "next/server";
import { getNextAlarmISO, normalizeTime } from "@/lib/alarm-time";
import {
    listUsersReadyForAlarm,
    updateUserNextAlarmTime,
} from "@/lib/firestore-rest";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const CRON_SECRET = process.env.CRON_SECRET || process.env.BLAND_API_KEY;

        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const nowIso = new Date().toISOString();
        const users = await listUsersReadyForAlarm(nowIso);

        const triggered = [];

        for (const user of users) {
            triggered.push(user.id);

            // Trigger the call via Bland
            if (user.phone) {
                try {
                    const res = await fetch("https://api.bland.ai/v1/calls", {
                        method: "POST",
                        headers: {
                            "Authorization": process.env.BLAND_API_KEY || "",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            phone_number: user.phone,
                            pathway_id: process.env.NEXT_PUBLIC_BLAND_PATHWAY_ID,
                        }),
                    });
                    const blandRes: unknown = await res.json();
                    if (!res.ok) {
                        console.error("Failed to trigger bland call for user", user.id, blandRes);
                    }
                } catch (err) {
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

        return NextResponse.json({ success: true, count: triggered.length, triggered });
    } catch (error: unknown) {
        console.error("Trigger error:", error);
        const message =
            error instanceof Error ? error.message : "Internal Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
