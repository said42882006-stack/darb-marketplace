import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_MAP } from "@/lib/constants";
import CategoryNav from "@/components/CategoryNav";
import Filters from "@/components/Filters";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string; min?: string; max?: string; sort?: string };
}) {
  const category = CATEGORY_MAP[params.slug];
  if (!category) notFound();

  const { q, min, max, sort } = searchParams;

  const where: any = { category: category.id };
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

  const listings = await prisma.listing.findMany({ where, orderBy });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-navy mb-3">{category.label}</h1>
        <CategoryNav active={category.id} />
      </div>

      <Filters category={category} defaults={{ q, min, max, sort }} />

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
