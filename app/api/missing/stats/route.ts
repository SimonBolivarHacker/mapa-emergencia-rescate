import { NextResponse } from "next/server";
import { countMissingStats } from "@/lib/missing";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=5, stale-while-revalidate=30",
};

export async function GET() {
  const stats = await countMissingStats();
  return NextResponse.json({ stats }, { headers: CACHE_HEADERS });
}
