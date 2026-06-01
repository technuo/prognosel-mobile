"use client";

import useSWR from "swr";
import { fetchCurrentPrice } from "@/lib/api/forecast";
import { toRetailPrice } from "@/lib/pricing";
import type { ZoneCode } from "@/types";

export function useCurrentPrice(zone: ZoneCode) {
  const { data, error, isLoading } = useSWR(
    ["current-price", zone],
    async () => {
      const priceData = await fetchCurrentPrice(zone);
      return toRetailPrice(priceData.price_sek_kwh);
    },
    {
      refreshInterval: 60_000,
      dedupingInterval: 10_000,
      revalidateOnFocus: false,
    }
  );

  return {
    price: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load price") : null,
  };
}
