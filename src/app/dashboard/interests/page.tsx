import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, BedDouble, Maximize2, ArrowRight } from "lucide-react";
import { formatPrice, formatArea } from "@/lib/utils/formatters";
import { getPlaceholderImage } from "@/lib/utils/placeholder";
import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Interests" };

export default async function InterestsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const inquiries = await prisma.inquiry.findMany({
    where: { seekerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      property: {
        select: {
          id: true,
          title: true,
          type: true,
          listingType: true,
          status: true,
          building: true,
          locality: true,
          bedrooms: true,
          areaSqft: true,
          price: true,
          images: {
            select: { url: true, isPrimary: true },
            orderBy: { isPrimary: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Interests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Properties you've registered interest in
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-xl bg-white">
          <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No interests yet
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Browse listings and click &ldquo;Register Interest&rdquo; to save them here.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-[#0F2244] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#0F2244]/90 transition-colors"
          >
            Browse Listings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {inquiries.map(({ id, property }) => {
            const imageUrl = property.images[0]?.url ?? getPlaceholderImage(property.id);
            const isRent = property.listingType === "RENT";
            const inactive = property.status !== "ACTIVE";

            return (
              <Link
                key={id}
                href={inactive ? "#" : `/listings/${property.id}`}
                className={`group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${inactive ? "opacity-60 cursor-default pointer-events-none" : ""}`}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isRent ? "bg-[#C9A96E] text-[#0F2244]" : "bg-[#0F2244] text-white"}`}>
                      {LISTING_TYPE_LABELS[property.listingType]}
                    </span>
                    {inactive && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        No longer available
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {PROPERTY_TYPE_LABELS[property.type]}
                  </p>
                  <h3 className="font-semibold text-[#0F2244] text-sm line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="h-3 w-3 shrink-0 text-[#C9A96E]" />
                    {property.building}, {property.locality}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5" />
                        {property.bedrooms} BHK
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Maximize2 className="h-3.5 w-3.5" />
                      {formatArea(property.areaSqft)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-50 flex items-baseline gap-1">
                    <span className="font-bold text-[#0F2244]">
                      {formatPrice(property.price)}
                    </span>
                    {isRent && (
                      <span className="text-xs text-gray-400">/month</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
