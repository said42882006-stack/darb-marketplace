import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import ListingCard from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();

  const notExpired = { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };

  const listings = await prisma.listing.findMany({
    where: q
      ? {
          AND: [
            notExpired,
            {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { location: { contains: q } },
                { fromPlace: { contains: q } },
                { toPlace: { contains: q } },
              ],
            },
          ],
        }
      : notExpired,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
          <svg width="100%" height="100%" preserveAspectRatio="none">
            <line x1="0" y1="60" x2="100%" y2="140" stroke="#2F6F6B" strokeWidth="2" strokeDasharray="6 8" />
            <line x1="0" y1="180" x2="100%" y2="40" stroke="#C98A3E" strokeWidth="2" strokeDasharray="6 8" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-8 relative flex flex-col gap-5">
          <h1 className="text-3xl sm:text-4xl font-display font-bold leading-tight text-navy">
            كل ما يُؤجَّر أو يُنقَل، في مكان واحد
          </h1>
          <p className="text-sm sm:text-base max-w-xl text-muted">
            منازل، سيارات، شاليهات، منتجعات، دراجات، قوارب — أو شاحنات ونقل نفط ومندوب وتاكسي وتوصيل. تصفح، تواصل مباشرة مع المعلن، وانشر إعلانك بسهولة.
          </p>
          <form method="get" className="flex items-center gap-2 rounded-2xl p-2 shadow-sm bg-white border border-line">
            <Search className="w-5 h-5 mr-1 text-muted shrink-0" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="ابحث بالاسم أو الموقع..."
              className="flex-1 bg-transparent text-sm focus:outline-none py-2"
            />
            <button type="submit" className="shrink-0 rounded-xl px-4 py-2 text-sm font-bold bg-navy text-white hover:bg-navy-deep transition-colors">
              بحث
            </button>
          </form>
        </div>
      </section>

      {/* Category shortcuts */}
      <section className="max-w-6xl mx-auto px-4 pb-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.id];
            return (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="rounded-2xl border border-line bg-white p-4 flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:border-teal transition-all focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <Icon className="w-6 h-6 text-teal" strokeWidth={1.75} />
                <span className="text-xs sm:text-sm font-bold text-navy text-center">{c.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-navy mb-4">
          {q ? `نتائج البحث عن "${q}"` : "أحدث الإعلانات"}
        </h2>
        {listings.length === 0 ? (
          <div className="text-center py-16 text-muted">لا توجد إعلانات مطابقة حالياً.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
