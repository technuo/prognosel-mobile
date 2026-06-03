/**
 * Server-side price fetching for SEO (Landing Page, /elpriser, etc.)
 * Must work in Next.js Server Components — no 'window', no localStorage.
 */
import { fetchCurrentPrice, fetchZoneStats } from "./forecast";
import { toRetailPrice } from "../pricing";
import type { ZoneCode } from "@/types";

export interface ZonePriceData {
  zone: ZoneCode;
  currentPrice: number; // retail öre/kWh
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  minTime: string;
  maxTime: string;
  trend: "up" | "down" | "stable";
}

function calculateTrend(current: number, avg: number): "up" | "down" | "stable" {
  if (avg === 0) return "stable";
  const diff = ((current - avg) / avg) * 100;
  if (diff > 3) return "up";
  if (diff < -3) return "down";
  return "stable";
}

export async function fetchAllZonesPrices(): Promise<ZonePriceData[]> {
  const zones: ZoneCode[] = ["SE1", "SE2", "SE3", "SE4"];

  const results = await Promise.all(
    zones.map(async (zone) => {
      try {
        const [current, stats] = await Promise.all([
          fetchCurrentPrice(zone),
          fetchZoneStats(zone, 24),
        ]);

        const currentRetail = toRetailPrice(current.price_sek_kwh);

        return {
          zone,
          currentPrice: Math.round(currentRetail),
          minPrice: Math.round(stats.min_price),
          maxPrice: Math.round(stats.max_price),
          avgPrice: Math.round(stats.avg_price),
          minTime: stats.min_time,
          maxTime: stats.max_time,
          trend: calculateTrend(currentRetail, stats.avg_price),
        };
      } catch (err) {
        console.error(`[prices-server] Failed to fetch ${zone}:`, err);
        return {
          zone,
          currentPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          avgPrice: 0,
          minTime: "--:--",
          maxTime: "--:--",
          trend: "stable" as const,
        };
      }
    })
  );

  return results;
}
