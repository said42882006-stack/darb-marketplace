import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/constants";
import { hasLiveMoyasarKey, chargeCard } from "@/lib/payments";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول للاشتراك" }, { status: 401 });
  }

  const body = await req.json();
  const { card, planId } = body;

  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ success: false, message: "باقة غير معروفة" }, { status: 400 });
  }
  if (!card?.number || !card?.name || !card?.exp || !card?.cvv) {
    return NextResponse.json({ success: false, message: "بيانات البطاقة غير مكتملة" }, { status: 400 });
  }

  let transactionId: string;

  if (hasLiveMoyasarKey()) {
    const result = await chargeCard(plan.price, `اشتراك OTR - باقة ${plan.name}`, card);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 402 });
    }
    transactionId = result.id!;
  } else {
    await new Promise((r) => setTimeout(r, 400));
    transactionId = `mock_${Date.now()}`;
  }

  const userId = (session.user as any).id as string;
  const subscriber = await prisma.subscriber.create({
    data: { name: session.user.name || card.name, phone: "", planId, active: true, userId },
  });

  if (session.user.email) {
    sendMail({
      to: session.user.email,
      subject: `تفعيل اشتراك ${plan.name} - OTR`,
      html: `<div dir="rtl" style="font-family:sans-serif"><h2>تم تفعيل اشتراكك ✅</h2><p>الباقة: ${plan.name}</p><p>المبلغ: ${plan.price} ﷼ / شهر</p><p>رقم العملية: ${transactionId}</p></div>`,
    }).catch((err) => console.error("[mail] subscription confirmation failed:", err));
  }

  return NextResponse.json({ success: true, subscriptionId: subscriber.id, planId, mode: hasLiveMoyasarKey() ? "live" : "mock" });
}
