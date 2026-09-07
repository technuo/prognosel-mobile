/**
 * Sweden is a single time zone (Europe/Stockholm) with DST transitions.
 * Nord Pool timestamps and NordAPI `hour_start` values are UTC ISO strings,
 * so every "which hour is this" label must be resolved in Stockholm time —
 * never in the server's default zone (serverless functions run in UTC, and
 * the client may be anywhere).
 */

export const SWEDEN_TZ = "Europe/Stockholm";

/** Hour (0–23) of an ISO timestamp in a given time zone. */
export function hourInZone(iso: string, timeZone: string = SWEDEN_TZ): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  // Some engines report midnight as "24" with hour12:false
  return hour === 24 ? 0 : hour;
}

/** "HH:00" label of an ISO timestamp in a given time zone. */
export function hourLabelInZone(iso: string, timeZone: string = SWEDEN_TZ): string {
  return `${String(hourInZone(iso, timeZone)).padStart(2, "0")}:00`;
}
