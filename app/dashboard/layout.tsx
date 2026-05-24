"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import MobileWrapper from "@/components/layout/mobile-wrapper";
import BottomNav from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let redirectTimer: ReturnType<typeof setTimeout>;

    async function handleAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;
      if (user) {
        setChecking(false);
        return;
      }

      // Wait for async OAuth code exchange before redirecting
      redirectTimer = setTimeout(async () => {
        const { data: { user: retryUser } } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!retryUser) {
          router.replace("/login/");
        } else {
          setChecking(false);
        }
      }, 2000);
    }

    handleAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return;
      if (event === "SIGNED_IN") {
        clearTimeout(redirectTimer);
        setChecking(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(redirectTimer);
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <MobileWrapper>
        <div className="h-screen flex flex-col items-center justify-center bg-paper">
          <div className="w-10 h-10 rounded-full border-2 border-accent/30 border-t-accent animate-spin mb-4" />
          <p className="text-sm text-muted">Checking session…</p>
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
