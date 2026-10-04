import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Radera ditt konto – PrognosEL",
  description:
    "Så raderar du ditt PrognosEL-konto och alla uppgifter vi har om dig. Gör det direkt i appen, i webbversionen, eller via e-post.",
  alternates: {
    canonical: "https://prognosel.energy/radera-konto/",
  },
};

/**
 * Public account-deletion page.
 *
 * Google Play requires a reachable web resource describing how to delete an
 * account, separate from the in-app path — this page is that resource, and the
 * Data Safety form links to it. It is deliberately public (no login) and
 * explains the email fallback for anyone who can no longer sign in.
 */

export default function RaderaKontoPage() {
  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#1C1814",
    margin: "40px 0 12px",
  };
  const body: React.CSSProperties = {
    color: "#5B554E",
    fontSize: 16,
    lineHeight: 1.8,
  };
  const list: React.CSSProperties = { paddingLeft: 20, margin: "12px 0" };

  return (
    <div style={{ padding: "120px 32px 80px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/"
          style={{
            fontSize: 14,
            color: "#8C847C",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
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
        Ditt konto
      </div>
      <h1
        style={{
          fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif",
          fontSize: "clamp(32px, 5vw, 46px)",
          fontWeight: 700,
          lineHeight: 1.1,
          color: "#1C1814",
          margin: "0 0 24px",
        }}
      >
        Radera ditt konto
      </h1>

      <div style={body}>
        <p>
          Du kan radera ditt PrognosEL-konto och allt som hör till det när som
          helst. Raderingen är permanent och kan inte ångras.
        </p>

        <h2 style={sectionTitle}>Detta raderas</h2>
        <ul style={list}>
          <li>Ditt konto och din e-postadress</li>
          <li>Din profil och ditt valda elområde</li>
          <li>Dina uppgifter, inklusive din dagars serie</li>
          <li>Din chatt med Sparky</li>
          <li>Din användningsstatistik kopplad till kontot</li>
          <li>
            Enhetstoken för pushnotiser, om du har slagit på notiser i
            Android-appen
          </li>
        </ul>
        <p>
          Inga uppgifter behålls efter raderingen, och vi säljer eller delar
          aldrig dina uppgifter vidare.
        </p>

        <h2 style={sectionTitle}>Så här gör du</h2>

        <p>
          <strong>I Android-appen:</strong> öppna Inställningar → Radera konto →
          bekräfta. Kontot raderas direkt.
        </p>
        <p>
          <strong>I webbversionen:</strong> logga in och gå till Inställningar →
          Radera konto → bekräfta.
        </p>
        <p>
          <strong>Om du inte kan logga in:</strong> mejla{" "}
          <a href="mailto:hello@prognosel.se" style={{ color: "#C4623A" }}>
            hello@prognosel.se
          </a>{" "}
          från den e-postadress som är kopplad till kontot. Skriv
          &quot;Radera konto&quot; i ämnesraden. Vi behandlar begäran inom 30
          dagar.
        </p>

        <h2 style={sectionTitle}>Hur lång tid det tar</h2>
        <p>
          När du raderar kontot själv i appen eller på webben sker det omedelbart.
          Säkerhetskopior som innehåller uppgifterna skrivs över inom 30 dagar.
        </p>

        <h2 style={sectionTitle}>Frågor</h2>
        <p>
          Läs mer om hur vi hanterar personuppgifter i{" "}
          <Link
            href="/integritetspolicy/"
            style={{ color: "#C4623A" }}
          >
            integritetspolicyn
          </Link>
          , eller mejla{" "}
          <a href="mailto:hello@prognosel.se" style={{ color: "#C4623A" }}>
            hello@prognosel.se
          </a>
          .
        </p>
      </div>
    </div>
  );
}
