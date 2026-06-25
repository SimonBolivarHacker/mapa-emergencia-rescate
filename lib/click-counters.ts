import { getSql, hasDbEnv } from "./db";

const PSYCHOLOGY_HELP_KEY = "psychology_help";

let memoryCount = 0;
const memoryDedup = new Set<string>();

let _schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!_schemaReady) {
    const sql = getSql();
    _schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS click_counters (
          key TEXT PRIMARY KEY,
          count INTEGER NOT NULL DEFAULT 0
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS click_counter_dedup (
          counter_key TEXT NOT NULL,
          ip_hash TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          PRIMARY KEY (counter_key, ip_hash)
        )
      `;
      await sql`
        INSERT INTO click_counters (key, count)
        VALUES (${PSYCHOLOGY_HELP_KEY}, 0)
        ON CONFLICT DO NOTHING
      `;
    })();
  }
  return _schemaReady;
}

export async function getPsychologyHelpClickCount(): Promise<number> {
  if (hasDbEnv()) {
    await ensureSchema();
    const rows = (await getSql()`
      SELECT count FROM click_counters WHERE key = ${PSYCHOLOGY_HELP_KEY}
    `) as { count: number }[];
    return Number(rows[0]?.count ?? 0);
  }
  return memoryCount;
}

/** Incrementa el contador una vez por IP (aprox. una persona). */
export async function incrementPsychologyHelpClick(
  ipKey: string,
): Promise<number> {
  if (hasDbEnv()) {
    await ensureSchema();
    const sql = getSql();
    const inserted = (await sql`
      INSERT INTO click_counter_dedup (counter_key, ip_hash, created_at)
      VALUES (${PSYCHOLOGY_HELP_KEY}, ${ipKey}, ${Date.now()})
      ON CONFLICT DO NOTHING
      RETURNING counter_key
    `) as { counter_key: string }[];
    if (inserted.length === 0) {
      return getPsychologyHelpClickCount();
    }
    const rows = (await sql`
      UPDATE click_counters SET count = count + 1
      WHERE key = ${PSYCHOLOGY_HELP_KEY}
      RETURNING count
    `) as { count: number }[];
    return Number(rows[0]?.count ?? 0);
  }
  if (memoryDedup.has(ipKey)) return memoryCount;
  memoryDedup.add(ipKey);
  memoryCount += 1;
  return memoryCount;
}
