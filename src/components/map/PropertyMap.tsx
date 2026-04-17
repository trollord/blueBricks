"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";

type AmenityType = "hospital" | "pharmacy" | "school";

interface Props {
  lat: number;
  lng: number;
  propertyId: string;
  activeAmenity: AmenityType | null;
}

const AMENITY_COLOR: Record<AmenityType, string> = {
  hospital: "#ef4444",
  pharmacy: "#22c55e",
  school:   "#3b82f6",
};

export default function PropertyMap({ lat, lng, propertyId, activeAmenity }: Props) {
  const containerRef       = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef             = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const amenityMarkersRef  = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cacheRef           = useRef<Record<string, any[]>>({});
  const debounceRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store constructors from initial load so effect 2 never re-imports
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AdvancedMarkerRef  = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LatLngBoundsRef    = useRef<any>(null);
  const readyRef           = useRef(false);

  /* ── Effect 1: init map once ─────────────────────────────────────────── */
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !containerRef.current || readyRef.current) return;
    readyRef.current = true;

    (async () => {
      setOptions({ key: apiKey, v: "weekly" });

      const mapsLib  = await importLibrary("maps");
      const markerLib = await importLibrary("marker");

      // Stash constructors for reuse in effect 2
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      LatLngBoundsRef.current   = (mapsLib as any).LatLngBounds;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      AdvancedMarkerRef.current = (markerLib as any).AdvancedMarkerElement;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = new (mapsLib as any).Map(containerRef.current!, {
        center:            { lat, lng },
        zoom:              14,
        mapId:             "hiranandani-property-map",
        zoomControl:       true,
        streetViewControl: false,
        mapTypeControl:    false,
        fullscreenControl: false,
      });

      mapRef.current = map;

      // Persistent property marker — never removed
      new AdvancedMarkerRef.current({ map, position: { lat, lng }, title: "Property" });
    })();
  }, [lat, lng]);

  /* ── Effect 2: react to activeAmenity ───────────────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const map    = mapRef.current;
      const AME    = AdvancedMarkerRef.current;
      const LLB    = LatLngBoundsRef.current;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!map || !apiKey) return;

      // Wipe amenity markers; property marker is untouched
      amenityMarkersRef.current.forEach((m) => { m.map = null; });
      amenityMarkersRef.current = [];

      if (!activeAmenity) return;

      const cacheKey = `${propertyId}_${activeAmenity}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let places: any[];

      if (cacheRef.current[cacheKey]) {
        places = cacheRef.current[cacheKey];
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { Place } = await importLibrary("places") as any;
        try {
          const { places: results } = await Place.searchNearby({
            fields: ["displayName", "location"],
            locationRestriction: { center: { lat, lng }, radius: 2000 },
            includedPrimaryTypes: [activeAmenity],
            maxResultCount: 5,
          });
          places = results ?? [];
        } catch (err) {
          console.error("[PropertyMap] Place.searchNearby failed:", err);
          places = [];
        }

        // Only cache non-empty results so a failed call is retried next click
        if (places.length) cacheRef.current[cacheKey] = places;
      }

      if (!places.length || !AME || !LLB) return;

      const bounds = new LLB();
      bounds.extend({ lat, lng });

      const color = AMENITY_COLOR[activeAmenity];

      places.forEach((place) => {
        // New Places API: place.location is a LatLng
        const loc = place.location;
        if (!loc) return;

        const position = { lat: loc.lat(), lng: loc.lng() };
        bounds.extend(position);

        const pin = document.createElement("div");
        pin.style.cssText = [
          `background:${color}`,
          "color:white",
          "font-size:11px",
          "font-weight:600",
          "padding:4px 8px",
          "border-radius:999px",
          "box-shadow:0 2px 6px rgba(0,0,0,0.25)",
          "cursor:pointer",
          "white-space:nowrap",
          "max-width:130px",
          "overflow:hidden",
          "text-overflow:ellipsis",
        ].join(";");
        pin.textContent = place.displayName ?? activeAmenity;

        amenityMarkersRef.current.push(
          new AME({ map, position, content: pin, title: place.displayName ?? "" })
        );
      });

      map.fitBounds(bounds, 60);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeAmenity, lat, lng, propertyId]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-72 bg-gray-50 rounded-xl border text-sm text-gray-400 gap-2">
        <MapPin className="h-4 w-4" />
        Map not available — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-72 w-full rounded-xl overflow-hidden border border-gray-200"
    />
  );
}
