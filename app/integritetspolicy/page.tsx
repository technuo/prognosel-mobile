import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integritetspolicy – PrognosEL",
  description:
    "Hur PrognosEL hanterar dina personuppgifter: vilka uppgifter vi samlar in, varför, var de lagras och dina rättigheter enligt GDPR.",
  alternates: {
    canonical: "https://prognosel.energy/integritetspolicy/",
  },
};

export default function IntegritetspolicyPage() {
  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#1C1814",
    margin: "40px 0 12px",
  };
  const body: React.CSSProperties = { color: "#5B554E", fontSize: 16, lineHeight: 1.8 };
  const list: React.CSSProperties = { paddingLeft: 20, margin: "12px 0" };

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
        Integritetspolicy
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
        Din integritet
      </h1>
      <p style={{ color: "#8C847C", fontSize: 15, marginBottom: 8 }}>
        Senast uppdaterad: 2026-08-27
      </p>

      <div style={body}>
        <p>
          Denna policy beskriver hur PrognosEL behandlar personuppgifter när du använder vår
          webbapp på prognosel.energy. PrognosEL drivs av en enskild utvecklare och vi strävar efter
          att samla in så lite data som möjligt – bara det som behövs för att tjänsten ska fungera.
        </p>

        <h2 style={sectionTitle}>1. Vilka uppgifter vi samlar in</h2>
        <ul style={list}>
          <li>
            <strong>Kontouppgifter (om du loggar in):</strong> när du loggar in med Google eller
            GitHub får vi ditt namn, din e-postadress och din profilbild från den tjänsten.
          </li>
          <li>
            <strong>Ditt elområde (SE1–SE4):</strong> för att visa rätt priser och spartips för just
            dig.
          </li>
          <li>
            <strong>Dina uppgifter och dina sparmål:</strong> de energisparuppgifter du skapar och
            dina resultat.
          </li>
          <li>
            <strong>Chattmeddelanden till Sparky:</strong> frågor du ställer till vår AI-assistent
            behandlas för att kunna besvara dig.
          </li>
          <li>
            <strong>Lokal lagring i din webbläsare:</strong> ditt språkval, elområde, uppgifter och
            chattlogg kan sparas lokalt (localStorage) på din enhet för att tjänsten ska fungera
            även utan konto.
          </li>
        </ul>

        <h2 style={sectionTitle}>2. Varför vi behandlar uppgifterna</h2>
        <p>
          Vi behandlar uppgifterna för att tillhandahålla tjänsten: visa rätt elpriser för ditt
          område, ge personliga spartips, synkronisera dina uppgifter mellan enheter när du är
          inloggad och svara på dina frågor via Sparky. Rättslig grund är ditt samtycke (när du
          loggar in och använder funktionerna) och vårt berättigade intresse av att driva och
          förbättra tjänsten.
        </p>

        <h2 style={sectionTitle}>3. AI-assistenten Sparky</h2>
        <p>
          Dina meddelanden till Sparky skickas till Googles Gemini-modell (via en serverdator vi
          kontrollerar) för att generera svar. Vi använder inte dina meddelanden för att träna
          modeller. Du bör inte dela känsliga personuppgifter i chatten.
        </p>

        <h2 style={sectionTitle}>4. Var uppgifterna lagras</h2>
        <p>
          Uppgifterna lagras hos vår molnleverantör Supabase samt hos de inloggningstjänster du
          använder (Google/GitHub). Överföring till länder utanför EU/EES sker endast med
          skyddsmekanismer enligt GDPR (t.ex. EU:s standardavtalsklausuler).
        </p>

        <h2 style={sectionTitle}>5. Cookies och lokal lagring</h2>
        <p>
          Vi använder inga tredjeparts spårningscookies. Vi använder localStorage i din webbläsare
          för funktionella inställningar (språk, elområde, dina uppgifter). Dessa uppgifter lämnar
          inte din enhet om du inte loggar in.
        </p>

        <h2 style={sectionTitle}>6. Dina rättigheter (GDPR)</h2>
        <ul style={list}>
          <li><strong>Åtkomst:</strong> du kan begära en kopia av de uppgifter vi har om dig.</li>
          <li><strong>Rättelse:</strong> du kan be oss korrigera felaktiga uppgifter.</li>
          <li><strong>Radering:</strong> du kan be oss radera ditt konto och dina uppgifter när som helst.</li>
          <li><strong>Begränsning och invändning:</strong> du kan invända mot behandling som grundas på berättigat intresse.</li>
          <li><strong>Dataportabilitet:</strong> du kan få ut dina uppgifter i ett maskinläsbart format.</li>
        </ul>
        <p>
          För att utöva dina rättigheter, kontakta oss på{" "}
          <a href="mailto:hello@prognosel.se" style={{ color: "#C4623A" }}>hello@prognosel.se</a>.
          Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY).
        </p>

        <h2 style={sectionTitle}>7. Ändringar av denna policy</h2>
        <p>
          Vi kan komma att uppdatera denna policy. Vid väsentliga ändringar meddelar vi dig via
          tjänsten. Datumet högst upp visar när policyn senast uppdaterades.
        </p>

        <h2 style={sectionTitle}>8. Kontakt</h2>
        <p>
          PrognosEL ·{" "}
          <a href="mailto:hello@prognosel.se" style={{ color: "#C4623A" }}>hello@prognosel.se</a>
        </p>
      </div>
    </div>
  );
}
