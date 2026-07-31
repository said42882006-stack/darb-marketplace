"use client";

import { useState } from "react";
import { CreditCard, X, ShieldCheck, Loader2, Check } from "lucide-react";

export default function PaymentModal({
  title,
  amount,
  amountLabel,
  endpoint,
  extra,
  onClose,
  onSuccess,
}: {
  title: string;
  amount: number;
  amountLabel: string;
  endpoint: string; // API route to POST to, e.g. /api/checkout or /api/subscribe
  extra?: Record<string, unknown>;
  onClose: () => void;
  onSuccess: (data: any) => void;
}) {
  const [stage, setStage] = useState<"form" | "loading" | "done" | "error">("form");
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvv: "" });
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage("loading");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, card, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? "تعذّر إتمام العملية");
        setStage("error");
        return;
      }
      setStage("done");
      setTimeout(() => onSuccess(data), 900);
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setStage("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-deep/60">
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden bg-white">
        <div className="p-5 flex items-center justify-between bg-navy">
          <div className="flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5" />
            <span className="font-bold">{title}</span>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {stage === "form" && (
          <form onSubmit={submit} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted">{amountLabel}</span>
              <span className="text-xl font-bold text-teal font-num">{amount} ﷼</span>
            </div>
            <label className="text-sm font-medium text-ink">
              اسم حامل البطاقة
              <input required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                placeholder="الاسم كما يظهر على البطاقة" />
            </label>
            <label className="text-sm font-medium text-ink">
              رقم البطاقة
              <input required maxLength={19} value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                placeholder="0000 0000 0000 0000" />
            </label>
            <div className="flex gap-3">
              <label className="text-sm font-medium text-ink flex-1">
                تاريخ الانتهاء
                <input required value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="MM/YY" />
              </label>
              <label className="text-sm font-medium text-ink w-24">
                CVV
                <input required maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="123" />
              </label>
            </div>
            <button type="submit" className="mt-2 w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2 bg-teal text-white hover:bg-teal-deep transition-colors focus:outline-none focus:ring-2 focus:ring-navy">
              <ShieldCheck className="w-4 h-4" />
              تأكيد الدفع
            </button>
            <p className="text-xs text-center text-muted">
              مدفوعات مشفّرة عبر بوابة Moyasar. في بيئة التطوير يتم محاكاة الاستجابة.
            </p>
          </form>
        )}

        {stage === "loading" && (
          <div className="p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
            <span className="text-sm text-muted">جارٍ معالجة الدفع...</span>
          </div>
        )}

        {stage === "done" && (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-teal">
              <Check className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-navy">تمت العملية بنجاح</span>
          </div>
        )}

        {stage === "error" && (
          <div className="p-8 flex flex-col items-center gap-3">
            <p className="text-sm text-center text-red-600">{error}</p>
            <button onClick={() => setStage("form")} className="text-sm font-bold text-teal underline">
              حاول مرة أخرى
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
