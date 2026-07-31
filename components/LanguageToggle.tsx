"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
      className="flex items-center gap-1 text-xs font-bold text-sand/90 hover:text-white transition-colors border border-white/20 rounded-full px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal"
      aria-label="Toggle language"
    >
      <Languages className="w-3.5 h-3.5" />
      {locale === "ar" ? "EN" : "AR"}
    </button>
  );
}
