"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, MailCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsVerification(false);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      if (res.error.includes("تأكيد بريدك")) {
        setNeedsVerification(true);
        setError(res.error);
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
      return;
    }
    router.push("/post");
    router.refresh();
  };

  const resend = async () => {
    setResendState("sending");
    await fetch("/api/auth/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    setResendState("sent");
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-display font-bold text-navy mb-6 flex items-center gap-2">
        <LogIn className="w-6 h-6 text-teal" />
        تسجيل الدخول
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}

        {needsVerification && (
          <div className="rounded-xl border border-amber/40 bg-sand p-3 flex flex-col gap-2">
            <p className="text-xs text-ink flex items-center gap-1.5">
              <MailCheck className="w-4 h-4 text-amber shrink-0" />
              لم يوصلك الإيميل؟
            </p>
            <button
              type="button"
              onClick={resend}
              disabled={resendState !== "idle"}
              className="text-xs font-bold text-teal underline disabled:opacity-60 text-right"
            >
              {resendState === "idle" && "أعد إرسال رابط التأكيد"}
              {resendState === "sending" && "جارٍ الإرسال..."}
              {resendState === "sent" && "تم الإرسال ✅ تحقق من بريدك"}
            </button>
          </div>
        )}

        <label className="text-sm font-medium text-ink">
          البريد الإلكتروني
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          كلمة المرور
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-xl py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors disabled:opacity-50"
        >
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="text-teal font-bold">
          أنشئ حساباً
        </Link>
      </p>
    </div>
  );
}
