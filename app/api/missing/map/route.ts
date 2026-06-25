import { NextResponse } from "next/server";
import { listMissingMapMarkers } from "@/lib/missing";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=3, stale-while-revalidate=15",
};

function parseCoord(value: string | null): number | undefined {
  if (value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const markers = await listMissingMapMarkers({
    north: parseCoord(params.get("north")),
    south: parseCoord(params.get("south")),
    east: parseCoord(params.get("east")),
    west: parseCoord(params.get("west")),
    limit: Number(params.get("limit") ?? "500"),
  });
  return NextResponse.json({ markers }, { headers: CACHE_HEADERS });
}
