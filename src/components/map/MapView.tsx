"use client";

import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";

interface PropertyPin {
  id: string;
  title: string;
  price: number;
  listingType: string;
  latitude: number | null;
  longitude: number | null;
}

export default function MapView({ properties }: { properties: PropertyPin[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  const withCoords = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null
  );

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !mapRef.current || withCoords.length === 0) return;

    (async () => {
      setOptions({ key: apiKey, v: "weekly" });

      const { Map, InfoWindow, LatLngBounds } = await importLibrary("maps");
      const { AdvancedMarkerElement } = await importLibrary("marker");

      const bounds = new LatLngBounds();

      const map = new Map(mapRef.current!, {
        mapId: "hiranandani-listings-map",
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      });

      const infoWindow = new InfoWindow();

      withCoords.forEach((property) => {
        const position = { lat: property.latitude!, lng: property.longitude! };
        bounds.extend(position);

        const pin = document.createElement("div");
        pin.className =
          "bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition-colors";
        pin.textContent =
          property.listingType === "RENT"
            ? `₹${Math.round(property.price / 1000)}k/mo`
            : `₹${(property.price / 10000000).toFixed(1)}Cr`;

        const marker = new AdvancedMarkerElement({
          map,
          position,
          content: pin,
          title: property.title,
        });

        marker.addListener("click", () => {
          infoWindow.setContent(`
            <div style="padding:8px;max-width:200px">
              <p style="font-weight:600;font-size:13px;margin:0 0 4px">${property.title}</p>
              <a href="/listings/${property.id}" style="color:#2563eb;font-size:12px">View details →</a>
            </div>
          `);
          infoWindow.open(map, marker);
        });
      });

      map.fitBounds(bounds, 60);
    })();
  }, [withCoords]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-xl border text-sm text-gray-400 gap-2">
        <MapPin className="h-4 w-4" />
        Map not available — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-xl border text-sm text-gray-400 gap-2">
        <MapPin className="h-4 w-4" />
        No properties with location data to show on map.
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-200"
    />
  );
}
