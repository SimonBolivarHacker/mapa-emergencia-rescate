import { NextResponse } from "next/server";
import {
  getPsychologyHelpClickCount,
  incrementPsychologyHelpClick,
} from "@/lib/click-counters";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=0, s-maxage=5, stale-while-revalidate=30",
};

export async function GET() {
  try {
    const count = await getPsychologyHelpClickCount();
    return NextResponse.json({ count }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json({ count: 0 }, { headers: CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const allowed = await checkRateLimit(`psychology-help:${ip}`, 20);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas peticiones." }, { status: 429 });
  }

  try {
    const count = await incrementPsychologyHelpClick(ip);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json(
      { error: "No se pudo registrar el clic." },
      { status: 503 },
    );
  }
}
