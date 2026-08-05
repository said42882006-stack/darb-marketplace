import { Phone, MessageCircle as WhatsAppIcon } from "lucide-react";
import { toWhatsAppDigits } from "@/lib/phone";
import ChatButton from "./ChatButton";

export default function ContactPanel({ phone, title, listingId }: { phone: string | null; title: string; listingId: string }) {
  const waDigits = phone ? toWhatsAppDigits(phone) : null;
  const waMessage = encodeURIComponent(`مرحباً، شفت إعلانك "${title}" في OTR وحاب أستفسر عنه.`);

  return (
    <div className="flex gap-3">
      {phone && (
        <>
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
            <WhatsAppIcon className="w-4 h-4" />
            واتساب
          </a>
        </>
      )}
      <ChatButton listingId={listingId} />
    </div>
  );
}
