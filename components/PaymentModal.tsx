"use client";

import { useState, useEffect } from "react";
import { CreditCard, X, ShieldCheck, Loader2, Check, ExternalLink } from "lucide-react";

type Kind = "subscription";

export default function PaymentModal({
  title,
  kind,
  payload,
  onClose,
  onSuccess,
}: {
  title: string;
  kind: Kind;
  payload: Record<string, unknown>;
  onClose: () => void;
  onSuccess: (data: any) => void;
}) {
  const [stage, setStage] = useState<"init" | "live" | "form" | "loading" | "done" | "error">("init");
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvv: "" });
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [amountOMR, setAmountOMR] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, ...payload }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) {
          setError(data.message ?? "تعذّر بدء عملية الدفع");
          setStage("error");
          return;
        }
        if (data.live) {
          setRedirectUrl(data.redirectUrl);
          setStage("live");
        } else {
          setPendingId(data.pendingId);
          setAmountOMR(data.amountOMR);
          setItemName(data.name);
          setStage("form");
        }
      } catch {
        if (!cancelled) {
          setError("تعذّر الاتصال بالخادم");
          setStage("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submitMock = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage("loading");
    try {
      const res = await fetch("/api/pay/mock-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, card }),
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

        {stage === "init" && (
          <div className="p-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal" />
            <span className="text-sm text-muted">جارٍ التحضير...</span>
          </div>
        )}

        {stage === "live" && redirectUrl && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <ShieldCheck className="w-12 h-12 text-teal" />
            <p className="text-sm text-ink">
              رح يتم تحويلك لصفحة دفع آمنة عبر <span className="font-bold">Thawani Pay</span> لإكمال العملية.
            </p>
            <a
              href={redirectUrl}
              className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2 bg-teal text-white hover:bg-teal-deep transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              المتابعة للدفع الآمن
            </a>
          </div>
        )}

        {stage === "form" && (
          <form onSubmit={submitMock} className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted">{itemName}</span>
              <span className="text-xl font-bold text-teal font-num">{amountOMR} ر.ع.</span>
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
              وضع تجريبي — لا يوجد بوابة دفع حقيقية مفعّلة بعد، لا تُجرى أي عملية دفع فعلية.
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
            <button onClick={onClose} className="text-sm font-bold text-teal underline">
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
