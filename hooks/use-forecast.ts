"use client";

import useSWR from "swr";
import { fetchForecasts } from "@/lib/api/forecast";
import type { ZoneCode } from "@/types";

export function useForecast(zone: ZoneCode, horizon: 1 | 24 | 168) {
  const { data, error, isLoading } = useSWR(
    ["forecasts", zone, horizon],
    () => fetchForecasts(zone, horizon, 168),
    {
      refreshInterval: 60_000,   // revalidate every 60s
      dedupingInterval: 10_000,  // dedupe requests within 10s
      revalidateOnFocus: false,
    }
  );

  return {
    data: data || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load forecast") : null,
  };
}
