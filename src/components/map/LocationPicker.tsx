"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin, Loader2 } from "lucide-react";

// Default center: Hiranandani Estate, Thane
const DEFAULT_CENTER = { lat: 19.2700, lng: 72.9675 };

interface Props {
  value?: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  building?: string;
  locality?: string;
}

export default function LocationPicker({ value, onChange, building, locality }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef        = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef     = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AMERef        = useRef<any>(null);
  const readyRef      = useRef(false);
  const [geocoding, setGeocoding] = useState(false);

  /* ── Effect 1: init map once ─────────────────────────────────────────── */
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !containerRef.current || readyRef.current) return;
    readyRef.current = true;

    (async () => {
      setOptions({ key: apiKey, v: "weekly" });

      const mapsLib   = await importLibrary("maps");
      const markerLib = await importLibrary("marker");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      AMERef.current = (markerLib as any).AdvancedMarkerElement;

      const center = value ?? DEFAULT_CENTER;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = new (mapsLib as any).Map(containerRef.current!, {
        center,
        zoom: 15,
        mapId: "f3bb37f586d3587c4600c0c2",
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      mapRef.current = map;

      // If a value already exists, show the marker
      if (value) {
        markerRef.current = new AMERef.current({
          map,
          position: value,
          title: "Property location",
        });
      }

      // Click to place / move marker (manual override)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addListener("click", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeOrMoveMarker(map, lat, lng);
        onChange(lat, lng);
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Effect 2: auto-geocode when building + locality change ─────────── */
  useEffect(() => {
    if (!building || !locality) return;

    const timer = setTimeout(async () => {
      const map = mapRef.current;
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!map || !apiKey) return;

      setGeocoding(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { Geocoder } = await importLibrary("geocoding") as any;
        const geocoder = new Geocoder();
        const address = `${building}, ${locality}, Hiranandani Estate, Thane, Maharashtra, India`;

        geocoder.geocode(
          { address },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (results: any[], status: string) => {
            if (status === "OK" && results[0]) {
              const loc = results[0].geometry.location;
              const lat = loc.lat();
              const lng = loc.lng();
              map.setCenter({ lat, lng });
              map.setZoom(17);
              placeOrMoveMarker(map, lat, lng);
              onChange(lat, lng);
            }
            setGeocoding(false);
          }
        );
      } catch {
        setGeocoding(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building, locality]);

  function placeOrMoveMarker(map: unknown, lat: number, lng: number) {
    if (markerRef.current) {
      markerRef.current.position = { lat, lng };
    } else if (AMERef.current) {
      markerRef.current = new AMERef.current({
        map,
        position: { lat, lng },
        title: "Property location",
      });
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-52 bg-gray-50 rounded-xl border text-sm text-gray-400 gap-2">
        <MapPin className="h-4 w-4" />
        Map not available — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          ref={containerRef}
          className="h-52 w-full rounded-xl overflow-hidden border border-gray-200 cursor-crosshair"
        />
        {geocoding && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding location…
            </div>
          </div>
        )}
      </div>
      {value ? (
        <p className="text-xs text-gray-500">
          Location found — click the map to adjust if needed
        </p>
      ) : (
        <p className="text-xs text-gray-400">
          Fill in Building Name &amp; Locality above to auto-locate, or click the map to pin manually
        </p>
      )}
    </div>
  );
}
