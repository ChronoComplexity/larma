/**
 * Alarm time utilities. Single source of truth: user's preferred time is
 * { hours, minutes, timezone }. nextAlarmTime (ISO string) is always derived
 * from that for cron/scheduling.
 */

export interface AlarmTimePreference {
  hours: number;
  minutes: number;
  timezone: string;
}

type ZonedTimeParts = {
  hour: number;
  minute: number;
};

function getZonedTimeParts(date: Date, timezone: string): ZonedTimeParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const part = (k: string) => parts.find((p) => p.type === k)?.value ?? "0";

  return {
    hour: parseInt(part("hour"), 10),
    minute: parseInt(part("minute"), 10),
  };
}

/**
 * Returns the next UTC moment when the clock in the given timezone shows
 * (hours, minutes). Uses Intl only; scans minute-by-minute for up to 2 days.
 */
export function getNextAlarmISO(
  hours: number,
  minutes: number,
  timezone: string,
  after: Date = new Date()
): string {
  const stepMs = 60 * 1000;
  const maxSteps = 2 * 24 * 60;
  let t = Math.floor(after.getTime() / stepMs) * stepMs + stepMs;
  for (let i = 0; i < maxSteps; i++) {
    const date = new Date(t);
    const zoned = getZonedTimeParts(date, timezone);
    if (zoned.hour === hours && zoned.minute === minutes) {
      return date.toISOString();
    }
    t += stepMs;
  }
  // fallback: 24h from after
  return new Date(after.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

export function isCurrentAlarmMinute(
  hours: number,
  minutes: number,
  timezone: string,
  now: Date = new Date()
): boolean {
  const zoned = getZonedTimeParts(now, timezone);
  return zoned.hour === hours && zoned.minute === minutes;
}

/**
 * Normalize user doc time field: may be { hours, minutes } with top-level timezone
 * or { hours, minutes, timezone }. Returns single shape { hours, minutes, timezone }.
 */
export function normalizeTime(
  time: unknown,
  fallbackTimezone: string
): AlarmTimePreference | null {
  if (!time || typeof time !== "object") return null;
  const o = time as Record<string, unknown>;
  const h = typeof o.hours === "number" ? o.hours : null;
  const m = typeof o.minutes === "number" ? o.minutes : null;
  if (h == null || m == null || h < 0 || h > 23 || m < 0 || m > 59) return null;
  const tz =
    (typeof o.timezone === "string" ? o.timezone : null) || fallbackTimezone;
  return { hours: h, minutes: m, timezone: tz };
}
