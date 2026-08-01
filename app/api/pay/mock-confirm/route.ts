import { NextRequest, NextResponse } from "next/server";
import { fulfillPendingPayment } from "@/lib/fulfill";

export async function POST(req: NextRequest) {
  const { pendingId, card } = await req.json();

  if (!card?.number || !card?.name || !card?.exp || !card?.cvv) {
    return NextResponse.json({ success: false, message: "بيانات البطاقة غير مكتملة" }, { status: 400 });
  }
  if (!pendingId) {
    return NextResponse.json({ success: false, message: "طلب غير صالح" }, { status: 400 });
  }

  // Simulate processing delay — no real charge happens here (mock mode only).
  await new Promise((r) => setTimeout(r, 500));

  const result = await fulfillPendingPayment(pendingId);
  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message ?? "تعذّر إتمام العملية" }, { status: 500 });
  }

  return NextResponse.json({ success: true, mode: "mock", ...result });
}
