/**
 * Motor de sincronización: corre un adaptador, normaliza y hace upsert por el
 * camino único (`upsertExternalMissing`). Acumula contadores y nunca deja que
 * el fallo de una fuente tumbe a las demás.
 *
 * Ver docs/rfcs/0001-sincronizacion-fuentes.md
 */

import { hasDbEnv } from "../db";
import { upsertExternalMissingBatch } from "../missing";
import type { SourceAdapter, SyncResult } from "./types";
import { enabledSources, getSource } from "./sources";

const DEFAULT_USER_AGENT =
  "MapaEmergenciaVE/1.0 (+https://terremotovenezuela.app)";

export interface RunOptions {
  dryRun?: boolean;
  /** Tope de registros a procesar por fuente. */
  limit?: number;
}

function userAgent(): string {
  return process.env.SYNC_USER_AGENT || DEFAULT_USER_AGENT;
}

/** Sincroniza una sola fuente. Nunca lanza: empaqueta el fallo en el resultado. */
export async function runSync(
  adapter: SourceAdapter,
  opts: RunOptions = {},
): Promise<SyncResult> {
  const dryRun = Boolean(opts.dryRun);
  const startedAt = Date.now();
  const base: SyncResult = {
    source: adapter.id,
    ok: false,
    dryRun,
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    startedAt,
    finishedAt: startedAt,
    durationMs: 0,
  };

  if (!dryRun && !hasDbEnv()) {
    return finalize({
      ...base,
      error: "DATABASE_URL no configurada: la sincronización necesita DB.",
    });
  }

  try {
    const people = await adapter.fetchAll({
      userAgent: userAgent(),
      limit: opts.limit,
    });
    base.fetched = people.length;

    if (dryRun) {
      // Sin escribir: contamos válidos (se procesarían) vs inválidos (se saltan).
      for (const p of people) {
        if (p.name?.trim() && p.externalId?.trim() && p.source?.trim()) {
          base.inserted++;
        } else {
          base.skipped++;
        }
      }
      return finalize({ ...base, ok: true });
    }

    const r = await upsertExternalMissingBatch(people);
    base.inserted = r.inserted;
    base.updated = r.updated;
    base.skipped = r.skipped;
    base.errors = r.errors;

    return finalize({ ...base, ok: true });
  } catch (err) {
    return finalize({
      ...base,
      error: err instanceof Error ? err.message : "Error desconocido.",
    });
  }
}

/** Sincroniza todas las fuentes habilitadas (o las indicadas en `sourceIds`). */
export async function runAllSources(
  opts: RunOptions & { sourceIds?: string[] } = {},
): Promise<SyncResult[]> {
  const adapters = opts.sourceIds?.length
    ? opts.sourceIds
        .map((id) => getSource(id))
        .filter((a): a is SourceAdapter => Boolean(a))
    : enabledSources();

  const results: SyncResult[] = [];
  for (const adapter of adapters) {
    results.push(await runSync(adapter, opts));
  }
  return results;
}

function finalize(r: SyncResult): SyncResult {
  const finishedAt = Date.now();
  return { ...r, finishedAt, durationMs: finishedAt - r.startedAt };
}
