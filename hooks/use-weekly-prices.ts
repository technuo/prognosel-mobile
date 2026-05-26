"use client";

import { useState, useEffect } from "react";
import { fetchWeeklyPrices } from "@/lib/api/nordapi";
import type { ZoneCode, DayPriceData } from "@/types";

export function useWeeklyPrices(zone: ZoneCode) {
  const [data, setData] = useState<DayPriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const weekData = await fetchWeeklyPrices(zone);
        if (!cancelled) setData(weekData);
      } catch (e) {
        if (!cancelled) setError("Failed to load weekly prices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [zone]);

  return { data, loading, error };
}
