/**
 * Estado de sincronización por fuente: el cursor de página para la ejecución
 * por chunks. Ver docs/rfcs/0001-sincronizacion-fuentes.md §2.5.
 */

import { getSql, hasDbEnv } from "../db";

export interface SyncCursor {
  /** Próxima página a procesar (1-based). */
  nextPage: number;
  /** Último total de páginas conocido (null si aún no se sabe). */
  totalPages: number | null;
}

let _stateSchemaReady: Promise<void> | null = null;
function ensureStateSchema(): Promise<void> {
  if (!_stateSchemaReady) {
    const sql = getSql();
    _stateSchemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS sync_state (
          source TEXT PRIMARY KEY,
          next_page INTEGER NOT NULL DEFAULT 1,
          total_pages INTEGER,
          last_run_at BIGINT,
          last_cycle_completed_at BIGINT,
          updated_at BIGINT NOT NULL
        )
      `;
    })();
  }
  return _stateSchemaReady;
}

/** Lee el cursor de una fuente; si no existe, devuelve el inicial (página 1). */
export async function getSyncCursor(source: string): Promise<SyncCursor> {
  if (!hasDbEnv()) return { nextPage: 1, totalPages: null };
  await ensureStateSchema();
  const rows = (await getSql()`
    SELECT next_page, total_pages FROM sync_state WHERE source = ${source}
  `) as { next_page: number; total_pages: number | null }[];
  if (rows.length === 0) return { nextPage: 1, totalPages: null };
  return {
    nextPage: Math.max(1, Number(rows[0].next_page) || 1),
    totalPages: rows[0].total_pages === null ? null : Number(rows[0].total_pages),
  };
}

/** Persiste el cursor de una fuente (upsert). */
export async function setSyncCursor(
  source: string,
  cursor: SyncCursor,
  opts: { cycleCompleted?: boolean } = {},
): Promise<void> {
  if (!hasDbEnv()) return;
  await ensureStateSchema();
  const now = Date.now();
  const cycleAt = opts.cycleCompleted ? now : null;
  await getSql()`
    INSERT INTO sync_state
      (source, next_page, total_pages, last_run_at, last_cycle_completed_at, updated_at)
    VALUES (
      ${source}, ${cursor.nextPage}, ${cursor.totalPages}, ${now}, ${cycleAt}, ${now}
    )
    ON CONFLICT (source) DO UPDATE SET
      next_page = EXCLUDED.next_page,
      total_pages = EXCLUDED.total_pages,
      last_run_at = EXCLUDED.last_run_at,
      last_cycle_completed_at = COALESCE(EXCLUDED.last_cycle_completed_at, sync_state.last_cycle_completed_at),
      updated_at = EXCLUDED.updated_at
  `;
}
