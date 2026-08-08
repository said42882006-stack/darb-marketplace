import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FREE_LISTINGS_LIMIT, MAX_LISTING_IMAGES, LISTING_LIFETIME_DAYS } from "@/lib/constants";
import { CATEGORY_ATTRIBUTES } from "@/lib/categoryAttributes";
import { resolveUserId } from "@/lib/mobileAuth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const sort = searchParams.get("sort") ?? "newest";

  const where: any = {
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
  };
  if (category) where.category = category;
  if (q) {
    where.AND.push({
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
        { fromPlace: { contains: q } },
        { toPlace: { contains: q } },
      ],
    });
  }
  if (min || max) {
    where.price = {};
    if (min) where.price.gte = Number(min);
    if (max) where.price.lte = Number(max);
  }
  // Category-specific attribute filter, e.g. ?transmission=automatic for cars
  const attrDef = category ? CATEGORY_ATTRIBUTES[category as keyof typeof CATEGORY_ATTRIBUTES] : undefined;
  if (attrDef) {
    const attrValue = searchParams.get(attrDef.key);
    if (attrValue) {
      where.attributes = { path: [attrDef.key], equals: attrValue };
    }
  }

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    { createdAt: "desc" as const };

  const listings = await prisma.listing.findMany({ where, orderBy, take: 60 });
  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: "يجب تسجيل الدخول لنشر إعلان" }, { status: 401 });
  }

  const body = await req.json();
  const {
    category, title, description, price,
    location, lat, lng, fromPlace, toPlace,
    images, ownerName, ownerPhone, attributes,
  } = body;

  if (!category || !title || !description || !price) {
    return NextResponse.json({ success: false, message: "الحقول المطلوبة غير مكتملة" }, { status: 400 });
  }

  const [currentUser, listingCount, activeSubscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.listing.count({ where: { userId } }),
    prisma.subscriber.findFirst({
      where: { userId, active: true, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: "desc" },
    }),
  ]);
  if (!currentUser) {
    return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
  }

  const usingFreeSlot = !activeSubscription && listingCount < FREE_LISTINGS_LIMIT;
  const usingSubscription = !!activeSubscription;
  if (!usingFreeSlot && !usingSubscription) {
    return NextResponse.json(
      { success: false, message: "استخدمت إعلاناتك المجانية — يلزم الاشتراك بباقة للنشر", code: "NEEDS_SUBSCRIPTION" },
      { status: 402 }
    );
  }

  const sessionUserName = currentUser.name;
  const sessionUserEmail = currentUser.email;
  const expiresAt = new Date(Date.now() + LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

  const listing = await prisma.listing.create({
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
      images: JSON.stringify(Array.isArray(images) ? images.slice(0, MAX_LISTING_IMAGES) : []),
      attributes: attributes && typeof attributes === "object" ? attributes : {},
      ownerName: ownerName || sessionUserName || null,
      ownerPhone: ownerPhone || null,
      ownerEmail: sessionUserEmail || null,
      userId,
      expiresAt,
      featured: usingSubscription && activeSubscription!.planId !== "basic",
    },
  });

  return NextResponse.json({ success: true, listing });
}
