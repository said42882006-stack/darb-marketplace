import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionStatus } from "@/lib/thawani";
import { fulfillPendingPayment } from "@/lib/fulfill";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const base = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  if (!ref) {
    return NextResponse.redirect(`${base}/pay/failed`);
  }

  const pending = await prisma.pendingPayment.findUnique({ where: { id: ref } });
  if (!pending) {
    return NextResponse.redirect(`${base}/pay/failed`);
  }
  if (pending.status === "fulfilled") {
    const payload = JSON.parse(pending.payload);
    const redirect = pending.kind === "booking" ? `/listing/${payload.listingId}` : "/post";
    return NextResponse.redirect(`${base}${redirect}?paid=1`);
  }
  if (!pending.thawaniSessionId) {
    return NextResponse.redirect(`${base}/pay/failed`);
  }

  const { paid } = await getSessionStatus(pending.thawaniSessionId);
  if (!paid) {
    await prisma.pendingPayment.update({ where: { id: ref }, data: { status: "failed" } });
    return NextResponse.redirect(`${base}/pay/failed`);
  }

  const result = await fulfillPendingPayment(ref);
  if (!result.success) {
    return NextResponse.redirect(`${base}/pay/failed`);
  }

  return NextResponse.redirect(`${base}${result.redirect}?paid=1`);
}
