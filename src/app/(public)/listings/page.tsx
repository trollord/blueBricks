import { Suspense } from "react";
import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import LoadMoreProperties from "@/components/property/LoadMoreProperties";
import FilterPanel from "@/components/search/FilterPanel";
import MobileFilterToggle from "@/components/search/MobileFilterToggle";
import { SlidersHorizontal, MapPin } from "lucide-react";
import Link from "next/link";
import type { PropertyFilters } from "@/types/property";

// Lazy-load MapView so Google Maps API is never fetched unless view=map
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl border text-sm text-gray-400 gap-2">
      <MapPin className="h-4 w-4 animate-pulse" />
      Loading map…
    </div>
  ),
});

const PAGE_SIZE = 6;

async function getListings(filters: PropertyFilters) {
  const where = {
    status: "ACTIVE" as const,
    ...(filters.type && { type: filters.type as never }),
    ...(filters.listingType && { listingType: filters.listingType as never }),
    ...(filters.locality && { locality: filters.locality }),
    ...(filters.bedrooms && { bedrooms: parseInt(filters.bedrooms) }),
    ...(filters.furnished && { furnished: filters.furnished as never }),
    ...((filters.minPrice || filters.maxPrice) && {
      price: {
        ...(filters.minPrice && { gte: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { lte: parseFloat(filters.maxPrice) }),
      },
    }),
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        type: true,
        listingType: true,
        locality: true,
        building: true,
        bedrooms: true,
        areaSqft: true,
        furnished: true,
        price: true,
        deposit: true,
        latitude: true,
        longitude: true,
        images: {
          select: { id: true, url: true, isPrimary: true },
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, total };
}

// Lightweight query for map view — all matching pins, no pagination limit
async function getAllMapPins(filters: PropertyFilters) {
  const where = {
    status: "ACTIVE" as const,
    latitude:  { not: null },
    longitude: { not: null },
    ...(filters.type && { type: filters.type as never }),
    ...(filters.listingType && { listingType: filters.listingType as never }),
    ...(filters.locality && { locality: filters.locality }),
    ...(filters.bedrooms && { bedrooms: parseInt(filters.bedrooms) }),
    ...(filters.furnished && { furnished: filters.furnished as never }),
    ...((filters.minPrice || filters.maxPrice) && {
      price: {
        ...(filters.minPrice && { gte: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { lte: parseFloat(filters.maxPrice) }),
      },
    }),
  };

  return prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      listingType: true,
      latitude: true,
      longitude: true,
    },
  });
}

interface ListingsPageProps {
  searchParams: Promise<PropertyFilters>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const filters = await searchParams;
  const view = filters.view ?? "grid";
  const { properties, total } = await getListings(filters);
  const mapPins = view === "map" ? await getAllMapPins(filters) : [];

  const headingLocation = filters.locality ?? "All Localities";
  const listingWord = total === 1 ? "property" : "properties";
  const listingTypeLabel =
    filters.listingType === "RENT" ? "available for rent" : "available for sale";

  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">

        {/* ── FILTER SIDEBAR — hidden on mobile, shown on desktop ── */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div
            className="bg-white rounded-xl p-8 sticky top-28"
            style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}
          >
            <Suspense
              fallback={
                <div className="h-96 animate-pulse bg-[#f2f4f4] rounded-lg" />
              }
            >
              <FilterPanel />
            </Suspense>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <section className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start sm:items-end justify-between mb-6 sm:mb-12 flex-wrap gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-zinc-900">
                Properties in {headingLocation}
              </h1>
              <p className="text-zinc-500 mt-1 sm:mt-2 text-xs sm:text-sm">
                {total > 0
                  ? `${total} ${listingWord} ${listingTypeLabel}`
                  : "No properties match your filters"}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile filter toggle */}
              <MobileFilterToggle />

              {/* View toggle */}
              {(
                [
                  {
                    key: "grid",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    ),
                  },
                  {
                    key: "list",
                    icon: (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    ),
                  },
                ] as const
              ).map(({ key, icon }) => {
                const params = new URLSearchParams(
                  Object.entries(filters).filter(([, v]) => v) as [string, string][]
                );
                params.set("view", key);
                return (
                  <Link key={key} href={`/listings?${params.toString()}`}>
                    <button
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        view === key
                          ? "bg-zinc-900 text-white shadow-lg"
                          : "bg-white text-zinc-500 border border-[#e4e9ea] hover:bg-[#f2f4f4]"
                      }`}
                    >
                      {icon}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {properties.length === 0 ? (
            <div className="text-center py-16 sm:py-20 text-zinc-400">
              <SlidersHorizontal className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-4 opacity-40" />
              <p className="font-medium text-zinc-900 text-sm sm:text-base">
                No properties match your filters.
              </p>
              <Link
                href="/listings"
                className="text-zinc-500 hover:text-zinc-900 text-xs sm:text-sm mt-2 inline-block underline underline-offset-2"
              >
                Clear all filters
              </Link>
            </div>
          ) : view === "map" ? (
            <MapView properties={mapPins} />
          ) : (
            <LoadMoreProperties
              initialProperties={properties}
              total={total}
              pageSize={PAGE_SIZE}
              filters={filters}
              view={view as "grid" | "list"}
            />
          )}
        </section>
      </div>
    </div>
  );
}
