"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileWrapper from "@/components/layout/mobile-wrapper";
import { useLanguage } from "@/hooks/use-language";
import { useZone } from "@/hooks/use-zone";
import { zoneList } from "@/lib/i18n/translations";
import type { ZoneCode } from "@/types";

export default function ZoneSelectionPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { zone: savedZone, setZone } = useZone();
  const [selected, setSelected] = useState<ZoneCode>(savedZone || "SE3");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    // Save to localStorage (also attempts Supabase if logged in)
    setZone(selected);
    router.push("/dashboard/");
    setLoading(false);
  };

  return (
    <MobileWrapper>
      <div className="h-screen flex flex-col bg-paper">
        <div className="px-5 pt-5">
          <h1 className="font-serif text-[28px] font-bold text-ink tracking-tight mb-1">
            {t.selectArea}
          </h1>
          <p className="text-sm text-muted leading-relaxed mb-5">
            {t.areaSubtitle}
          </p>
        </div>

        <div className="flex-1 overflow-auto px-5 pb-4">
          <div className="flex flex-col gap-3">
            {zoneList.map((z) => {
              const info = t.zones[z.code];
              const isSelected = selected === z.code;
              return (
                <button
                  key={z.code}
                  onClick={() => setSelected(z.code)}
                  className="w-full p-4 rounded-2xl text-left flex items-center gap-4 transition-all cursor-pointer outline-none"
                  style={{
                    background: "var(--card)",
                    border: isSelected
                      ? `2px solid ${z.color}`
                      : "2px solid transparent",
                    boxShadow: isSelected
                      ? "0 2px 12px rgba(0,0,0,0.08)"
                      : "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: z.bg }}
                  >
                    <span
                      className="font-mono text-lg font-bold"
                      style={{ color: z.text }}
                    >
                      {z.code}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-serif text-lg font-semibold text-ink">
                        {info.city}
                      </span>
                      <span className="text-xs text-faint font-medium">
                        {info.region}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-snug">
                      {info.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: z.color }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M3 7l3 3 5-6"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-4 bg-paper border-t border-line">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-accent text-white text-[17px] font-semibold cursor-pointer border-none shadow-[0_2px_8px_rgba(204,120,92,0.35)] hover:bg-accent-hi transition-colors disabled:opacity-50"
          >
            {loading ? "..." : t.continue}
          </button>
        </div>
      </div>
    </MobileWrapper>
  );
}
