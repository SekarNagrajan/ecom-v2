// Modified by Sekar Nagarajan (2026-10-16 23:15)
/**
 * Pure helpers shared by the booking bridges and the booking feature (MasterDetailsStep).
 * Deliberately free of `db` / fixture imports so feature code can import it without bundling fixtures.
 */

/** Pull UN/LOCODE-style port code from "USNYC" or "USNYC - New York, USA". */
export function extractPortCode(value: string): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  const code = trimmed.split(/[\s-]/)[0] ?? trimmed;
  return code.trim().toUpperCase();
}

const pad = (n: number) => String(n).padStart(2, '0');

/** yyyy-MM-dd (local time) or '' when the value is not a date. */
export function toDateOnly(value: unknown): string {
  if (value == null || value === '') return '';
  const d = new Date(value as string);
  if (Number.isNaN(+d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** yyyy-MM-dd HH:mm (local time) — the format the route cards / cut-off fields already render. */
export function toDateTimeMinute(value: unknown): string {
  const day = toDateOnly(value);
  if (!day) return '';
  const d = new Date(value as string);
  return `${day} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Whole days between two dates (never negative). */
export function daysBetween(from: unknown, to: unknown): number {
  const a = +new Date(from as string);
  const b = +new Date(to as string);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** Trimmed string; null/undefined become ''. */
export const str = (v: unknown): string => (v == null ? '' : String(v).trim());

/** Finite number or undefined (blank strings, nulls and NaN are undefined). */
export function num(v: unknown): number | undefined {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** 'Y' / 'N' flag → boolean. */
export const yes = (v: unknown): boolean => str(v).toUpperCase() === 'Y';

/** Distinct, non-empty, trimmed values of a column, in first-seen order. */
export function distinctValues(rows: ReadonlyArray<Record<string, unknown>>, column: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    const v = str(r[column]);
    const key = v.toUpperCase();
    if (!v || seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

/** Most frequent non-empty value of `column` among `rows` ('' when none). */
export function mostCommon(rows: ReadonlyArray<Record<string, unknown>>, column: string): string {
  const counts = new Map<string, { value: string; n: number }>();
  for (const r of rows) {
    const v = str(r[column]);
    if (!v) continue;
    const key = v.toLowerCase();
    const entry = counts.get(key) ?? { value: v, n: 0 };
    entry.n += 1;
    counts.set(key, entry);
  }
  let best = '';
  let bestN = 0;
  for (const { value, n } of counts.values()) {
    if (n > bestN) { best = value; bestN = n; }
  }
  return best;
}
