import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/property/PropertyCard";
import FilterPanel from "@/components/search/FilterPanel";
import MapView from "@/components/map/MapView";
import { Map, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import type { PropertyFilters } from "@/types/property";

const PAGE_SIZE = 6;

async function getListings(filters: PropertyFilters) {
  const page = Math.max(1, parseInt(filters.page ?? "1"));

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
      take: page * PAGE_SIZE,   // cumulative: page 2 returns 12, page 3 returns 18, etc.
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

  return { properties, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
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
  const { properties, total, page, totalPages } = await getListings(filters);
  const mapPins = view === "map" ? await getAllMapPins(filters) : [];

  const headingLocation = filters.locality ?? "All Localities";
  const listingWord = total === 1 ? "property" : "properties";
  const listingTypeLabel =
    filters.listingType === "RENT" ? "available for rent" : "available for sale";

  return (
    <div className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* ── FILTER SIDEBAR ── */}
        <aside className="w-full lg:w-64 shrink-0">
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
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-zinc-900">
                Properties in {headingLocation}
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">
                {total > 0
                  ? `${total} ${listingWord} ${listingTypeLabel}`
                  : "No properties match your filters"}
              </p>
            </div>

            {/* View toggle */}
            <div className="flex gap-3">
              {(
                [
                  {
                    key: "grid",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    ),
                  },
                  {
                    key: "list",
                    icon: (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    ),
                  },
                  {
                    key: "map",
                    icon: <Map className="w-5 h-5" />,
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
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
            <div className="text-center py-20 text-zinc-400">
              <SlidersHorizontal className="h-10 w-10 mx-auto mb-4 opacity-40" />
              <p className="font-medium text-zinc-900">
                No properties match your filters.
              </p>
              <Link
                href="/listings"
                className="text-zinc-500 hover:text-zinc-900 text-sm mt-2 inline-block underline underline-offset-2"
              >
                Clear all filters
              </Link>
            </div>
          ) : view === "map" ? (
            <MapView properties={mapPins} />
          ) : (
            <>
              <div
                className={
                  view === "list"
                    ? "flex flex-col gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch"
                }
              >
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-20 flex justify-center">
                {page < totalPages ? (
                  <LoadMoreLink filters={filters} targetPage={page + 1} />
                ) : (
                  total > PAGE_SIZE && (
                    <p className="text-sm text-zinc-400">
                      All {total} properties shown
                    </p>
                  )
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function LoadMoreLink({
  filters,
  targetPage,
}: {
  filters: PropertyFilters;
  targetPage: number;
}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][]
  );
  params.set("page", String(targetPage));
  return (
    <Link href={`/listings?${params.toString()}`}>
      <button className="flex items-center gap-2 px-8 py-4 bg-white border border-[#e4e9ea] rounded-xl text-zinc-900 font-bold hover:bg-[#f2f4f4] transition-all">
        Load More Properties
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </Link>
  );
}
