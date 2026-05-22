"use client";

import { useState, useMemo } from "react";
import NavHeader from "@/components/layout/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { useZone } from "@/hooks/use-zone";
import { useForecast } from "@/hooks/use-forecast";
import { eurMwhToRetailSekKwh } from "@/lib/pricing";
import type { ForecastRecord } from "@/types";

function groupForecastByDay(records: ForecastRecord[]) {
  const map = new Map<string, { day: string; date: string; hours: number[] }>();

  for (const r of records) {
    const d = new Date(r.timestamp);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const priceSek = eurMwhToRetailSekKwh(r.predicted_price);

    if (!map.has(key)) {
      map.set(key, {
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        hours: [],
      });
    }
    map.get(key)!.hours.push(priceSek);
  }

  // Pad incomplete days to 24 hours with the day's average
  return Array.from(map.values()).map((d) => {
    if (d.hours.length < 24 && d.hours.length > 0) {
      const avg = d.hours.reduce((a, b) => a + b, 0) / d.hours.length;
      while (d.hours.length < 24) d.hours.push(avg);
    }
    return d;
  });
}

function getHeatColor(price: number, min: number, max: number): string {
  if (max === min) return "#5C8A5E";
  const ratio = (price - min) / (max - min);
  if (ratio < 0.33) return "#5C8A5E";
  if (ratio < 0.66) return "#C8922E";
  return "#B85D40";
}

function LoadingPlanner() {
  return (
    <>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-16 h-20 bg-paper-2 rounded-2xl animate-pulse"
          />
        ))}
      </div>
      <div className="flex gap-2.5 mb-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 bg-paper-2 rounded-xl p-3.5 h-20 animate-pulse"
          />
        ))}
      </div>
      <div className="bg-card rounded-[20px] p-5 mb-5 shadow-sm border border-line animate-pulse">
        <div className="h-5 bg-paper-2 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-paper-2" />
          ))}
        </div>
      </div>
    </>
  );
}

export default function PlannerPage() {
  const { t } = useLanguage();
  const { zone } = useZone();
  const [selectedDay, setSelectedDay] = useState(0);

  const { data: forecastData, loading } = useForecast(zone, 168);

  const weekData = useMemo(() => {
    if (!forecastData.length) return [];
    return groupForecastByDay(forecastData);
  }, [forecastData]);

  const day = weekData[selectedDay];
  const dayMin = day ? Math.min(...day.hours) : 0;
  const dayMax = day ? Math.max(...day.hours) : 0;
  const dayAvg = day
    ? day.hours.reduce((a, b) => a + b, 0) / day.hours.length
    : 0;

  const bestWindow = useMemo(() => {
    if (!day) return [];
    const sorted = day.hours
      .map((p, i) => ({ price: p, hour: i }))
      .sort((a, b) => a.price - b.price);
    return sorted.slice(0, 3);
  }, [day]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <NavHeader title={t.weeklyPlanner} zone={zone} />
        <div className="px-5 pt-2 pb-24">
          <LoadingPlanner />
        </div>
      </div>
    );
  }

  if (!weekData.length) {
    return (
      <div className="animate-fade-in">
        <NavHeader title={t.weeklyPlanner} zone={zone} />
        <div className="px-5 pt-2 pb-24">
          <div className="h-[200px] flex items-center justify-center text-faint text-sm">
            No forecast data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <NavHeader title={t.weeklyPlanner} zone={zone} />

      <div className="px-5 pt-2 pb-24">
        {/* Day Selector */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
          {weekData.map((d, i) => {
            const active = i === selectedDay;
            const dMin = Math.min(...d.hours);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex-shrink-0 w-16 py-2.5 rounded-2xl text-center cursor-pointer transition-all ${
                  active
                    ? "bg-accent text-white shadow-[0_2px_8px_rgba(204,120,92,0.3)] border border-accent"
                    : "bg-card border border-line text-muted shadow-sm"
                }`}
              >
                <div
                  className={`text-[11px] font-semibold ${
                    active ? "opacity-90" : "opacity-70"
                  } mb-0.5`}
                >
                  {d.day}
                </div>
                <div className="font-serif text-base font-bold mb-1">
                  {dMin.toFixed(2)}
                </div>
                <div
                  className={`text-[9px] font-mono ${
                    active ? "opacity-80" : "opacity-50"
                  }`}
                >
                  {d.date}
                </div>
              </button>
            );
          })}
        </div>

        {/* Day Stats */}
        <div className="flex gap-2.5 mb-5">
          {[
            { label: t.min, value: dayMin.toFixed(2), color: "text-good" },
            { label: t.avg, value: dayAvg.toFixed(2), color: "text-warn" },
            { label: t.max, value: dayMax.toFixed(2), color: "text-bad" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 bg-card rounded-xl p-3.5 shadow-sm border border-line text-center"
            >
              <div className="font-mono text-[10px] tracking-widest uppercase text-muted mb-1">
                {stat.label}
              </div>
              <div className={`font-serif text-xl font-semibold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[10px] text-muted">SEK</div>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="bg-card rounded-[20px] p-5 mb-5 shadow-sm border border-line">
          <h3 className="font-serif text-lg font-semibold text-ink mb-4">
            {day.day} · {day.date}
          </h3>
          <div className="grid grid-cols-6 gap-1.5">
            {day.hours.map((price, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: getHeatColor(price, dayMin, dayMax) + "20",
                }}
              >
                <span
                  className="text-[10px] font-mono font-semibold"
                  style={{ color: getHeatColor(price, dayMin, dayMax) }}
                >
                  {price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-mono text-faint">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Best Windows */}
        <div className="bg-card rounded-[20px] p-5 shadow-sm border border-line">
          <h3 className="font-serif text-lg font-semibold text-ink mb-3">
            {t.bestWindows}
          </h3>
          <div className="flex flex-col gap-2.5">
            {bestWindow.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-line last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-good/10 flex items-center justify-center">
                    <span className="text-good text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink">
                      {String(w.hour).padStart(2, "0")}:00 –{" "}
                      {String(w.hour + 1).padStart(2, "0")}:00
                    </div>
                    <div className="text-xs text-muted">Lowest price window</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-lg font-semibold text-good">
                    {w.price.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted">SEK/kWh</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-accent-soft/50 rounded-xl">
            <p className="text-sm text-accent-hi font-medium">
              Save ~{((dayMax - dayMin) * 2).toFixed(0)} SEK vs peak pricing
            </p>
            <p className="text-xs text-muted mt-0.5">
              By running appliances during the cheapest 3-hour window
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
