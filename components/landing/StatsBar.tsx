export default function StatsBar() {
  const stats = [
    { num: "24h", label: "AI-prognos per zon" },
    { num: "4", label: "Elområden SE1–SE4" },
    { num: "±8%", label: "Genomsnittligt prognosfel" },
    { num: "0 kr", label: "Alltid gratis" },
  ];

  return (
    <div className="landing-stats-bar" role="region" aria-label="Statistik">
      {stats.map((s) => (
        <div key={s.label} className="landing-stat-item">
          <span className="landing-stat-num">{s.num}</span>
          <div className="landing-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
