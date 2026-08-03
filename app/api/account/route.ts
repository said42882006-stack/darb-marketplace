import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toE164Oman } from "@/lib/phone";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const { name, phone, gender, birthdate, accountType, photo } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ success: false, message: "الاسم مطلوب" }, { status: 400 });
  }

  const userId = (session.user as any).id as string;
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const data: any = {
    name: name.trim(),
    gender: gender || null,
    birthdate: birthdate ? new Date(birthdate) : null,
    accountType: accountType === "business" ? "business" : "personal",
    photo: photo || null,
  };

  if (phone) {
    const normalized = toE164Oman(phone);
    if (normalized !== existing.phone) {
      const verification = await prisma.phoneVerification.findUnique({ where: { phone: normalized } });
      if (!verification?.verified) {
        return NextResponse.json({ success: false, message: "يجب تأكيد الرقم الجديد أولاً عبر واتساب" }, { status: 400 });
      }
      const alreadyUsed = await prisma.user.findFirst({ where: { phone: normalized, id: { not: userId } } });
      if (alreadyUsed) {
        return NextResponse.json({ success: false, message: "رقم الجوال مستخدم بحساب آخر" }, { status: 409 });
      }
      data.phone = normalized;
    }
  }

  const user = await prisma.user.update({ where: { id: userId }, data });

  return NextResponse.json({ success: true, name: user.name, phone: user.phone });
}
