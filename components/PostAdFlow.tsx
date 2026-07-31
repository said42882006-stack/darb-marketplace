"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { CATEGORIES, PLANS, Plan } from "@/lib/constants";
import PaymentModal from "./PaymentModal";
import ImageUploader from "./ImageUploader";
import LocationPicker, { LocationValue } from "./LocationPicker";

type Step = "plan" | "details" | "publishing";

export default function PostAdFlow({ initialPlanId }: { initialPlanId?: string }) {
  const router = useRouter();
  const initialPlan = PLANS.find((p) => p.id === initialPlanId);

  const [step, setStep] = useState<Step>("plan");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(initialPlan ?? null);
  const [showPay, setShowPay] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
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

  const publish = async () => {
    setStep("publishing");
    setError("");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        planId: selectedPlan?.id,
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
      setError(data.message ?? "تعذّر نشر الإعلان");
      setStep("details");
      return;
    }
    router.push(`/listing/${data.listing.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-display font-bold text-navy mb-1">نشر إعلان جديد</h1>
      <p className="text-sm text-muted mb-6">
        {subscribed ? "اشتراكك فعّال — يمكنك تعبئة تفاصيل الإعلان الآن." : "يتطلب النشر اختيار باقة اشتراك أولاً."}
      </p>

      {step === "plan" && !subscribed && (
        <div className="flex flex-col gap-3">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p)}
              className={`text-right rounded-xl border p-4 flex flex-col gap-2 focus:outline-none focus:ring-2 focus:ring-teal ${
                selectedPlan?.id === p.id ? "border-teal bg-sand" : "border-line bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-navy">
                  {p.name}
                  {p.popular && <Sparkles className="w-4 h-4 text-amber" />}
                </span>
                <span className="font-bold text-teal font-num">{p.price} ﷼ / شهر</span>
              </div>
              <ul className="text-xs flex flex-col gap-1 text-muted">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0 text-teal" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
          <button
            disabled={!selectedPlan}
            onClick={() => setShowPay(true)}
            className="mt-2 w-full rounded-xl py-3 font-bold disabled:opacity-40 bg-teal text-white hover:bg-teal-deep transition-colors"
          >
            الاشتراك والمتابعة
          </button>
        </div>
      )}

      {(step === "details" || (step === "plan" && subscribed)) && (
        <div className="flex flex-col gap-3">
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
            السعر (﷼)
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
            disabled={!canPublish}
            onClick={publish}
            className="mt-2 w-full rounded-xl py-3 font-bold disabled:opacity-40 bg-navy text-white hover:bg-navy-deep transition-colors"
          >
            نشر الإعلان
          </button>
        </div>
      )}

      {step === "publishing" && <p className="text-sm text-muted">جارٍ نشر الإعلان...</p>}

      {showPay && selectedPlan && (
        <PaymentModal
          title={`الاشتراك في الباقة ${selectedPlan.name}`}
          amount={selectedPlan.price}
          amountLabel="رسوم الاشتراك الشهري"
          endpoint="/api/subscribe"
          extra={{ planId: selectedPlan.id }}
          onClose={() => setShowPay(false)}
          onSuccess={() => {
            setShowPay(false);
            setSubscribed(true);
            setStep("details");
          }}
        />
      )}
    </div>
  );
}
