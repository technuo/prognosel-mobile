"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { ZoneCode } from "@/types";

const STORAGE_KEY = "prognosel-zone";

export function useZone() {
  const [zone, setZoneState] = useState<ZoneCode>("SE3");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      // 1. Load from localStorage first as fallback
      const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved && ["SE1", "SE2", "SE3", "SE4"].includes(saved)) {
        setZoneState(saved as ZoneCode);
      }

      // 2. If user is authenticated, load from Supabase profile (takes precedence)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("selected_zone")
            .eq("id", user.id)
            .single();
          if (data?.selected_zone && ["SE1", "SE2", "SE3", "SE4"].includes(data.selected_zone)) {
            setZoneState(data.selected_zone as ZoneCode);
            localStorage.setItem(STORAGE_KEY, data.selected_zone);
          }
        }
      } catch {
        // Silently ignore auth/profile errors when auth is disabled or no user
      }

      setLoaded(true);
    }
    load();
  }, []);

  const setZone = useCallback(async (newZone: ZoneCode) => {
    setZoneState(newZone);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newZone);
    }

    // 3. Sync to Supabase profile if user is authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ selected_zone: newZone })
          .eq("id", user.id);
      }
    } catch {
      // Silently ignore when auth is disabled
    }
  }, []);

  return { zone, setZone, loaded };
}
