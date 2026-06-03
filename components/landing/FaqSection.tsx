"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Vad är spotpris på el och hur fungerar det?",
    a: "Spotpriset är det timvisa marknadspriset för el på Nordpool-börsen. Det bestäms av utbud och efterfrågan varje timme och varierar kraftigt under dygnet — typiskt billigast på natten (02–06) och dyrast på morgon- och kvällstoppar (07–09, 17–20).",
  },
  {
    q: "Hur noggrann är PrognosEL:s elprognos?",
    a: "Vår AI-modell tränas kontinuerligt på historiska Nordpool-priser, väderdata och förbrukningsprognoser. För 24h-prognoser har vi ett genomsnittligt absolut procentuellt fel (MAPE) på under 8%. Prognosen fungerar bäst under stabila förhållanden och kan bli osäkrare vid extremväder.",
  },
  {
    q: "Varför skiljer sig elpriset i SE4 (Malmö) från SE1 (Luleå)?",
    a: "SE1 (Norrland) har överskott på vattenkraft och låg förbrukning, vilket ger lägre priser. SE4 (södra Sverige) är mer beroende av importerad el och kärnkraft, och påverkas starkare av Europas elmarknader och kabelkapacitet. Prisskillnaden kan vara 2–3x under höglasttimmar.",
  },
  {
    q: "När är elen billigast under dygnet?",
    a: "Generellt är elen billigast mellan kl. 02:00 och 06:00 på natten, samt mitt på dagen (11–14) på soliga dagar med hög solproduktion. Dyrast är det vanligtvis 07–09 och 17–20 när hushåll och industri förbrukar som mest. PrognosEL visar exakt vilka timmar som är billigast i ditt område.",
  },
  {
    q: "Är PrognosEL gratis att använda?",
    a: "Ja, PrognosEL är helt gratis. Du kan se realtidspriser för alla fyra elområden utan att logga in. Skapar du ett gratis konto (med Google eller GitHub) får du tillgång till AI-prognosen, veckoplaneraren, Sparky-assistenten och personliga spartips.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="landing-faq-section" aria-labelledby="faq-heading">
      <div className="landing-faq-inner">
        <div className="landing-section-eyebrow" style={{ textAlign: "center" }}>
          Vanliga frågor
        </div>
        <h2
          className="landing-section-title"
          id="faq-heading"
          style={{ textAlign: "center", margin: "0 auto 0" }}
        >
          Allt om<br /><em>elpriser & prognos</em>
        </h2>

        <div className="landing-faq-list" itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`landing-faq-item ${openIndex === i ? "open" : ""}`}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                className="landing-faq-q"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
              >
                <span itemProp="name">{faq.q}</span>
                <div className="landing-faq-icon">+</div>
              </button>
              <div
                className="landing-faq-a"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div className="landing-faq-a-inner" itemProp="text">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
