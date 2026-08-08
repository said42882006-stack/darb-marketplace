import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

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
      const lastMsg = c.messages[0];
      const lastMessage = lastMsg
        ? lastMsg.type === "image"
          ? "📷 صورة"
          : lastMsg.type === "audio"
          ? "🎤 رسالة صوتية"
          : lastMsg.body
        : null;
      return {
        id: c.id,
        listingTitle: c.listing?.title ?? "إعلان محذوف",
        listingId: c.listingId,
        otherUserName: otherUser.name,
        lastMessage,
        lastMessageAt: lastMsg?.createdAt ?? c.createdAt,
        unreadCount,
      };
    })
  );

  return NextResponse.json({ success: true, conversations: result });
}
