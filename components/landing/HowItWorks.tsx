const steps = [
  {
    num: "1",
    title: "Välj ditt elområde",
    desc: "Välj SE1, SE2, SE3 eller SE4 baserat på var du bor. Priserna varierar kraftigt mellan norr och söder.",
  },
  {
    num: "2",
    title: "Se pris & prognos",
    desc: "Kolla aktuellt spotpris och vår AI-prognos för de närmaste 24 timmarna. Planera din förbrukning smart.",
  },
  {
    num: "3",
    title: "Spara pengar",
    desc: "Flytta energitunga uppgifter till billiga timmar. Kör tvätt och ladda elbilen när priset är som lägst.",
  },
];

export default function HowItWorks() {
  return (
    <section className="landing-how-section" aria-labelledby="how-heading">
      <div className="landing-section-eyebrow">Så fungerar det</div>
      <h2 className="landing-section-title" id="how-heading">
        Igång på<br /><em>tre steg</em>
      </h2>

      <div className="landing-steps">
        {steps.map((s) => (
          <div key={s.num} className="landing-step">
            <div className="landing-step-num">{s.num}</div>
            <h3 className="landing-step-title">{s.title}</h3>
            <p className="landing-step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
