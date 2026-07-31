import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasLiveMoyasarKey, chargeCard } from "@/lib/payments";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, card, listingId, customerName, customerPhone, customerEmail } = body;

  if (!card?.number || !card?.name || !card?.exp || !card?.cvv) {
    return NextResponse.json({ success: false, message: "بيانات البطاقة غير مكتملة" }, { status: 400 });
  }

  const listing = listingId ? await prisma.listing.findUnique({ where: { id: listingId } }) : null;
  if (listingId && !listing) {
    return NextResponse.json({ success: false, message: "الإعلان غير موجود" }, { status: 404 });
  }
  // Never trust a client-supplied amount for a listing booking — always charge the stored price.
  const chargeAmount = listing ? listing.price : Number(amount) || 0;

  let transactionId: string;

  if (hasLiveMoyasarKey()) {
    const result = await chargeCard(chargeAmount, `حجز: ${listing?.title ?? "إعلان"}`, card);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 402 });
    }
    transactionId = result.id!;
  } else {
    // Mocked response — no real charge happens without a live MOYASAR_SECRET_KEY.
    await new Promise((r) => setTimeout(r, 400));
    transactionId = `mock_${Date.now()}`;
  }

  if (listingId) {
    await prisma.booking.create({
      data: {
        listingId,
        customerName: customerName || card.name,
        customerPhone: customerPhone || "",
        customerEmail: customerEmail || null,
        amount: chargeAmount,
        status: "paid",
      },
    });
  }

  // Fire-and-forget confirmation emails — a failed email must never fail the booking itself.
  if (customerEmail) {
    sendMail({
      to: customerEmail,
      subject: "تأكيد الحجز - دَرْب",
      html: `<div dir="rtl" style="font-family:sans-serif"><h2>تم تأكيد حجزك ✅</h2><p>${listing?.title ?? ""}</p><p>المبلغ المدفوع: ${chargeAmount} ﷼</p><p>رقم العملية: ${transactionId}</p></div>`,
    }).catch((err) => console.error("[mail] booking confirmation failed:", err));
  }
  if (listing?.ownerEmail) {
    sendMail({
      to: listing.ownerEmail,
      subject: "لديك حجز جديد - دَرْب",
      html: `<div dir="rtl" style="font-family:sans-serif"><h2>حجز جديد على إعلانك</h2><p>${listing.title}</p><p>من: ${customerName || card.name}${customerPhone ? ` — ${customerPhone}` : ""}</p></div>`,
    }).catch((err) => console.error("[mail] owner notification failed:", err));
  }

  return NextResponse.json({ success: true, transactionId, mode: hasLiveMoyasarKey() ? "live" : "mock" });
}
