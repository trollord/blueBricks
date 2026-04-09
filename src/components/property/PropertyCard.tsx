import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Maximize2, Building2 } from "lucide-react";
import { formatPrice, formatArea } from "@/lib/utils/formatters";
import {
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  FURNISHED_LABELS,
} from "@/lib/constants";

interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface PropertyCardData {
  id: string;
  title: string;
  type: string;
  listingType: string;
  locality: string;
  building: string;
  bedrooms: number | null;
  areaSqft: number;
  furnished: string;
  price: number;
  deposit: number | null;
  images: PropertyImage[];
}

export default function PropertyCard({ property }: { property: PropertyCardData }) {
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];
  const isRent = property.listingType === "RENT";

  return (
    <Link href={`/listings/${property.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
        {/* Image — 60% of card height */}
        <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0F2244]/5 to-[#0F2244]/10">
              <Building2 className="h-12 w-12 text-[#0F2244]/20" />
            </div>
          )}
          {/* Gold listing type badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                isRent
                  ? "bg-[#C9A96E] text-[#0F2244]"
                  : "bg-[#0F2244] text-[#C9A96E]"
              }`}
            >
              {LISTING_TYPE_LABELS[property.listingType]}
            </span>
          </div>
          {/* Property type badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
              {PROPERTY_TYPE_LABELS[property.type]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Price */}
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-[#0F2244]">{formatPrice(property.price)}</span>
            {isRent && <span className="text-sm text-gray-400">/month</span>}
          </div>
          {isRent && property.deposit && (
            <p className="text-xs text-gray-400 mb-2">
              Deposit: {formatPrice(property.deposit)}
            </p>
          )}

          {/* Title */}
          <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2.5 line-clamp-2">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-4">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{property.building}, {property.locality}</span>
          </div>

          {/* Separator */}
          <div className="h-px bg-gray-100 mb-3" />

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 text-[#C9A96E]" />
                <span>{property.bedrooms} BHK</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-[#C9A96E]" />
              <span>{formatArea(property.areaSqft)}</span>
            </div>
            <span className="ml-auto text-gray-400">{FURNISHED_LABELS[property.furnished]}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
