"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
  matches: Array<{ startOffset: number; endOffset: number }>;
}

export interface SelectedPlace {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

/* ── Module-level LRU cache ── */
const MAX_CACHE = 30;
const queryCache = new Map<string, PlacePrediction[]>();

function cacheGet(key: string) {
  return queryCache.get(key.toLowerCase().trim());
}

function cacheSet(key: string, value: PlacePrediction[]) {
  if (queryCache.size >= MAX_CACHE) queryCache.delete(queryCache.keys().next().value!);
  queryCache.set(key.toLowerCase().trim(), value);
}

// Bounding box: Hiranandani Estate, Thane
const BOUNDS = { west: 72.948, south: 19.253, east: 72.987, north: 19.286 };

export function usePlacesAutocomplete() {
  const [query, setQuery]             = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionTokenRef = useRef<any>(null);
  const reqIdRef        = useRef(0);
  const debounceRef     = useRef<ReturnType<typeof setTimeout>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placesLibRef    = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) setOptions({ key: apiKey, v: "weekly" });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function getPlacesLib(): Promise<any> {
    if (placesLibRef.current) return placesLibRef.current;
    const lib = await importLibrary("places");
    placesLibRef.current = lib;
    return lib;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function ensureToken(lib: any) {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new lib.AutocompleteSessionToken();
    }
    return sessionTokenRef.current;
  }

  const fetchPredictions = useCallback(async (input: string) => {
    const cached = cacheGet(input);
    if (cached) { setPredictions(cached); return; }

    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const lib   = await getPlacesLib();
      const token = ensureToken(lib);

      const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken:        token,
        locationRestriction: BOUNDS,
      });

      if (reqId !== reqIdRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const preds: PlacePrediction[] = suggestions.map((s: any) => {
        const p = s.placePrediction;
        return {
          placeId:       p.placeId,
          mainText:      p.mainText?.text       ?? "",
          secondaryText: p.secondaryText?.text  ?? "",
          matches:       p.mainText?.matches    ?? [],
        };
      });

      cacheSet(input, preds);
      setPredictions(preds);
    } catch (err) {
      if (reqId !== reqIdRef.current) return;
      console.error("[usePlacesAutocomplete]", err);
      setError("Couldn't fetch suggestions");
      setPredictions([]);
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      clearTimeout(debounceRef.current);
      if (value.length < 3) { setPredictions([]); setLoading(false); return; }
      debounceRef.current = setTimeout(() => fetchPredictions(value), 350);
    },
    [fetchPredictions]
  );

  const selectPrediction = useCallback(
    async (prediction: PlacePrediction): Promise<SelectedPlace | null> => {
      try {
        const lib   = await getPlacesLib();
        const place = new lib.Place({ id: prediction.placeId });
        await place.fetchFields({ fields: ["formattedAddress", "location"] });

        // Reset session token to start a new billing session
        sessionTokenRef.current = new lib.AutocompleteSessionToken();

        setQuery(prediction.mainText);
        setPredictions([]);

        const lat = place.location?.lat();
        const lng = place.location?.lng();
        if (lat == null || lng == null) return null;

        return { address: place.formattedAddress ?? "", lat, lng, placeId: prediction.placeId };
      } catch {
        return null;
      }
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const clearPredictions = useCallback(() => { setPredictions([]); setError(null); }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return { query, predictions, loading, error, handleQueryChange, selectPrediction, clearPredictions, setQuery };
}
