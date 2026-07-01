// Tipos y helpers puros del dominio "acopio" (sin React ni TanStack Query).
// Viven aquí —y NO en hooks/acopio.ts ("use client")— para poder reutilizarlos
// desde el servidor (prefetch SSR en app/(content)/acopio/page.tsx) sin cruzar
// la frontera cliente/servidor.

export interface CollectionCenter {
  id: string;
  name: string;
  manager: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  accepts: string[];
  contact: string | null;
  schedule: string | null;
  status: string;
  verificationLevel: string;
  disputed: boolean;
  description: string | null;
}

export interface AcopioFacets {
  byCountry: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface AcopioResponse {
  items: CollectionCenter[];
  total: number;
  facets: AcopioFacets;
}

export interface AcopioFilters {
  country?: string;
  category?: string;
  q?: string;
}

/** Filtros del primer render del directorio. Deben coincidir con el estado
 *  inicial de CollectionCenters para que el prefetch SSR hidrate sin re-fetch. */
export const ACOPIO_DEFAULT_FILTERS: AcopioFilters = { country: "Venezuela" };

export function buildAcopioUrl(f: AcopioFilters): string {
  const sp = new URLSearchParams();
  if (f.country) sp.set("country", f.country);
  if (f.category) sp.set("category", f.category);
  if (f.q) sp.set("q", f.q);
  const qs = sp.toString();
  return qs ? `/api/acopio?${qs}` : "/api/acopio";
}
