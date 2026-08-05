import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { toE164Oman } from "@/lib/phone";

const VERIFICATION_VALID_MINUTES = 30;

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();

  if (!phone || !password) {
    return NextResponse.json({ success: false, message: "البيانات غير مكتملة" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ success: false, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
  }

  const normalizedPhone = toE164Oman(phone);

  const verification = await prisma.phoneVerification.findUnique({ where: { phone: normalizedPhone } });
  if (!verification?.verified || !verification.verifiedAt) {
    return NextResponse.json({ success: false, message: "يجب تأكيد رقم الجوال أولاً" }, { status: 400 });
  }
  const minutesSinceVerified = (Date.now() - verification.verifiedAt.getTime()) / 60000;
  if (minutesSinceVerified > VERIFICATION_VALID_MINUTES) {
    return NextResponse.json({ success: false, message: "انتهت صلاحية التأكيد — أعد تأكيد الرقم" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
  if (!user) {
    return NextResponse.json({ success: false, message: "لا يوجد حساب بهذا الرقم" }, { status: 404 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
