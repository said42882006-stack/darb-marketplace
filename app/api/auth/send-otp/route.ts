import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppOtp } from "@/lib/whatsapp";
import { generateOtp, toE164Oman } from "@/lib/phone";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone || phone.replace(/\D/g, "").length < 8) {
    return NextResponse.json({ success: false, message: "رقم الجوال غير صالح" }, { status: 400 });
  }

  const normalized = toE164Oman(phone);
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.phoneVerification.upsert({
    where: { phone: normalized },
    create: { phone: normalized, code, expiresAt, attempts: 0, verified: false },
    update: { code, expiresAt, attempts: 0, verified: false, verifiedAt: null },
  });

  const result = await sendWhatsAppOtp(phone, code).catch((err) => {
    console.error("[whatsapp] OTP send failed:", err);
    return { sent: false, mode: "mock" as const };
  });

  return NextResponse.json({ success: true, whatsappMode: result.mode });
}
