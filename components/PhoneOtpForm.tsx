"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

export default function PhoneOtpForm({
  phone,
  onVerified,
}: {
  phone: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/confirm-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.message ?? "تعذّر التحقق من الرمز");
      return;
    }
    onVerified();
  };

  const resend = async () => {
    setResendState("sending");
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setResendState("sent");
    setTimeout(() => setResendState("idle"), 15000);
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <MessageCircle className="w-12 h-12 text-teal" />
      <div>
        <h2 className="text-lg font-bold text-navy">تأكيد رقم الجوال</h2>
        <p className="text-sm text-muted mt-1">أرسلنا رمزاً مكوّناً من 6 أرقام عبر واتساب إلى {phone}.</p>
      </div>

      <form onSubmit={submit} className="w-full flex flex-col gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          required
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="- - - - - -"
          className="w-full rounded-lg border border-line px-3 py-3 text-center text-xl tracking-[0.5em] font-num focus:outline-none focus:ring-2 focus:ring-teal"
        />
        <button
          disabled={loading || code.length < 6}
          type="submit"
          className="w-full rounded-xl py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors disabled:opacity-50"
        >
          {loading ? "جارٍ التحقق..." : "تأكيد"}
        </button>
      </form>

      <button
        type="button"
        onClick={resend}
        disabled={resendState !== "idle"}
        className="text-xs font-bold text-teal underline disabled:opacity-60"
      >
        {resendState === "idle" && "لم يصلك الرمز؟ أعد الإرسال"}
        {resendState === "sending" && "جارٍ الإرسال..."}
        {resendState === "sent" && "تم الإرسال ✅ (تحقق من واتساب)"}
      </button>
    </div>
  );
}
