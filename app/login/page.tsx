"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Phone } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      phone: form.phone,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("رقم الجوال أو كلمة المرور غير صحيحة");
      return;
    }
    router.push("/post");
    router.refresh();
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-14">
      <h1 className="text-2xl font-display font-bold text-navy mb-6 flex items-center gap-2">
        <LogIn className="w-6 h-6 text-teal" />
        تسجيل الدخول
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <label className="text-sm font-medium text-ink">
          رقم الجوال
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-line px-3 py-2 focus-within:ring-2 focus-within:ring-teal">
            <Phone className="w-4 h-4 text-muted shrink-0" />
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="9xxxxxxx"
              className="flex-1 min-w-0 text-sm focus:outline-none"
            />
          </div>
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
        <Link href="/forgot-password" className="text-xs font-bold text-teal hover:underline w-fit -mt-1">
          نسيت كلمة المرور؟
        </Link>
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
