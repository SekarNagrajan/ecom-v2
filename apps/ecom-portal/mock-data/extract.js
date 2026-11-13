#!/usr/bin/env node
/**
 * Extracts sampled, anonymised rows from the e-commerce SQL Server databases into JSON fixtures.
 *
 *   npm run extract          → writes ../src/mocks/fixtures/*.json + _manifest.json
 *   npm run extract:dry      → prints SQL + row counts, writes nothing
 *
 * Datasets run in the order declared in extract.config.js so children can reference parents.
 */
import 'dotenv/config';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import sql from 'mssql';
import { faker } from '@faker-js/faker';
// Dataset catalogue: default ./extract.config.js, or `node extract.js --config ./extract.masters.config.js`
const configArg = process.argv.indexOf('--config');
const configPath = configArg > -1 ? process.argv[configArg + 1] : process.env.EXTRACT_CONFIG ?? './extract.config.js';
const { datasets, dateAnchor } = await import(new URL(configPath, import.meta.url).href);

// ─── settings ────────────────────────────────────────────────────────────────
const env = {
  SAMPLE_CUSTOMERS: num('SAMPLE_CUSTOMERS', 15),
  SAMPLE_BOOKINGS: num('SAMPLE_BOOKINGS', 120),
  SAMPLE_SI: num('SAMPLE_SI', 80),
  SAMPLE_VGM: num('SAMPLE_VGM', 60),
  SAMPLE_PAYMENTS: num('SAMPLE_PAYMENTS', 40),
};
const SHIFT_DATES = process.env.SHIFT_DATES_TO_NOW !== 'false';
const DRY_RUN = process.env.DRY_RUN === 'true';
const OUT_DIR = path.resolve(process.env.OUT_DIR ?? '../src/mocks/fixtures');

