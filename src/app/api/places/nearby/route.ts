import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const lat  = parseFloat(searchParams.get("lat")  ?? "");
  const lng  = parseFloat(searchParams.get("lng")  ?? "");
  const type = searchParams.get("type") ?? "";

  if (!lat || !lng || !type) {
    return NextResponse.json({ error: "Missing lat, lng or type" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Maps API key not configured" }, { status: 500 });
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "X-Goog-Api-Key":   apiKey,
      "X-Goog-FieldMask": "places.displayName,places.location",
    },
    body: JSON.stringify({
      includedTypes:       [type],
      maxResultCount:      5,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 5000.0,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[places/nearby] Google API error:", err);
    return NextResponse.json({ error: "Places API error", detail: err }, { status: res.status });
  }

  const data = await res.json();

  // Normalise: REST API returns displayName as { text, languageCode }
  const places = (data.places ?? []).map((p: {
    displayName?: { text?: string };
    location?: { latitude?: number; longitude?: number };
  }) => ({
    name: p.displayName?.text ?? type,
    lat:  p.location?.latitude,
    lng:  p.location?.longitude,
  })).filter((p: { lat?: number; lng?: number }) => p.lat != null && p.lng != null);

  return NextResponse.json({ places });
}
