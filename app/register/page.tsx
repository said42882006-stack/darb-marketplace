"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, MailCheck } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.message ?? "تعذّر إنشاء الحساب");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <MailCheck className="w-14 h-14 text-teal" />
        <h1 className="text-xl font-display font-bold text-navy">تحقق من بريدك الإلكتروني</h1>
        <p className="text-sm text-muted">
          أرسلنا رابط تأكيد إلى <span className="font-bold text-ink">{form.email}</span>. اضغط عليه لتفعيل حسابك، ثم سجّل الدخول.
        </p>
        <Link href="/login" className="mt-2 rounded-xl px-6 py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors">
          الذهاب لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-display font-bold text-navy mb-6 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-teal" />
        إنشاء حساب
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="text-sm font-medium text-ink">
          الاسم
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
        </label>
        <label className="text-sm font-medium text-ink">
          البريد الإلكتروني
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
        </label>
        <label className="text-sm font-medium text-ink">
          رقم الجوال
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
        </label>
        <label className="text-sm font-medium text-ink">
          كلمة المرور
          <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
        </label>
        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-xl py-3 font-bold bg-teal text-white hover:bg-teal-deep transition-colors disabled:opacity-50"
        >
          {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>
      <p className="text-sm text-muted mt-4">
        لديك حساب؟{" "}
        <Link href="/login" className="text-teal font-bold">
          سجّل الدخول
        </Link>
      </p>
    </div>
  );
}
