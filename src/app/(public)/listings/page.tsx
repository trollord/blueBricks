import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/property/PropertyCard";
import FilterPanel from "@/components/search/FilterPanel";
import MapView from "@/components/map/MapView";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Map, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import type { PropertyFilters } from "@/types/property";

const PAGE_SIZE = 12;

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
      skip: (page - 1) * PAGE_SIZE,
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

  return { properties, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

interface ListingsPageProps {
  searchParams: Promise<PropertyFilters>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const filters = await searchParams;
  const view = filters.view ?? "grid";
  const { properties, total, page, totalPages } = await getListings(filters);

  const activeFilterCount = [
    "type", "listingType", "locality", "bedrooms", "furnished", "minPrice",
  ].filter((k) => filters[k as keyof PropertyFilters]).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[#C9A96E] text-sm font-medium uppercase tracking-widest mb-1">
          Hiranandani Estate, Thane
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#0F2244]">
          Available Properties
        </h1>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── FILTER SIDEBAR ── */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-[#0F2244]/5 p-5">
            <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-lg" />}>
              <FilterPanel />
            </Suspense>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-base font-semibold text-[#0F2244]">
                {total > 0
                  ? `${total} propert${total === 1 ? "y" : "ies"} found`
                  : "No properties found"}
              </p>
              {activeFilterCount > 0 && (
                <p className="text-sm text-gray-400 mt-0.5">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
                </p>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(
                [
                  { key: "grid", icon: LayoutGrid },
                  { key: "list", icon: List },
                  { key: "map", icon: Map },
                ] as const
              ).map(({ key, icon: Icon }) => {
                const params = new URLSearchParams(
                  Object.entries(filters).filter(([, v]) => v) as [string, string][]
                );
                params.set("view", key);
                return (
                  <Link key={key} href={`/listings?${params.toString()}`}>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        view === key
                          ? "bg-white shadow-sm text-[#0F2244]"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {properties.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <SlidersHorizontal className="h-10 w-10 mx-auto mb-4 opacity-40" />
              <p className="font-medium text-[#0F2244]">No properties match your filters.</p>
              <Link href="/listings">
                <Button variant="link" className="text-[#C9A96E] mt-2">Clear all filters</Button>
              </Link>
            </div>
          ) : view === "map" ? (
            <MapView properties={properties} />
          ) : (
            <>
              <div
                className={
                  view === "list"
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                }
              >
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <PaginationLink
                      filters={filters}
                      targetPage={page - 1}
                      label="← Previous"
                    />
                  )}
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <PaginationLink
                      filters={filters}
                      targetPage={page + 1}
                      label="Next →"
                    />
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function PaginationLink({
  filters,
  targetPage,
  label,
}: {
  filters: PropertyFilters;
  targetPage: number;
  label: string;
}) {
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][]
  );
  params.set("page", String(targetPage));
  return (
    <Link href={`/listings?${params.toString()}`}>
      <Button variant="outline" size="sm">{label}</Button>
    </Link>
  );
}

