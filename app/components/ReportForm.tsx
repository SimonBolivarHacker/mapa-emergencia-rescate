"use client";

import { useState } from "react";
import { REPORT_TYPES, type ReportType } from "@/lib/types";

interface ReportFormProps {
  coords: { lat: number; lng: number };
  onCancel: () => void;
  onSubmit: (payload: {
    type: ReportType;
    place: string;
    affected: number;
    needs: string;
  }) => Promise<void>;
}

type FieldCopy = {
  placeLabel: string;
  placePlaceholder: string;
  showAffected: boolean;
  affectedLabel: string;
  needsLabel: string;
  needsPlaceholder: string;
};

const DEFAULT_COPY: FieldCopy = {
  placeLabel: "Nombre o Dirección exacta del Edificio / Lugar",
  placePlaceholder: "Ej: Residencias El Parque, Torre B, Municipio Chacao",
  showAffected: true,
  affectedLabel: "Cantidad estimada de personas afectadas o atrapadas",
  needsLabel: "¿Qué se necesita con urgencia?",
  needsPlaceholder:
    "Sé específico: Equipos de rescate, paramédicos, agua potable, maquinaria pesada para escombros, medicinas",
};

const COPY_BY_TYPE: Partial<Record<ReportType, Partial<FieldCopy>>> = {
  nopower: {
    placeLabel: "Zona / Sector",
    placePlaceholder: "Ej: Urbanización La Trinidad, calle principal",
    showAffected: false,
    needsLabel: "Detalles de la zona",
    needsPlaceholder:
      "¿Desde cuándo sin luz? ¿Hay agua, señal, comercios abiertos? ¿Vías despejadas?",
  },
  missing: {
    placeLabel: "Última ubicación conocida",
    placePlaceholder: "Ej: visto por última vez cerca de la plaza de Chacao",
    affectedLabel: "¿Cuántas personas se buscan?",
    needsLabel: "Descripción de la persona",
    needsPlaceholder:
      "Nombre, edad, estatura, vestimenta, señas particulares y un contacto",
  },
};

function copyFor(type: ReportType): FieldCopy {
  return { ...DEFAULT_COPY, ...COPY_BY_TYPE[type] };
}

export default function ReportForm({
  coords,
  onCancel,
  onSubmit,
}: ReportFormProps) {
  const [type, setType] = useState<ReportType>("critical");
  const [place, setPlace] = useState("");
  const [affected, setAffected] = useState("");
  const [needs, setNeeds] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = copyFor(type);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!place.trim()) {
      setError("Indica el nombre o dirección del lugar.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        place: place.trim(),
        affected: copy.showAffected ? Number(affected) || 0 : 0,
        needs: needs.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 id="form-title" className="text-lg font-bold text-slate-900">
            🚨 Reportar Emergencia / Solicitar Ayuda
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar"
            className="text-2xl leading-none text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <p className="mb-4 text-xs text-slate-500">
          Ubicación seleccionada: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">
              Tipo de marcador
            </legend>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(REPORT_TYPES) as ReportType[]).map((key) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm transition ${
                    type === key
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={key}
                    checked={type === key}
                    onChange={() => setType(key)}
                    className="sr-only"
                  />
                  <span>{REPORT_TYPES[key].emoji}</span>
                  <span className="font-medium text-slate-800">
                    {REPORT_TYPES[key].label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="place"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              {copy.placeLabel}
            </label>
            <input
              id="place"
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder={copy.placePlaceholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              required
            />
          </div>

          {copy.showAffected && (
            <div>
              <label
                htmlFor="affected"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {copy.affectedLabel}
              </label>
              <input
                id="affected"
                type="number"
                min={0}
                value={affected}
                onChange={(e) => setAffected(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="needs"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              {copy.needsLabel}
            </label>
            <textarea
              id="needs"
              value={needs}
              onChange={(e) => setNeeds(e.target.value)}
              rows={3}
              placeholder={copy.needsPlaceholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? "Publicando…" : "Publicar Alerta en el Mapa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
