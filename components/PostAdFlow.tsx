"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, CreditCard, CheckCircle2 } from "lucide-react";
import { CATEGORIES, LISTING_CREDIT_PRICE_OMR, LISTING_CREDIT_AMOUNT } from "@/lib/constants";
import PaymentModal from "./PaymentModal";
import ImageUploader from "./ImageUploader";
import LocationPicker, { LocationValue } from "./LocationPicker";

type Step = "details" | "publishing";

export default function PostAdFlow({
  freeRemaining,
  credits,
  subscriptionPlanName,
  subscriptionExpiresAt,
}: {
  freeRemaining: number;
  credits: number;
  subscriptionPlanName?: string | null;
  subscriptionExpiresAt?: string | null;
}) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [remainingFree, setRemainingFree] = useState(freeRemaining);
  const [remainingCredits, setRemainingCredits] = useState(credits);
  const [showPay, setShowPay] = useState(false);
  const [error, setError] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationValue>({ address: "", lat: null, lng: null });
  const [fromLocation, setFromLocation] = useState<LocationValue>({ address: "", lat: null, lng: null });
  const [toLocation, setToLocation] = useState<LocationValue>({ address: "", lat: null, lng: null });

  const [form, setForm] = useState({
    category: "homes",
    title: "",
    description: "",
    price: "",
    ownerName: "",
    ownerPhone: "",
  });

  const catDef = CATEGORIES.find((c) => c.id === form.category)!;
  const canPublish =
    form.title &&
    form.description &&
    form.price &&
    (catDef.isRoute ? fromLocation.address && toLocation.address : location.address);

  const hasActiveSubscription = !!subscriptionPlanName;
  const hasQuota = hasActiveSubscription || remainingFree > 0 || remainingCredits > 0;

  const publish = async () => {
    setStep("publishing");
    setError("");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        images,
        location: location.address,
        lat: location.lat,
        lng: location.lng,
        fromPlace: fromLocation.address,
        toPlace: toLocation.address,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      if (data.code === "NEEDS_CREDIT") {
        setRemainingFree(0);
        setRemainingCredits(0);
      }
      setError(data.message ?? "تعذّر نشر الإعلان");
      setStep("details");
      return;
    }
    router.push(`/listing/${data.listing.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-navy mb-1">نشر إعلان جديد</h1>

      {/* Quota banner */}
      {hasActiveSubscription ? (
        <div className="mb-6 rounded-xl border border-teal/30 bg-sand p-3 flex items-center gap-2 text-sm text-ink">
          <CheckCircle2 className="w-4 h-4 text-teal shrink-0" />
          اشتراكك بباقة <span className="font-bold text-teal">{subscriptionPlanName}</span> فعّال — نشر غير محدود
          {subscriptionExpiresAt && (
            <> حتى <span className="font-num">{new Date(subscriptionExpiresAt).toLocaleDateString("ar")}</span></>
          )}
          .
        </div>
      ) : remainingFree > 0 ? (
        <div className="mb-6 rounded-xl border border-teal/30 bg-sand p-3 flex items-center gap-2 text-sm text-ink">
          <Gift className="w-4 h-4 text-teal shrink-0" />
          لديك <span className="font-bold text-teal font-num">{remainingFree}</span> من إعلاناتك المجانية متبقية.
        </div>
      ) : remainingCredits > 0 ? (
        <div className="mb-6 rounded-xl border border-teal/30 bg-sand p-3 flex items-center gap-2 text-sm text-ink">
          <CreditCard className="w-4 h-4 text-teal shrink-0" />
          لديك <span className="font-bold text-teal font-num">{remainingCredits}</span> رصيد نشر مدفوع متبقٍ.
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-amber/40 bg-sand p-4 flex flex-col gap-3">
          <p className="text-sm text-ink">
            استخدمت إعلاناتك المجانية الثلاثة. لنشر المزيد، اشترِ رصيداً أو اشترك بباقة:
            <span className="font-bold text-teal font-num"> {LISTING_CREDIT_AMOUNT} إعلانات مقابل {LISTING_CREDIT_PRICE_OMR} ر.ع.</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPay(true)}
              className="flex-1 rounded-xl py-2.5 font-bold bg-teal text-white hover:bg-teal-deep transition-colors"
            >
              شراء رصيد النشر
            </button>
            <a
              href="/pricing"
              className="flex-1 rounded-xl py-2.5 font-bold border border-teal text-teal text-center hover:bg-sand-deep transition-colors"
            >
              أو اشترك بباقة
            </a>
          </div>
        </div>
      )}

      {step === "details" && (
        <div className={`flex flex-col gap-3 ${!hasQuota ? "opacity-50 pointer-events-none" : ""}`}>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="text-sm font-medium text-ink">
            القسم
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-ink">
            عنوان الإعلان
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="مثال: شقة مفروشة قريبة من الحرم" />
          </label>
          <label className="text-sm font-medium text-ink">
            الوصف
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="اكتب تفاصيل تهم المستأجر أو المستفيد من الخدمة" />
          </label>
          <label className="text-sm font-medium text-ink">
            السعر (ر.ع.)
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="0" />
          </label>

          {catDef.isRoute ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <LocationPicker label="مكان الاستلام" value={fromLocation} onChange={setFromLocation} />
              </div>
              <div className="flex-1">
                <LocationPicker label="مكان التوصيل" value={toLocation} onChange={setToLocation} />
              </div>
            </div>
          ) : (
            <LocationPicker label="الموقع" value={location} onChange={setLocation} />
          )}

          <ImageUploader images={images} onChange={setImages} />

          <div className="flex gap-3">
            <label className="text-sm font-medium text-ink flex-1">
              اسمك
              <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
            </label>
            <label className="text-sm font-medium text-ink flex-1">
              رقم التواصل
              <input value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal" />
            </label>
          </div>

          <button
            disabled={!canPublish || !hasQuota}
            onClick={publish}
            className="mt-2 w-full rounded-xl py-3 font-bold disabled:opacity-40 bg-navy text-white hover:bg-navy-deep transition-colors"
          >
            نشر الإعلان
          </button>
        </div>
      )}

      {step === "publishing" && <p className="text-sm text-muted">جارٍ نشر الإعلان...</p>}

      {showPay && (
        <PaymentModal
          title="شراء رصيد نشر"
          kind="credit"
          payload={{}}
          onClose={() => setShowPay(false)}
          onSuccess={() => {
            setShowPay(false);
            setRemainingCredits(remainingCredits + LISTING_CREDIT_AMOUNT);
          }}
        />
      )}
    </div>
  );
}
