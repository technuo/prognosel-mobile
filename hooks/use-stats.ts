"use client";

import { useState, useEffect } from "react";
import { fetchZoneStats } from "@/lib/api/forecast";
import { toRetailPrice } from "@/lib/pricing";
import type { ZoneCode, ZoneStats } from "@/types";

export function useStats(zone: ZoneCode, hours: number = 24) {
  const [stats, setStats] = useState<ZoneStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchZoneStats(zone, hours);
        if (!cancelled) {
          setStats({
            ...data,
            min_price: toRetailPrice(data.min_price),
            avg_price: toRetailPrice(data.avg_price),
            max_price: toRetailPrice(data.max_price),
          });
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [zone, hours]);

  return { stats, loading, error };
}
