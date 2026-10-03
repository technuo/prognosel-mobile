import { supabase } from "@/lib/supabase/client";
import { eurMwhToWholesaleSekKwh, toRetailPrice } from "@/lib/pricing";
import { SWEDEN_TZ } from "@/lib/time";
import { nordapiUrl } from "./nordapi-endpoint";
import type { ZoneCode, ForecastRecord, ZoneStats } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// NordAPI.ee's `/electricity/current/*` endpoint measured 4.7–7.2s on
// 2026-10-03; a 5s timeout aborted most requests before the body arrived
// (436 `AbortError`s in one day). Keep this under Vercel's 10s function
// budget so a slow-but-successful response isn't cut off by the platform.
const FETCH_TIMEOUT_MS = 9000;

/**
 * Server-side price fetches are cached for 60s, matching the `revalidate = 60`
 * already declared on the pages that call them.
 *
 * `cache: "no-store"` looked harmless but made Next throw its internal
 * "Dynamic server usage" signal during prerendering. The try/catch below
 * swallowed that signal, so instead of bailing out to dynamic rendering the
 * app silently fell through to the stale Supabase fallback — and when that was
 * empty too, the build failed with a misleading "all sources failed".
 * Caching the response is what the pages ask for anyway, and it keeps every
 * page view from turning into a burst of upstream calls.
 */
const PRICE_CACHE = { next: { revalidate: 60 } } as const;

export interface CurrentPrice {
  zone: string;
  price_eur_mwh: number;
  price_sek_kwh: number;
  timestamp: string;
  source: string;
}

/** Fetch with timeout to prevent hanging on cold Render backend. */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ── Supabase: forecasts table (public read) ────────────────────────────────
export async function fetchForecasts(
  zone: ZoneCode,
  horizon: 1 | 24 | 168,
  limit: number = 168
): Promise<ForecastRecord[]> {
  const todayUtc = new Date().toISOString();

  const { data, error } = await supabase
    .from("forecasts")
    .select("*")
    .eq("zone", zone)
    .eq("horizon_hours", horizon)
    .gte("timestamp", todayUtc)
    .order("timestamp", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Supabase forecasts error:", error);
    // Fallback to FastAPI
    return fetchForecastsFromApi(zone, horizon, limit);
  }

  // If Supabase has no future data, fallback to API
  if (!data || data.length === 0) {
    return fetchForecastsFromApi(zone, horizon, limit);
  }

  // predicted_price is stored as SEK/MWh (DataProcessor converts EUR->SEK).
  // Convert to EUR/MWh so all pricing helpers work correctly.
  const records = (data as ForecastRecord[]) || [];
  records.forEach((r) => {
    r.predicted_price = r.predicted_price / 11.5;
  });
  return records;
}

// ── FastAPI Fallback ───────────────────────────────────────────────────────
export async function fetchForecastsFromApi(
  zone: ZoneCode,
  horizon: 1 | 24 | 168,
  limit: number = 168
): Promise<ForecastRecord[]> {
  const res = await fetchWithTimeout(
    `${API_BASE}/forecast/${zone}/${horizon}?limit=${limit}`,
    PRICE_CACHE
  );
  if (!res.ok) throw new Error("Failed to fetch forecasts from API");
  return res.json();
}

// ── NordAPI.ee: real-time current price ────────────────────────────────────
async function fetchNordapiCurrentPrice(zone: ZoneCode): Promise<CurrentPrice | null> {
  const url = nordapiUrl("current", zone);
  try {
    const res = await fetchWithTimeout(url, PRICE_CACHE);
    if (!res.ok) {
      console.warn(`[forecast] nordapi current ${zone}: HTTP ${res.status} <- ${url}`);
      return null;
    }
    const data = await res.json();
    if (!data.success) {
      console.warn(`[forecast] nordapi current ${zone}: success=false <- ${url}`);
      return null;
    }
    // nordapi returns EUR/kWh and SEK/kWh directly
    const priceEurKwh = parseFloat(data.price_eur_kwh);
    const priceSekKwh = parseFloat(data.price_local_kwh);
    return {
      zone: data.zone || zone,
      price_eur_mwh: round(priceEurKwh * 1000, 2),
      price_sek_kwh: round(priceSekKwh, 4),
      timestamp: data.hour_start,
      source: "nordapi",
    };
  } catch (err) {
    // Don't swallow the reason: a silent catch here hid a 404 on every request
    // for weeks (the URL used to point at the FastAPI host).
    console.error(`[forecast] nordapi current ${zone} failed <- ${url}:`, err);
    return null;
  }
}

