import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasLiveThawaniKey, createCheckoutSession, omrToBaisa } from "@/lib/thawani";
import { PLANS, LISTING_CREDIT_PRICE_OMR, LISTING_CREDIT_AMOUNT } from "@/lib/constants";

// Builds the (name, amountOMR, payload) for each purchase kind, shared by both
// the live Thawani path and the mock-confirm path so pricing can never drift.
async function resolvePurchase(kind: string, body: any, userId?: string) {
  if (kind === "credit") {
    return {
      name: `رصيد نشر - ${LISTING_CREDIT_AMOUNT} إعلانات`,
      amountOMR: LISTING_CREDIT_PRICE_OMR,
      payload: { userId },
    };
  }

  if (kind === "subscription") {
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

  if (kind === "booking") {
    const listing = body.listingId ? await prisma.listing.findUnique({ where: { id: body.listingId } }) : null;
    if (body.listingId && !listing) return null;
    const amountOMR = listing ? listing.price : Number(body.amount) || 0;
    return {
      name: `حجز: ${listing?.title ?? "إعلان"}`,
      amountOMR,
      payload: {
        listingId: body.listingId ?? null,
        customerName: body.customerName ?? "",
        customerPhone: body.customerPhone ?? "",
        customerEmail: body.customerEmail ?? null,
        ownerEmail: listing?.ownerEmail ?? null,
        listingTitle: listing?.title ?? "",
        amountOMR,
      },
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { kind } = body;
  if (!["credit", "subscription", "booking"].includes(kind)) {
    return NextResponse.json({ success: false, message: "نوع عملية غير معروف" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if ((kind === "credit" || kind === "subscription") && !session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const userId = session?.user ? ((session.user as any).id as string) : undefined;

  const purchase = await resolvePurchase(kind, body, userId);
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
