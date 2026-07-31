import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;

  let result: "success" | "invalid" | "expired" = "invalid";

  if (token) {
    const user = await prisma.user.findUnique({ where: { verifyToken: token } });
    if (user) {
      if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
        result = "expired";
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true, verifyToken: null, verifyTokenExpiry: null },
        });
        result = "success";
      }
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
      {result === "success" && (
        <>
          <CheckCircle2 className="w-14 h-14 text-teal" />
          <h1 className="text-xl font-display font-bold text-navy">تم تأكيد بريدك الإلكتروني ✅</h1>
          <p className="text-sm text-muted">يمكنك الآن تسجيل الدخول واستخدام حسابك بالكامل.</p>
          <Link href="/login" className="mt-2 rounded-xl px-6 py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors">
            تسجيل الدخول
          </Link>
        </>
      )}

      {result === "expired" && (
        <>
          <XCircle className="w-14 h-14 text-amber" />
          <h1 className="text-xl font-display font-bold text-navy">انتهت صلاحية رابط التأكيد</h1>
          <p className="text-sm text-muted">هذا الرابط صالح لمدة 24 ساعة فقط. تقدر تطلب رابطاً جديداً من صفحة تسجيل الدخول.</p>
          <Link href="/login" className="mt-2 rounded-xl px-6 py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors">
            الذهاب لتسجيل الدخول
          </Link>
        </>
      )}

      {result === "invalid" && (
        <>
          <XCircle className="w-14 h-14 text-red-600" />
          <h1 className="text-xl font-display font-bold text-navy">رابط غير صالح</h1>
          <p className="text-sm text-muted">هذا الرابط غير صحيح أو استُخدم من قبل.</p>
          <Link href="/login" className="mt-2 rounded-xl px-6 py-3 font-bold bg-navy text-white hover:bg-navy-deep transition-colors">
            الذهاب لتسجيل الدخول
          </Link>
        </>
      )}
    </div>
  );
}
