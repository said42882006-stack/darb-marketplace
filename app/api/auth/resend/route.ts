import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ success: false, message: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond success-shaped even if not found, to avoid leaking which emails are registered.
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true });
  }

  const verifyToken = randomBytes(32).toString("hex");
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken, verifyTokenExpiry },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verifyToken}`;

  sendMail({
    to: email,
    subject: "أكّد بريدك الإلكتروني - دَرْب",
    html: `
      <div dir="rtl" style="font-family:sans-serif;line-height:1.8">
        <h2>مرحباً ${user.name} 👋</h2>
        <p>إليك رابط تأكيد جديد لبريدك الإلكتروني:</p>
        <p>
          <a href="${verifyUrl}" style="background:#2F6F6B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
            تأكيد البريد الإلكتروني
          </a>
        </p>
        <p style="color:#7A7362;font-size:13px">هذا الرابط صالح لمدة 24 ساعة.</p>
      </div>`,
  }).catch((err) => console.error("[mail] resend verification failed:", err));

  return NextResponse.json({ success: true });
}
