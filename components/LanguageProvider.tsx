"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { dict, Locale, DictKey } from "@/lib/i18n";

interface Ctx {
  locale: Locale;
  t: (key: DictKey) => string;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<Ctx | null>(null);

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("darb-locale")) as Locale | null;
    if (stored === "ar" || stored === "en") applyLocale(stored);
  }, []);

  const applyLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
    if (typeof window !== "undefined") localStorage.setItem("darb-locale", l);
  }, []);

  const t = useCallback((key: DictKey) => dict[locale][key] ?? dict.ar[key], [locale]);

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale: applyLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
