import { notFound } from "next/navigation";
import { MapPin, Home, Car, Palmtree, Waves, Truck, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORY_MAP } from "@/lib/constants";
import Badge from "@/components/Badge";
import RouteLine from "@/components/RouteLine";
import BookingPanel from "@/components/BookingPanel";

export const dynamic = "force-dynamic";

const ICONS: Record<string, typeof Home> = { homes: Home, cars: Car, chalets: Palmtree, resorts: Waves, delivery: Truck };

function parseImages(images: string): string[] {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default async function ListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) notFound();

  const cat = CATEGORY_MAP[listing.category];
  const Icon = ICONS[listing.category] ?? Home;
  const images = parseImages(listing.images);
  const mainImage = images[0];
  const isExpired = !!listing.expiresAt && listing.expiresAt < new Date();
  const daysLeft = listing.expiresAt
    ? Math.max(0, Math.ceil((listing.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="rounded-2xl overflow-hidden border border-line bg-white">
        <div
          className="h-64 flex items-center justify-center relative bg-cover bg-center"
          style={mainImage ? { backgroundImage: `url(${mainImage})` } : { backgroundImage: cat.gradient }}
        >
          {!mainImage && <Icon className="w-14 h-14 text-white/85" strokeWidth={1.5} />}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto border-b border-line">
            {images.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-line shrink-0" />
            ))}
          </div>
        )}

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge tone="teal">{cat.label}</Badge>
            {listing.featured && !isExpired && <Badge tone="amber">مميز</Badge>}
            {isExpired ? (
              <Badge tone="amber">انتهت مدة الإعلان</Badge>
            ) : (
              daysLeft !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Clock className="w-3.5 h-3.5" />
                  ينتهي خلال {daysLeft} يوم
                </span>
              )
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-navy">{listing.title}</h1>
          <p className="text-sm leading-relaxed text-ink">{listing.description}</p>

          {cat.isRoute ? (
            <RouteLine from={listing.fromPlace ?? ""} to={listing.toPlace ?? ""} />
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-ink">
              <MapPin className="w-4 h-4 text-teal" />
              <span>{listing.location}</span>
            </div>
          )}

          {listing.lat && listing.lng && (
            <iframe
              title="الموقع على الخريطة"
              className="w-full h-56 rounded-xl border border-line"
              loading="lazy"
              src={`https://www.google.com/maps?q=${listing.lat},${listing.lng}&output=embed`}
            />
          )}

          <div className="flex items-center justify-between rounded-xl p-4 bg-sand">
            <span className="text-sm text-muted">{cat.unit}</span>
            <span className="text-2xl font-bold text-teal font-num">{listing.price} ر.ع.</span>
          </div>

          {isExpired ? (
            <p className="text-sm text-center text-muted rounded-xl border border-line p-3">
              انتهت مدة نشر هذا الإعلان ولم يعد بالإمكان حجزه.
            </p>
          ) : (
            <BookingPanel listingId={listing.id} title={listing.title} price={listing.price} unit={cat.unit} />
          )}
        </div>
      </div>
    </div>
  );
}
