import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toE164Oman } from "@/lib/phone";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) {
    return NextResponse.json({ success: false, message: "البيانات غير مكتملة" }, { status: 400 });
  }

  const normalized = toE164Oman(phone);
  const record = await prisma.phoneVerification.findUnique({ where: { phone: normalized } });
  if (!record) {
    return NextResponse.json({ success: false, message: "لم يُرسل أي رمز لهذا الرقم بعد" }, { status: 404 });
  }
  if (record.verified) {
    return NextResponse.json({ success: true, alreadyVerified: true });
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ success: false, message: "تجاوزت عدد المحاولات المسموح — اطلب رمزاً جديداً" }, { status: 429 });
  }
  if (record.expiresAt < new Date()) {
    return NextResponse.json({ success: false, message: "انتهت صلاحية الرمز — اطلب رمزاً جديداً" }, { status: 400 });
  }

  if (record.code !== String(code).trim()) {
    const attempts = record.attempts + 1;
    await prisma.phoneVerification.update({ where: { phone: normalized }, data: { attempts } });
    const remaining = MAX_ATTEMPTS - attempts;
    return NextResponse.json(
      { success: false, message: remaining > 0 ? `رمز غير صحيح — ${remaining} محاولات متبقية` : "رمز غير صحيح — اطلب رمزاً جديداً" },
      { status: 400 }
    );
  }

  await prisma.phoneVerification.update({
    where: { phone: normalized },
    data: { verified: true, verifiedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
