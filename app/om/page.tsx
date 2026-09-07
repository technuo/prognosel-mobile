import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om PrognosEL – Så fungerar vår elprognos",
  description:
    "PrognosEL är en gratis webbapp som hjälper svenska hushåll att se när elen är billig – med realtidspriser för SE1–SE4, AI-prognos och smarta spartips.",
  alternates: {
    canonical: "https://prognosel.energy/om/",
  },
};

export default function OmPage() {
  return (
    <div style={{ padding: "120px 32px 80px", maxWidth: 720, margin: "0 auto" }}>
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
          textTransform: "uppercase",
          color: "#C4623A",
          marginBottom: 16,
        }}
      >
        Om PrognosEL
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif",
          fontSize: "clamp(32px, 5vw, 48px)",
          fontWeight: 700,
          lineHeight: 1.1,
          color: "#1C1814",
          margin: "0 0 24px",
        }}
      >
        Elpriser gör om man gör något åt dem.
      </h1>

      <div style={{ color: "#5B554E", fontSize: 16, lineHeight: 1.8 }}>
        <p>
          PrognosEL är en gratis webbapp som visar svenska hushåll när elen är billig. Sverige är
          indelat i fyra elområden (SE1–SE4) där priset ändras varje timme – och med ett
          timprisavtal kan skillnaden mellan dyraste och billigaste timmen vara flera kronor per
          kilowattimme.
        </p>
        <p>
          Vi visar <Link href="/elpriser/" style={{ color: "#C4623A" }}>aktuella elpriser per timme</Link>,
          en <Link href="/prognos/" style={{ color: "#C4623A" }}>AI-driven 24-timmarsprognos</Link> och
          en <Link href="/guide/" style={{ color: "#C4623A" }}>kunskapsbank med guider</Link> – så att du kan
          flytta tvätt, disk och elbilsladdning till de timmar som lönar sig.
        </p>
        <p>
          PrognosEL byggdes under första halvan av 2026 av en enskild utvecklare som tyckte att det
          borde vara enklare att veta när elen är billig.
        </p>
      </div>

      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#1C1814",
          margin: "40px 0 12px",
        }}
      >
        Våra datakällor
      </h2>
      <div style={{ color: "#5B554E", fontSize: 16, lineHeight: 1.8 }}>
        <p>
          Priserna kommer från den nordiska elbörsen Nord Pool, levererade i realtid via NordAPI,
          med en reservkedja via Supabase för att hålla tjänsten uppe även om en datakälla störs.
        </p>
      </div>

      <h2
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#1C1814",
          margin: "40px 0 12px",
        }}
      >
        Viktigt att veta
      </h2>
      <div style={{ color: "#5B554E", fontSize: 16, lineHeight: 1.8 }}>
        <p>
          Prognoser och besparingsuppskattningar är just uppskattningar – de är inte garantier.
          Priserna du ser är spotpris med en ungefärlig återförsäljaruppräkning (moms och påslag
          kan skilja sig mellan elhandlare) och exkluderar elnätsavgifter.
        </p>
        <p>
          Läs mer om hur vi hanterar dina uppgifter i vår{" "}
          <Link href="/integritetspolicy/" style={{ color: "#C4623A" }}>integritetspolicy</Link>.
        </p>
      </div>

      <div style={{ marginTop: 48, textAlign: "center" }}>
        <p style={{ color: "#B5AFA8", fontSize: 14 }}>
          Frågor eller feedback?{" "}
          <a href="mailto:hello@prognosel.se" style={{ color: "#C4623A", textDecoration: "none" }}>
            Kontakta oss
          </a>
          .
        </p>
      </div>
    </div>
  );
}
