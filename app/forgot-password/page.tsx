"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Phone, CheckCircle2 } from "lucide-react";
import PhoneOtpForm from "@/components/PhoneOtpForm";

type Stage = "phone" | "otp" | "newPassword" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [saving, setSaving] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 8) {
      setPhoneError("رقم جوال غير صالح");
      return;
    }
    setSendingOtp(true);
    setPhoneError("");
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setSendingOtp(false);
    setStage("otp");
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }
    setSaving(true);
    setPasswordError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setPasswordError(data.message ?? "تعذّر تحديث كلمة المرور");
      return;
    }
    setStage("done");
  };

  if (stage === "otp") {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <PhoneOtpForm phone={phone} onVerified={() => setStage("newPassword")} />
      </div>
    );
  }

  if (stage === "newPassword") {
    return (
      <div className="max-w-sm mx-auto px-4 py-14">
        <h1 className="text-2xl font-display font-bold text-navy mb-1 flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-teal" />
          كلمة مرور جديدة
        </h1>
        <p className="text-sm text-muted mb-6">تم تأكيد رقمك ✅ — اختر كلمة مرور جديدة.</p>
        <form onSubmit={submitNewPassword} className="flex flex-col gap-3">
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          <label className="text-sm font-medium text-ink">
            كلمة المرور الجديدة
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
          </label>
          <label className="text-sm font-medium text-ink">
            تأكيد كلمة المرور
            <input required type="password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
          </label>
          <button
            disabled={saving}
            type="submit"
            className="mt-2 w-full rounded-xl py-3 font-bold bg-teal text-white hover:bg-teal-deep transition-colors disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
          </button>
        </form>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="w-14 h-14 text-teal" />
        <h1 className="text-xl font-display font-bold text-navy">تم تحديث كلمة المرور ✅</h1>
        <p className="text-sm text-muted">تقدر تسجّل دخول الآن بكلمة المرور الجديدة.</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 rounded-xl px-6 py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors"
        >
          الذهاب لتسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-display font-bold text-navy mb-1 flex items-center gap-2">
        <KeyRound className="w-6 h-6 text-teal" />
        نسيت كلمة المرور
      </h1>
      <p className="text-sm text-muted mb-6">أدخل رقم جوالك المسجّل، وراح نرسل رمز تأكيد عبر واتساب.</p>

      <form onSubmit={sendOtp} className="flex flex-col gap-3">
        {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
        <label className="text-sm font-medium text-ink">
          رقم الجوال
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-line px-3 py-2 focus-within:ring-2 focus-within:ring-teal">
            <Phone className="w-4 h-4 text-muted shrink-0" />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9xxxxxxx"
              className="flex-1 min-w-0 text-sm focus:outline-none"
            />
          </div>
        </label>
        <button
          disabled={sendingOtp}
          type="submit"
          className="mt-2 w-full rounded-xl py-3 font-bold bg-teal text-white hover:bg-teal-deep transition-colors disabled:opacity-50"
        >
          {sendingOtp ? "جارٍ الإرسال..." : "إرسال رمز التأكيد"}
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        تذكّرت كلمة المرور؟{" "}
        <Link href="/login" className="text-teal font-bold">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
