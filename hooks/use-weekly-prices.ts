"use client";

import useSWR from "swr";
import { fetchWeeklyPrices } from "@/lib/api/nordapi";
import type { ZoneCode } from "@/types";

export function useWeeklyPrices(zone: ZoneCode) {
  const { data, error, isLoading } = useSWR(
    ["weekly-prices", zone],
    () => fetchWeeklyPrices(zone),
    {
      refreshInterval: 300_000,  // weekly data changes slowly — refresh every 5 min
      dedupingInterval: 30_000,
      revalidateOnFocus: false,
    }
  );

  return {
    data: data || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load weekly prices") : null,
  };
}