function num(key, fallback) {
  const v = Number(process.env[key]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// ─── connections (one pool per logical datasource) ───────────────────────────
const pools = new Map();
async function getPool(db) {
  const connStr = process.env[`DB_${db}`];
  if (!connStr) return null;
  if (!pools.has(db)) {
    // Sampling queries over large tables can exceed mssql's 15 s default request timeout.
    const pool = new sql.ConnectionPool(/request timeout/i.test(connStr) ? connStr : `${connStr};Request Timeout=120000`);
    pool.on('error', err => console.error(`[${db}] pool error`, err.message));
    pools.set(db, pool.connect());
  }
  return pools.get(db);
}

// ─── deterministic anonymiser ────────────────────────────────────────────────
// Same original value always maps to the same fake value, so an email anonymised in
// `users` matches the same email anonymised in `bookings.usercr`.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (const ch of String(str)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}
const generators = {
  company: () => faker.company.name(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  fullName: () => faker.person.fullName(),
  email: () => faker.internet.email({ provider: 'example.com' }).toLowerCase(),
  phone: () => faker.phone.number({ style: 'international' }),
  address: () => faker.location.streetAddress(),
  address2: () => faker.location.secondaryAddress(),
  city: () => faker.location.city(),
  zip: () => faker.location.zipCode(),
  text: () => faker.lorem.sentence(),
};
const fakeCache = new Map();
function fakeFor(kind, original) {
  if (original == null || String(original).trim() === '') return original;
  if (kind === 'remove') return undefined;
  const gen = generators[kind];
  if (!gen) throw new Error(`Unknown anonymize kind '${kind}'`);
  const key = `${kind}|${original}`;
  if (!fakeCache.has(key)) {
    faker.seed(fnv1a(key));
    fakeCache.set(key, gen());
  }
  return fakeCache.get(key);
}
function anonymizeRows(rows, rules) {
  if (!rules) return rows;
  const ruleEntries = Object.entries(rules);
  return rows.map(row => {
    const out = { ...row };
    for (const [col, kind] of ruleEntries) {
      // SQL Server is case-insensitive; match the column however the SELECT returned it.
      const actual = Object.keys(out).find(k => k.toLowerCase() === col.toLowerCase());
      if (!actual) continue;
      const v = fakeFor(kind, out[actual]);
      if (v === undefined) delete out[actual];
      else out[actual] = v;
    }
    return out;
  });
}

// ─── dataset context (what config functions receive) ─────────────────────────
class SkipDataset extends Error {}
const results = {};
const fixtureCache = {};
function readFixtureSync(name) {
  try { return JSON.parse(readFileSync(path.join(OUT_DIR, `${name}.json`), 'utf8')); } catch { return undefined; }
}
function readManifest() {
  try { return JSON.parse(readFileSync(path.join(OUT_DIR, '_manifest.json'), 'utf8')); } catch { return {}; }
}
const ctx = {
  env,
  values(ds, col) {
    // Datasets extracted in this run first, then fixtures already on disk (e.g. written by dump-all.js).
    const rows = results[ds] ?? fixtureCache[ds] ?? (fixtureCache[ds] = readFixtureSync(ds));
    if (!rows) throw new SkipDataset(`depends on '${ds}', which was not extracted`);
    const key = Object.keys(rows[0] ?? {}).find(k => k.toLowerCase() === col.toLowerCase()) ?? col;
    return [...new Set(rows.map(r => r[key]).filter(v => v != null && String(v).trim() !== ''))];
  },
  list(ds, col) {
    const vals = ctx.values(ds, col);
    if (!vals.length) throw new SkipDataset(`'${ds}.${col}' is empty`);
    return '(' + vals.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',') + ')';
  },
};

// ─── run one dataset ─────────────────────────────────────────────────────────
async function runDataset(d) {
  const tag = `${d.name.padEnd(22)} [${d.db}]`;
  if (d.enabled === false) return console.log(`  skip  ${tag}  disabled`);

  const pool = await getPool(d.db);
  if (!pool) return console.log(`  skip  ${tag}  no DB_${d.db} connection string`);

  let text, rows;
  try {
    const request = pool.request();
    if (d.sp) {
      const params = typeof d.params === 'function' ? d.params(ctx) : d.params ?? [];
      params.forEach((p, i) => request.input(`p${i}`, p));
      text = `exec ${d.sp} ${params.map((_, i) => `@p${i}`).join(', ')}`;
    } else {
      text = typeof d.sql === 'function' ? d.sql(ctx) : d.sql;
    }
    if (DRY_RUN) console.log(`\n-- ${d.name}\n${text.replace(/\s+/g, ' ').trim()}\n`);
    rows = (await request.query(text)).recordset ?? [];
  } catch (err) {
    if (err instanceof SkipDataset) return console.log(`  skip  ${tag}  ${err.message}`);
    console.error(`  FAIL  ${tag}  ${err.message}`);
    return;
  }

  rows = anonymizeRows(rows, d.anonymize);
  if (d.transform) rows = d.transform(rows, ctx);
  results[d.name] = rows;
  manifest.datasets[d.name] = { db: d.db, rows: rows.length, source: d.sp ?? firstTable(text) };
  console.log(`  ok    ${tag}  ${rows.length} rows`);
}
function firstTable(text) {
  const m = /from\s+([\w.\[\]]+)/i.exec(text) ?? /exec\s+(\w+)/i.exec(text);
  return m ? m[1] : undefined;
}

// ─── shift all dates so the newest anchor row is "now" ───────────────────────
function shiftDates() {
  let offset;
  const anchorRows = results[dateAnchor.dataset];
  if (anchorRows?.length) {
    const key = Object.keys(anchorRows[0]).find(k => k.toLowerCase() === dateAnchor.column.toLowerCase());
    const max = Math.max(...anchorRows.map(r => +new Date(r[key])).filter(Number.isFinite));
    if (Number.isFinite(max)) offset = Date.now() - max;
  } else {
    // Anchor not part of this run: reuse the shift recorded by the previous dump so related dates stay aligned.
    offset = Number(readManifest().dateShiftMs);
    if (!Number.isFinite(offset)) return console.log('\n  no date anchor and no previous dateShiftMs — dates left as-is');
  }
  let touched = 0;
  for (const rows of Object.values(results)) {
    for (const row of rows) {
      for (const [k, v] of Object.entries(row)) {
        if (v instanceof Date && !Number.isNaN(+v)) {
          row[k] = new Date(+v + offset);
          touched++;
        }
      }
    }
  }
  manifest.dateShiftMs = offset;
  console.log(`\n  shifted ${touched} date values by ${(offset / 864e5).toFixed(1)} days (anchor: ${dateAnchor.dataset}.${dateAnchor.column})`);
}

// ─── main ────────────────────────────────────────────────────────────────────
const manifest = { extractedAt: new Date().toISOString(), sampling: env, datasets: {} };

console.log(`Extracting ${datasets.length} datasets${DRY_RUN ? ' (dry run)' : ''}\n`);
for (const d of datasets) await runDataset(d);

if (SHIFT_DATES) shiftDates();

if (!DRY_RUN) {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const [name, rows] of Object.entries(results)) {
    await fs.writeFile(path.join(OUT_DIR, `${name}.json`), JSON.stringify(rows, null, 1));
  }
  const previous = readManifest();
  const merged = { ...previous, ...manifest, datasets: { ...(previous.datasets ?? {}), ...manifest.datasets }, dateShiftMs: manifest.dateShiftMs ?? previous.dateShiftMs };
  await fs.writeFile(path.join(OUT_DIR, '_manifest.json'), JSON.stringify(merged, null, 2));
  console.log(`\nWrote ${Object.keys(results).length} fixture files to ${OUT_DIR}`);
}

for (const p of pools.values()) (await p).close().catch(() => {});
