"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import PaymentModal from "./PaymentModal";

export default function BookingPanel({
  listingId,
  title,
  price,
  unit,
}: {
  listingId: string;
  title: string;
  price: number;
  unit: string;
}) {
  const { data: session } = useSession();
  const [stage, setStage] = useState<"idle" | "contact" | "pay" | "done">("idle");
  const [contact, setContact] = useState({
    name: session?.user?.name || "",
    phone: "",
    email: session?.user?.email || "",
  });

  return (
    <>
      {stage === "idle" && (
        <button
          onClick={() => setStage("contact")}
          className="w-full rounded-xl py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
        >
          احجز الآن
        </button>
      )}

      {stage === "contact" && (
        <div className="flex flex-col gap-2 border border-line rounded-xl p-4 bg-white">
          <label className="text-sm font-medium text-ink">
            الاسم
            <input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            رقم الجوال
            <input
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            البريد الإلكتروني (لإرسال تأكيد الحجز)
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </label>
          <button
            disabled={!contact.name || !contact.phone}
            onClick={() => setStage("pay")}
            className="mt-1 w-full rounded-xl py-2.5 font-bold bg-navy text-white disabled:opacity-40 hover:bg-navy-deep transition-colors"
          >
            متابعة إلى الدفع
          </button>
        </div>
      )}

      {stage === "done" && (
        <div className="flex items-center gap-2 text-sm text-teal font-medium">
          <Check className="w-4 h-4" />
          تم الحجز بنجاح{contact.email ? " — أُرسل التأكيد إلى بريدك" : ""}
        </div>
      )}

      {stage === "pay" && (
        <PaymentModal
          title={`حجز: ${title}`}
          amount={price}
          amountLabel={`السعر ${unit}`}
          endpoint="/api/checkout"
          extra={{
            listingId,
            customerName: contact.name,
            customerPhone: contact.phone,
            customerEmail: contact.email,
          }}
          onClose={() => setStage("contact")}
          onSuccess={() => setStage("done")}
        />
      )}
    </>
  );
}
