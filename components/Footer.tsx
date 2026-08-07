"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t, locale } = useLanguage();
  const pathname = usePathname();
  if (pathname?.startsWith("/chat/")) return null;

  return (
    <footer className="border-t border-line mt-10 bg-white">
      {/* Welcome blurb */}
      <div className="max-w-6xl mx-auto px-4 py-8 border-b border-line">
        <h2 className="font-display font-bold text-lg text-navy mb-2">مرحباً بكم في OTR — سوق عُمان للإيجارات والنقل</h2>
        <p className="text-sm text-muted leading-relaxed max-w-3xl">
          OTR منصة إعلانات مبوّبة تجمع كل ما يُؤجَّر أو يُنقَل في عُمان بمكان واحد: عقارات، أراضٍ، شاليهات، منتجعات، فنادق،
          سيارات، دراجات، قوارب، وخدمات النقل العام والمندوب والرافعات والمعدات الثقيلة والكرفان. تصفّح الإعلانات، وتواصل مع المعلن مباشرة عبر
          الاتصال أو واتساب دون وسيط.
        </p>
      </div>

      {/* Link columns */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
        <div>
          <h3 className="font-bold text-sm text-navy mb-3">الأقسام</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.id}`} className="hover:text-teal transition-colors">
                  {categoryLabel(c, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm text-navy mb-3">المنصة</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li><Link href="/post" className="hover:text-teal transition-colors">{t("postAd")}</Link></li>
            <li><Link href="/pricing" className="hover:text-teal transition-colors">{t("pricing")}</Link></li>
            <li><Link href="/account" className="hover:text-teal transition-colors">حسابي</Link></li>
            <li><Link href="/register" className="hover:text-teal transition-colors">إنشاء حساب</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm text-navy mb-3">تعرّف علينا</h3>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li><Link href="/about" className="hover:text-teal transition-colors">عن الموقع</Link></li>
            <li><Link href="/terms" className="hover:text-teal transition-colors">الشروط والأحكام</Link></li>
            <li><Link href="/contact" className="hover:text-teal transition-colors">تواصل معنا</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <span>© {new Date().getFullYear()} OTR. جميع الحقوق محفوظة.</span>
          <span>عُمان</span>
        </div>
      </div>
    </footer>
  );
}
