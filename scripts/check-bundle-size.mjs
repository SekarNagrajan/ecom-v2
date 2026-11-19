// Created by Sekar Nagarajan (2026-11-12 23:50)
/**
 * Bundle budget for apps/ecom-portal. Run after `pnpm build` (CI does): fails when the entry
 * chunk or any single chunk exceeds its gzip budget, and prints the largest chunks either way.
 *
 *   node scripts/check-bundle-size.mjs
 *   BUNDLE_ENTRY_BUDGET_KB=600 BUNDLE_CHUNK_BUDGET_KB=1200 node scripts/check-bundle-size.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "apps/ecom-portal/dist");
const assets = path.join(dist, "assets");

const ENTRY_BUDGET_KB = Number(process.env.BUNDLE_ENTRY_BUDGET_KB ?? 500);
const CHUNK_BUDGET_KB = Number(process.env.BUNDLE_CHUNK_BUDGET_KB ?? 1024);

const kb = (bytes) => bytes / 1024;
const fmt = (bytes) => `${kb(bytes).toFixed(1).padStart(8)} kB`;

let indexHtml;
try {
  indexHtml = readFileSync(path.join(dist, "index.html"), "utf8");
} catch {
  console.error(`✖ ${path.relative(root, dist)}/index.html not found. Run \`pnpm build\` first.`);
  process.exit(1);
}
const entryMatch = indexHtml.match(/<script[^>]+type="module"[^>]+src="\/assets\/([^"]+\.js)"/);
const entryFile = entryMatch?.[1];

const chunks = readdirSync(assets)
  .filter((f) => f.endsWith(".js"))
  .map((f) => {
    const buf = readFileSync(path.join(assets, f));
    return {
      file: f,
      raw: statSync(path.join(assets, f)).size,
      gzip: gzipSync(buf, { level: 9 }).length,
    };
  })
  .sort((a, b) => b.gzip - a.gzip);

const totalGzip = chunks.reduce((sum, c) => sum + c.gzip, 0);
console.log(`\n${"chunk".padEnd(48)} ${"raw".padStart(11)} ${"gzip".padStart(11)}`);
for (const c of chunks.slice(0, 15)) {
  const tag = c.file === entryFile ? "  ← entry" : "";
  console.log(`${c.file.padEnd(48)} ${fmt(c.raw)} ${fmt(c.gzip)}${tag}`);
}
console.log(
  `${"total JS (" + chunks.length + " chunks)".padEnd(48)} ${"".padStart(11)} ${fmt(totalGzip)}\n`,
);

const failures = [];
const entry = chunks.find((c) => c.file === entryFile);
if (!entry) failures.push("could not identify the entry chunk from index.html");
else if (kb(entry.gzip) > ENTRY_BUDGET_KB)
  failures.push(
    `entry chunk ${entry.file} is ${kb(entry.gzip).toFixed(1)} kB gzip (budget ${ENTRY_BUDGET_KB} kB)`,
  );
for (const c of chunks)
  if (kb(c.gzip) > CHUNK_BUDGET_KB)
    failures.push(
      `chunk ${c.file} is ${kb(c.gzip).toFixed(1)} kB gzip (budget ${CHUNK_BUDGET_KB} kB)`,
    );

if (failures.length) {
  console.error("✖ bundle budget exceeded:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  `✔ bundle within budget (entry ≤ ${ENTRY_BUDGET_KB} kB gzip, chunks ≤ ${CHUNK_BUDGET_KB} kB gzip)`,
);
