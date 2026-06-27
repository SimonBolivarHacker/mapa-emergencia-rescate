import { createRequire } from "module";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export function hasDbEnv(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * ¿La URL apunta a Neon (driver HTTP) o a un Postgres plano por TCP?
 *
 * El driver `neon()` habla SQL-sobre-HTTP contra el endpoint de Neon, así que
 * NO puede conectarse a un Postgres normal (localhost en desarrollo, o el VPS
 * de Postgres en Hetzner en producción). Sólo usamos `neon()` cuando el host es
 * de Neon; para cualquier otro Postgres usamos `node-postgres` (TCP). Detectar
 * por host (no por "localhost") es lo que permite correr contra el Postgres
 * privado de Hetzner además de en local.
 */
function isNeonUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

/**
 * Adaptador `node-postgres` (TCP) que expone la misma interfaz de template tag
 * que el resto del código (`sql\`...\``) y devuelve el array de filas, igual que
 * Neon con `fullResults: false`. Se usa para todo Postgres plano: desarrollo
 * local y el VPS de Postgres privado en Hetzner.
 */
function createTcpSql(url: string): NeonQueryFunction<false, false> {
  const require = createRequire(import.meta.url);
  const { Pool, types } = require("pg") as typeof import("pg");
  // BIGINT (oid 20) llega como string por defecto; Neon lo entrega como número.
  // created_at/resolved_at son epoch-ms, dentro del rango seguro de Number.
  types.setTypeParser(20, (v: string) => parseInt(v, 10));
  const pool = new Pool({ connectionString: url });

  const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    for (let i = 0; i < values.length; i++) text += `$${i + 1}${strings[i + 1]}`;
    return pool.query(text, values as unknown[]).then((res) => res.rows);
  };

  // Paridad con el driver de Neon: `sql.query(text, params)` ejecuta una
  // consulta parametrizada con placeholders $1..$n y devuelve las filas.
  (sql as { query?: unknown }).query = (text: string, params: unknown[] = []) =>
    pool.query(text, params).then((res) => res.rows);

  return sql as unknown as NeonQueryFunction<false, false>;
}

let _sql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL!;
    _sql = isNeonUrl(url) ? neon(url) : createTcpSql(url);
  }
  return _sql;
}
