/**
 * Shared electricity-price window helpers.
 *
 * Used by BOTH the Sparky chat API (server) and the app UI (client) so that
 * the recommended window and the savings figure are computed identically
 * everywhere — the chat answer, the suggestion card and the planner can never
 * contradict each other.
 */

export interface PricePoint {
  /** "HH:00" in local Swedish time, hours sorted ascending. */
  hour: string;
  price: number;
}

export interface BestWindow {
  start: string;
  /** First hour AFTER the window (exclusive end), e.g. window 23:00–02:00. */
  end: string;
  avg: number;
  hours: PricePoint[];
}

/** "HH:00" label for a numeric hour (0–23). */
export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function nextHourLabel(label: string): string {
  const h = (parseInt(label, 10) + 1) % 24;
  return hourLabel(h);
}

/** Cheapest CONTIGUOUS window of `length` hours (input must be sorted by hour). */
export function bestContiguousWindow(
  hours: PricePoint[],
  length: number
): BestWindow | null {
  if (hours.length < length) return null;

  let best: { index: number; avg: number } | null = null;
  for (let i = 0; i + length <= hours.length; i++) {
    const slice = hours.slice(i, i + length);
    const avg = slice.reduce((sum, h) => sum + h.price, 0) / length;
    if (!best || avg < best.avg) best = { index: i, avg };
  }
  if (!best) return null;

  const slice = hours.slice(best.index, best.index + length);
  const after = hours[best.index + length];

  return {
    start: slice[0].hour,
    end: after ? after.hour : nextHourLabel(slice[slice.length - 1].hour),
    avg: best.avg,
    hours: slice,
  };
}

/**
 * Up to `count` best non-overlapping windows (greedy: take the best window,
 * remove its hours, repeat). Used by the weekly planner.
 */
export function topContiguousWindows(
  hours: PricePoint[],
  length: number,
  count: number
): BestWindow[] {
  let pool = [...hours];
  const result: BestWindow[] = [];

  for (let i = 0; i < count; i++) {
    const win = bestContiguousWindow(pool, length);
    if (!win) break;
    result.push(win);
    const used = new Set(win.hours.map((h) => h.hour));
    pool = pool.filter((h) => !used.has(h.hour));
  }

  return result;
}

/** Estimated saving in SEK for using `avg` instead of the day's peak hour. */
export function savingsVsPeak(
  hours: PricePoint[],
  avg: number,
  kwh: number
): number {
  if (hours.length === 0) return 0;
  const peak = Math.max(...hours.map((h) => h.price));
  return Math.max(0, (peak - avg) * kwh) / 100;
}
