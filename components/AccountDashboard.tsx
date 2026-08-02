"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Trash2, Gift, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { CATEGORY_MAP } from "@/lib/constants";

interface ListingRow {
  id: string;
  title: string;
  category: string;
  price: number;
  createdAt: string;
  expiresAt: string | null;
}

export default function AccountDashboard({
  name,
  email,
  phone,
  credits,
  subscriptionPlanName,
  subscriptionExpiresAt,
  listings,
}: {
  name: string;
  email: string;
  phone: string | null;
  credits: number;
  subscriptionPlanName: string | null;
  subscriptionExpiresAt: string | null;
  listings: ListingRow[];
}) {
  const { update } = useSession();

  const [form, setForm] = useState({ name, phone: phone ?? "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [rows, setRows] = useState(listings);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setError(data.message ?? "تعذّر حفظ التعديلات");
      return;
    }
    setSaved(true);
    await update({ name: data.name });
    setTimeout(() => setSaved(false), 2500);
  };

  const deleteListing = async (id: string) => {
    if (!confirm("متأكد تبي تحذف هذا الإعلان؟ لا يمكن التراجع.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
    const data = await res.json();
    setDeletingId(null);
    if (!res.ok || !data.success) {
      alert(data.message ?? "تعذّر حذف الإعلان");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy mb-1 flex items-center gap-2">
          <User className="w-6 h-6 text-teal" />
          حسابي
        </h1>
        <p className="text-sm text-muted">إدارة بياناتك الشخصية وإعلاناتك المنشورة.</p>
      </div>

      {/* Quota / subscription status */}
      <div className="rounded-xl border border-line bg-white p-4 flex flex-col gap-2 text-sm">
        {subscriptionPlanName ? (
          <div className="flex items-center gap-2 text-ink">
            <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
            اشتراكك بباقة <span className="font-bold text-teal">{subscriptionPlanName}</span> فعّال
            {subscriptionExpiresAt && (
              <> حتى <span className="font-num">{new Date(subscriptionExpiresAt).toLocaleDateString("ar")}</span></>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-ink">
            <CreditCard className="w-4 h-4 text-teal shrink-0" />
            رصيد النشر المدفوع المتبقي: <span className="font-bold text-teal font-num">{credits}</span>
          </div>
        )}
        <Link href="/pricing" className="text-xs font-bold text-teal underline w-fit">إدارة الاشتراك والرصيد</Link>
      </div>

      {/* Profile form */}
      <form onSubmit={saveProfile} className="rounded-xl border border-line bg-white p-5 flex flex-col gap-3">
        <h2 className="font-bold text-navy">البيانات الشخصية</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <label className="text-sm font-medium text-ink">
          الاسم
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          البريد الإلكتروني
          <input
            disabled
            value={email}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm bg-sand text-muted cursor-not-allowed"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          رقم الجوال
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <button
          disabled={saving}
          type="submit"
          className="mt-1 rounded-xl py-2.5 font-bold bg-navy text-white hover:bg-navy-deep transition-colors disabled:opacity-50 w-fit px-6"
        >
          {saving ? "جارٍ الحفظ..." : saved ? "تم الحفظ ✅" : "حفظ التعديلات"}
        </button>
      </form>

      {/* My listings */}
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-navy">إعلاناتي ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">لم تنشر أي إعلان بعد.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((l) => {
              const isExpired = l.expiresAt ? new Date(l.expiresAt) < new Date() : false;
              const daysLeft = l.expiresAt
                ? Math.max(0, Math.ceil((new Date(l.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
                : null;
              return (
                <div key={l.id} className="rounded-xl border border-line bg-white p-3 flex items-center justify-between gap-3">
                  <Link href={`/listing/${l.id}`} className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-medium text-ink truncate">{l.title}</span>
                    <span className="text-xs text-muted flex items-center gap-2">
                      {CATEGORY_MAP[l.category]?.label ?? l.category} · {l.price} ر.ع.
                      {isExpired ? (
                        <span className="text-amber font-bold">· منتهي</span>
                      ) : daysLeft !== null ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {daysLeft} يوم متبقٍ
                        </span>
                      ) : null}
                    </span>
                  </Link>
                  <button
                    onClick={() => deleteListing(l.id)}
                    disabled={deletingId === l.id}
                    aria-label="حذف الإعلان"
                    className="shrink-0 rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
