import { supabase } from "@/lib/supabase/client";
import { eurMwhToWholesaleSekKwh } from "@/lib/pricing";
import type { ZoneCode, ForecastRecord, ZoneStats } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const { data, error } = await supabase
    .from("forecasts")
    .select("*")
    .eq("zone", zone)
    .eq("horizon_hours", horizon)
    .order("timestamp", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Supabase forecasts error:", error);
    // Fallback to FastAPI
    return fetchForecastsFromApi(zone, horizon, limit);
  }

  return (data as ForecastRecord[]) || [];
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

export async function fetchCurrentPrice(zone: ZoneCode): Promise<CurrentPrice> {
  try {
    const res = await fetch(`${API_BASE}/current-price/${zone}`, {
      cache: "no-store",
    });
    if (res.ok) return res.json();
    throw new Error("FastAPI current price failed");
  } catch {
    // Fallback: use latest forecast from Supabase
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

    return {
      zone,
      price_eur_mwh: data.predicted_price,
      price_sek_kwh: eurMwhToWholesaleSekKwh(data.predicted_price),
      timestamp: data.timestamp,
      source: "supabase-fallback",
    };
  }
}

export async function fetchZoneStats(
  zone: ZoneCode,
  hours: number = 24
): Promise<ZoneStats> {
  try {
    const res = await fetch(`${API_BASE}/stats/${zone}?hours=${hours}`, {
      cache: "no-store",
    });
    if (res.ok) return res.json();
    throw new Error("FastAPI stats failed");
  } catch {
    // Fallback: compute from Supabase forecasts
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

    const prices = data.map((r) => eurMwhToWholesaleSekKwh(r.predicted_price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    const minRecord = data.find((r) => eurMwhToRetailSekKwh(r.predicted_price) === minPrice);
    const maxRecord = data.find((r) => eurMwhToRetailSekKwh(r.predicted_price) === maxPrice);

    return {
      zone,
      min_price: minPrice,
      avg_price: avgPrice,
      max_price: maxPrice,
      min_time: minRecord ? new Date(minRecord.timestamp).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) : "--:--",
      max_time: maxRecord ? new Date(maxRecord.timestamp).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }) : "--:--",
      currency: "öre",
      period_hours: hours,
    };
  }
}
