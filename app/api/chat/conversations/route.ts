import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: { select: { id: true, title: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const result = await Promise.all(
    conversations.map(async (c) => {
      const otherUser = c.buyerId === userId ? c.seller : c.buyer;
      const unreadCount = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, read: false },
      });
      return {
        id: c.id,
        listingTitle: c.listing?.title ?? "إعلان محذوف",
        listingId: c.listingId,
        otherUserName: otherUser.name,
        lastMessage: c.messages[0]?.body ?? null,
        lastMessageAt: c.messages[0]?.createdAt ?? c.createdAt,
        unreadCount,
      };
    })
  );

  return NextResponse.json({ success: true, conversations: result });
}
