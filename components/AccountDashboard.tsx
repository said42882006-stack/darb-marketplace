"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { User, Trash2, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { CATEGORY_MAP } from "@/lib/constants";
import PhoneOtpForm from "./PhoneOtpForm";
import AvatarUploader from "./AvatarUploader";

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
  photo,
  gender,
  birthdate,
  accountType,
  subscriptionPlanName,
  subscriptionExpiresAt,
  listings,
}: {
  name: string;
  email: string | null;
  phone: string;
  photo: string | null;
  gender: string | null;
  birthdate: string | null;
  accountType: string;
  subscriptionPlanName: string | null;
  subscriptionExpiresAt: string | null;
  listings: ListingRow[];
}) {
  const { update } = useSession();

  const [form, setForm] = useState({
    name,
    phone,
    gender: gender ?? "",
    birthdate: birthdate ?? "",
    accountType: accountType ?? "personal",
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(photo);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [awaitingOtpFor, setAwaitingOtpFor] = useState<string | null>(null);

  const [rows, setRows] = useState(listings);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const doSave = async (dataOverride?: Partial<typeof form>) => {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...dataOverride, photo: photoUrl }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok || !data.success) {
      setError(data.message ?? "تعذّر حفظ التعديلات");
      return;
    }
    setSaved(true);
    await update({ name: data.name, phone: data.phone });
    setTimeout(() => setSaved(false), 2500);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneChanged = form.phone !== phone;
    if (phoneChanged) {
      setSaving(true);
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone }),
      });
      setSaving(false);
      setAwaitingOtpFor(form.phone);
      return;
    }
    await doSave();
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

  if (awaitingOtpFor) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <PhoneOtpForm
          phone={awaitingOtpFor}
          onVerified={async () => {
            setAwaitingOtpFor(null);
            await doSave();
          }}
        />
      </div>
    );
  }

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
            بدون اشتراك فعّال حالياً — نشر إعلانات إضافية يتطلب اشتراكاً بباقة.
          </div>
        )}
        <Link href="/pricing" className="text-xs font-bold text-teal underline w-fit">
          {subscriptionPlanName ? "إدارة الاشتراك" : "عرض باقات الاشتراك"}
        </Link>
      </div>

      {/* Profile form */}
      <form onSubmit={saveProfile} className="rounded-xl border border-line bg-white p-5 flex flex-col gap-4">
        <h2 className="font-bold text-navy">البيانات الشخصية</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <AvatarUploader value={photoUrl} onChange={setPhotoUrl} />

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
          رقم الجوال
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
          {form.phone !== phone && (
            <span className="text-xs text-amber block mt-1">سيُطلب منك تأكيد الرقم الجديد عبر واتساب بعد الحفظ.</span>
          )}
        </label>
        <label className="text-sm font-medium text-ink">
          البريد الإلكتروني
          <input
            disabled
            value={email ?? "لم يُضف بريد إلكتروني"}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm bg-sand text-muted cursor-not-allowed"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          الجنس
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white"
          >
            <option value="">غير محدد</option>
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          تاريخ الميلاد
          <input
            type="date"
            value={form.birthdate}
            onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </label>
        <div className="text-sm font-medium text-ink flex flex-col gap-2">
          نوع الحساب
          <div className="flex gap-2">
            <label className="flex-1 flex items-center gap-2 rounded-xl border border-line p-3 cursor-pointer has-[:checked]:border-teal has-[:checked]:bg-sand">
              <input type="radio" checked={form.accountType === "personal"} onChange={() => setForm({ ...form, accountType: "personal" })} />
              شخصي
            </label>
            <label className="flex-1 flex items-center gap-2 rounded-xl border border-line p-3 cursor-pointer has-[:checked]:border-teal has-[:checked]:bg-sand">
              <input type="radio" checked={form.accountType === "business"} onChange={() => setForm({ ...form, accountType: "business" })} />
              تجاري
            </label>
          </div>
        </div>

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
