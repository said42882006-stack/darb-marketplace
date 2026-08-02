import Link from "next/link";
import { MapPin, Clock, Tag } from "lucide-react";
import { CATEGORY_MAP } from "@/lib/constants";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import { attributeOptionLabel } from "@/lib/categoryAttributes";
import { relativeTimeAr } from "@/lib/relativeTime";
import Badge from "./Badge";
import RouteLine from "./RouteLine";

function parseFirstImage(images?: string): string | null {
  if (!images) return null;
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
}

function firstAttributeLabel(category: string, attributes: unknown): string | null {
  if (!attributes || typeof attributes !== "object") return null;
  const entries = Object.entries(attributes as Record<string, string>);
  if (entries.length === 0) return null;
  return attributeOptionLabel(category, entries[0][1]);
}

export interface ListingCardData {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  location?: string | null;
  fromPlace?: string | null;
  toPlace?: string | null;
  featured: boolean;
  createdAt?: Date | string;
  attributes?: unknown;
}

export default function ListingCard({ listing }: { listing: ListingCardData & { images?: string } }) {
  const cat = CATEGORY_MAP[listing.category];
  if (!cat) return null;
  const Icon = CATEGORY_ICONS[listing.category as keyof typeof CATEGORY_ICONS] ?? CATEGORY_ICONS.other;
  const firstImage = parseFirstImage(listing.images);
  const attrLabel = firstAttributeLabel(listing.category, listing.attributes);

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="text-right rounded-2xl overflow-hidden border border-line bg-white transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal block"
    >
      <div
        className="h-36 flex items-center justify-center relative bg-cover bg-center"
        style={firstImage ? { backgroundImage: `url(${firstImage})` } : { backgroundImage: cat.gradient }}
      >
        {!firstImage && <Icon className="w-10 h-10 text-white/85" strokeWidth={1.5} />}
        {listing.featured && (
          <div className="absolute top-3 left-3">
            <Badge tone="amber">مميز</Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge tone="teal">{cat.label}</Badge>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-base leading-snug text-navy font-num">{listing.title}</h3>
        <p className="text-sm line-clamp-2 text-muted">{listing.description}</p>
        {attrLabel && (
          <span className="inline-flex items-center gap-1 text-xs text-teal font-medium w-fit">
            <Tag className="w-3 h-3" />
            {attrLabel}
          </span>
        )}
        {cat.isRoute ? (
          <RouteLine from={listing.fromPlace ?? ""} to={listing.toPlace ?? ""} />
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-ink">
            <MapPin className="w-4 h-4 text-teal" />
            <span>{listing.location}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-line">
          <span className="text-xs text-muted flex items-center gap-1">
            {listing.createdAt && (
              <>
                <Clock className="w-3 h-3" />
                {relativeTimeAr(listing.createdAt)}
              </>
            )}
          </span>
          <span className="text-lg font-bold text-teal font-num">{listing.price} ر.ع.</span>
        </div>
      </div>
    </Link>
  );
}
