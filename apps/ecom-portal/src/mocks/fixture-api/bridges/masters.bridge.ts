// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Code → name lookups over the master-data fixtures (Masters / VSS databases, written by
 * `npm run extract:masters`). Every helper falls back to the code itself when the master row is
 * missing, so screens never show blanks. Lookups are indexed once per table array and rebuilt
 * automatically after resetDb() (the index is keyed by the array instance).
 */
import { db, type Row } from '../db';

const indexes = new WeakMap<Row[], Map<string, Row>>();
const norm = (v: unknown) => String(v ?? '').trim().toLowerCase();
const text = (v: unknown) => String(v ?? '').trim();

/** First row of `table` whose `keyColumn` equals `code` (case-insensitive), or undefined. */
export function masterRow(table: string, keyColumn: string, code: unknown): Row | undefined {
  const rows = db[table] ?? [];
  let index = indexes.get(rows);
  if (!index) {
    index = new Map();
    for (const r of rows) {
      const k = norm(r[keyColumn]);
      if (k && !index.has(k)) index.set(k, r);
    }
    indexes.set(rows, index);
  }
  return index.get(norm(code));
}

const nameOf = (table: string, keyColumn: string, nameColumn: string) => (code: unknown): string =>
  text(masterRow(table, keyColumn, code)?.[nameColumn]) || text(code);

// ─── ports ───────────────────────────────────────────────────────────────────
export const portRow = (code: unknown) => masterRow('ports', 'portcode', code);
export const portName = nameOf('ports', 'portcode', 'portname');
/** "INNSA - NHAVA SHEVA" (just the code when no master name exists). */
export function portLabel(code: unknown): string {
  const c = text(code).toUpperCase();
  if (!c) return '';
  const name = portName(c);
  return name && name.toUpperCase() !== c ? `${c} - ${name}` : c;
}
export const portCountry = (code: unknown): string | null =>
  text(portRow(code)?.countrycode) || text(masterRow('portCountryMap', 'portcode', code)?.countrycode) || null;
export function portCoordinates(code: unknown): { lat: number; lng: number } | null {
  const r = portRow(code);
  const lat = Number(r?.latitude), lng = Number(r?.longitude);
  return r && Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? { lat, lng } : null;
}
/** Ports whose code or name contains `q` (code matches first), for typeaheads. */
export function portsMatching(q: string, limit = 50): Row[] {
  const needle = norm(q);
  const rows = db.ports ?? [];
  if (!needle) return rows.slice(0, limit);
  const byCode = rows.filter(p => norm(p.portcode).startsWith(needle));
  const byName = rows.filter(p => !norm(p.portcode).startsWith(needle) && (norm(p.portcode).includes(needle) || norm(p.portname).includes(needle)));
  return [...byCode, ...byName].slice(0, limit);
}

// ─── vessels, services, terminals ────────────────────────────────────────────
export const vesselRow = (code: unknown) => masterRow('vessels', 'VesselCode', code);
export const vesselName = nameOf('vessels', 'VesselCode', 'VesselName');
export const serviceRow = (code: unknown) => masterRow('services', 'servicecode', code);
export const serviceName = nameOf('services', 'servicecode', 'servicename');
export const terminalRow = (code: unknown) => masterRow('terminals', 'terminalcode', code);
export const terminalName = nameOf('terminals', 'terminalcode', 'terminalname');

// ─── equipment, commodities, packages, charges ───────────────────────────────
/** Spellings of the type half of an equipment code that mean the same box (DV20 = 20DC = 20GP, RE20 = 20RF, 40HQ = 40HC). */
const EQUIPMENT_TYPE_ALIASES: Record<string, string[]> = {
  DV: ['DC', 'GP'], DC: ['DV', 'GP'], GP: ['DC', 'DV'], RE: ['RF'], RF: ['RE'], HQ: ['HC'], HC: ['HQ'],
};
/** Only live equipment rows (status A) are masters; void rows (status V, e.g. the bare "20" SOC entry) are ignored. */
const activeEquipmentCache = new WeakMap<Row[], Row[]>();
function activeEquipments(): Row[] {
  const all = db.equipments ?? [];
  let active = activeEquipmentCache.get(all);
  if (!active) {
    active = all.filter(e => norm(e.status) === 'a');
    activeEquipmentCache.set(all, active);
  }
  return active;
}
const activeEquipmentRow = (code: string): Row | undefined => {
  const rows = activeEquipments();
  let index = indexes.get(rows);
  if (!index) {
    index = new Map();
    for (const r of rows) {
      const k = norm(r.Equiptype);
      if (k && !index.has(k)) index.set(k, r);
    }
    indexes.set(rows, index);
  }
  return index.get(norm(code));
};

