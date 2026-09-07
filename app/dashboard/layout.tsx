"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import MobileWrapper from "@/components/layout/mobile-wrapper";
import BottomNav from "@/components/layout/bottom-nav";
import { ZONE_SELECTED_KEY } from "@/hooks/use-zone";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authOk, setAuthOk] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let redirectTimer: ReturnType<typeof setTimeout>;

    async function handleAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (user) {
        setChecking(false);
        setAuthOk(true);
        return;
      }

      // Wait for async OAuth code exchange before redirecting.
      redirectTimer = setTimeout(async () => {
        const {
          data: { user: retryUser },
        } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!retryUser) {
          router.replace("/login/");
        } else {
          setChecking(false);
          setAuthOk(true);
        }
      }, 2000);
    }

    handleAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return;
      if (event === "SIGNED_IN") {
        clearTimeout(redirectTimer);
        setChecking(false);
        setAuthOk(true);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(redirectTimer);
      subscription.unsubscribe();
    };
  }, [router]);

  // Activation funnel: a signed-in user who has never picked a zone on this
  // device is sent to /zone first (correct prices + zone_selected event).
  useEffect(() => {
    if (!authOk) return;
    const choseZone =
      typeof window !== "undefined" &&
      localStorage.getItem(ZONE_SELECTED_KEY) === "1";
    if (!choseZone) {
      router.replace("/zone/");
    }
  }, [authOk, router]);

  if (checking) {
    return (
      <MobileWrapper>
        <div className="h-screen flex flex-col items-center justify-center bg-paper">
          <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin mb-4" />
          <p className="text-sm text-muted">Kollar session…</p>
        </div>
      </MobileWrapper>
    );
  }

  return (
    <MobileWrapper>
      <div className="h-screen flex flex-col bg-paper relative">
        <div className="flex-1 overflow-auto pb-[84px]">
          {children}
        </div>
        <BottomNav />
      </div>
    </MobileWrapper>
  );
}
