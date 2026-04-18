import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PriceHistoryChart from "@/components/property/PriceHistoryChart";
import PropertyMapSection from "@/components/map/PropertyMapSection";
import InquiryButton from "@/components/payment/InquiryButton";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Building2,
  TrainFront,
  GraduationCap,
  HeartPulse,
  Wifi,
  Car,
  Dumbbell,
  ShieldCheck,
  Droplets,
  Wind,
  Zap,
  Trees,
} from "lucide-react";
import {
  formatPrice,
  formatArea,
  formatDate,
  parseAmenities,
} from "@/lib/utils/formatters";
import {
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  FURNISHED_LABELS,
} from "@/lib/constants";
import { getPlaceholderImage } from "@/lib/utils/placeholder";
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

/* ── Amenity icon mapping ── */
const AMENITY_ICONS: Record<string, React.ElementType> = {
  "High-speed Wifi": Wifi,
  "Wi-Fi": Wifi,
  WiFi: Wifi,
  "Covered Parking": Car,
  Parking: Car,
  "Private Gym": Dumbbell,
  Gym: Dumbbell,
  "24x7 Security": ShieldCheck,
  "24/7 Security": ShieldCheck,
  Security: ShieldCheck,
  "Swimming Pool": Droplets,
  "Infinity Pool": Droplets,
  Pool: Droplets,
  "Air Conditioning": Wind,
  "Laundry Service": Wind,
  AC: Wind,
  "Power Backup": Zap,
  Garden: Trees,
};

function getAmenityIcon(name: string) {
  return AMENITY_ICONS[name] ?? ShieldCheck;
}

