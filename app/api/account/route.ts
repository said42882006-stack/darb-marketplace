import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const { name, phone } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ success: false, message: "الاسم مطلوب" }, { status: 400 });
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: name.trim(), phone: phone?.trim() || null },
  });

  return NextResponse.json({ success: true, name: user.name, phone: user.phone });
}
