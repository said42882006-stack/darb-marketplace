import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/mobileAuth";

export async function POST(req: NextRequest) {
  const buyerId = await resolveUserId(req);
  if (!buyerId) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const { listingId } = await req.json();
  if (!listingId) {
    return NextResponse.json({ success: false, message: "الإعلان مطلوب" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.userId) {
    return NextResponse.json({ success: false, message: "لا يمكن بدء محادثة حول هذا الإعلان" }, { status: 400 });
  }

  if (buyerId === listing.userId) {
    return NextResponse.json({ success: false, message: "لا يمكنك مراسلة نفسك" }, { status: 400 });
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      listingId_buyerId_sellerId: { listingId, buyerId, sellerId: listing.userId },
    },
    create: { listingId, buyerId, sellerId: listing.userId },
    update: {},
  });

  return NextResponse.json({ success: true, conversationId: conversation.id });
}
