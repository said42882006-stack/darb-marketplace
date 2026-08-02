import { Phone, MessageCircle } from "lucide-react";

function toWhatsAppDigits(phone: string) {
  // Strip everything but digits; if it looks like a local Omani number (starts with 0
  // or is 8 digits), prefix the country code 968 so the wa.me link resolves correctly.
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 8) digits = `968${digits}`;
  return digits;
}

export default function ContactPanel({ phone, title }: { phone: string | null; title: string }) {
  if (!phone) {
    return (
      <p className="text-sm text-center text-muted rounded-xl border border-line p-3">
        لم يضف المعلن رقم تواصل لهذا الإعلان.
      </p>
    );
  }

  const waDigits = toWhatsAppDigits(phone);
  const waMessage = encodeURIComponent(`مرحباً، شفت إعلانك "${title}" في OTR وحاب أستفسر عنه.`);

  return (
    <div className="flex gap-3">
      <a
        href={`tel:${phone}`}
        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors focus:outline-none focus:ring-2 focus:ring-teal"
      >
        <Phone className="w-4 h-4" />
        اتصال
      </a>
      <a
        href={`https://wa.me/${waDigits}?text=${waMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-bold bg-teal text-white hover:bg-teal-deep transition-colors focus:outline-none focus:ring-2 focus:ring-navy"
      >
        <MessageCircle className="w-4 h-4" />
        واتساب
      </a>
    </div>
  );
}
