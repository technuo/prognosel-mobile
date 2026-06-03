const features = [
  {
    icon: "⚡",
    iconClass: "landing-icon-rust",
    title: "Realtids spotpris",
    desc: "Timvisa elpriser direkt från Nordpool för alla fyra svenska elområden. Uppdateras varje timme dygnet runt.",
    href: "/elpriser",
    link: "Se elpriser idag →",
  },
  {
    icon: "🔮",
    iconClass: "landing-icon-sage",
    title: "AI-driven prognos",
    desc: "Vår maskininlärningsmodell förutspår elpriset de kommande 24 timmarna med ett genomsnittligt fel på under 8%.",
    href: "/prognos",
    link: "Se elprognos →",
  },
  {
    icon: "📅",
    iconClass: "landing-icon-gold",
    title: "Veckoplanerare",
    desc: "Se ett priskarta för hela veckan och hitta de billigaste timmarna att köra tvätt, diskmaskin och elbil.",
    href: "/dashboard/planner/",
    link: "Planera din vecka →",
  },
  {
    icon: "🤖",
    iconClass: "landing-icon-rust",
    title: "Sparky AI-assistent",
    desc: "Chatta med vår AI om elpriser, spartips och när det är bäst att ladda din elbil eller köra energitunga uppgifter.",
    href: "/dashboard/sparky/",
    link: "Prata med Sparky →",
  },
  {
    icon: "📊",
    iconClass: "landing-icon-sage",
    title: "Prisjämförelse SE1–SE4",
    desc: "Förstå varför priset i SE4 (Malmö) skiljer sig från SE1 (Luleå). Interaktiva zongrafik och historisk analys.",
    href: "/guide/se1-vs-se4",
    link: "Läs om elzoner →",
  },
  {
    icon: "🎯",
    iconClass: "landing-icon-gold",
    title: "Smarta spartips",
    desc: "Dagliga, personliga tips baserade på ditt elområde och aktuella prismönster. Spara hundratals kronor per år.",
    href: "/login",
    link: "Kom igång →",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="landing-section" aria-labelledby="features-heading">
      <div className="landing-section-eyebrow">Funktioner</div>
      <h2 className="landing-section-title" id="features-heading">
        Mer än bara<br /><em>elpriser</em>
      </h2>
      <p className="landing-section-desc">
        PrognosEL kombinerar realtidsdata med AI-prognoser så att du alltid vet när det lönar sig att driva tunga apparater.
      </p>

      <div className="landing-features-grid">
        {features.map((f, i) => (
          <div key={f.title} className="landing-feature-card">
            <div className={`landing-feature-icon ${f.iconClass}`}>{f.icon}</div>
            <h3 className="landing-feature-title">{f.title}</h3>
            <p className="landing-feature-desc">{f.desc}</p>
            <a href={f.href} className="landing-feature-link">{f.link}</a>
          </div>
        ))}
      </div>
    </section>
  );
}
