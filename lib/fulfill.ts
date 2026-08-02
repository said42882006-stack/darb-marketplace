import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { PLANS } from "@/lib/constants";

// Subscriptions are the only paid product on the platform (no per-booking or
// per-listing-credit payments), so this only ever fulfills a subscription purchase.
export async function fulfillPendingPayment(pendingId: string) {
  const pending = await prisma.pendingPayment.findUnique({ where: { id: pendingId } });
  if (!pending) return { success: false, message: "العملية غير موجودة" };
  if (pending.status === "fulfilled") return { success: true, alreadyFulfilled: true };
  if (pending.kind !== "subscription") return { success: false, message: "نوع عملية غير مدعوم" };

  const payload = JSON.parse(pending.payload);
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
