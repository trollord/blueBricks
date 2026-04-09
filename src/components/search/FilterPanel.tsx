"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  HIRANANDANI_LOCALITIES,
  PROPERTY_TYPE_LABELS,
  FURNISHED_LABELS,
  BHK_OPTIONS,
  PRICE_RANGES_RENT,
  PRICE_RANGES_SALE,
} from "@/lib/constants";

export default function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const get = (key: string): string => searchParams.get(key) ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset to page 1 on filter change
      router.push(`/listings?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = () => router.push("/listings");

  const listingType = get("listingType") || "RENT";
  const priceRanges = listingType === "SALE" ? PRICE_RANGES_SALE : PRICE_RANGES_RENT;
  const activeFilters = ["type", "locality", "bedrooms", "furnished", "minPrice"].filter(
    (k) => searchParams.has(k)
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {activeFilters > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <X className="h-3 w-3" />
            Clear all ({activeFilters})
          </button>
        )}
      </div>

      {/* Listing type */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500 uppercase tracking-wide">Looking to</Label>
        <div className="flex gap-2">
          {["RENT", "SALE"].map((t) => (
            <Button
              key={t}
              variant={listingType === t ? "default" : "outline"}
              size="sm"
              className={listingType === t ? "bg-blue-600 hover:bg-blue-700" : ""}
              onClick={() => update("listingType", t)}
            >
              {t === "RENT" ? "Rent" : "Buy"}
            </Button>
          ))}
        </div>
      </div>

      {/* Property type */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500 uppercase tracking-wide">Property Type</Label>
        <Select value={get("type")} onValueChange={(v) => update("type", v === "all" || !v ? "" : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Locality */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500 uppercase tracking-wide">Locality</Label>
        <Select value={get("locality")} onValueChange={(v) => update("locality", v === "all" || !v ? "" : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All localities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All localities</SelectItem>
            {HIRANANDANI_LOCALITIES.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BHK */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500 uppercase tracking-wide">Bedrooms</Label>
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((n) => (
            <Badge
              key={n}
              variant={get("bedrooms") === String(n) ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1 text-sm ${
                get("bedrooms") === String(n)
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => update("bedrooms", get("bedrooms") === String(n) ? "" : String(n))}
            >
              {n} BHK
            </Badge>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500 uppercase tracking-wide">Budget</Label>
        <div className="space-y-1.5">
          {priceRanges.map((range) => {
            const active =
              get("minPrice") === String(range.min) &&
              (range.max === Infinity || get("maxPrice") === String(range.max));
            return (
              <button
                key={range.label}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (active) {
                    params.delete("minPrice");
                    params.delete("maxPrice");
                  } else {
                    params.set("minPrice", String(range.min));
                    if (range.max !== Infinity) params.set("maxPrice", String(range.max));
                    else params.delete("maxPrice");
                  }
                  params.delete("page");
                  router.push(`/listings?${params.toString()}`);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Furnished */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500 uppercase tracking-wide">Furnishing</Label>
        <Select value={get("furnished")} onValueChange={(v) => update("furnished", v === "all" || !v ? "" : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {Object.entries(FURNISHED_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
