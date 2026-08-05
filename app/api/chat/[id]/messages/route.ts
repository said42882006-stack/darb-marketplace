import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthorizedConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { select: { id: true, title: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  });
  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) return null;
  return conversation;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const conversation = await getAuthorizedConversation(params.id, userId);
  if (!conversation) {
    return NextResponse.json({ success: false, message: "المحادثة غير موجودة" }, { status: 404 });
  }

  // Mark incoming messages as read now that the recipient is viewing them.
  await prisma.message.updateMany({
    where: { conversationId: params.id, senderId: { not: userId }, read: false },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  const otherUser = conversation.buyerId === userId ? conversation.seller : conversation.buyer;

  return NextResponse.json({
    success: true,
    otherUserName: otherUser.name,
    listingTitle: conversation.listing?.title ?? "إعلان محذوف",
    listingId: conversation.listingId,
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderId: m.senderId,
      mine: m.senderId === userId,
      createdAt: m.createdAt,
    })),
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const conversation = await getAuthorizedConversation(params.id, userId);
  if (!conversation) {
    return NextResponse.json({ success: false, message: "المحادثة غير موجودة" }, { status: 404 });
  }

  const { body } = await req.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ success: false, message: "الرسالة فارغة" }, { status: 400 });
  }
  if (body.length > 2000) {
    return NextResponse.json({ success: false, message: "الرسالة طويلة جداً" }, { status: 400 });
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: params.id, senderId: userId, body: body.trim() },
    }),
    prisma.conversation.update({ where: { id: params.id }, data: { updatedAt: new Date() } }),
  ]);

  return NextResponse.json({ success: true, message: { id: message.id, body: message.body, mine: true, createdAt: message.createdAt } });
}
