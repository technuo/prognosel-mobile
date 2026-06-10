import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/hooks/use-language";

export const metadata: Metadata = {
  metadataBase: new URL("https://prognosel.energy"),
  title: {
    default: "PrognosEL – Elpriser Idag & AI-Prognos för SE1–SE4 | Gratis",
    template: "%s | PrognosEL",
  },
  description:
    "Se aktuella elpriser per timme för hela Sverige. AI-driven 24h-prognos för SE1, SE2, SE3 och SE4. Spara pengar med smarta tips och veckoplanerare. Helt gratis.",
  keywords: [
    "elpriser idag",
    "spotpris el",
    "elprognos Sverige",
    "elpris SE4",
    "elpris SE1",
    "billigaste eltimme",
    "elpriser per timme",
  ],
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: "https://prognosel.energy",
    siteName: "PrognosEL",
    title: "PrognosEL – Elpriser & AI-Prognos Sverige",
    description: "Aktuella spotpriser + 24h AI-prognos för SE1–SE4. Gratis.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrognosEL elpriser och prognos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrognosEL – Elpriser Idag & AI-Prognos",
    description: "Aktuella spotpriser + 24h AI-prognos för SE1–SE4",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://prognosel.energy",
    languages: {
      "sv-SE": "https://prognosel.energy",
      "en-SE": "https://prognosel.energy/en",
    },
  },
  verification: {
    google: "01oh6yk7TRrGao-5fdlt6q64ivBm_gcwdZVBZW2rShs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F5F4EE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
