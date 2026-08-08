import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.message.count({
    where: {
      senderId: { not: userId },
      read: false,
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });

  return NextResponse.json({ count });
}
