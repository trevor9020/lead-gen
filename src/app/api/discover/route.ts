import { runAudit } from "@/lib/audit";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface PlaceResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  vicinity?: string;
  business_status?: string;
  types?: string[];
}

export async function POST(request: Request) {
  const body = await request.json();
  const { lat, lng, radius, type } = body;

  if (!lat || !lng || !radius) {
    return Response.json(
      { error: "lat, lng, and radius are required" },
      { status: 400 }
    );
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return Response.json(
      { error: "Places API key not configured" },
      { status: 500 }
    );
  }

  try {
    const searchType = type || "establishment";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${searchType}&key=${GOOGLE_PLACES_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return Response.json(
        { error: `Places API error: ${data.status}` },
        { status: 502 }
      );
    }

    const places: PlaceResult[] = data.results || [];

    const results = await Promise.all(
      places.slice(0, 20).map(async (place) => {
        const city = place.vicinity?.split(",").pop()?.trim() || "Unknown";
        const audit = await runAudit(place.name, city);
        return {
          placeId: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          vicinity: place.vicinity || "",
          audit,
        };
      })
    );

    return Response.json({ results, total: places.length });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Discovery failed" },
      { status: 500 }
    );
  }
}
