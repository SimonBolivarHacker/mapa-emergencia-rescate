import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";
import { buildDuplicateReport } from "@/lib/sync/dedup";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Reporte de posibles duplicados (read-only, sub-fase 6a). Solo detecta y
 * reporta; no modifica ni agrupa nada. Pensado para llamarse bajo demanda desde
 * el panel admin (no en cada poll).
 *
 *   GET /api/sync/duplicates?source=<id>&limit=<n>
 *
 * Auth: header `x-admin-token`.
 */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const params = new URL(request.url).searchParams;
  const source = params.get("source") ?? undefined;
  const limitParam = Number(params.get("limit"));
  const limitGroups =
    Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  try {
    const report = await buildDuplicateReport({ source, limitGroups });
    return NextResponse.json(report, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al generar el reporte." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