/* ── Section label ── */
function SectionLabel({ title }: { title: string }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.25em] text-[#1A1A1A]/50 uppercase mb-8 mt-16">
      {title}
    </p>
  );
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
  const primaryImageUrl =
    primaryImage?.url ?? getPlaceholderImage(property.id);
  const secondImageUrl =
    property.images[1]?.url ?? getPlaceholderImage(property.id + "_2");
  const thirdImageUrl =
    property.images[2]?.url ?? getPlaceholderImage(property.id + "_3");

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

  const amenities = parseAmenities(property.amenities);

  /* Split title for italic portion after comma */
  const titleParts = property.title.split(",");
  const mainTitle = titleParts[0];
  const italicTitle =
    titleParts.length > 1 ? ", " + titleParts.slice(1).join(",").trim() : null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero Gallery ──────────────────────────────────────────────────── */}
      <div className="pt-[60px]">
        <div className="grid grid-cols-5 gap-px h-[480px] sm:h-[580px] lg:h-[650px]">
          {/* Primary image — 60% */}
          <div className="col-span-3 relative">
            <Image
              src={primaryImageUrl}
              alt={property.title}
              fill
              className="object-cover"
              priority
              sizes="60vw"
            />
          </div>
          {/* Right stack — 40% */}
          <div className="col-span-2 grid grid-rows-2 gap-px">
            <div className="relative">
              <Image
                src={secondImageUrl}
                alt={`${property.title} 2`}
                fill
                className="object-cover"
                sizes="40vw"
              />
            </div>
            <div className="relative">
              <Image
                src={thirdImageUrl}
                alt={`${property.title} 3`}
                fill
                className="object-cover"
                sizes="40vw"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10">

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-10">
          {[
            `For ${LISTING_TYPE_LABELS[property.listingType]}`,
            PROPERTY_TYPE_LABELS[property.type],
            FURNISHED_LABELS[property.furnished],
          ].map((label) => (
            <span
              key={label}
              className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#1A1A1A]/55 border border-gray-200 px-3 py-1 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0B0B0C] mt-5 leading-tight tracking-tight">
          {mainTitle}
          {italicTitle && (
            <span className="italic font-normal text-[#0B0B0C]/80">
              {italicTitle}
            </span>
          )}
        </h1>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-[#1A1A1A]/45 text-[13px] mt-3">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {property.building}, {property.locality}, Hiranandani Estate, Thane
          </span>
        </div>

        {/* ── Key Stats ── */}
        <div className="grid grid-cols-4 mt-10 bg-[#f5f5f5] divide-x divide-white">
          {[
            {
              icon: BedDouble,
              label: "BEDROOM",
              value: property.bedrooms ? `${property.bedrooms} BHK` : "N/A",
            },
            {
              icon: Bath,
              label: "BATHROOM",
              value: property.bathrooms ?? "N/A",
            },
            {
              icon: Maximize2,
              label: "SQ.FT AREA",
              value: formatArea(property.areaSqft),
            },
            {
              icon: Building2,
              label: "FLOOR",
              value:
                property.floor != null
                  ? `${property.floor}${property.totalFloors ? `/${property.totalFloors}` : ""}`
                  : "N/A",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center py-9 px-4"
            >
              <Icon className="h-5 w-5 text-[#0B0B0C]/35 mb-4" strokeWidth={1.5} />
              <p className="font-bold text-[#0B0B0C] text-2xl leading-none tracking-tight">
                {value}
              </p>
              <p className="text-[9px] tracking-[0.22em] text-[#1A1A1A]/45 mt-2.5 uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── About + Price Card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">

          {/* About — left 3/5 */}
          <div className="lg:col-span-3">
            <SectionLabel title="About This Property" />
            <p className="text-[#0B0B0C]/75 leading-[1.85] text-[15px] whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Price Card — right 2/5 */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 mt-0 lg:mt-[88px]">
            <div className="border border-gray-150 bg-[#fafafa] p-8 rounded-sm">
              <p className="text-[9px] tracking-[0.25em] text-[#1A1A1A]/45 uppercase mb-3">
                {isRent ? "Price Per Month" : "Sale Price"}
              </p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold text-[#0B0B0C] font-[family-name:var(--font-playfair)]">
                  {formatPrice(property.price)}
                </span>
                {isRent && (
                  <span className="text-[#1A1A1A]/40 text-sm font-normal">/mo</span>
                )}
              </div>

              {property.rentNegotiable && (
                <span className="inline-block text-[10px] tracking-wide text-gray-400 border border-gray-200 px-2 py-0.5 mb-2">
                  Negotiable
                </span>
              )}
              {isRent && property.deposit && (
                <p className="text-xs text-gray-400 mb-1">
                  Deposit: {formatPrice(property.deposit)}
                </p>
              )}
              {isRent && property.lockInMonths != null && property.lockInMonths > 0 && (
                <p className="text-xs text-gray-400 mb-1">
                  Lock-in: {property.lockInMonths} month
                  {property.lockInMonths > 1 ? "s" : ""}
                  {property.lockInNegotiable ? " (negotiable)" : ""}
                </p>
              )}

              <div className="mt-5">
                <InquiryButton
                  propertyId={property.id}
                  hasRegistered={hasRegistered}
                  isLoggedIn={!!session}
                />
              </div>

              <p className="text-[10px] text-center text-[#1A1A1A]/40 mt-4 leading-relaxed tracking-wide">
                No hidden charges &bull; 100% Verified Property
              </p>
            </div>
          </div>
        </div>

        {/* ── Amenities ── */}
        {amenities.length > 0 && (
          <>
            <SectionLabel title="Amenities" />
            <div className="flex flex-wrap gap-10 sm:gap-14">
              {amenities.map((amenity) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div key={amenity} className="flex flex-col items-center gap-2.5">
                    <Icon className="h-[18px] w-[18px] text-[#0B0B0C]/40" strokeWidth={1.5} />
                    <span className="text-[11px] text-[#1A1A1A]/55 text-center leading-tight">
                      {amenity}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Location / Map ── */}
        {property.latitude && property.longitude && (
          <>
            <SectionLabel title="Location" />
            <PropertyMapSection
              lat={property.latitude}
              lng={property.longitude}
              propertyId={property.id}
            />

            {/* ── Connectivity ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mt-12">
              {[
                {
                  icon: TrainFront,
                  label: "CONNECTIVITY",
                  headline: "Thane Station (3km)",
                  description:
                    "Quick access to the Central Line and Eastern Express Highway connecting to Mumbai.",
                },
                {
                  icon: GraduationCap,
                  label: "EDUCATION",
                  headline: "Hiranandani School (0.5km)",
                  description:
                    "Proximity to top-rated ICSE and CBSE schools and international institutions.",
                },
                {
                  icon: HeartPulse,
                  label: "WELLNESS",
                  headline: "Jupiter Hospital (2km)",
                  description:
                    "World-class healthcare facilities and wellness centres within short distance.",
                },
              ].map(({ icon: Icon, label, headline, description }) => (
                <div key={label}>
                  <p className="text-[9px] tracking-[0.25em] text-[#1A1A1A]/45 uppercase font-semibold mb-3">
                    {label}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-[#0B0B0C]/60 shrink-0" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-[#0B0B0C]">
                      {headline}
                    </p>
                  </div>
                  <p className="text-[12px] text-[#1A1A1A]/50 leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Price History — only when data exists ── */}
        {property.priceHistory.length > 0 && (
          <>
            <SectionLabel title="Price History" />
            <PriceHistoryChart
              data={property.priceHistory.map((ph) => ({
                ...ph,
                recordedAt: ph.recordedAt.toString(),
              }))}
              listingType={property.listingType}
            />
          </>
        )}

        {/* ── Footer meta ── */}
        <div className="flex items-center gap-4 text-[11px] text-[#1A1A1A]/30 mt-16 pt-6 pb-20 border-t border-gray-100">
          <span>Listed {formatDate(property.createdAt)}</span>
          <span>&middot;</span>
          <span>{property._count.inquiries} inquiries</span>
          <span>&middot;</span>
          <span className="text-gray-400 font-medium">Verified Owner</span>
        </div>
      </div>
    </div>
  );
}
