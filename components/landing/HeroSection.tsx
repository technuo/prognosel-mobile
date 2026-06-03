"use client";

import { useState, useEffect } from "react";

interface PriceData {
  zone: string;
  currentPrice: number;
  trend: "up" | "down" | "stable";
}

interface HeroSectionProps {
  prices: PriceData[];
}

export default function HeroSection({ prices }: HeroSectionProps) {
  const [activeZone, setActiveZone] = useState("SE3");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`Uppdaterad ${h}:${m}`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const trendLabel = (t: string) => {
    if (t === "up") return "↑";
    if (t === "down") return "↓";
    return "→";
  };

  return (
    <section className="landing-hero">
      <div className="landing-eyebrow">
        <span className="landing-live-dot" />
        Realtidsdata · Nordpool
      </div>

      <h1>
        Elpriser idag —
        <br />
        <em>förutspå imorgon</em>
      </h1>

      <p className="landing-hero-sub">
        Spotpriser per timme för SE1–SE4, AI-driven 24h-prognos och smarta spartips. Alltid gratis.
      </p>

      <div className="landing-hero-actions">
        <a href="/login" className="landing-btn-primary">
          Kom igång gratis
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7H12M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <a href="/elpriser" className="landing-btn-secondary">Se elpriser nu</a>
      </div>

      <div className="landing-price-widget">
        <div className="landing-widget-header">
          <span className="landing-widget-title">Spotpris just nu</span>
          <span className="landing-widget-time">{timeStr}</span>
        </div>

        <div className="landing-zones-grid">
          {prices.map((p) => (
            <div
              key={p.zone}
              className={`landing-zone-card ${activeZone === p.zone ? "active" : ""}`}
              onClick={() => setActiveZone(p.zone)}
              role="button"
              tabIndex={0}
            >
              <div className="landing-zone-label">{p.zone}</div>
              <div className="landing-zone-price">{p.currentPrice > 0 ? p.currentPrice : "—"}</div>
              <div className="landing-zone-unit">öre/kWh</div>
              <div className={`landing-zone-trend landing-trend-${p.trend}`}>
                {trendLabel(p.trend)}
              </div>
            </div>
          ))}
        </div>

        <div className="landing-widget-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>Nästa 8h:</span>
            <div className="landing-sparkline" aria-hidden="true">
              {[8, 11, 14, 18, 16, 20, 13, 9].map((h, i) => (
                <div key={i} className={`landing-spark-bar ${i === 3 ? "now" : ""}`} style={{ height: h }} />
              ))}
            </div>
          </div>
          <a href="/prognos" className="landing-forecast-hint">
            Se 24h-prognos
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6H10M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
