/**
 * NordAPI.ee client for real-time and historical electricity prices.
 * Provides 15-minute interval data aggregated to hourly for the Planner.
 *
 * NordAPI returns:
 *   - price_eur_kwh: EUR per kWh (wholesale)
 *   - price_local_kwh: SEK per kWh (wholesale, local currency)
 *
 * We convert to retail öre/kWh for display.
 */

import type { ZoneCode } from "@/types";

const PROXY_BASE = typeof window !== "undefined" ? "" : "http://localhost:3001";

export interface NordapiPricePoint {
  hour_start: string; // ISO 8601 UTC, e.g. "2026-05-25T00:00:00Z"
  price_eur_kwh: number;
  price_local_kwh: number;
}

export interface NordapiHistoryResponse {
  success: boolean;
  zone: string;
  start_date: string;
  end_date: string;
  count: number;
  data: NordapiPricePoint[];
}

export interface HourlyPrice {
  hour: number; // 0-23
  price: number; // retail öre/kWh
}

export interface DayPriceData {
  date: string; // YYYY-MM-DD
  dayName: string; // "Mon", "Tue", etc.
  dayLabel: string; // "May 25"
  hours: HourlyPrice[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  hasData: boolean;
}

/** Convert SEK/kWh (wholesale) → retail öre/kWh. */
function toRetailOrePerKwh(sekPerKwh: number): number {
  const factor = parseFloat(
    process.env.NEXT_PUBLIC_RETAIL_PRICE_FACTOR || "1.2"
  );
  return sekPerKwh * factor * 100;
}

/** Format a Date as YYYY-MM-DD in Swedish local time (Europe/Stockholm). */
function fmt(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
}

/** Get hour (0-23) in Swedish local time (Europe/Stockholm). */
function getStockholmHour(d: Date): number {
  return parseInt(
    d.toLocaleTimeString("sv-SE", {
      timeZone: "Europe/Stockholm",
      hour: "2-digit",
      hour12: false,
    }),
    10
  );
}

/** Aggregate 15-minute NordAPI points into 24 hourly averages. */
function aggregateToHourly(points: NordapiPricePoint[]): HourlyPrice[] {
  const hourlyMap = new Map<number, number[]>();

  for (const p of points) {
    const dt = new Date(p.hour_start);
    const localHour = getStockholmHour(dt);
    const price = toRetailOrePerKwh(p.price_local_kwh);

    if (!hourlyMap.has(localHour)) {
      hourlyMap.set(localHour, []);
    }
    hourlyMap.get(localHour)!.push(price);
  }

  const result: HourlyPrice[] = [];
  for (let h = 0; h < 24; h++) {
    const prices = hourlyMap.get(h) || [];
    const avg =
      prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;
    result.push({ hour: h, price: avg });
  }

  return result;
}

/** Fetch historical prices for a date range via local proxy. */
async function fetchHistory(
  zone: ZoneCode,
  startDate: string,
  endDate: string
): Promise<NordapiPricePoint[]> {
  const url = `${PROXY_BASE}/api/nordapi?endpoint=history&zone=${zone}&start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`NordAPI history failed: ${res.status}`);
  }
  const data: NordapiHistoryResponse = await res.json();
  return data.data || [];
}

/** Fetch today's real-time prices via local proxy. */
async function fetchToday(zone: ZoneCode): Promise<NordapiPricePoint[]> {
  const url = `${PROXY_BASE}/api/nordapi?endpoint=today&zone=${zone}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`NordAPI today failed: ${res.status}`);
  }
  const data = await res.json();
  return data.data || [];
}

/**
 * Build a 7-day weekly view for the Planner.
 * Returns data for the current week (Mon–Sun).
 * - Past days + today: actual historical prices
 * - Tomorrow: day-ahead prices (if available)
 * - Future days: marked as hasData=false
 */
/** Map short weekday name to numeric day (0=Sun, 1=Mon, ...). */
const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

export async function fetchWeeklyPrices(zone: ZoneCode): Promise<DayPriceData[]> {
  const now = new Date();

  // Get the current date in Swedish timezone
  const stockholmDateStr = now.toLocaleDateString("sv-SE", {
    timeZone: "Europe/Stockholm",
  }); // e.g. "2026-05-26"
  const [year, month, day] = stockholmDateStr.split("-").map(Number);

  // Compute the day of week in Swedish timezone (not browser timezone)
  const stockholmWeekdayStr = now.toLocaleDateString("en-US", {
    timeZone: "Europe/Stockholm",
    weekday: "short",
  });
  const dayOfWeek = WEEKDAY_MAP[stockholmWeekdayStr] ?? now.getDay();

  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  // Build Monday using the Swedish calendar date
  const monday = new Date(year, month - 1, day);
  monday.setDate(monday.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // Compute Sunday of this week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Fetch data for the whole week in one call
  const fetchStart = fmt(monday);
  const fetchEnd = fmt(sunday);
  console.debug("[fetchWeeklyPrices] Today in Stockholm:", stockholmDateStr, "| Requesting:", fetchStart, "to", fetchEnd, "| Zone:", zone);

  let allPoints: NordapiPricePoint[] = [];
  try {
    allPoints = await fetchHistory(zone, fetchStart, fetchEnd);
  } catch {
    // Fallback: try today endpoint only
    try {
      allPoints = await fetchToday(zone);
    } catch {
      allPoints = [];
    }
  }

  // Group points by date (Swedish local time)
  const dayMap = new Map<string, NordapiPricePoint[]>();
  for (const p of allPoints) {
    const dt = new Date(p.hour_start);
    const key = fmt(dt);
    if (!dayMap.has(key)) {
      dayMap.set(key, []);
    }
    dayMap.get(key)!.push(p);
  }

  // Build 7-day result
  const result: DayPriceData[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = fmt(d);
    const points = dayMap.get(key) || [];
    const hours = aggregateToHourly(points);

    const prices = hours.map((h) => h.price).filter((p) => p > 0);
    const hasData = prices.length > 0;

    // Use Swedish timezone for day name and month (English labels)
    const dayName = d.toLocaleDateString("en-US", {
      timeZone: "Europe/Stockholm",
      weekday: "short",
    });
    const monthName = d.toLocaleDateString("en-US", {
      timeZone: "Europe/Stockholm",
      month: "short",
    });
    const dayNum = parseInt(
      d.toLocaleDateString("en-US", {
        timeZone: "Europe/Stockholm",
        day: "numeric",
      }),
      10
    );

    result.push({
      date: key,
      dayName: dayName,
      dayLabel: `${monthName} ${dayNum}`,
      hours,
      minPrice: hasData ? Math.min(...prices) : 0,
      maxPrice: hasData ? Math.max(...prices) : 0,
      avgPrice: hasData
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0,
      hasData,
    });
  }

  console.debug("[fetchWeeklyPrices] Built week:", result.map((r) => `${r.dayName} ${r.date}`).join(", "));
  return result;
}
