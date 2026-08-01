import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FREE_LISTINGS_LIMIT } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const sort = searchParams.get("sort") ?? "newest";

  const where: any = {};
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { location: { contains: q } },
      { fromPlace: { contains: q } },
      { toPlace: { contains: q } },
    ];
  }
  if (min || max) {
    where.price = {};
    if (min) where.price.gte = Number(min);
    if (max) where.price.lte = Number(max);
  }

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    { createdAt: "desc" as const };

  const listings = await prisma.listing.findMany({ where, orderBy, take: 60 });
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول لنشر إعلان" }, { status: 401 });
  }

  const body = await req.json();
  const {
    category, title, description, price,
    location, lat, lng, fromPlace, toPlace,
    images, ownerName, ownerPhone,
  } = body;

  if (!category || !title || !description || !price) {
    return NextResponse.json({ success: false, message: "الحقول المطلوبة غير مكتملة" }, { status: 400 });
  }

  const userId = (session.user as any).id as string;

  const [listingCount, user, activeSubscription] = await Promise.all([
    prisma.listing.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subscriber.findFirst({
      where: { userId, active: true, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
    }),
  ]);
  if (!user) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const usingFreeSlot = !activeSubscription && listingCount < FREE_LISTINGS_LIMIT;
  const usingSubscription = !!activeSubscription;
  if (!usingFreeSlot && !usingSubscription && user.listingCredits <= 0) {
    return NextResponse.json(
      { success: false, message: "استخدمت إعلاناتك المجانية — يلزم شراء رصيد إضافي أو الاشتراك للنشر", code: "NEEDS_CREDIT" },
      { status: 402 }
    );
  }

  const listing = await prisma.$transaction(async (tx) => {
    const created = await tx.listing.create({
      data: {
        category,
        title,
        description,
        price: Number(price),
        location: location || null,
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        fromPlace: fromPlace || null,
        toPlace: toPlace || null,
        images: JSON.stringify(Array.isArray(images) ? images.slice(0, 6) : []),
        ownerName: ownerName || session.user.name || null,
        ownerPhone: ownerPhone || null,
        ownerEmail: session.user.email || null,
        userId,
        featured: usingSubscription && activeSubscription!.planId !== "basic",
      },
    });
    if (!usingFreeSlot && !usingSubscription) {
      await tx.user.update({ where: { id: userId }, data: { listingCredits: { decrement: 1 } } });
    }
    return created;
  });

  return NextResponse.json({ success: true, listing });
}
