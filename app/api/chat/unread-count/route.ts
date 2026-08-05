import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ count: 0 });
  }
  const userId = (session.user as any).id as string;

  const count = await prisma.message.count({
    where: {
      senderId: { not: userId },
      read: false,
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });

  return NextResponse.json({ count });
}
