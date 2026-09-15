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

const DATES_KEY = "prognosel-completed-dates";
const MAX_LOCAL_DATES = 400;

/**
 * Device-side record of completion dates.
 *
 * The server (`tasks.completed_at`) is the primary source, but that column is
 * not guaranteed to exist in every deployment. Keeping a local record as well
 * means the streak still counts correctly even then, and that history is
 * preserved should the column be added later.
 */
export function loadLocalCompletionDates(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DATES_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((d): d is string => typeof d === "string")
      : [];
  } catch {
    return [];
  }
}

/** Record that the user completed something today; returns the updated list. */
export function addLocalCompletionDate(key: string = stockholmDateKey()): string[] {
  if (typeof window === "undefined") return [];
  const dates = loadLocalCompletionDates();
  if (dates.includes(key)) return dates;
  const next = [key, ...dates].slice(0, MAX_LOCAL_DATES);
  try {
    localStorage.setItem(DATES_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** Union of two date lists (deduplicated). */
export function mergeDates(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b].filter(Boolean)));
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
