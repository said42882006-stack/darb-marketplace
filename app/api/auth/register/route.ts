import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
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
  const verifyToken = randomBytes(32).toString("hex");
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: hashed,
      emailVerified: false,
      verifyToken,
      verifyTokenExpiry,
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verifyToken}`;

  sendMail({
    to: email,
    subject: "أكّد بريدك الإلكتروني - دَرْب",
    html: `
      <div dir="rtl" style="font-family:sans-serif;line-height:1.8">
        <h2>مرحباً ${name} 👋</h2>
        <p>شكراً لتسجيلك في منصة دَرْب. لإكمال إنشاء حسابك، فضلاً أكّد بريدك الإلكتروني بالضغط على الرابط التالي:</p>
        <p>
          <a href="${verifyUrl}" style="background:#2F6F6B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
            تأكيد البريد الإلكتروني
          </a>
        </p>
        <p style="color:#7A7362;font-size:13px">هذا الرابط صالح لمدة 24 ساعة. إذا لم يعمل الزر، انسخ والصق هذا الرابط بالمتصفح:<br>${verifyUrl}</p>
      </div>`,
  }).catch((err) => console.error("[mail] verification email failed:", err));

  return NextResponse.json({ success: true, userId: user.id });
}
