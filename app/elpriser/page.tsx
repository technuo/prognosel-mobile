import { Metadata } from "next";
import Link from "next/link";
import { fetchAllZonesPrices } from "@/lib/api/prices-server";

export const metadata: Metadata = {
  title: "Elpriser Idag Sverige – Spotpris per Timme",
  description:
    "Aktuella elpriser per timme för SE1, SE2, SE3 och SE4. Se dagens lägsta, högsta och genomsnittliga spotpris för ditt elområde. Uppdateras i realtid från Nordpool.",
  alternates: {
    canonical: "https://prognosel.se/elpriser/",
  },
};

export const revalidate = 60;

export default async function ElpriserPage() {
  const prices = await fetchAllZonesPrices();

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Svenska elpriser – realtidsdata",
    description: "Timvisa spotpriser för SE1, SE2, SE3 och SE4 från Nordpool.",
    temporalCoverage: "2023/..",
    spatialCoverage: {
      "@type": "Place",
      name: "Sweden",
    },
    creator: {
      "@type": "Organization",
      name: "PrognosEL",
      url: "https://prognosel.se",
    },
  };

  return (
    <div style={{ padding: "120px 32px 80px", maxWidth: 960, margin: "0 auto" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
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
        Realtidsdata
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
        Elpriser idag
      </h1>
      <p style={{ color: "#8C847C", fontSize: 16, maxWidth: 480, lineHeight: 1.7, marginBottom: 48 }}>
        Aktuella spotpriser per timme för alla svenska elområden. Uppdateras varje timme.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 48 }}>
        {prices.map((p) => (
          <Link
            key={p.zone}
            href={`/elpriser/${p.zone.toLowerCase()}/`}
            style={{
              background: "#F5F1EB",
              border: "1px solid rgba(28,24,20,0.10)",
              borderRadius: 16,
              padding: "24px 28px",
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                letterSpacing: 1,
                color: "#8C847C",
                marginBottom: 8,
              }}
            >
              {p.zone}
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36,
                fontWeight: 700,
                color: "#1C1814",
                lineHeight: 1,
              }}
            >
              {p.currentPrice > 0 ? `${p.currentPrice} öre` : "—"}
            </div>
            <div style={{ fontSize: 13, color: "#B5AFA8", marginTop: 4 }}>/ kWh</div>
            <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 12, color: "#8C847C" }}>
              <span>Min: {p.minPrice > 0 ? p.minPrice : "—"}</span>
              <span>Max: {p.maxPrice > 0 ? p.maxPrice : "—"}</span>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ background: "#F5F1EB", borderRadius: 16, padding: 24, border: "1px solid rgba(28,24,20,0.10)" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#1C1814",
            margin: "0 0 12px",
          }}
        >
          Vad är spotpris?
        </h2>
        <p style={{ color: "#8C847C", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
          Spotpriset är det timvisa marknadspriset för el på Nordpool-börsen. Det bestäms av utbud och efterfrågan varje timme och varierar kraftigt under dygnet. Med PrognosEL kan du se priserna i realtid och planera din elförbrukning för att spara pengar.
        </p>
        <div style={{ marginTop: 16 }}>
          <Link
            href="/guide/spotpris"
            style={{ fontSize: 13, fontWeight: 600, color: "#C4623A", textDecoration: "none" }}
          >
            Läs mer om spotpris →
          </Link>
        </div>
      </div>
    </div>
  );
}
