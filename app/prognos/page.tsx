import { Metadata } from "next";
import Link from "next/link";
import { fetchForecasts } from "@/lib/api/forecast";
import { eurMwhToRetailSekKwh } from "@/lib/pricing";
import type { ZoneCode } from "@/types";

export const metadata: Metadata = {
  title: "Elprognos 24 Timmar – AI-driven Prognos Sverige",
  description:
    "AI-driven elprisprognos för nästa 24 timmar i SE1–SE4. Se när elen är billigast och planera din förbrukning. Genomsnittligt fel under 8%.",
  alternates: {
    canonical: "https://prognosel.se/prognos/",
  },
};

export const revalidate = 300; // 5 minutes

const zones: ZoneCode[] = ["SE1", "SE2", "SE3", "SE4"];

export default async function PrognosPage() {
  const zoneForecasts = await Promise.all(
    zones.map(async (zone) => {
      try {
        const forecasts = await fetchForecasts(zone, 24, 24);
        const hourly = forecasts.map((f) => ({
          hour: new Date(f.timestamp).getHours(),
          price: Math.round(eurMwhToRetailSekKwh(f.predicted_price)),
        }));
        const prices = hourly.map((h) => h.price);
        return {
          zone,
          hourly,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        };
      } catch {
        return { zone, hourly: [], minPrice: 0, maxPrice: 0, avgPrice: 0 };
      }
    })
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Hur noggrann är PrognosEL:s elprognos?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Vår AI-modell har en genomsnittlig felprocent på under 8% för 24h-prognoser, baserat på historisk validering mot Nordpool-data.",
        },
      },
      {
        "@type": "Question",
        name: "Hur långt i förväg kan jag se prognosen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "PrognosEL visar elprisprognoser för kommande 24 timmar. Modellen uppdateras kontinuerligt med nya data.",
        },
      },
    ],
  };

  return (
    <div style={{ padding: "120px 32px 80px", maxWidth: 960, margin: "0 auto" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: 14, color: "#8C847C", textDecoration: "none", fontWeight: 500 }}>
          ← PrognosEL
        </Link>
      </div>

      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
          color: "#C4623A",
          marginBottom: 16,
        }}
      >
        AI-Prognos
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif",
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 700,
          lineHeight: 1.1,
          color: "#1C1814",
          margin: "0 0 16px",
        }}
      >
        Elprognos 24 timmar
      </h1>
      <p style={{ color: "#8C847C", fontSize: 16, maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}>
        AI-driven prognos för elpriset de kommande 24 timmarna. Genomsnittligt fel under 8%.
      </p>

      {zoneForecasts.map((zf) => (
        <div
          key={zf.zone}
          style={{
            background: "#F5F1EB",
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
            border: "1px solid rgba(28,24,20,0.10)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  background: "#1C1814",
                  color: "#FAF8F5",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  padding: "6px 12px",
                  borderRadius: 8,
                  letterSpacing: 1,
                }}
              >
                {zf.zone}
              </span>
              <span style={{ fontSize: 14, color: "#8C847C" }}>
                {zf.avgPrice > 0 ? `Medel: ${zf.avgPrice} öre/kWh` : "Ingen data"}
              </span>
            </div>
            <Link
              href={`/elpriser/${zf.zone.toLowerCase()}/`}
              style={{ fontSize: 13, color: "#C4623A", textDecoration: "none", fontWeight: 500 }}
            >
              Se aktuellt pris →
            </Link>
          </div>

          {zf.hourly.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 80 }}>
              {zf.hourly.map((h, i) => {
                const pct = zf.maxPrice > zf.minPrice
                  ? ((h.price - zf.minPrice) / (zf.maxPrice - zf.minPrice)) * 100
                  : 50;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.max(10, pct)}%`,
                      background: i === 0 ? "#C4623A" : "#B5AFA8",
                      borderRadius: 2,
                      minWidth: 4,
                      transition: "height 0.3s",
                    }}
                    title={`${h.hour}:00 – ${h.price} öre`}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 32 }}>
        <Link href="/elpriser/" style={{ color: "#C4623A", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
          ← Se aktuella elpriser
        </Link>
      </div>
    </div>
  );
}