/**
 * Equipment codes appear as 20DC / 40HC in masters and as DV20 / RE20 / 20DV / DC20 in e-commerce rows.
 * The exact code wins; otherwise size and type are swapped and the type aliases are tried, both ways round.
 */
export function equipmentRow(code: unknown): Row | undefined {
  const c = text(code).toUpperCase();
  if (!c) return undefined;
  const direct = activeEquipmentRow(c);
  if (direct) return direct;
  const typeFirst = /^([A-Z]{2})(\d{2})$/.exec(c);
  const sizeFirst = /^(\d{2})([A-Z]{2})$/.exec(c);
  if (!typeFirst && !sizeFirst) return undefined;
  const size = typeFirst ? typeFirst[2] : sizeFirst![1];
  const type = typeFirst ? typeFirst[1] : sizeFirst![2];
  for (const t of [type, ...(EQUIPMENT_TYPE_ALIASES[type] ?? [])]) {
    const row = activeEquipmentRow(`${size}${t}`) ?? activeEquipmentRow(`${t}${size}`);
    if (row) return row;
  }
  return undefined;
}
export const equipmentLabel = (code: unknown): string => text(equipmentRow(code)?.equipdesc) || text(code);
export const equipmentTeus = (code: unknown): number => {
  const teus = Number(equipmentRow(code)?.Teus);
  if (Number.isFinite(teus) && teus > 0) return teus;
  const digits = /(\d{2})/.exec(text(code))?.[1];
  return digits === '20' || digits === '22' || digits === '10' ? 1 : 2;
};
export const commodityName = nameOf('commodities', 'comdtycode', 'comdtyname');
export const packageName = nameOf('packages', 'packagecode', 'description');
export const chargeRow = (code: unknown) => masterRow('charges', 'chargecode', code);
export const chargeName = nameOf('charges', 'chargecode', 'chargename');
export const depotName = nameOf('depots', 'depot', 'description');

// ─── countries, states ───────────────────────────────────────────────────────
export const countryRow = (code: unknown) => masterRow('countries', 'countrycode', code);
export const countryName = nameOf('countries', 'countrycode', 'countryname');
export const stateName = nameOf('states', 'statecode', 'statedesc');
/** "+91" from countries.isdcode; '' when the country (or its dial code) is unknown. */
export function countryDialCode(code: unknown): string {
  const digits = text(countryRow(code)?.isdcode).replace(/\D/g, '');
  return digits ? `+${digits}` : '';
}
/** Every distinct dial code in the country master, longest first (for prefix matching on stored phone numbers). */
export function dialCodes(): string[] {
  const out = new Set<string>();
  for (const c of db.countries ?? []) {
    const digits = text(c.isdcode).replace(/\D/g, '');
    if (digits) out.add(`+${digits}`);
  }
  return [...out].sort((a, b) => b.length - a.length || a.localeCompare(b));
}

/** "CODE - NAME" when a distinct name is known, else the code (generic form of portLabel for any master). */
export function codeLabel(code: unknown, name: unknown): string {
  const c = text(code);
  const n = text(name);
  if (c && n && n.toUpperCase() !== c.toUpperCase()) return `${c} - ${n}`;
  return c || n;
}

// ─── customers ───────────────────────────────────────────────────────────────
export const customerRow = (code: unknown) => masterRow('customerMaster', 'CustCode', code);
export const customerName = nameOf('customerMaster', 'CustCode', 'CustName');
