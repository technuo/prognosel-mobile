import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCurrentPrice, fetchZoneStats } from "@/lib/api/forecast";
import { toRetailPrice } from "@/lib/pricing";
import type { ZoneCode } from "@/types";

const zoneMeta: Record<ZoneCode, { name: string; cities: string; desc: string }> = {
  SE1: {
    name: "Norra Sverige",
    cities: "Luleå, Umeå, Östersund",
    desc:
      "SE1 omfattar Norrland och har generellt de lägsta elpriserna i Sverige tack vare riklig vattenkraft och låg befolkningsdensitet.",
  },
  SE2: {
    name: "Norra Mellansverige",
    cities: "Sundsvall, Falun, Gävle",
    desc:
      "SE2 täcker norra delen av Mellansverige och präglas av industriell förbrukning och god tillgång på förnybar el.",
  },
  SE3: {
    name: "Södra Mellansverige",
    cities: "Stockholm, Uppsala, Västerås",
    desc:
      "SE3 är Sveriges största förbrukningsområde med Stockholm i centrum. Priserna är högre än i norr på grund av större efterfrågan.",
  },
  SE4: {
    name: "Södra Sverige",
    cities: "Malmö, Göteborg, Helsingborg",
    desc:
      "SE4 är Sveriges sydligaste elområde och påverkas starkt av europeiska elpriser och importberoende. Här varierar priserna mest.",
  },
};

interface Props {
  params: Promise<{ zone: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zone } = await params;
  const upperZone = zone.toUpperCase() as ZoneCode;
  const meta = zoneMeta[upperZone];
  if (!meta) return {};

  return {
    title: `Elpris ${upperZone} Idag – ${meta.name} Spotpris`,
    description: `Aktuellt elpris för ${upperZone} (${meta.name}). Timvisa spotpriser för ${meta.cities}. Se dagens lägsta, högsta och genomsnittliga pris.`,
    alternates: {
      canonical: `https://prognosel.se/elpriser/${zone.toLowerCase()}/`,
    },
  };
}

export async function generateStaticParams() {
  return [
    { zone: "se1" },
    { zone: "se2" },
    { zone: "se3" },
    { zone: "se4" },
  ];
}

export const revalidate = 60;

export default async function ZonePage({ params }: Props) {
  const { zone } = await params;
  const upperZone = zone.toUpperCase() as ZoneCode;
  const meta = zoneMeta[upperZone];

  if (!meta) {
    notFound();
  }

  const [current, stats] = await Promise.all([
    fetchCurrentPrice(upperZone),
    fetchZoneStats(upperZone, 24),
  ]);

  const currentRetail = Math.round(toRetailPrice(current.price_sek_kwh));

  return (
    <div style={{ padding: "120px 32px 80px", maxWidth: 960, margin: "0 auto" }}>
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
        Elområde {upperZone}
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
        Elpris {upperZone} – {meta.name}
      </h1>
      <p style={{ color: "#8C847C", fontSize: 16, maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}>
        {meta.desc}
      </p>

      {/* Current Price */}
      <div
        style={{
          background: "#F5F1EB",
          borderRadius: 20,
          padding: 40,
          textAlign: "center",
          border: "1px solid rgba(28,24,20,0.10)",
          marginBottom: 32,
        }}
      >
        <div style={{ fontSize: 13, color: "#8C847C", marginBottom: 12 }}>Nuvarande spotpris</div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 64,
            fontWeight: 700,
            color: "#1C1814",
            lineHeight: 1,
          }}
        >
          {currentRetail}
        </div>
        <div style={{ fontSize: 16, color: "#B5AFA8", marginTop: 8 }}>öre / kWh</div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16,
          marginBottom: 48,
        }}
      >
        {[
          { label: "Lägsta idag", value: `${Math.round(stats.min_price)} öre`, time: stats.min_time },
          { label: "Högsta idag", value: `${Math.round(stats.max_price)} öre`, time: stats.max_time },
          { label: "Genomsnitt", value: `${Math.round(stats.avg_price)} öre`, time: null },
          { label: "Område", value: meta.cities, time: null },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#FAF8F5",
              border: "1px solid rgba(28,24,20,0.06)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 11, color: "#8C847C", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1C1814" }}>
              {s.value}
            </div>
            {s.time && <div style={{ fontSize: 12, color: "#B5AFA8", marginTop: 4 }}>kl. {s.time}</div>}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/elpriser/" style={{ color: "#C4623A", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
          ← Alla elområden
        </Link>
        <Link href="/prognos/" style={{ color: "#C4623A", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
          Se 24h-prognos →
        </Link>
      </div>
    </div>
  );
}
