import { SWEDEN_TZ } from "@/lib/time";

/**
 * Streak helpers.
 *
 * A streak is derived from the DAYS on which the user completed at least one
 * task (server data, `tasks.completed_at`). Deriving it instead of keeping a
 * counter in localStorage means the streak survives a device change and can
 * not drift from the tasks themselves.
 */

/** "YYYY-MM-DD" for a moment in Swedish local time. */
export function stockholmDateKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("sv-SE", { timeZone: SWEDEN_TZ });
}

/**
 * Number of consecutive days with ≥1 completion, ending today — or yesterday,
 * so a streak stays alive until the current day is over.
 */
export function computeStreakFromDates(
  dates: string[],
  today: string = stockholmDateKey()
): number {
  const set = new Set(dates.filter(Boolean));
  if (set.size === 0) return 0;

  const DAY_MS = 86_400_000;
  // Anchor at noon UTC so DST shifts can never move the calendar day.
  const toTs = (key: string) => new Date(`${key}T12:00:00Z`).getTime();

  let cursor = toTs(today);
  if (!set.has(today)) {
    const yesterday = new Date(cursor - DAY_MS).toISOString().slice(0, 10);
    if (!set.has(yesterday)) return 0;
    cursor -= DAY_MS;
  }

  let streak = 0;
  while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}
