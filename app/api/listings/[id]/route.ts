import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/mobileAuth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) {
    return NextResponse.json({ message: "الإعلان غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) {
    return NextResponse.json({ success: false, message: "الإعلان غير موجود" }, { status: 404 });
  }

  if (listing.userId !== userId) {
    return NextResponse.json({ success: false, message: "لا تملك صلاحية حذف هذا الإعلان" }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
