"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { PLANS, Plan } from "@/lib/constants";
import PaymentModal from "@/components/PaymentModal";

type Interval = "monthly" | "yearly";

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [interval, setInterval] = useState<Interval>("monthly");
  const [payingPlan, setPayingPlan] = useState<Plan | null>(null);

  const startCheckout = (plan: Plan) => {
    if (!session?.user) {
      router.push("/login?next=/pricing");
      return;
    }
    setPayingPlan(plan);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-bold text-navy mb-2">باقات نشر الإعلانات</h1>
      <p className="text-sm text-muted mb-6">اشترك بنشر غير محدود طوال مدة الاشتراك، بدل الدفع لكل إعلان.</p>

      <div className="inline-flex rounded-full border border-line bg-white p-1 mb-8">
        <button
          onClick={() => setInterval("monthly")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
            interval === "monthly" ? "bg-teal text-white" : "text-ink"
          }`}
        >
          شهري
        </button>
        <button
          onClick={() => setInterval("yearly")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
            interval === "yearly" ? "bg-teal text-white" : "text-ink"
          }`}
        >
          سنوي <span className="text-xs opacity-80">(وفّر ~17%)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((p) => {
          const price = interval === "yearly" ? p.yearlyPriceOMR : p.monthlyPriceOMR;
          return (
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
                <span className="text-3xl font-bold text-teal font-num">{price}</span>
                <span className="text-sm text-muted"> ر.ع. / {interval === "yearly" ? "سنة" : "شهر"}</span>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => startCheckout(p)}
                className="mt-auto text-center rounded-xl py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors"
              >
                ابدأ الآن
              </button>
            </div>
          );
        })}
      </div>

      {payingPlan && (
        <PaymentModal
          title={`الاشتراك في الباقة ${payingPlan.name}`}
          kind="subscription"
          payload={{ planId: payingPlan.id, interval }}
          onClose={() => setPayingPlan(null)}
          onSuccess={() => {
            setPayingPlan(null);
            router.push("/post");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
