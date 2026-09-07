import { Metadata } from "next";
import Link from "next/link";
import { articles as articleData } from "./[slug]/articles";

export const metadata: Metadata = {
  title: "Guide – Allt om Elpriser, Spotpris & Sparande",
  description:
    "Lär dig allt om svenska elpriser, spotpris, elområden och hur du sparar pengar på el. Faktabaserade guider med realtidsdata från Nordpool.",
  alternates: {
    canonical: "https://prognosel.energy/guide/",
  },
};

// Driven from articles.ts so the guide list can never drift out of sync with
// the actual article slugs (previously half the cards linked to 404s).
const articles = articleData.map((a) => ({
  slug: a.slug,
  title: a.title,
  excerpt: a.description,
  badge: a.category,
}));

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
