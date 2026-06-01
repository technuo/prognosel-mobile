"use client";

import useSWR from "swr";
import { fetchZoneStats } from "@/lib/api/forecast";
import type { ZoneCode, ZoneStats } from "@/types";

export function useStats(zone: ZoneCode, hours: number = 24) {
  const { data, error, isLoading } = useSWR<ZoneStats, Error>(
    ["zone-stats", zone, hours],
    () => fetchZoneStats(zone, hours),
    {
      refreshInterval: 60_000,
      dedupingInterval: 10_000,
      revalidateOnFocus: false,
    }
  );

  return {
    stats: data ?? null,
    loading: isLoading,
    error: error ? error.message : null,
  };
}