// ── NordAPI.ee: today's hourly stats ───────────────────────────────────────
async function fetchNordapiZoneStats(
  zone: ZoneCode,
  hours: number = 24
): Promise<ZoneStats | null> {
  const url = nordapiUrl("today", zone);
  try {
    const res = await fetchWithTimeout(url, PRICE_CACHE);
    if (!res.ok) {
      console.warn(`[forecast] nordapi today ${zone}: HTTP ${res.status} <- ${url}`);
      return null;
    }
    const data = await res.json();
    const prices = data.data as Array<{
      hour_start: string;
      price_local_kwh: number | string;
    }>;
    if (!prices || prices.length === 0) {
      console.warn(`[forecast] nordapi today ${zone}: empty data <- ${url}`);
      return null;
    }

    // Aggregate 15-min intervals into hourly averages
    const hourly = new Map<
      string,
      { prices: number[]; timestamp: Date }
    >();
    for (const p of prices) {
      const ts = new Date(p.hour_start);
      const key = ts.toLocaleTimeString("sv-SE", {
        timeZone: SWEDEN_TZ,
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!hourly.has(key)) {
        hourly.set(key, { prices: [], timestamp: ts });
      }
      hourly.get(key)!.prices.push(toRetailPrice(parseFloat(String(p.price_local_kwh))));
    }

    const sorted = Array.from(hourly.entries()).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    const recent = sorted.length > hours ? sorted.slice(-hours) : sorted;

    const avgPrices = recent.map(([, v]) =>
      v.prices.reduce((a, b) => a + b, 0) / v.prices.length
    );
    const times = recent.map(([, v]) => v.timestamp);

    const minPrice = Math.min(...avgPrices);
    const maxPrice = Math.max(...avgPrices);
    const avgPrice =
      avgPrices.reduce((a, b) => a + b, 0) / avgPrices.length;

    const minIdx = avgPrices.indexOf(minPrice);
    const maxIdx = avgPrices.indexOf(maxPrice);

    return {
      zone: zone,
      min_price: minPrice,
      avg_price: avgPrice,
      max_price: maxPrice,
      min_time: times[minIdx].toLocaleTimeString("sv-SE", {
        timeZone: SWEDEN_TZ,
        hour: "2-digit",
        minute: "2-digit",
      }),
      max_time: times[maxIdx].toLocaleTimeString("sv-SE", {
        timeZone: SWEDEN_TZ,
        hour: "2-digit",
        minute: "2-digit",
      }),
      currency: "öre",
      period_hours: recent.length,
    };
  } catch (err) {
    console.error(`[forecast] nordapi today ${zone} failed <- ${url}:`, err);
    return null;
  }
}

function round(n: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

export async function fetchCurrentPrice(zone: ZoneCode): Promise<CurrentPrice> {
  // 1. Primary: NordAPI.ee (always fast, no cold-start)
  const nordapi = await fetchNordapiCurrentPrice(zone);
  if (nordapi) return nordapi;

  // 2. Secondary: FastAPI backend (with timeout to avoid Render cold-start hang)
  try {
    const res = await fetchWithTimeout(`${API_BASE}/current-price/${zone}`, {
      ...PRICE_CACHE,
    });
    if (res.ok) return res.json();
  } catch {
    // ignore, try next
  }

  // 3. Last resort: Supabase stale forecasts
  const { data, error } = await supabase
    .from("forecasts")
    .select("timestamp, predicted_price")
    .eq("zone", zone)
    .eq("horizon_hours", 1)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch current price from all sources");
  }

  const priceEurMwh = data.predicted_price / 11.5;
  return {
    zone,
    price_eur_mwh: priceEurMwh,
    price_sek_kwh: eurMwhToWholesaleSekKwh(priceEurMwh),
    timestamp: data.timestamp,
    source: "supabase-fallback",
  };
}

export async function fetchZoneStats(
  zone: ZoneCode,
  hours: number = 24
): Promise<ZoneStats> {
  // 1. Primary: NordAPI.ee (always fast, no cold-start)
  const nordapi = await fetchNordapiZoneStats(zone, hours);
  if (nordapi) return nordapi;

  // 2. Secondary: FastAPI backend (with timeout to avoid Render cold-start hang)
  try {
    const res = await fetchWithTimeout(`${API_BASE}/stats/${zone}?hours=${hours}`, {
      ...PRICE_CACHE,
    });
    if (res.ok) return res.json();
  } catch {
    // ignore, try next
  }

  // 3. Last resort: Supabase stale forecasts
  const { data, error } = await supabase
    .from("forecasts")
    .select("timestamp, predicted_price")
    .eq("zone", zone)
    .eq("horizon_hours", 24)
    .order("timestamp", { ascending: true })
    .limit(hours);

  if (error || !data || data.length === 0) {
    throw new Error("Failed to fetch zone stats from all sources");
  }

  const prices = data.map((r) =>
    toRetailPrice(eurMwhToWholesaleSekKwh(r.predicted_price / 11.5))
  );
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  const minRecord = data.find(
    (r) => toRetailPrice(eurMwhToWholesaleSekKwh(r.predicted_price / 11.5)) === minPrice
  );
  const maxRecord = data.find(
    (r) => toRetailPrice(eurMwhToWholesaleSekKwh(r.predicted_price / 11.5)) === maxPrice
  );

  return {
    zone,
    min_price: minPrice,
    avg_price: avgPrice,
    max_price: maxPrice,
    min_time: minRecord
      ? new Date(minRecord.timestamp).toLocaleTimeString("sv-SE", {
          timeZone: SWEDEN_TZ,
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    max_time: maxRecord
      ? new Date(maxRecord.timestamp).toLocaleTimeString("sv-SE", {
          timeZone: SWEDEN_TZ,
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    currency: "öre",
    period_hours: hours,
  };
}
