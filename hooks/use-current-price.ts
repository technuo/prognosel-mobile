"use client";

import { useState, useEffect } from "react";
import { fetchCurrentPrice } from "@/lib/api/forecast";
import { toRetailPrice } from "@/lib/pricing";
import type { ZoneCode } from "@/types";

export function useCurrentPrice(zone: ZoneCode) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCurrentPrice(zone);
        if (!cancelled) setPrice(toRetailPrice(data.price_sek_kwh));
      } catch (e) {
        if (!cancelled) setError("Failed to load price");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [zone]);

  return { price, loading, error };
}
