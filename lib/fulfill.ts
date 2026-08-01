import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { PLANS, LISTING_CREDIT_AMOUNT } from "@/lib/constants";

export async function fulfillPendingPayment(pendingId: string) {
  const pending = await prisma.pendingPayment.findUnique({ where: { id: pendingId } });
  if (!pending) return { success: false, message: "العملية غير موجودة" };
  if (pending.status === "fulfilled") return { success: true, alreadyFulfilled: true };

  const payload = JSON.parse(pending.payload);

  if (pending.kind === "credit") {
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { listingCredits: { increment: LISTING_CREDIT_AMOUNT } },
    });
    await prisma.pendingPayment.update({ where: { id: pendingId }, data: { status: "fulfilled" } });
    if (user.email) {
      sendMail({
        to: user.email,
        subject: "تم شراء رصيد نشر إضافي - OTR",
        html: `<div dir="rtl" style="font-family:sans-serif"><h2>تم تفعيل رصيدك ✅</h2><p>أضفنا ${LISTING_CREDIT_AMOUNT} إعلانات إضافية لحسابك.</p></div>`,
      }).catch((err) => console.error("[mail] credit confirmation failed:", err));
    }
    return { success: true, kind: "credit", redirect: "/post" };
  }

  if (pending.kind === "subscription") {
    const plan = PLANS.find((p) => p.id === payload.planId);
    const interval: "monthly" | "yearly" = payload.interval === "yearly" ? "yearly" : "monthly";
    const days = interval === "yearly" ? 365 : 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    const subscriber = await prisma.subscriber.create({
      data: {
        name: user?.name || "",
        phone: "",
        planId: payload.planId,
        interval,
        active: true,
        expiresAt,
        userId: payload.userId,
      },
    });
    await prisma.pendingPayment.update({ where: { id: pendingId }, data: { status: "fulfilled" } });
    if (user?.email && plan) {
      sendMail({
        to: user.email,
        subject: `تفعيل اشتراك ${plan.name} - OTR`,
        html: `<div dir="rtl" style="font-family:sans-serif"><h2>تم تفعيل اشتراكك ✅</h2><p>الباقة: ${plan.name} (${interval === "yearly" ? "سنوي" : "شهري"})</p><p>ساري حتى: ${expiresAt.toLocaleDateString("ar")}</p></div>`,
      }).catch((err) => console.error("[mail] subscription confirmation failed:", err));
    }
    return { success: true, kind: "subscription", subscriberId: subscriber.id, redirect: "/post" };
  }

  if (pending.kind === "booking") {
    const booking = await prisma.booking.create({
      data: {
        listingId: payload.listingId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail,
        amount: Number(payload.amountOMR) || 0,
        status: "paid",
      },
    });
    await prisma.pendingPayment.update({ where: { id: pendingId }, data: { status: "fulfilled" } });

    const emailJobs: Promise<any>[] = [];
    if (payload.customerEmail) {
      emailJobs.push(
        sendMail({
          to: payload.customerEmail,
          subject: "تأكيد الحجز - OTR",
          html: `<div dir="rtl" style="font-family:sans-serif"><h2>تم تأكيد حجزك ✅</h2><p>${payload.listingTitle ?? ""}</p></div>`,
        }).catch((err) => console.error("[mail] booking confirmation failed:", err))
      );
    }
    if (payload.ownerEmail) {
      emailJobs.push(
        sendMail({
          to: payload.ownerEmail,
          subject: "لديك حجز جديد - OTR",
          html: `<div dir="rtl" style="font-family:sans-serif"><h2>حجز جديد على إعلانك</h2><p>${payload.listingTitle ?? ""}</p><p>من: ${payload.customerName}${payload.customerPhone ? ` — ${payload.customerPhone}` : ""}</p></div>`,
        }).catch((err) => console.error("[mail] owner notification failed:", err))
      );
    }
    await Promise.allSettled(emailJobs);

    return { success: true, kind: "booking", listingId: payload.listingId, redirect: `/listing/${payload.listingId}` };
  }

  return { success: false, message: "نوع عملية غير مدعوم" };
}
