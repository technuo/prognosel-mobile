import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide – Allt om Elpriser, Spotpris & Sparande",
  description:
    "Lär dig allt om svenska elpriser, spotpris, elområden och hur du sparar pengar på el. Faktabaserade guider med realtidsdata från Nordpool.",
  alternates: {
    canonical: "https://prognosel.se/guide/",
  },
};

const articles = [
  {
    slug: "spotpris",
    title: "Spotpris el – Vad är det och hur fungerar det?",
    excerpt:
      "En komplett guide till spotpris: hur det sätts på Nordpool, varför det varierar timme för timme, och hur du som konsument kan dra nytta av det.",
    badge: "Grundläggande",
  },
  {
    slug: "se1-vs-se4",
    title: "SE4 vs SE1: Varför skiljer sig elpriset?",
    excerpt:
      "En djupdykning i Sveriges fyra elområden. Förstå varför priset i södra Sverige kan vara 2–3 gånger högre än i norr.",
    badge: "Elområden",
  },
  {
    slug: "billigaste-timmen",
    title: "Bästa timmen att köra tvätt & diskmaskin",
    excerpt:
      "Praktiska tips för att planera energitunga hushållssysslor. Spara hundratals kronor per år genom att välja rätt timme.",
    badge: "Sparande",
  },
  {
    slug: "negativa-priser",
    title: "Negativa elpriser i Sverige – Vad händer?",
    excerpt:
      "När elpriset går under noll: varför det händer, hur ofta, och vad det betyder för dig som elkonsument.",
    badge: "Avancerat",
  },
  {
    slug: "elpriser-2025",
    title: "Varför är elpriset högt just nu?",
    excerpt:
      "En analys av faktorerna bakom dagens elpriser: väder, vind, kärnkraft, och europeiska marknader.",
    badge: "Aktuellt",
  },
  {
    slug: "minska-elrakning",
    title: "10 sätt att minska din elräkning med spotpris",
    excerpt:
      "Konkreta åtgärder som alla kan vidta för att sänka elräkningen när man har timprisavtal.",
    badge: "Sparande",
  },
];

export default function GuidePage() {
  return (
    <div style={{ padding: "120px 32px 80px", maxWidth: 960, margin: "0 auto" }}>
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
        Kunskapsbank
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
        Guide till elpriser
      </h1>
      <p style={{ color: "#8C847C", fontSize: 16, maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}>
        Faktabaserade artiklar om svenska elpriser, spotpris och hur du sparar pengar.
      </p>

      <div style={{ display: "grid", gap: 16 }}>
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/guide/${a.slug}/`}
            style={{
              display: "block",
              background: "#F5F1EB",
              border: "1px solid rgba(28,24,20,0.10)",
              borderRadius: 16,
              padding: "24px 28px",
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#C4623A",
                  background: "#F4E4DC",
                  padding: "4px 10px",
                  borderRadius: 100,
                }}
              >
                {a.badge}
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#1C1814",
                margin: "0 0 8px",
              }}
            >
              {a.title}
            </h2>
            <p style={{ color: "#8C847C", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
              {a.excerpt}
            </p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 48, textAlign: "center" }}>
        <p style={{ color: "#B5AFA8", fontSize: 14 }}>
          Fler artiklar kommer snart. Har du förslag på ämnen?{" "}
          <a href="mailto:hello@prognosel.se" style={{ color: "#C4623A", textDecoration: "none" }}>
            Kontakta oss
          </a>
          .
        </p>
      </div>
    </div>
  );
}
