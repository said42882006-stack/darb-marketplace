import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_MAP } from "@/lib/constants";
import { CATEGORY_ATTRIBUTES } from "@/lib/categoryAttributes";
import CategoryNav from "@/components/CategoryNav";
import Filters from "@/components/Filters";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string; min?: string; max?: string; sort?: string; [key: string]: string | undefined };
}) {
  const category = CATEGORY_MAP[params.slug];
  if (!category) notFound();

  const { q, min, max, sort } = searchParams;
  const attrDef = CATEGORY_ATTRIBUTES[category.id as keyof typeof CATEGORY_ATTRIBUTES];
  const attrValue = attrDef ? searchParams[attrDef.key] : undefined;

  const where: any = {
    category: category.id,
    AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
  };
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
  if (attrDef && attrValue) {
    where.attributes = { path: [attrDef.key], equals: attrValue };
  }

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    { createdAt: "desc" as const };

  const listings = await prisma.listing.findMany({ where, orderBy });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
      <nav className="flex items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-teal transition-colors">الرئيسية</Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-ink">{category.label}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-display font-bold text-navy mb-3">{category.label}</h1>
        <CategoryNav active={category.id} />
      </div>

      <Filters category={category} defaults={{ q, min, max, sort }} attrValue={attrValue} />

      <p className="text-sm text-muted">{listings.length} إعلان متاح</p>

      {listings.length === 0 ? (
        <div className="text-center py-16 text-muted">لا توجد إعلانات مطابقة لهذا البحث حالياً.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
