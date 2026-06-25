export type ReportType =
  | "critical"
  | "supplies"
  | "shelter"
  | "nopower"
  | "missing";

export interface EmergencyReport {
  id: string;
  type: ReportType;
  lat: number;
  lng: number;
  place: string;
  affected: number;
  needs: string;
  createdAt: number;
}

export type NewReport = Omit<EmergencyReport, "id" | "createdAt">;

export const REPORT_TYPES: Record<
  ReportType,
  { label: string; color: string; emoji: string; description: string }
> = {
  critical: {
    label: "Emergencia Crítica",
    color: "#dc2626",
    emoji: "🔴",
    description:
      "Personas atrapadas, heridos de gravedad o colapso estructural inminente. Prioridad máxima de rescate.",
  },
  supplies: {
    label: "Suministros",
    color: "#eab308",
    emoji: "🟡",
    description:
      "Zonas seguras pero con necesidad urgente de suministros (falta de agua, comida, cobijo o primeros auxilios).",
  },
  shelter: {
    label: "Centro de Acopio",
    color: "#16a34a",
    emoji: "🟢",
    description:
      "Punto verificado y habilitado para recibir donaciones físicas o resguardar familias (Refugio seguro).",
  },
  nopower: {
    label: "Zona estable (sin electricidad)",
    color: "#0ea5e9",
    emoji: "🔵",
    description:
      "Zona sin daños graves y segura, pero sin servicio eléctrico (y posiblemente sin señal). Útil para saber qué sectores están bien.",
  },
  missing: {
    label: "Se busca (persona)",
    color: "#9333ea",
    emoji: "🟣",
    description:
      "Búsqueda de una persona desaparecida. Indica su última ubicación conocida y una descripción para ayudar a localizarla.",
  },
};

export const REPORT_TYPE_KEYS = Object.keys(REPORT_TYPES) as ReportType[];
