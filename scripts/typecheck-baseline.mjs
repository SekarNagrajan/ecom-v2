// Created by Sekar Nagarajan (2026-11-12 23:10)
/**
 * Typecheck ratchet. The workspace still carries pre-existing TypeScript errors, so CI cannot
 * require a clean `tsc` yet. Instead this script fails when the error count grows beyond the
 * committed baseline and tells you how to lower it when you fix some.
 *
 *   node scripts/typecheck-baseline.mjs            # gate (used by `pnpm typecheck:ci`)
 *   node scripts/typecheck-baseline.mjs --update   # rewrite the baseline from the current state
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselineFile = path.join(root, "typecheck-baseline.json");
const update = process.argv.includes("--update");

const tsc = spawnSync(
  "pnpm",
  ["exec", "tsc", "--noEmit", "--pretty", "false", "-p", "apps/ecom-portal/tsconfig.json"],
  { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, shell: process.platform === "win32" },
);
const output = `${tsc.stdout ?? ""}${tsc.stderr ?? ""}`;
const errorLines = output.split(/\r?\n/).filter((line) => /error TS\d+:/.test(line));

// Positions churn with every edit; the fingerprint keeps file + code + message so diffs stay useful.
// TypeScript prints union members in a non-deterministic order, so they are sorted before comparing.
const fingerprint = (line) =>
  line.replace(/\(\d+,\d+\)/, "").replace(
    /'((?:"[^"]*"\s*\|\s*)+"[^"]*")'/g,
    (_match, members) =>
      `'${members
        .split("|")
        .map((m) => m.trim())
        .sort()
        .join(" | ")}'`,
  );
const current = {
  count: errorLines.length,
  errors: [...new Set(errorLines.map(fingerprint))].sort(),
};

if (update || !existsSync(baselineFile)) {
  writeFileSync(baselineFile, `${JSON.stringify(current, null, 2)}\n`);
  console.log(
    `typecheck baseline written: ${current.count} error(s) → ${path.relative(root, baselineFile)}`,
  );
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselineFile, "utf8"));
const known = new Set(baseline.errors ?? []);
const unseen = current.errors.filter((e) => !known.has(e));

console.log(`typecheck: ${current.count} error(s), baseline ${baseline.count}`);
if (unseen.length) {
  console.log(`\n${unseen.length} error(s) not in the baseline:`);
  for (const line of errorLines.filter((l) => unseen.includes(fingerprint(l))))
    console.log(`  ${line}`);
}

if (current.count > baseline.count) {
  console.error(
    `\n✖ typecheck error count grew from ${baseline.count} to ${current.count}. Fix the new errors above.`,
  );
  process.exit(1);
}
if (current.count < baseline.count) {
  console.log(
    `\n✔ ${baseline.count - current.count} fewer error(s) than the baseline. Lock it in with: pnpm typecheck:baseline`,
  );
}
process.exit(0);
