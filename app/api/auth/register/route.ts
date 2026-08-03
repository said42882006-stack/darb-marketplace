import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { toE164Oman } from "@/lib/phone";

const VERIFICATION_VALID_MINUTES = 30; // how long a confirmed OTP stays usable to complete registration

export async function POST(req: NextRequest) {
  const { name, phone, password, email, gender, birthdate, accountType, photo } = await req.json();

  if (!name || !phone || !password) {
    return NextResponse.json({ success: false, message: "الرجاء تعبئة الاسم ورقم الجوال وكلمة المرور" }, { status: 400 });
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
    return NextResponse.json({ success: false, message: "انتهت صلاحية تأكيد الرقم — أعد تأكيده" }, { status: 400 });
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
  if (existingPhone) {
    return NextResponse.json({ success: false, message: "رقم الجوال مسجّل مسبقاً" }, { status: 409 });
  }
  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "هذا البريد الإلكتروني مسجّل مسبقاً" }, { status: 409 });
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  const verifyToken = email ? randomBytes(32).toString("hex") : null;
  const verifyTokenExpiry = email ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

  const user = await prisma.user.create({
    data: {
      name,
      phone: normalizedPhone,
      password: hashed,
      email: email || null,
      gender: gender || null,
      birthdate: birthdate ? new Date(birthdate) : null,
      accountType: accountType === "business" ? "business" : "personal",
      photo: photo || null,
      phoneVerified: true,
      emailVerified: !email, // true (vacuously) when no email was provided, so it never blocks login
      verifyToken,
      verifyTokenExpiry,
    },
  });

  if (email && verifyToken) {
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${verifyToken}`;
    sendMail({
      to: email,
      subject: "أكّد بريدك الإلكتروني - OTR",
      html: `
        <div dir="rtl" style="font-family:sans-serif;line-height:1.8">
          <h2>مرحباً ${name} 👋</h2>
          <p>شكراً لتسجيلك في منصة OTR. لتأكيد بريدك الإلكتروني، اضغط الرابط التالي:</p>
          <p>
            <a href="${verifyUrl}" style="background:#2F6F6B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
              تأكيد البريد الإلكتروني
            </a>
          </p>
          <p style="color:#7A7362;font-size:13px">هذا الرابط صالح لمدة 24 ساعة.</p>
        </div>`,
    }).catch((err) => console.error("[mail] verification email failed:", err));
  }

  return NextResponse.json({ success: true, userId: user.id });
}
