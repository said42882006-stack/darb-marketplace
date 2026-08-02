import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasLiveThawaniKey, createCheckoutSession, omrToBaisa } from "@/lib/thawani";
import { PLANS } from "@/lib/constants";

// Subscriptions are the only paid product on the platform — no per-booking or
// per-listing-credit payments. This resolver stays kind-based in case a second
// paid product is added later, but "subscription" is the only kind today.
function resolvePurchase(kind: string, body: any, userId?: string) {
  if (kind !== "subscription") return null;

  const plan = PLANS.find((p) => p.id === body.planId);
  if (!plan) return null;
  const interval = body.interval === "yearly" ? "yearly" : "monthly";
  const amountOMR = interval === "yearly" ? plan.yearlyPriceOMR : plan.monthlyPriceOMR;
  return {
    name: `اشتراك ${plan.name} - ${interval === "yearly" ? "سنوي" : "شهري"}`,
    amountOMR,
    payload: { userId, planId: plan.id, interval },
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { kind } = body;
  if (kind !== "subscription") {
    return NextResponse.json({ success: false, message: "نوع عملية غير معروف" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const purchase = resolvePurchase(kind, body, userId);
  if (!purchase) {
    return NextResponse.json({ success: false, message: "طلب غير صالح" }, { status: 400 });
  }

  const pending = await prisma.pendingPayment.create({
    data: { kind, payload: JSON.stringify(purchase.payload), status: "pending" },
  });

  if (!hasLiveThawaniKey()) {
    // Mock mode — client will show the card-form simulation and call /api/pay/mock-confirm.
    return NextResponse.json({ success: true, live: false, pendingId: pending.id, amountOMR: purchase.amountOMR, name: purchase.name });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const result = await createCheckoutSession({
    products: [{ name: purchase.name, unitAmountBaisa: omrToBaisa(purchase.amountOMR) }],
    clientReferenceId: pending.id,
    successUrl: `${base}/api/pay/callback?ref=${pending.id}`,
    cancelUrl: `${base}/pay/failed?reason=cancelled`,
  });

  if (!result.success) {
    await prisma.pendingPayment.update({ where: { id: pending.id }, data: { status: "failed" } });
    return NextResponse.json({ success: false, message: result.message }, { status: 502 });
  }

  await prisma.pendingPayment.update({ where: { id: pending.id }, data: { thawaniSessionId: result.sessionId } });

  return NextResponse.json({ success: true, live: true, redirectUrl: result.paymentUrl });
}
