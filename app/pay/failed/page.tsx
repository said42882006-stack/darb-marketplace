import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage({ searchParams }: { searchParams: { reason?: string } }) {
  const cancelled = searchParams.reason === "cancelled";

  return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
      <XCircle className="w-14 h-14 text-red-500" />
      <h1 className="text-xl font-display font-bold text-navy">
        {cancelled ? "تم إلغاء عملية الدفع" : "تعذّر تأكيد الدفع"}
      </h1>
      <p className="text-sm text-muted">
        {cancelled
          ? "ألغيت عملية الدفع قبل إتمامها. لم يتم خصم أي مبلغ."
          : "لم نتمكن من تأكيد نجاح الدفع. إذا تم خصم مبلغ من بطاقتك، تواصل معنا وسنراجع الأمر."}
      </p>
      <Link href="/post" className="mt-2 rounded-xl px-6 py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors">
        المحاولة مرة أخرى
      </Link>
    </div>
  );
}
