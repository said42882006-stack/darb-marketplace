"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-line py-8 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <span>© {new Date().getFullYear()} OTR. جميع الحقوق محفوظة.</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="hover:text-teal transition-colors">{t("pricing")}</Link>
          <Link href="/post" className="hover:text-teal transition-colors">{t("postAd")}</Link>
        </div>
      </div>
    </footer>
  );
}
