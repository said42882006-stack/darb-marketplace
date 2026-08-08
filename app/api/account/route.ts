import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toE164Oman } from "@/lib/phone";
import { resolveUserId } from "@/lib/mobileAuth";
import { PLANS } from "@/lib/constants";

// Used by the mobile app (no server-rendered account page there) to fetch the
// full profile + subscription + listings in one call.
export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const [user, activeSubscription, listings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subscriber.findFirst({
      where: { userId, active: true, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
    }),
    prisma.listing.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      photo: user.photo,
      gender: user.gender,
      birthdate: user.birthdate?.toISOString().slice(0, 10) ?? null,
      accountType: user.accountType,
    },
    subscriptionPlanName: activeSubscription ? PLANS.find((p) => p.id === activeSubscription.planId)?.name ?? null : null,
    subscriptionExpiresAt: activeSubscription?.expiresAt?.toISOString() ?? null,
    listings: listings.map((l) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      price: l.price,
      createdAt: l.createdAt.toISOString(),
      expiresAt: l.expiresAt?.toISOString() ?? null,
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const { name, phone, gender, birthdate, accountType, photo } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ success: false, message: "الاسم مطلوب" }, { status: 400 });
  }

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
