import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) {
    return NextResponse.json({ message: "الإعلان غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) {
    return NextResponse.json({ success: false, message: "الإعلان غير موجود" }, { status: 404 });
  }

  const userId = (session.user as any).id as string;
  if (listing.userId !== userId) {
    return NextResponse.json({ success: false, message: "لا تملك صلاحية حذف هذا الإعلان" }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
