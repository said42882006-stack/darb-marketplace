import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/constants";

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-navy mb-2">باقات نشر الإعلانات</h1>
      <p className="text-sm text-muted mb-8">اختر الباقة المناسبة لحجم نشاطك، ويمكنك الترقية أو الإلغاء في أي وقت.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl border p-6 flex flex-col gap-4 bg-white ${
              p.popular ? "border-teal ring-2 ring-teal" : "border-line"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-navy flex items-center gap-1.5">
                {p.name}
                {p.popular && <Sparkles className="w-4 h-4 text-amber" />}
              </span>
              {p.popular && <span className="text-xs font-bold text-white bg-teal px-2 py-1 rounded-full">الأكثر طلباً</span>}
            </div>
            <div>
              <span className="text-3xl font-bold text-teal font-num">{p.price}</span>
              <span className="text-sm text-muted"> ﷼ / شهر</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-ink">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/post?plan=${p.id}`}
              className="mt-auto text-center rounded-xl py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors"
            >
              ابدأ الآن
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
