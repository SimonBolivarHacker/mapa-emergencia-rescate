import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export function hasDbEnv(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let _sql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}
