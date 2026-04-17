import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PriceHistoryChart from "@/components/property/PriceHistoryChart";
import PropertyMapSection from "@/components/map/PropertyMapSection";
import InquiryButton from "@/components/payment/InquiryButton";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import {
  formatPrice,
  formatArea,
  formatDate,
  parseAmenities,
} from "@/lib/utils/formatters";
import { getPlaceholderImage } from "@/lib/utils/placeholder";
import {
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  FURNISHED_LABELS,
} from "@/lib/constants";
import type { Metadata } from "next";

export const revalidate = 3600;

async function getProperty(id: string) {
  return prisma.property.findUnique({
    where: { id, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      listingType: true,
      building: true,
      address: true,
      locality: true,
      bedrooms: true,
      bathrooms: true,
      areaSqft: true,
      floor: true,
      totalFloors: true,
      furnished: true,
      amenities: true,
      price: true,
      deposit: true,
      rentNegotiable: true,
      lockInMonths: true,
      lockInNegotiable: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      images: {
        select: { id: true, url: true, isPrimary: true },
        orderBy: { isPrimary: "desc" },
      },
      priceHistory: {
        select: { price: true, recordedAt: true, source: true },
        orderBy: { recordedAt: "asc" },
      },
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { inquiries: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: "Property Not Found" };

  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      images: property.images[0] ? [property.images[0].url] : [],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, session] = await Promise.all([getProperty(id), auth()]);

  if (!property) notFound();

  const isRent = property.listingType === "RENT";
  const primaryImage =
    property.images.find((i) => i.isPrimary) ?? property.images[0];
  const primaryImageUrl = primaryImage?.url ?? getPlaceholderImage(property.id);
  const secondImageUrl = property.images[1]?.url ?? getPlaceholderImage(property.id + "_2");
  const thirdImageUrl = property.images[2]?.url ?? getPlaceholderImage(property.id + "_3");

  // Check if current user has already registered interest for this property
  let hasRegistered = false;
  if (session?.user?.id) {
    const inquiry = await prisma.inquiry.findUnique({
      where: {
        propertyId_seekerId: {
          propertyId: id,
          seekerId: session.user.id,
        },
      },
      select: { status: true },
    });
    hasRegistered = inquiry != null;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="container mx-auto px-4 pt-24 pb-8 max-w-6xl">
        {/* Back */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#0F2244] mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-72 sm:h-[420px] rounded-2xl overflow-hidden shadow-lg">
              <div className="col-span-3 row-span-2 relative">
                <Image
                  src={primaryImageUrl}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
              <div className="col-span-1 row-span-1 relative">
                <Image
                  src={secondImageUrl}
                  alt={`${property.title} 2`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
              <div className="col-span-1 row-span-1 relative">
                <Image
                  src={thirdImageUrl}
                  alt={`${property.title} 3`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            </div>

            {/* Title & badges */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                  className={
                    isRent
                      ? "bg-[#C9A96E] text-[#0F2244] hover:bg-[#C9A96E]"
                      : "bg-[#0F2244] text-[#C9A96E] hover:bg-[#0F2244]"
                  }
                >
                  For {LISTING_TYPE_LABELS[property.listingType]}
                </Badge>
                <Badge variant="secondary">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
                <Badge variant="outline">{FURNISHED_LABELS[property.furnished]}</Badge>
              </div>
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#0F2244] mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[#C9A96E]" />
                <span>
                  {property.building}, {property.locality}, Hiranandani Estate, Thane
                </span>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: BedDouble,
                  label: "Bedrooms",
                  value: property.bedrooms ? `${property.bedrooms} BHK` : "N/A",
                },
                { icon: Bath, label: "Bathrooms", value: property.bathrooms ?? "N/A" },
                { icon: Maximize2, label: "Area", value: formatArea(property.areaSqft) },
                {
                  icon: Building2,
                  label: "Floor",
                  value:
                    property.floor != null
                      ? `${property.floor}${property.totalFloors ? ` / ${property.totalFloors}` : ""}`
                      : "N/A",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-4 text-center shadow-sm border border-[#0F2244]/5"
                >
                  <Icon className="h-5 w-5 text-[#C9A96E] mx-auto mb-2" />
                  <p className="font-semibold text-[#0F2244]">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#0F2244] font-[family-name:var(--font-playfair)]">
                  About this property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {parseAmenities(property.amenities).length > 0 && (
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#0F2244] font-[family-name:var(--font-playfair)]">
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {parseAmenities(property.amenities).map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 text-[#C9A96E] shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price History */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#0F2244] font-[family-name:var(--font-playfair)]">
                  Price History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriceHistoryChart
                  data={property.priceHistory.map((ph) => ({
                    ...ph,
                    recordedAt: ph.recordedAt.toString(),
                  }))}
                  listingType={property.listingType}
                />
              </CardContent>
            </Card>

            {/* Map */}
            {property.latitude && property.longitude && (
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#0F2244] font-[family-name:var(--font-playfair)]">
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PropertyMapSection
                    lat={property.latitude}
                    lng={property.longitude}
                    propertyId={property.id}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── RIGHT COLUMN — STICKY PRICE CARD ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                {/* Gold top bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#C9A96E] to-[#e8c98a]" />
                <CardContent className="pt-6 space-y-5">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-bold text-[#0F2244] font-[family-name:var(--font-playfair)]">
                        {formatPrice(property.price)}
                      </span>
                      {isRent && <span className="text-gray-400">/month</span>}
                      {property.rentNegotiable && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#C9A96E]/20 text-[#8B6914] border border-[#C9A96E]/40">
                          Negotiable
                        </span>
                      )}
                    </div>
                    {isRent && property.deposit && (
                      <p className="text-sm text-gray-400 mt-1">
                        Security deposit: {formatPrice(property.deposit)}
                      </p>
                    )}
                    {isRent && property.lockInMonths && property.lockInMonths > 0 && (
                      <p className="text-sm text-gray-400 mt-1">
                        Lock-in: {property.lockInMonths} month{property.lockInMonths > 1 ? "s" : ""}
                        {property.lockInNegotiable ? " (negotiable)" : ""}
                      </p>
                    )}
                  </div>

                  <Separator className="bg-[#0F2244]/5" />

                  {/* Register interest notice */}
                  <div className="bg-[#0F2244]/5 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-[#0F2244]">
                      Register Interest — Free
                    </p>
                    <p className="text-xs text-[#0F2244]/70 leading-relaxed">
                      Let the owner know you&apos;re interested. They will review and reach out to you directly.
                    </p>
                  </div>

                  <InquiryButton
                    propertyId={property.id}
                    hasRegistered={hasRegistered}
                    isLoggedIn={!!session}
                  />

                  <p className="text-xs text-center text-gray-400">
                    Zero brokerage. The owner contacts you — no middlemen.
                  </p>
                </CardContent>
              </Card>

              {/* Listed by — verified badge only, no name */}
              <div className="flex items-center gap-2 px-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-xs text-gray-500">Listed by a <span className="font-medium text-emerald-700">Verified Owner</span></p>
              </div>

              {/* Listed date */}
              <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Listed {formatDate(property.createdAt)}</span>
                <span>·</span>
                <span>{property._count.inquiries} inquiries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
