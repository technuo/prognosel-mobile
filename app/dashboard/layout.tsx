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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login/");
      } else {
        setChecking(false);
      }
    });
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
