"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok || !data.success) {
      setError(data.message ?? "تعذّر إرسال الرسالة");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <CheckCircle2 className="w-14 h-14 text-teal" />
        <h1 className="text-xl font-display font-bold text-navy">تم إرسال رسالتك ✅</h1>
        <p className="text-sm text-muted">شكراً لتواصلك معنا — راح نراجع رسالتك ونرد عليك عبر وسيلة التواصل اللي تركتها.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-display font-bold text-navy mb-1 flex items-center gap-2">
        <Mail className="w-6 h-6 text-teal" />
        تواصل معنا
      </h1>
      <p className="text-sm text-muted mb-6">استفساراتكم ومقترحاتكم تهمّنا — راسلنا وراح نرد عليك بأقرب وقت.</p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="text-sm font-medium text-ink">
          الاسم
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
        </label>
        <label className="text-sm font-medium text-ink">
          البريد الإلكتروني أو رقم الجوال
          <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })}
            placeholder="حتى نقدر نرد عليك"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
        </label>
        <label className="text-sm font-medium text-ink">
          رسالتك
          <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="استفسار، مشكلة، أو اقتراح لتحسين الموقع..."
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
        </label>
        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-xl py-3 font-bold bg-teal text-white hover:bg-teal-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? "جارٍ الإرسال..." : "إرسال"}
        </button>
      </form>
    </div>
  );
}
