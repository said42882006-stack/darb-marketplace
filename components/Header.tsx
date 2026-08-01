"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import AuthStatus from "./AuthStatus";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";

export default function Header() {
  const { locale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-navy">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-brand font-bold text-white tracking-wide">OTR</span>
          <span className="text-xs text-sand-deep hidden sm:inline">{t("tagline")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="text-sm font-medium text-sand/90 hover:text-white px-3 py-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {categoryLabel(c, locale)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <LanguageToggle />
          <AuthStatus />
          <Link
            href="/post"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold bg-amber text-white hover:bg-amber-deep transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Plus className="w-4 h-4" />
            {t("postAd")}
          </Link>
        </div>
      </div>
      <nav className="md:hidden flex gap-2 overflow-x-auto px-4 pb-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.id}`}
            className="shrink-0 text-xs font-medium text-sand/90 hover:text-white px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            {categoryLabel(c, locale)}
          </Link>
        ))}
      </nav>
    </header>
  );
}
