import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { toE164Oman } from "@/lib/phone";
import { signMobileToken } from "@/lib/mobileAuth";

export async function POST(req: NextRequest) {
  const { phone, password } = await req.json();
  if (!phone || !password) {
    return NextResponse.json({ success: false, message: "البيانات غير مكتملة" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { phone: toE164Oman(phone) } });
  if (!user) {
    return NextResponse.json({ success: false, message: "رقم الجوال أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ success: false, message: "رقم الجوال أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const token = signMobileToken(user.id);
  return NextResponse.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, phone: user.phone, email: user.email },
  });
}
