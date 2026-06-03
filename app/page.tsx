import { Metadata } from "next";
import "./landing.css";
import { JsonLd } from "@/components/landing/JsonLd";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ZonesSection from "@/components/landing/ZonesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import { fetchAllZonesPrices } from "@/lib/api/prices-server";

export const metadata: Metadata = {
  title: "PrognosEL – Elpriser Idag & AI-Prognos för SE1–SE4",
  description:
    "Se aktuella elpriser per timme för hela Sverige. AI-driven 24h-prognos för SE1, SE2, SE3 och SE4. Spara pengar med smarta tips. Helt gratis.",
  alternates: {
    canonical: "https://prognosel.se",
  },
};

export const revalidate = 60; // Revalidate every 60 seconds for fresh prices

export default async function LandingPage() {
  const prices = await fetchAllZonesPrices();

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PrognosEL",
    url: "https://prognosel.se",
    description: "AI-driven elprisprognoser för Sverige. Realtidsdata för SE1–SE4.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SEK",
    },
    inLanguage: ["sv", "en"],
  };

  return (
    <div className="landing">
      <JsonLd data={webAppSchema} />

      {/* Navigation */}
      <nav className="landing-nav" role="navigation" aria-label="Huvudnavigation">
        <a href="/" className="landing-nav-brand" aria-label="PrognosEL hem">
          <div className="landing-nav-icon">
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
              <path d="M9.5 2L4 9H8.5L7 14L13 7H8.5L9.5 2Z" stroke="#C4623A" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <span className="landing-nav-name">PrognosEL</span>
        </a>
        <ul className="landing-nav-links">
          <li><a href="/elpriser">Elpriser</a></li>
          <li><a href="/prognos">Prognos</a></li>
          <li><a href="/guide">Guide</a></li>
          <li><a href="/login" className="landing-nav-cta">Logga in</a></li>
        </ul>
      </nav>

      <main>
        <HeroSection prices={prices} />
        <StatsBar />
        <FeaturesGrid />
        <ZonesSection prices={prices} />
        <HowItWorks />
        <FaqSection />
        <CtaSection />
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span>© 2025 PrognosEL · Data från Nordpool</span>
          <ul className="landing-footer-links">
            <li><a href="/elpriser">Elpriser</a></li>
            <li><a href="/prognos">Prognos</a></li>
            <li><a href="/guide">Guide</a></li>
            <li><a href="/om">Om oss</a></li>
            <li><a href="/integritetspolicy">Integritet</a></li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
