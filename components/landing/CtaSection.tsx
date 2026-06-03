export default function CtaSection() {
  return (
    <section className="landing-cta-section" aria-labelledby="cta-heading">
      <div className="landing-cta-eyebrow">Börja spara idag</div>
      <h2 className="landing-cta-title" id="cta-heading">
        Vet alltid när<br /><em>elen är billig</em>
      </h2>
      <p className="landing-cta-sub">Gratis · Ingen kreditkort · Redo på 30 sekunder</p>
      <a href="/login" className="landing-btn-light">Skapa gratis konto</a>
    </section>
  );
}
