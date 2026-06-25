#!/usr/bin/env node
/**
 * Convierte los CSV de hospitales (lista completa + prioridad) en un JSON
 * normalizado que se commitea en lib/data/hospitals-seed.json.
 *
 * Uso:
 *   node scripts/parse-hospitals-csv.mjs \
 *     --in '/path/hospitales_lista_manual_normalizada_v1.csv' \
 *     --priority '/path/hospitales_prioridad_zona_cero_corredor_v1.csv' \
 *     --out lib/data/hospitals-seed.json
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));
if (!args.in || !args.out) {
  console.error("Faltan --in CSV y --out JSON.");
  process.exit(1);
}

const fullCsv = await readFile(resolve(args.in), "utf8");
const fullRows = parseCsv(fullCsv);

let priorityIds = new Set();
if (args.priority) {
  const priorityCsv = await readFile(resolve(args.priority), "utf8");
  for (const row of parseCsv(priorityCsv)) {
    priorityIds.add(row.source_record_id);
  }
}

const seen = new Set();
const seed = [];

for (const row of fullRows) {
  const id = (row.source_record_id || "").trim();
  if (!id || seen.has(id)) continue;
  seen.add(id);

  const priorityZone = mapPriority(row.priority_zone);
  const facilityType = normalizeFacilityType(row.facility_type);
  const level = normalizeLevel(row.level_raw);

  seed.push({
    externalId: id,
    name: cleanName(row.name),
    facilityType,
    state: cleanField(row.state),
    municipality: cleanField(row.municipality),
    address: cleanAddress(row.address_raw),
    level,
    priorityZone,
    isPriority: priorityIds.has(id),
  });
}

await mkdir(dirname(resolve(args.out)), { recursive: true });
await writeFile(resolve(args.out), JSON.stringify(seed, null, 2) + "\n", "utf8");

console.log(`✓ ${seed.length} hospitales escritos en ${args.out}`);
console.log(
  `   Prioridad (P0/P1): ${seed.filter((h) => h.isPriority).length}`,
);
const byZone = seed.reduce((acc, h) => {
  acc[h.priorityZone] = (acc[h.priorityZone] || 0) + 1;
  return acc;
}, {});
console.log("   Por zona:", byZone);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in") out.in = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--priority") out.priority = argv[++i];
  }
  return out;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (ch === "\r") {
        // skip
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.length > 1 && r.some((v) => v.trim()))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (r[idx] ?? "").trim();
      });
      return obj;
    });
}

function cleanField(v) {
  if (!v) return "";
  return v.replace(/\s+/g, " ").trim();
}

function cleanName(v) {
  return cleanField(v).replace(/^\.\s+/, "").slice(0, 200);
}

function cleanAddress(v) {
  if (!v) return "";
  const trimmed = v.replace(/\s+/g, " ").trim();
  return trimmed.slice(0, 400);
}

function normalizeFacilityType(v) {
  const t = (v || "").toLowerCase().trim();
  if (!t) return "hospital";
  if (t.includes("ivss")) return "hospital_ivss";
  if (t.includes("militar")) return "hospital_militar";
  if (t.includes("pediátrico") || t.includes("pediatrico")) return "hospital_pediatrico";
  if (t.includes("maternidad") || t.includes("materno")) return "maternidad";
  if (t === "cdi") return "cdi";
  return "hospital";
}

function normalizeLevel(v) {
  const t = (v || "").toUpperCase().trim();
  if (t === "I" || t === "II" || t === "III" || t === "IV") return t;
  if (t === "MILITAR") return "militar";
  return null;
}

function mapPriority(v) {
  const t = (v || "").toLowerCase().trim();
  if (t.startsWith("p0")) return "P0";
  if (t.startsWith("p1")) return "P1";
  if (t.startsWith("p2")) return "P2";
  if (t.startsWith("p3")) return "P3";
  return "P3";
}
