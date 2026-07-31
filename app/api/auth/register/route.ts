import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: "الرجاء تعبئة الاسم والبريد وكلمة المرور" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ success: false, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, message: "هذا البريد الإلكتروني مسجّل مسبقاً" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: hashed },
  });

  sendMail({
    to: email,
    subject: "مرحباً بك في دَرْب",
    html: `<div dir="rtl" style="font-family:sans-serif"><h2>مرحباً ${name} 👋</h2><p>تم إنشاء حسابك بنجاح في منصة دَرْب. يمكنك الآن نشر الإعلانات وإدارة حجوزاتك.</p></div>`,
  }).catch((err) => console.error("[mail] welcome email failed:", err));

  return NextResponse.json({ success: true, userId: user.id });
}
