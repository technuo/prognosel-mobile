"use client";

import { useEffect, useState, useMemo } from "react";
import NavHeader from "@/components/layout/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { useZone } from "@/hooks/use-zone";
import { ZoneBadge } from "@/components/ui/zone-badge";
import { useCurrentPrice } from "@/hooks/use-current-price";
import { useForecast } from "@/hooks/use-forecast";
import { useStats } from "@/hooks/use-stats";
import { useTasks } from "@/hooks/use-tasks";
import { eurMwhToRetailSekKwh } from "@/lib/pricing";
import type { ZoneCode, ForecastRecord } from "@/types";

interface Tip {
  icon: string;
  text: string;
  zone: ZoneCode;
  taskTitle: string;
  estimatedSavings: number;
}

function generateTips(forecast24h: ForecastRecord[], zone: ZoneCode): Tip[] {
  if (!forecast24h.length) return [];

  const prices = forecast24h.map((r) => ({
    hour: new Date(r.timestamp).getHours(),
    price: eurMwhToRetailSekKwh(r.predicted_price),
  }));

  if (prices.length === 0) return [];

  // Sort by price to find cheapest hours
  const sorted = [...prices].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];
  const cheapest3 = sorted.slice(0, 3).sort((a, b) => a.hour - b.hour);
  const mostExpensive = sorted[sorted.length - 1];

  const tips: Tip[] = [];

  // Tip 1: cheapest single hour
  if (cheapest) {
    const saving = Math.max(0, mostExpensive.price - cheapest.price) * 2 / 100; // ~2 kWh dishwasher → SEK
    tips.push({
      icon: "💡",
      text: `Run dishwasher after ${String(cheapest.hour).padStart(2, "0")}:00 — save ~${saving.toFixed(0)} SEK`,
      zone,
      taskTitle: `Run dishwasher after ${String(cheapest.hour).padStart(2, "0")}:00`,
      estimatedSavings: saving,
    });
  }

  // Tip 2: cheapest 3-hour window for EV
  if (cheapest3.length >= 3) {
    const start = cheapest3[0].hour;
    const end = cheapest3[cheapest3.length - 1].hour;
    const saving = Math.max(0, mostExpensive.price - cheapest3[0].price) * 30 / 100; // ~30 kWh EV charge → SEK
    tips.push({
      icon: "🔋",
      text: `Best EV charging window: ${String(start).padStart(2, "0")}:00–${String(end + 1).padStart(2, "0")}:00`,
      zone,
      taskTitle: `Charge EV ${String(start).padStart(2, "0")}:00–${String(end + 1).padStart(2, "0")}`,
      estimatedSavings: saving,
    });
  }

  // Tip 3: pre-cool before peak
  if (mostExpensive) {
    tips.push({
      icon: "❄️",
      text: `Pre-cool home before ${String(mostExpensive.hour).padStart(2, "0")}:00 peak`,
      zone,
      taskTitle: `Pre-cool home before ${String(mostExpensive.hour).padStart(2, "0")}:00`,
      estimatedSavings: 15,
    });
  }

  return tips;
}

