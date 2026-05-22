"use client";

import { useState, useEffect } from "react";
import { fetchForecasts } from "@/lib/api/forecast";
import type { ZoneCode, ForecastRecord } from "@/types";

export function useForecast(zone: ZoneCode, horizon: 1 | 24 | 168) {
  const [data, setData] = useState<ForecastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const records = await fetchForecasts(zone, horizon, 168);
        if (!cancelled) setData(records);
      } catch (e) {
        if (!cancelled) setError("Failed to load forecast");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [zone, horizon]);

  return { data, loading, error };
}
