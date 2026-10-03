import { toRetailPrice } from "@/lib/pricing";
import { hourLabelInZone } from "@/lib/time";
import type { ZoneCode } from "@/types";

/**
 * Today's prices, aggregated from NordAPI's 15-minute intervals into one value
 * per hour, in retail öre/kWh and in Swedish local time.
 *
 * Extracted from the chat route so the push sender can compute the same
 * "cheapest window" the app and Sparky show. Three places disagreeing about
 * which hours are cheapest would be worse than a little shared code.
 */

const NORDAPI_BASE = "https://nordapi.ee/api/v1";
const CACHE_TTL_MS = 120_000;
const FETCH_TIMEOUT_MS = 9000; // match forecast.ts; stay under Vercel's 10s budget

export interface HourlyPrice {
  /** "HH:00" in Europe/Stockholm. */
  hour: string;
  /** Retail öre/kWh. */
  price: number;
}

const cache = new Map<string, { at: number; data: HourlyPrice[] | null }>();

export async function fetchTodayHourly(
  zone: ZoneCode
): Promise<HourlyPrice[] | null> {
  const now = Date.now();
  const cached = cache.get(zone);
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.data;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${NORDAPI_BASE}/electricity/today/${zone}`, {
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(id);
    }
    if (!res.ok) {
      cache.set(zone, { at: now, data: null });
      return null;
    }

    const payload = await res.json();
    const points = payload.data as
      | { hour_start: string; price_local_kwh: number | string }[]
      | undefined;
    if (!points || points.length === 0) {
      cache.set(zone, { at: now, data: null });
      return null;
    }

    const byHour = new Map<string, { sum: number; count: number }>();
    for (const point of points) {
      const key = hourLabelInZone(point.hour_start);
      const entry = byHour.get(key) ?? { sum: 0, count: 0 };
      entry.sum += toRetailPrice(parseFloat(String(point.price_local_kwh)));
      entry.count += 1;
      byHour.set(key, entry);
    }

    const data = Array.from(byHour.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, value]) => ({
        hour,
        price: Math.round(value.sum / value.count),
      }));

    cache.set(zone, { at: now, data });
    return data;
  } catch (error) {
    console.error(`[today] ${zone} failed:`, error);
    cache.set(zone, { at: now, data: null });
    return null;
  }
}
