import { NextResponse } from "next/server";
import { getHospital } from "@/lib/hospitals";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const hospital = await getHospital(id);
  if (!hospital) {
    return NextResponse.json({ error: "Hospital no encontrado." }, { status: 404 });
  }
  return NextResponse.json({ hospital });
}
