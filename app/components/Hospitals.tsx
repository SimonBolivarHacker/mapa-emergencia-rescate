"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FACILITY_TYPE_META,
  PRIORITY_ZONE_META,
  type Hospital,
  type HospitalPriorityZone,
} from "@/lib/hospitals-meta";
import HospitalForm, { type HospitalPayload } from "./HospitalForm";

const ZONE_FILTERS: { value: HospitalPriorityZone | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "P0", label: "Zona cero" },
  { value: "P1", label: "Corredor" },
  { value: "P2", label: "Recuperación" },
  { value: "P3", label: "Base nacional" },
];

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [zoneFilter, setZoneFilter] = useState<HospitalPriorityZone | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hospitals?include=states", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo cargar la lista de hospitales.");
      const data = await res.json();
      setHospitals(data.hospitals ?? []);
      if (Array.isArray(data.states)) setStates(data.states);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hospitals.filter((h) => {
      if (stateFilter && h.state !== stateFilter) return false;
      if (zoneFilter !== "all" && h.priorityZone !== zoneFilter) return false;
      if (q) {
        const hay =
          h.name.toLowerCase().includes(q) ||
          h.municipality.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q);
        if (!hay) return false;
      }
      return true;
    });
  }, [hospitals, search, stateFilter, zoneFilter]);

  const stats = useMemo(() => {
    const byZone = { P0: 0, P1: 0, P2: 0, P3: 0 } as Record<
      HospitalPriorityZone,
      number
    >;
    let activePatients = 0;
    let totalPatients = 0;
    for (const h of hospitals) {
      byZone[h.priorityZone]++;
      activePatients += h.activePatients;
      totalPatients += h.totalPatients;
    }
    return { byZone, activePatients, totalPatients };
  }, [hospitals]);

  async function handleAdd(payload: HospitalPayload) {
    const res = await fetch("/api/hospitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "No se pudo guardar el hospital.");
    }
    setShowAddForm(false);
    await load();
  }

  return (
    <section
      id="hospitales"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-10"
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-700">
            🏥 Hospitales
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Hospitales y centros de salud
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Lista priorizada de la red hospitalaria de Venezuela según la zona
            de afectación. Toca un hospital para ver los pacientes registrados o
            añadir uno nuevo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="self-start rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          + Añadir hospital
        </button>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Total" value={hospitals.length} accent="#0f172a" />
        {(Object.keys(PRIORITY_ZONE_META) as HospitalPriorityZone[]).map((zone) => (
          <StatCard
            key={zone}
            label={`${PRIORITY_ZONE_META[zone].emoji} ${PRIORITY_ZONE_META[zone].label}`}
            value={stats.byZone[zone]}
            accent={PRIORITY_ZONE_META[zone].color}
          />
        ))}
        <StatCard
          label="Hospitalizados"
          value={stats.activePatients}
          accent="#1d4ed8"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, municipio o dirección…"
          className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400 lg:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-400"
          >
            <option value="">Todos los estados</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-1">
            {ZONE_FILTERS.map((f) => {
              const active = zoneFilter === f.value;
              const color =
                f.value !== "all" ? PRIORITY_ZONE_META[f.value].color : "#0f172a";
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setZoneFilter(f.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  style={active ? { background: color } : undefined}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Cargando hospitales…
          </p>
        ) : error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            No se encontraron hospitales con esos filtros.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((h) => (
              <li key={h.id}>
                <HospitalCard hospital={h} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddForm && (
        <HospitalForm
          onCancel={() => setShowAddForm(false)}
          onSubmit={handleAdd}
        />
      )}
    </section>
  );
}

function HospitalCard({ hospital }: { hospital: Hospital }) {
  const zone = PRIORITY_ZONE_META[hospital.priorityZone];
  const facility = FACILITY_TYPE_META[hospital.facilityType];

  return (
    <Link
      href={`/hospitales/${hospital.id}`}
      prefetch={false}
      className="group flex h-full w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      style={{ borderLeft: `4px solid ${zone.color}` }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: zone.color }}
        >
          {hospital.priorityZone}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
          {facility.emoji} {facility.label}
        </span>
        {hospital.level && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            Nivel {hospital.level}
          </span>
        )}
      </div>

      <div>
        <p className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-red-700">
          {hospital.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          {hospital.state}
          {hospital.municipality && ` · ${hospital.municipality}`}
        </p>
      </div>

      {hospital.address && (
        <p className="line-clamp-2 text-xs text-slate-500">📍 {hospital.address}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="text-base">🛏️</span>
            <strong className="text-slate-900">{hospital.activePatients}</strong>
            hospitalizados
          </span>
        </div>
        <span className="text-xs font-semibold text-red-600 transition group-hover:translate-x-0.5">
          Ver →
        </span>
      </div>
    </Link>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-lg font-bold" style={{ color: accent }}>
        {value.toLocaleString("es-VE")}
      </p>
    </div>
  );
}