function MetricCard({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: string;
  unit: string;
  sub?: string;
}) {
  return (
    <div className="bg-card rounded-xl p-3.5 shadow-sm border border-line flex-1 min-w-0">
      <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-1">
        {label}
      </div>
      <div className="font-serif text-[22px] font-semibold text-ink leading-tight">
        {value}
        <span className="text-[13px] text-muted font-sans font-medium">{unit}</span>
      </div>
      {sub && (
        <div className="text-[11px] mt-1 font-medium text-faint">{sub}</div>
      )}
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex justify-between items-baseline mb-2.5 px-1">
      <h2 className="font-serif text-xl font-semibold text-ink tracking-tight">{title}</h2>
      {action && <span className="text-[13px] text-accent font-medium cursor-pointer">{action}</span>}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-card rounded-[20px] p-5 mb-4 shadow-sm border border-line animate-pulse">
      <div className="h-4 bg-paper-2 rounded w-1/3 mb-4" />
      <div className="h-12 bg-paper-2 rounded w-1/2 mb-2" />
      <div className="h-6 bg-paper-2 rounded w-1/4" />
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const { zone } = useZone();

  // Fetch real data using the selected zone
  const { price: currentPrice, loading: priceLoading } = useCurrentPrice(zone);
  const { data: forecast24h, loading: forecastLoading } = useForecast(zone, 24);
  const { stats, loading: statsLoading } = useStats(zone, 24);
  const { totalSavings, addTask } = useTasks(zone);

  // Build chart data from forecast records
  const chartData = useMemo(() => {
    if (!forecast24h.length) return [];
    return forecast24h.slice(0, 24).map((r) => {
      const ts = new Date(r.timestamp);
      return {
        h: ts.getHours().toString().padStart(2, "0"),
        p: eurMwhToRetailSekKwh(r.predicted_price), // EUR/MWh → retail öre/kWh
      };
    });
  }, [forecast24h]);

  const isLoading = priceLoading || forecastLoading || statsLoading;

  const minPrice = chartData.length ? Math.min(...chartData.map((d) => d.p)) : 0;
  const maxPrice = chartData.length ? Math.max(...chartData.map((d) => d.p)) : 0;

  const tips = useMemo(() => generateTips(forecast24h, zone), [forecast24h, zone]);

  return (
    <div className="animate-fade-in">
      <NavHeader title={t.home} zone={zone} />

      <div className="px-5 pt-2 pb-24">
        {/* Current Price Hero */}
        {isLoading ? (
          <LoadingCard />
        ) : (
          <div className="bg-card rounded-[20px] p-5 mb-4 shadow-sm border border-line">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-good shadow-[0_0_0_3px_rgba(92,138,94,0.2)]" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-muted">
                {t.currentPrice}
              </span>
              <ZoneBadge code={zone} />
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-serif text-5xl font-bold text-ink tracking-tighter leading-none">
                {currentPrice?.toFixed(2) ?? "--"}
              </span>
              <span className="text-base text-muted font-medium">öre{t.perKwh}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-good font-semibold bg-good/10 px-2.5 py-0.5 rounded-full">
                Live
              </span>
              <span className="text-xs text-faint">
                {stats ? `Peak at ${stats.max_time}` : "Loading..."}
              </span>
            </div>
          </div>
        )}

        {/* Metrics Row */}
        {isLoading ? (
          <div className="flex gap-2.5 mb-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl p-3.5 shadow-sm border border-line flex-1 min-w-0 animate-pulse">
                <div className="h-3 bg-paper-2 rounded w-2/3 mb-2" />
                <div className="h-6 bg-paper-2 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2.5 mb-5">
            <MetricCard
              label={t.min}
              value={stats ? stats.min_price.toFixed(0) : "--"}
              unit=" öre"
              sub={stats ? `at ${stats.min_time}` : undefined}
            />
            <MetricCard
              label={t.avg}
              value={stats ? stats.avg_price.toFixed(0) : "--"}
              unit=" öre"
            />
            <MetricCard
              label={t.max}
              value={stats ? stats.max_price.toFixed(0) : "--"}
              unit=" öre"
              sub={stats ? `at ${stats.max_time}` : undefined}
            />
            <MetricCard
              label={t.savings}
              value={totalSavings > 0 ? totalSavings.toFixed(0) : "--"}
              unit=" SEK"
            />
          </div>
        )}

        {/* Chart Card */}
        <div className="bg-card rounded-[20px] p-5 mb-5 shadow-sm border border-line">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-lg font-semibold text-ink">{t.forecast}</h3>
            <span className="text-[11px] font-mono text-faint bg-paper-2 px-2.5 py-0.5 rounded-full">
              {zone} · t+24h
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-faint text-sm">
              {forecastLoading ? "Loading forecast..." : "No forecast data available"}
            </div>
          ) : (
            <div className="flex items-end gap-[3px] h-[120px] pb-6 relative">
              {chartData.map((d, i) => {
                const h = Math.max((d.p / (maxPrice * 1.1)) * 100, 4);
                const isMin = d.p === minPrice;
                const isMax = d.p === maxPrice;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
                    <div
                      className="w-full rounded-t-[3px] transition-all min-h-[4px]"
                      style={{
                        height: `${h}%`,
                        background: isMin ? "var(--good)" : isMax ? "var(--bad)" : "var(--accent)",
                        opacity: isMin || isMax ? 1 : 0.65,
                      }}
                    />
                    <span
                      className="text-[8px] font-mono text-faint absolute -bottom-5"
                      style={{ transform: "rotate(-45deg)", transformOrigin: "top left" }}
                    >
                      {d.h}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart Tips */}
        <SectionHeader title={t.smartTips} action={t.seeAll} />
        <div className="flex flex-col gap-2.5">
          {tips.length === 0 && !forecastLoading ? (
            <div className="h-[80px] flex items-center justify-center text-faint text-sm">
              No tips available — check forecast data
            </div>
          ) : (
            tips.map((tip, i) => (
              <div
                key={i}
                onClick={() => addTask(tip.taskTitle, tip.estimatedSavings)}
                className="bg-card rounded-2xl p-4 shadow-sm border border-line flex items-start gap-3 cursor-pointer hover:border-line-hi transition-colors active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-paper-2 flex items-center justify-center text-lg flex-shrink-0">
                  {tip.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-2 leading-relaxed font-medium">{tip.text}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <ZoneBadge code={tip.zone} />
                    <span className="text-[11px] text-faint">Tap to add to tasks</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
