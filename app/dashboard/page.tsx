"use client";

import { useEffect, useState, useMemo } from "react";
import NavHeader from "@/components/layout/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { useZone } from "@/hooks/use-zone";
import { ZoneBadge } from "@/components/ui/zone-badge";
import { useCurrentPrice } from "@/hooks/use-current-price";
import { useWeeklyPrices } from "@/hooks/use-weekly-prices";
import { useStats } from "@/hooks/use-stats";
import { useTasks } from "@/hooks/use-tasks";
import { track } from "@/lib/analytics";
import { bestContiguousWindow, hourLabel, savingsVsPeak } from "@/lib/windows";
import type { ZoneCode, HourlyPrice } from "@/types";

interface Tip {
  icon: string;
  text: string;
  zone: ZoneCode;
  taskTitle: string;
  estimatedSavings: number;
}

/**
 * Suggest two concrete actions with honest, approximate savings wording.
 * Savings are "vs the most expensive hour" estimates (retail öre/kWh based)
 * and deliberately phrased with "~" / "upp till" — they are not guarantees.
 * The EV window uses the SAME contiguous-window algorithm as Sparky, so the
 * chat answer and this card can't disagree.
 */
function generateTips(hours: HourlyPrice[], zone: ZoneCode): Tip[] {
  const points = hours
    .filter((h) => h.price > 0)
    .map((h) => ({ hour: hourLabel(h.hour), price: h.price }));

  if (points.length === 0) return [];

  const sorted = [...points].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0];

  const tips: Tip[] = [];

  // Tip 1: dishwasher after the cheapest hour (~1.5 kWh per load)
  const dishSaving = savingsVsPeak(points, cheapest.price, 1.5);
  tips.push({
    icon: "💡",
    text: `Starta diskmaskinen efter ${cheapest.hour} — spara ~${dishSaving.toFixed(0)} kr jämfört med dyraste timmen`,
    zone,
    taskTitle: `Starta diskmaskinen efter ${cheapest.hour}`,
    estimatedSavings: dishSaving,
  });

  // Tip 2: EV charging in the cheapest CONTIGUOUS 3-hour window (~30 kWh)
  const evWindow = bestContiguousWindow(points, 3);
  if (evWindow) {
    const evSaving = savingsVsPeak(points, evWindow.avg, 30);
    tips.push({
      icon: "🔋",
      text: `Ladda elbilen ${evWindow.start}–${evWindow.end} — upp till ~${evSaving.toFixed(0)} kr billigare än topptimmen`,
      zone,
      taskTitle: `Ladda elbilen ${evWindow.start}–${evWindow.end}`,
      estimatedSavings: evSaving,
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
  const { data: weekData, loading: weekLoading } = useWeeklyPrices(zone);
  const { stats, loading: statsLoading } = useStats(zone, 24);
  const { totalSavings, addTask } = useTasks(zone);

  // Find today's data from the weekly view
  const today = useMemo(() => {
    const now = new Date();
    const todayKey = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
    return weekData.find((d) => d.date === todayKey);
  }, [weekData]);

  // Build chart data from today's actual hourly prices
  const chartData = useMemo(() => {
    if (!today || !today.hasData) return [];
    return today.hours.map((h) => ({
      h: String(h.hour).padStart(2, "0"),
      p: h.price,
    }));
  }, [today]);

  const forecastLoading = weekLoading;
  // Per-section loading for progressive rendering
  const showPriceSkeleton = priceLoading;
  const showStatsSkeleton = statsLoading;

  const minPrice = chartData.length ? Math.min(...chartData.map((d) => d.p)) : 0;
  const maxPrice = chartData.length ? Math.max(...chartData.map((d) => d.p)) : 0;

  const tips = useMemo(() => generateTips(today?.hours || [], zone), [today, zone]);

  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const selectedPoint = selectedHour
    ? chartData.find((d) => d.h === selectedHour)
    : undefined;

  useEffect(() => {
    void track("dashboard_view", { zone });
  }, [zone]);

  return (
    <div className="animate-fade-in">
      <NavHeader title={t.home} zone={zone} />

      <div className="px-5 pt-2 pb-24">
        {/* Current Price Hero */}
        {showPriceSkeleton ? (
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
                Nu
              </span>
              <span className="text-xs text-faint">
                {stats ? `Högst kl ${stats.max_time}` : "Laddar…"}
              </span>
            </div>
          </div>
        )}

        {/* Metrics Row */}
        {showStatsSkeleton ? (
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
              sub={stats ? `kl ${stats.min_time}` : undefined}
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
              sub={stats ? `kl ${stats.max_time}` : undefined}
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
              {zone} · idag
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="h-[120px] flex items-center justify-center text-faint text-sm">
              {forecastLoading ? "Laddar priser…" : "Inga prisdata tillgängliga"}
            </div>
          ) : (
            <>
              <div className="flex items-end gap-[3px] h-[120px] pb-6 relative">
                {chartData.map((d, i) => {
                  const h = Math.max((d.p / (maxPrice * 1.1)) * 100, 4);
                  const isMin = d.p === minPrice;
                  const isMax = d.p === maxPrice;
                  const isSelected = selectedHour === d.h;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedHour(isSelected ? null : d.h)}
                      aria-label={`${d.h} – ${d.p.toFixed(0)} öre/kWh`}
                      className="flex-1 flex flex-col items-center gap-1 relative cursor-pointer bg-transparent border-0 p-0"
                    >
                      {(isMin || isMax) && (
                        <span
                          className="absolute -top-3.5 text-[10px] font-mono font-semibold"
                          style={{ color: isMin ? "var(--good)" : "var(--bad)" }}
                        >
                          {d.p.toFixed(0)}
                        </span>
                      )}
                      <div
                        className="w-full rounded-t-[3px] transition-all min-h-[4px]"
                        style={{
                          height: `${h}%`,
                          background: isMin
                            ? "var(--good)"
                            : isMax
                            ? "var(--bad)"
                            : "var(--accent)",
                          opacity: isSelected || isMin || isMax ? 1 : 0.65,
                          boxShadow: isSelected ? "0 0 0 2px var(--ink)" : "none",
                        }}
                      />
                      <span
                        className="text-[10px] font-mono text-faint absolute -bottom-5"
                        style={{ transform: "rotate(-45deg)", transformOrigin: "top left" }}
                      >
                        {d.h}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-ink-2 font-medium min-h-[18px]">
                {selectedPoint
                  ? `${selectedPoint.h} · ${selectedPoint.p.toFixed(0)} öre/kWh` +
                    (minPrice > 0
                      ? ` · ${(selectedPoint.p / minPrice).toFixed(1)}× billigaste timmen`
                      : "")
                  : "Tryck på en stapel för att läsa av priset"}
              </div>
            </>
          )}
        </div>

        {/* Smart Tips */}
        <SectionHeader title={t.smartTips} action={t.seeAll} />
        <div className="flex flex-col gap-2.5">
          {tips.length === 0 && !forecastLoading ? (
            <div className="h-[80px] flex items-center justify-center text-faint text-sm">
              Inga tips just nu – kontrollera prognosdata
            </div>
          ) : (
            tips.map((tip, i) => (
              <div
                key={i}
                onClick={() => {
                  addTask(tip.taskTitle, tip.estimatedSavings);
                  void track("tip_added_to_tasks", { zone, task: tip.taskTitle });
                }}
                className="bg-card rounded-2xl p-4 shadow-sm border border-line flex items-start gap-3 cursor-pointer hover:border-line-hi transition-colors active:scale-[0.98]"
              >
                <div className="w-9 h-9 rounded-xl bg-paper-2 flex items-center justify-center text-lg flex-shrink-0">
                  {tip.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-2 leading-relaxed font-medium">{tip.text}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <ZoneBadge code={tip.zone} />
                    <span className="text-[11px] text-faint">Tryck för att lägga till i uppgifter</span>
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
