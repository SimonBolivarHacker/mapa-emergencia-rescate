import { NextResponse } from "next/server";
import { deletePatient } from "@/lib/hospitals";
import { isAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; patientId: string }> },
) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id, patientId } = await params;
  const ok = await deletePatient(id, patientId);
  if (!ok) {
    return NextResponse.json(
      { error: "Paciente no encontrado." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
