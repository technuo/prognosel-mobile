"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { translations } from "@/lib/i18n/translations";
import type { Language } from "@/types";

interface LanguageContextType {
  lang: Language;
  t: (typeof translations)["en"];
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: translations.en,
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("prognosel-lang", newLang);
      document.documentElement.lang = newLang;
    }
  }, []);

  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("prognosel-lang") : null;
    if (saved === "en" || saved === "sv") {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
