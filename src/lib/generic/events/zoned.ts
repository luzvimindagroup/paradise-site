// Convert between a wall-clock time in a named time zone (what you type into the admin form)
// and the exact moment in UTC (what the database stores). Handles daylight saving.

function offsetMs(utcMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const n = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const wallAsUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return wallAsUtc - Math.floor(utcMs / 1000) * 1000;
}

/** "2027-04-10T19:00" typed in `tz` -> "2027-04-11T02:00:00.000Z". Returns null if the text isn't a valid date-time. */
export function zonedToUtcIso(naive: string, tz: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(naive);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi);
  if (Number.isNaN(asIfUtc)) return null;
  let utc = asIfUtc - offsetMs(asIfUtc, tz);
  utc = asIfUtc - offsetMs(utc, tz); // second pass settles dates near a daylight-saving change
  const iso = new Date(utc).toISOString();
  // Reject dates that only "work" by rolling over (Feb 31, month 13, hour 25) or don't exist (the spring-forward gap).
  return utcToZonedInput(iso, tz) === naive ? iso : null;
}

/** Stored UTC moment -> "2027-04-10T19:00" for the admin form's date-time box. */
export function utcToZonedInput(iso: string, tz: string): string {
  const ms = Date.parse(iso);
  return new Date(ms + offsetMs(ms, tz)).toISOString().slice(0, 16);
}

/** "Sat, Apr 10, 7:00 PM" in `tz`. */
export function formatZoned(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(new Date(iso));
}

/** "10/18/26, 7:15 PM" in `tz`: a full date for exports and records. */
export function formatZonedFull(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

/** Today's date as YYYY-MM-DD in `tz` (not UTC, so an evening entry isn't dated tomorrow). */
export function todayIn(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}
