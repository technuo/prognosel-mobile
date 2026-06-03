interface PriceData {
  zone: string;
  currentPrice: number;
}

interface ZonesSectionProps {
  prices: PriceData[];
}

const zoneMeta: Record<string, { name: string; cities: string }> = {
  SE1: { name: "Norra Sverige", cities: "Luleå · Umeå · Östersund" },
  SE2: { name: "Norra mellansverige", cities: "Sundsvall · Falun · Gävle" },
  SE3: { name: "Södra mellansverige", cities: "Stockholm · Uppsala · Västerås" },
  SE4: { name: "Södra Sverige", cities: "Malmö · Göteborg · Helsingborg" },
};

export default function ZonesSection({ prices }: ZonesSectionProps) {
  return (
    <section className="landing-zones-section" aria-labelledby="zones-heading">
      <div className="landing-zones-inner">
        <div className="landing-section-eyebrow">Sveriges elområden</div>
        <h2 className="landing-section-title" id="zones-heading">
          Elpriser för<br /><em>ditt område</em>
        </h2>
        <p className="landing-section-desc">
          Sverige är uppdelat i fyra elområden med olika prisbildning. Välj ditt område för timvisa priser och prognos.
        </p>

        <div className="landing-zones-list">
          {prices.map((p) => {
            const meta = zoneMeta[p.zone];
            if (!meta) return null;
            return (
              <a
                key={p.zone}
                href={`/elpriser/${p.zone.toLowerCase()}/`}
                className="landing-zone-row"
                aria-label={`Elpris ${p.zone} ${meta.name}`}
              >
                <div className="landing-zone-badge">{p.zone}</div>
                <div className="landing-zone-info">
                  <div className="landing-zone-name">{meta.name}</div>
                  <div className="landing-zone-cities">{meta.cities}</div>
                </div>
                <div className="landing-zone-live-price">
                  <div className="landing-zone-live-num">
                    {p.currentPrice > 0 ? `${p.currentPrice} öre` : "—"}
                  </div>
                  <div className="landing-zone-live-sub">nu / kWh</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
