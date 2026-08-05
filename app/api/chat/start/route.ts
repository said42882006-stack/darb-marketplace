import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
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

  const buyerId = (session.user as any).id as string;
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
