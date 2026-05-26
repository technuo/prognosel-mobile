import { supabase } from "@/lib/supabase/client";
import { eurMwhToWholesaleSekKwh } from "@/lib/pricing";
import type { ZoneCode, ForecastRecord, ZoneStats } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const NORDAPI_BASE = "https://nordapi.ee/api/v1";

export interface CurrentPrice {
  zone: string;
  price_eur_mwh: number;
  price_sek_kwh: number;
  timestamp: string;
  source: string;
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
  const res = await fetch(
    `${API_BASE}/forecast/${zone}/${horizon}?limit=${limit}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch forecasts from API");
  return res.json();
}

// ── NordAPI.ee: real-time current price ────────────────────────────────────
async function fetchNordapiCurrentPrice(zone: ZoneCode): Promise<CurrentPrice | null> {
  try {
    const res = await fetch(`${NORDAPI_BASE}/electricity/current/${zone}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
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
  } catch {
    return null;
  }
}

// ── NordAPI.ee: today's hourly stats ───────────────────────────────────────
async function fetchNordapiZoneStats(
  zone: ZoneCode,
  hours: number = 24
): Promise<ZoneStats | null> {
  try {
    const res = await fetch(`${NORDAPI_BASE}/electricity/today/${zone}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const prices = data.data as Array<{
      hour_start: string;
      price_local_kwh: number | string;
    }>;
    if (!prices || prices.length === 0) return null;

    // Aggregate 15-min intervals into hourly averages
    const hourly = new Map<
      string,
      { prices: number[]; timestamp: Date }
    >();
    for (const p of prices) {
      const ts = new Date(p.hour_start);
      const key = ts.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (!hourly.has(key)) {
        hourly.set(key, { prices: [], timestamp: ts });
      }
      hourly.get(key)!.prices.push(parseFloat(String(p.price_local_kwh)));
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
        hour: "2-digit",
        minute: "2-digit",
      }),
      max_time: times[maxIdx].toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      currency: "öre",
      period_hours: recent.length,
    };
  } catch {
    return null;
  }
}

function round(n: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

export async function fetchCurrentPrice(zone: ZoneCode): Promise<CurrentPrice> {
  // 1. Try FastAPI backend
  try {
    const res = await fetch(`${API_BASE}/current-price/${zone}`, {
      cache: "no-store",
    });
    if (res.ok) return res.json();
  } catch {
    // ignore, try next
  }

  // 2. Fallback: call nordapi.ee directly
  const nordapi = await fetchNordapiCurrentPrice(zone);
  if (nordapi) return nordapi;

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
  // 1. Try FastAPI backend
  try {
    const res = await fetch(`${API_BASE}/stats/${zone}?hours=${hours}`, {
      cache: "no-store",
    });
    if (res.ok) return res.json();
  } catch {
    // ignore, try next
  }

  // 2. Fallback: call nordapi.ee directly
  const nordapi = await fetchNordapiZoneStats(zone, hours);
  if (nordapi) return nordapi;

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
    eurMwhToWholesaleSekKwh(r.predicted_price / 11.5)
  );
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  const minRecord = data.find(
    (r) => eurMwhToWholesaleSekKwh(r.predicted_price / 11.5) === minPrice
  );
  const maxRecord = data.find(
    (r) => eurMwhToWholesaleSekKwh(r.predicted_price / 11.5) === maxPrice
  );

  return {
    zone,
    min_price: minPrice,
    avg_price: avgPrice,
    max_price: maxPrice,
    min_time: minRecord
      ? new Date(minRecord.timestamp).toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    max_time: maxRecord
      ? new Date(maxRecord.timestamp).toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--",
    currency: "öre",
    period_hours: hours,
  };
}
