"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Search, MapPin } from "lucide-react";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import AuthStatus from "./AuthStatus";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "./LanguageProvider";

export default function Header() {
  const { locale, t } = useLanguage();
  const pathname = usePathname();
  if (pathname?.startsWith("/chat/")) return null;

  return (
    <header className="sticky top-0 z-30">
      {/* Thin utility bar */}
      <div className="bg-navy-deep">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs text-sand/80">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            عُمان - كل المدن
          </span>
          <div className="flex items-center gap-3">
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-navy">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0 order-1">
            <span className="text-2xl font-brand font-bold text-white tracking-wide">OTR</span>
          </Link>

          <form action="/" method="get" className="flex-1 min-w-[140px] order-3 sm:order-2 flex items-center bg-white rounded-full overflow-hidden">
            <input
              name="q"
              placeholder="ابحث عن أي شيء..."
              className="flex-1 min-w-0 px-4 py-2 text-sm text-ink focus:outline-none"
            />
            <button
              type="submit"
              aria-label="بحث"
              className="shrink-0 bg-teal hover:bg-teal-deep transition-colors text-white p-2.5 m-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 shrink-0 order-2 sm:order-3">
            <AuthStatus />
            <Link
              href="/post"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold bg-amber text-white hover:bg-amber-deep transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("postAd")}</span>
            </Link>
          </div>
        </div>

        {/* Category strip */}
        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-3 sm:justify-center">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.id}`}
              className="shrink-0 text-xs sm:text-sm font-medium text-sand/90 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {categoryLabel(c, locale)}
            </Link>
          ))}
          <span className="shrink-0 w-px h-4 bg-white/20 mx-1" />
          <Link href="/about" className="shrink-0 text-xs sm:text-sm font-medium text-sand/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal">
            عن الموقع
          </Link>
          <Link href="/terms" className="shrink-0 text-xs sm:text-sm font-medium text-sand/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal">
            الشروط والأحكام
          </Link>
          <Link href="/contact" className="shrink-0 text-xs sm:text-sm font-medium text-sand/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal">
            تواصل معنا
          </Link>
        </nav>
      </div>
    </header>
  );
}
