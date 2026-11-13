// Modified by Sekar Nagarajan (2026-10-17 03:20)
/**
 * Rates module (published tariffs, service contracts, surcharges, spot quotes) derived from the fixtures:
 *   tariffs        (Commercial.bookingrates_tariff view)  → tariff lines: lane, equipment, amount, validity
 *   routes         (Routedetail)                           → main service of the lane (transService)
 *   contracts / contractLines / contractSurcharges /
 *   contractRouting / contractCommodities (Commercial corporate rates) → service contracts with real amounts
 *   charges        (charges master)                        → surcharge names, placeholder codes when a lane has no contract
 *   customerMaster / bookings                              → contract customer and carriage terms
 *   ports / equipments / commodities                       → display names (masters.bridge)
 *
 * The sample has no quotation table (quotes are derived from the customer's route-search log,
 * ecomRouteSearchLog) and lanes without a corporate contract fall back to placeholder surcharge amounts on
 * real charge codes; see the TODO(fixtures) markers
 * for the deterministic derivations that fill those gaps. Every function that takes rows is pure so the
 * tests can feed hand-made rows; the `fixture*` wrappers bind them to `db`.
 */
import type {
  ContractDTO,
  CreateQuoteInput,
  QuoteDTO,
  SurchargeDTO,
  TariffDTO,
} from '../../../features/rates/types/rates.types';
import { ciRow, db, eq, nextRef, type Row } from '../db';
import { carriageTerm, splitEquipmentCode } from './booking-lookups.bridge';
import { extractPortCode, mostCommon, num, str, toDateOnly, toDateTimeMinute, yes } from './booking-shared.bridge';
import { chargeName, commodityName, countryName, customerName, equipmentLabel, portCountry, portName } from './masters.bridge';
import { currentCustomerCode } from './user.bridge';

// ─── equipment vocabulary ────────────────────────────────────────────────────

/** Size + family of a box, e.g. { size: '40', family: 'HC' }. */
export interface EquipmentKey {
  size: string;
  family: string;
}

/** Legacy spellings of the type part (RE20 / 20DC / 40HQ …) folded onto one family code. */
const FAMILY_ALIASES: Record<string, string> = {
  DC: 'DV', GP: 'DV', DY: 'DV', DS: 'DV', ST: 'DV',
  RE: 'RF', RH: 'RF', HR: 'RF',
  HQ: 'HC', HH: 'HC',
};

/** Families the Rates search filter can name; everything else keeps the Masters description. */
const FAMILY_LABELS: Record<string, string> = {
  DV: 'Standard Dry',
  HC: 'High Cube Dry',
  RF: 'Reefer Container',
  OT: 'Open Top',
  FR: 'Flat Rack',
  TK: 'Tank',
};

/**
 * Parses either an equipment code (20DC, DV20, 40HC, RE40) or a portal label ("40' High Cube Dry",
 * "20' Dry Standard") into a comparable key. null means "no equipment filter" ('' / ALL / unparseable).
 */
export function equipmentKey(value: unknown): EquipmentKey | null {
  const v = str(value).toUpperCase();
  if (!v || v === 'ALL') return null;
  if (/^[A-Z]*\d{2}[A-Z]*$/.test(v)) {
    const { size, type } = splitEquipmentCode(v);
    return { size, family: FAMILY_ALIASES[type] ?? type };
  }
  const size = /(\d{2})/.exec(v)?.[1] ?? '';
  const family = /HIGH\s*CUBE/.test(v) ? 'HC'
    : /REEFER|REFRIG/.test(v) ? 'RF'
    : /OPEN\s*TOP/.test(v) ? 'OT'
    : /FLAT/.test(v) ? 'FR'
    : /TANK/.test(v) ? 'TK'
    : /DRY|STANDARD|GENERAL/.test(v) ? 'DV'
    : '';
  return size || family ? { size, family } : null;
}

/** true when the fixture code belongs to the requested size + family (no filter → always true). */
export function matchesEquipment(code: unknown, wanted: EquipmentKey | null): boolean {
  if (!wanted) return true;
  const k = equipmentKey(code);
  if (!k) return false;
  return (!wanted.size || k.size === wanted.size) && (!wanted.family || k.family === wanted.family);
}

/** "40' High Cube Dry" — the vocabulary the Rates search filter compares against — else the Masters description. */
export function rateEquipmentLabel(code: unknown): string {
  const k = equipmentKey(code);
  const family = k ? FAMILY_LABELS[k.family] : undefined;
  if (k && k.size && family) return `${k.size}' ${family}`;
  return equipmentLabel(code) || str(code);
}

// ─── lanes ───────────────────────────────────────────────────────────────────

/** Origin / destination of a rate line (loadport / dischport; pol / pod when the view left them blank). */
export const tariffPol = (r: Row) => str(r.loadport || r.pol).toUpperCase();
export const tariffPod = (r: Row) => str(r.dischport || r.pod).toUpperCase();

/** A tariff row whose status is active (the view only returns 'A' rows; blank is tolerated). */
const isActiveTariff = (r: Row) => {
  const s = str(r.status).toUpperCase();
  return !s || s === 'A';
};

/** Rows of the lane: `pol` matches pol OR loadport, `pod` matches pod OR dischport; blank side = any. */
export function laneTariffRows(tariffs: Row[], pol: string, pod: string): Row[] {
  const o = extractPortCode(pol);
  const d = extractPortCode(pod);
  return tariffs.filter(r =>
    isActiveTariff(r)
    && (!o || eq(r.pol, o) || eq(r.loadport, o))
    && (!d || eq(r.pod, d) || eq(r.dischport, d)));
}

const time = (v: unknown) => +new Date(str(v));

/** true when `on` (ms) lies within the row's validity. */
export function validOn(r: Row, on: number): boolean {
  const from = time(r.validfrom);
  const to = time(r.validto);
  return (!Number.isFinite(from) || from <= on) && (!Number.isFinite(to) || on <= to);
}

/** Currently valid rows first, then cheapest, then rate number / item number — a deterministic order. */
export function compareTariffRows(now = Date.now()) {
  return (a: Row, b: Row): number =>
    Number(validOn(b, now)) - Number(validOn(a, now))
    || (num(a.localamount) ?? 0) - (num(b.localamount) ?? 0)
    || str(a.rateno).localeCompare(str(b.rateno))
    || (num(a.itemno) ?? 0) - (num(b.itemno) ?? 0);
}

/** First-seen row per key, preserving order. */
function firstPerKey(rows: Row[], key: (r: Row) => string): Row[] {
  const seen = new Set<string>();
  return rows.filter(r => {
    const k = key(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** min(validfrom) .. max(validto) of the rows as yyyy-MM-dd; the calendar year when there are no rows. */
export function laneValidity(rows: Row[], now = new Date()): { from: string; to: string } {
  const froms = rows.map(r => time(r.validfrom)).filter(Number.isFinite);
  const tos = rows.map(r => time(r.validto)).filter(Number.isFinite);
  if (!froms.length || !tos.length) {
    return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
  }
  return { from: toDateOnly(new Date(Math.min(...froms))), to: toDateOnly(new Date(Math.max(...tos))) };
}

// ─── routes ──────────────────────────────────────────────────────────────────

/** Routedetail row for the lane: default route origin→delivery first, then any default, then any. */
export function laneRoute(routes: Row[], pol: string, pod: string): Row | undefined {
  const o = extractPortCode(pol);
  const d = extractPortCode(pod);
  if (!o || !d) return undefined;
  const candidates = routes.filter(r =>
    str(r.Status).toUpperCase() !== 'I'
    && (eq(r.BLPOL, o) || eq(r.origin, o))
    && (eq(r.BlPod, d) || eq(r.delivery, d)));
  return candidates.find(r => eq(r.origin, o) && eq(r.delivery, d) && yes(r.DefRoute))
    ?? candidates.find(r => yes(r.DefRoute))
    ?? candidates[0];
}

/** Main service of the lane (Routedetail.MainSvc); the tariff's own service when it is a real code. */
export function laneService(routes: Row[], tariff: Row): string | undefined {
  const svc = str(laneRoute(routes, tariffPol(tariff), tariffPod(tariff))?.MainSvc);
  if (svc) return svc;
  const own = str(tariff.service).toUpperCase();
  return own && own !== 'ZZZ' ? own : undefined;
}

// ─── commodity ───────────────────────────────────────────────────────────────

// TODO(fixtures): bookingrates_tariff has no commodity column — every line is Freight-All-Kinds. GEN-CGO
// is the portal's general-cargo category, so the screen's commodity filter keeps matching these rows.
export const FAK_COMMODITY = { code: 'GEN-CGO', name: 'General Cargo (FAK)' } as const;

/** Requested commodity echoed back (a FAK tariff applies to it); the general-cargo category otherwise. */
export function tariffCommodity(requested: unknown): { code: string; name: string } {
  const code = str(requested);
  if (!code || code.toUpperCase() === 'ALL' || code === FAK_COMMODITY.code) return { ...FAK_COMMODITY };
  const row = db.commodities.find(c => eq(c.comdtycode, code));
  return { code, name: str(row?.comdtyname) || `${code} (FAK)` };
}

// ─── tariffs ─────────────────────────────────────────────────────────────────

export interface TariffSearch {
  loadPort?: string;
  dischPort?: string;
  eqpType?: string;
  commodity?: string;
  /** yyyy-MM-dd; only rows valid on that day. */
  date?: string;
}

/** Matching rows of the view, one per (rate number, equipment label), in deterministic order. */
export function searchTariffRows(tariffs: Row[], q: TariffSearch, now = Date.now()): Row[] {
  const wanted = equipmentKey(q.eqpType);
  const on = q.date ? time(q.date) : NaN;
  const rows = laneTariffRows(tariffs, q.loadPort ?? '', q.dischPort ?? '')
    .filter(r => matchesEquipment(r.eqptype, wanted) && (!Number.isFinite(on) || validOn(r, on)))
    .sort(compareTariffRows(now));
  return firstPerKey(rows, r => `${str(r.rateno).toUpperCase()}|${rateEquipmentLabel(r.eqptype)}`);
}

/** Cheapest currently valid row of the lane for the equipment (exact code preferred over family). */
export function bestTariffRow(tariffs: Row[], pol: string, pod: string, eqpType: string, now = Date.now()): Row | undefined {
  const lane = laneTariffRows(tariffs, pol, pod).sort(compareTariffRows(now));
  return lane.find(r => eq(r.eqptype, eqpType)) ?? lane.find(r => matchesEquipment(r.eqptype, equipmentKey(eqpType)));
}

export function mapTariff(r: Row, routes: Row[], commodity?: string): TariffDTO {
  const pol = tariffPol(r);
  const pod = tariffPod(r);
  const amount = num(r.localamount) ?? 0;
  const cmd = tariffCommodity(commodity);
  return {
    id: `trf-${str(r.rateno)}-${str(r.itemno)}`,
    loadPort: pol,
    loadPortName: portName(pol),
    dischPort: pod,
    dischPortName: portName(pod),
    eqpType: rateEquipmentLabel(r.eqptype),
    commodityCode: cmd.code,
    commodityName: cmd.name,
    currency: str(r.currency) || 'USD',
    tariffAmount: amount,
    localAmount: amount,
    effectiveFrom: toDateOnly(r.validfrom),
    effectiveTo: toDateOnly(r.validto),
    soc: yes(r.soc) ? 'Yes' : 'No',
    nor: yes(r.nor),
    transService: laneService(routes, r),
  };
}

export function tariffsFromRows(tariffs: Row[], routes: Row[], q: TariffSearch): TariffDTO[] {
  return searchTariffRows(tariffs, q).map(r => mapTariff(r, routes, q.commodity));
}

export const fixtureTariffs = (q: TariffSearch): TariffDTO[] => tariffsFromRows(db.tariffs, db.routes, q);

// ─── surcharges ──────────────────────────────────────────────────────────────

export interface SurchargeSearch {
  origin?: string;
  pol?: string;
  pod?: string;
  delivery?: string;
  eqpType?: string;
}

// TODO(fixtures): no DB source — surcharge tariffs (COMDB corporate / surcharge tables were not extracted).
// The charge CODES are real: the all-in codes the lane's tariff rows name (`allin`: BAF,CAF / BAF,ADI) plus
// the standard accessorials below, each resolved against the `charges` master (non-FREIGHT rows only).
// The AMOUNTS are a stable hash of the charge code (×1.5 for 40'+ boxes), so a lane always shows the same figures.
export const STANDARD_SURCHARGE_CODES = ['BAF', 'CAF', 'PSS', 'EBS', 'TOC', 'THD'] as const;

/** 32-bit FNV-1a; same input → same number on every run. */
export function stableHash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Deterministic placeholder amount: 40–275 for a 20', ×1.5 for 40'/45'/53' boxes. */
export function surchargeAmount(chargeCode: string, eqpType: unknown): number {
  const size = Number(equipmentKey(eqpType)?.size) || 20;
  const factor = size >= 40 ? 1.5 : 1;
  return Math.round((40 + (stableHash(chargeCode.trim().toUpperCase()) % 48) * 5) * factor);
}

/** Charge codes the lane attracts: the tariff rows' `allin` lists first, then the standard accessorials. */
export function surchargeCodesForLane(laneRows: Row[]): string[] {
  const codes: string[] = [];
  const push = (c: string) => {
    const code = c.trim().toUpperCase();
    if (code && !codes.includes(code)) codes.push(code);
  };
  for (const r of laneRows) str(r.allin).split(',').forEach(push);
  STANDARD_SURCHARGE_CODES.forEach(push);
  return codes;
}

/** Most frequent equipment label among the lane's tariff rows (20' Standard Dry when there are none). */
export function laneEquipmentLabel(laneRows: Row[]): string {
  const labelled = laneRows.map((r): Row => ({ ...r, rateLabel: rateEquipmentLabel(r.eqptype) }));
  return mostCommon(labelled, 'rateLabel') || "20' Standard Dry";
}

/** Contract tables (Commercial corporate rates) that carry real surcharge amounts. */
export interface ContractTables {
  contracts: Row[];
  contractLines: Row[];
  contractSurcharges: Row[];
  contractRouting?: Row[];
  contractCommodities?: Row[];
}

const activeFlag = (r: Row) => !['V', 'D', 'I'].includes(str(r.statusFlag).toUpperCase());
const sameBox = (a: unknown, b: unknown) => {
  const ka = equipmentKey(a), kb = equipmentKey(b);
  return !ka || !kb || (ka.size === kb.size && ka.family === kb.family);
};
/** Equipment label of a surcharge row: its own box when it names one, else the contract line's. */
const surchargeBoxLabel = (sur: Row, line: Row) => rateEquipmentLabel(equipmentKey(sur.surEqp) ? sur.surEqp : line.eqpType);

/** Active contract lines on a lane (either port may be blank = any), optionally narrowed to one equipment family/size. */
export function contractLinesOnLane(lines: Row[], pol: string, pod: string, eqpType?: unknown): Row[] {
  const wanted = equipmentKey(eqpType);
  return lines.filter(l =>
    activeFlag(l)
    && (!pol || eq(l.pol, pol))
    && (!pod || eq(l.pod, pod))
    && (!wanted || matchesEquipment(l.eqpType, wanted)));
}

/** Surcharge rows of one contract line (same corporate number + item), active, for a compatible box. */
export function surchargeRowsForLine(contractSurcharges: Row[], line: Row): Row[] {
  return contractSurcharges.filter(s =>
    eq(s.corporateNo, line.corporateNo) && num(s.itemNo) === num(line.itemNo) && activeFlag(s) && sameBox(s.surEqp, line.eqpType));
}

export function mapContractSurcharge(sur: Row, line: Row): SurchargeDTO {
  const pol = str(line.pol).toUpperCase();
  const pod = str(line.pod).toUpperCase();
  const code = str(sur.chargeCode).toUpperCase();
  return {
    id: `sur-${str(line.corporateNo)}-${str(line.itemNo)}-${code}`,
    chargeCode: code,
    chargeName: chargeName(code),
    origin: pol,
    loadRegion: pol ? countryName(portCountry(pol) ?? '') : '',
    dischargeRegion: pod ? countryName(portCountry(pod) ?? '') : '',
    delivery: pod,
    eqpType: surchargeBoxLabel(sur, line),
    currency: str(sur.currency) || str(line.locCurrency) || 'USD',
    amount: Math.round((num(sur.amount) ?? 0) * 100) / 100,
    isNor: yes(line.Nor),
    effectiveFrom: toDateOnly(line.validFrom),
    effectiveTo: toDateOnly(line.validTo),
  };
}

/** Real surcharges on a lane: one row per charge code (newest contract line wins), ordered by code. */
export function contractSurchargesForLane(
  tables: Pick<ContractTables, 'contractLines' | 'contractSurcharges'>,
  pol: string,
  pod: string,
  eqpType?: unknown,
  customerCodes: string[] = [],
): SurchargeDTO[] {
  const onLane = contractLinesOnLane(tables.contractLines, pol, pod, eqpType);
  const owners = new Set(customerCodes.map(c => c.trim().toLowerCase()).filter(Boolean));
  const own = owners.size ? onLane.filter(l => owners.has(str(l.custCode).toLowerCase())) : [];
  const lines = (own.length ? own : onLane).sort((a, b) => time(b.validFrom) - time(a.validFrom));
  const out = new Map<string, SurchargeDTO>();
  for (const line of lines) {
    for (const sur of surchargeRowsForLine(tables.contractSurcharges, line)) {
      const dto = mapContractSurcharge(sur, line);
      if (!out.has(dto.chargeCode)) out.set(dto.chargeCode, dto);
    }
  }
  return [...out.values()].sort((a, b) => a.chargeCode.localeCompare(b.chargeCode));
}

export function surchargesFromRows(
  charges: Row[],
  tariffs: Row[],
  q: SurchargeSearch,
  now = new Date(),
  contractTables?: Pick<ContractTables, 'contractLines' | 'contractSurcharges'> & { customerCodes?: string[] },
): SurchargeDTO[] {
  const pol = extractPortCode(q.pol || q.origin || '');
  const pod = extractPortCode(q.pod || q.delivery || '');
  if (contractTables && (pol || pod)) {
    const real = contractSurchargesForLane(contractTables, pol, pod, q.eqpType, contractTables.customerCodes ?? []);
    if (real.length) return real;
  }
  // TODO(fixtures): no contract surcharge on this lane — deterministic placeholder amounts on real charge codes.
  const lane = pol || pod ? laneTariffRows(tariffs, pol, pod) : [];
  const eqpLabel = equipmentKey(q.eqpType) ? rateEquipmentLabel(q.eqpType) : laneEquipmentLabel(lane);
  const currency = mostCommon(lane, 'currency') || 'USD';
  const validity = laneValidity(lane, now);
  const isNor = lane.some(r => yes(r.nor));
  const sizeSlug = equipmentKey(eqpLabel)?.size || 'xx';
  const out: SurchargeDTO[] = [];
  for (const code of surchargeCodesForLane(lane)) {
    const charge = charges.find(c => eq(c.chargecode, code));
    if (!charge || str(charge.chargegrp).toUpperCase() === 'FREIGHT') continue;
    out.push({
      id: `sur-${code}-${pol || 'ANY'}${pod || 'ANY'}-${sizeSlug}`,
      chargeCode: code,
      chargeName: str(charge.chargename) || code,
      origin: pol,
      loadRegion: pol ? countryName(portCountry(pol) ?? '') : '',
      dischargeRegion: pod ? countryName(portCountry(pod) ?? '') : '',
      delivery: pod,
      eqpType: eqpLabel,
      currency,
      amount: surchargeAmount(code, eqpLabel),
      isNor,
      effectiveFrom: validity.from,
      effectiveTo: validity.to,
    });
  }
  return out;
}

export const fixtureSurcharges = (q: SurchargeSearch): SurchargeDTO[] =>
  surchargesFromRows(db.charges, db.tariffs, q, new Date(), {
    contractLines: db.contractLines,
    contractSurcharges: db.contractSurcharges,
    customerCodes: customerAccountCodes(currentCustomerCode(), db.customerMapping),
  });

// ─── contracts ───────────────────────────────────────────────────────────────

export interface ContractSearch {
  contractNo?: string;
  customerCode?: string;
  pol?: string;
  pod?: string;
}

export interface ContractSources extends Partial<ContractTables> {
  tariffs: Row[];
  routes: Row[];
  charges: Row[];
  bookings: Row[];
  /** Customer the mock session is logged in as (owner of the contracts). */
  customerCode: string;
  /** Every account code the contracts may be registered under (login code + mapped accounting codes). */
  customerCodes?: string[];
}

// TODO(fixtures): all 500 bookingrates_tariff rows carry a blank custcode (public tariffs), so the sample has
// no contract rates. Real custcode rows are used whenever present; otherwise the demo customer's contracts are
// derived as the tariff lines of the lanes that customer has actually booked (ecombooking.cust_code).
export function contractTariffRows(tariffs: Row[], bookings: Row[], customerCode: string): Row[] {
  const real = tariffs.filter(r => isActiveTariff(r) && str(r.custcode));
  if (real.length) return real;
  const lanes = new Set<string>();
  for (const b of bookings) {
    if (!eq(b.cust_code, customerCode) || str(b.ebook_status).toUpperCase() === 'T') continue;
    const o = str(b.originPortId).toUpperCase();
    const d = str(b.finalPortId).toUpperCase();
    if (o && d) lanes.add(`${o}>${d}`);
  }
  return tariffs
    .filter(r => isActiveTariff(r) && lanes.has(`${tariffPol(r)}>${tariffPod(r)}`))
    .map(r => ciRow({ ...r, custcode: customerCode }));
}

/** CY/CY, DOOR/CY … from the customer's bookings on the lane (CY/CY when the lane was never booked). */
export function laneCarriageTerm(bookings: Row[], pol: string, pod: string): string {
  const onLane = bookings.filter(b => eq(b.originPortId, pol) && eq(b.finalPortId, pod));
  return carriageTerm(mostCommon(onLane, 'preCarriage'), mostCommon(onLane, 'onCarriage'));
}

/** Newest validity first, then rate number, equipment label and item number. */
function compareContractRows(a: Row, b: Row): number {
  return time(b.validfrom) - time(a.validfrom)
    || str(a.rateno).localeCompare(str(b.rateno))
    || rateEquipmentLabel(a.eqptype).localeCompare(rateEquipmentLabel(b.eqptype))
    || (num(a.itemno) ?? 0) - (num(b.itemno) ?? 0);
}

export function mapContract(r: Row, src: Pick<ContractSources, 'routes' | 'charges' | 'tariffs' | 'bookings'>): ContractDTO {
  const pol = tariffPol(r);
  const pod = tariffPod(r);
  const eqpType = rateEquipmentLabel(r.eqptype);
  const custCode = str(r.custcode);
  const surcharges = surchargesFromRows(src.charges, src.tariffs, { pol, pod, eqpType });
  return {
    id: `ctr-${str(r.rateno)}-${str(r.itemno)}`,
    contractNo: str(r.rateno),
    customerCode: custCode,
    customerName: customerName(custCode),
    originPort: pol,
    originPortName: portName(pol),
    deliveryPort: pod,
    deliveryPortName: portName(pod),
    rateNo: `${str(r.rateno)}/${str(r.itemno)}`,
    eqpType,
    commodity: FAK_COMMODITY.code,
    commodityName: FAK_COMMODITY.name,
    oceanFreight: num(r.localamount) ?? 0,
    currency: str(r.currency) || 'USD',
    subjectToChargesAmount: surcharges.reduce((sum, s) => sum + s.amount, 0),
    soc: yes(r.soc) ? 'Yes' : 'No',
    carrTerms: laneCarriageTerm(src.bookings, pol, pod),
    effectiveFrom: toDateOnly(r.validfrom),
    effectiveTo: toDateOnly(r.validto),
    surcharges,
    transService: laneService(src.routes, r),
    nor: yes(r.nor),
  };
}

/** Carriage term of a contract line ("CY / CY" → "CY/CY"), else what the customer books on the lane. */
export function lineCarriageTerm(line: Row, bookings: Row[]): string {
  const term = str(line.Tservice).replace(/\s+/g, '').toUpperCase();
  return /^[A-Z]+\/[A-Z]+$/.test(term) ? term : laneCarriageTerm(bookings, str(line.pol).toUpperCase(), str(line.pod).toUpperCase());
}

/** Maps one corporateDetailN line (+ its contract header, surcharges, routing and commodity) onto ContractDTO. */
export function mapContractLine(line: Row, src: ContractSources): ContractDTO {
  const corporateNo = str(line.corporateNo);
  const itemNo = num(line.itemNo) ?? 0;
  const header = (src.contracts ?? []).find(c => eq(c.CorporateNo, corporateNo));
  const routing = (src.contractRouting ?? []).find(r => eq(r.CorporateNo, corporateNo) && num(r.itemNo) === itemNo);
  const commodityCode = str((src.contractCommodities ?? []).find(c => eq(c.corporateNo, corporateNo) && num(c.itemNo) === itemNo)?.commodityCode);
  const pol = str(line.pol).toUpperCase();
  const pod = str(line.pod).toUpperCase();
  const origin = str(routing?.origin).toUpperCase() || pol;
  const delivery = str(routing?.delivery).toUpperCase() || pod;
  const custCode = str(line.custCode) || str(header?.CustCode);
  const currency = str(line.locCurrency) || 'USD';
  const surcharges = surchargeRowsForLine(src.contractSurcharges ?? [], line).map(sur => mapContractSurcharge(sur, line));
  const service = str(line.servicecode) || str(routing?.svcCode) || str(routing?.polSer);
  return {
    id: `ctr-${corporateNo}-${itemNo}`,
    contractNo: corporateNo,
    customerCode: custCode,
    customerName: customerName(custCode),
    originPort: origin,
    originPortName: portName(origin),
    deliveryPort: delivery,
    deliveryPortName: portName(delivery),
    rateNo: `${corporateNo}/${itemNo}`,
    eqpType: rateEquipmentLabel(line.eqpType),
    commodity: commodityCode || FAK_COMMODITY.code,
    commodityName: commodityCode ? commodityName(commodityCode) : FAK_COMMODITY.name,
    oceanFreight: Math.round((num(line.locAmt) ?? num(line.BaseAmt) ?? 0) * 100) / 100,
    currency,
    subjectToChargesAmount: surcharges.filter(sur => sur.currency === currency).reduce((sum, sur) => sum + sur.amount, 0),
    soc: yes(line.Soc) ? 'Yes' : 'No',
    carrTerms: lineCarriageTerm(line, src.bookings),
    effectiveFrom: toDateOnly(line.validFrom),
    effectiveTo: toDateOnly(line.validTo),
    surcharges,
    transService: service && service !== 'ZZZ' ? service : undefined,
    nor: yes(line.Nor),
  };
}

/** Active contract lines registered under the customer's codes (contract header active too). */
export function customerContractLines(src: ContractSources, codes: string[]): Row[] {
  const inactive = new Set((src.contracts ?? []).filter(c => ['I', 'D', 'C'].includes(str(c.status).toUpperCase())).map(c => str(c.CorporateNo).toUpperCase()));
  const owners = new Set(codes.map(c => c.trim().toLowerCase()).filter(Boolean));
  return (src.contractLines ?? []).filter(l =>
    activeFlag(l)
    && str(l.conStatus).toUpperCase() !== 'N'
    && !inactive.has(str(l.corporateNo).toUpperCase())
    && (!owners.size || owners.has(str(l.custCode).toLowerCase())));
}

/** Currently valid first, then newest validity, then contract number and item. */
function compareContractLines(now: number) {
  return (a: Row, b: Row) =>
    Number(time(b.validTo) >= now) - Number(time(a.validTo) >= now)
    || time(b.validFrom) - time(a.validFrom)
    || str(a.corporateNo).localeCompare(str(b.corporateNo))
    || (num(a.itemNo) ?? 0) - (num(b.itemNo) ?? 0);
}

export function contractsFromRows(src: ContractSources, q: ContractSearch, now = new Date()): ContractDTO[] {
  const pol = extractPortCode(q.pol ?? '');
  const pod = extractPortCode(q.pod ?? '');
  const contractNo = str(q.contractNo).toUpperCase();
  const codes = q.customerCode ? [q.customerCode] : (src.customerCodes ?? [src.customerCode]);

  const lines = customerContractLines(src, codes)
    .filter(l =>
      (!pol || eq(l.pol, pol)) && (!pod || eq(l.pod, pod))
      && (!contractNo || str(l.corporateNo).toUpperCase().includes(contractNo))
      && !!FAMILY_LABELS[equipmentKey(l.eqpType)?.family ?? ''])
    .sort(compareContractLines(+now));
  if (lines.length) {
    return firstPerKey(lines, l => `${str(l.corporateNo).toUpperCase()}|${str(l.pol).toUpperCase()}>${str(l.pod).toUpperCase()}|${rateEquipmentLabel(l.eqpType)}`)
      .map(l => mapContractLine(l, src));
  }

  // TODO(fixtures): the customer has no corporate contract lines in the sample → contracts derived from the
  // published tariffs of the lanes the customer has booked.
  const rows = contractTariffRows(src.tariffs, src.bookings, src.customerCode)
    .filter(r =>
      (!pol || eq(r.pol, pol) || eq(r.loadport, pol))
      && (!pod || eq(r.pod, pod) || eq(r.dischport, pod))
      && (!q.customerCode || eq(r.custcode, q.customerCode))
      && (!contractNo || str(r.rateno).toUpperCase().includes(contractNo))
      && !!FAMILY_LABELS[equipmentKey(r.eqptype)?.family ?? ''])
    .sort(compareContractRows);
  return firstPerKey(rows, r => `${str(r.rateno).toUpperCase()}|${rateEquipmentLabel(r.eqptype)}`)
    .map(r => mapContract(r, src));
}

/** Login customer code plus the accounting codes mapped to it (ecom_customer_mapping). */
export function customerAccountCodes(login: string, mapping: Row[]): string[] {
  const codes = [login];
  for (const m of mapping) {
    if (eq(m.LoginCustCode, login) && str(m.APcustCode) && !['I', 'D'].includes(str(m.Status).toUpperCase())) codes.push(str(m.APcustCode));
  }
  return [...new Set(codes.map(c => c.trim()).filter(Boolean))];
}

export const fixtureContracts = (q: ContractSearch): ContractDTO[] => {
  const login = currentCustomerCode();
  return contractsFromRows(
    {
      tariffs: db.tariffs, routes: db.routes, charges: db.charges, bookings: db.bookings,
      contracts: db.contracts, contractLines: db.contractLines, contractSurcharges: db.contractSurcharges,
      contractRouting: db.contractRouting, contractCommodities: db.contractCommodities,
      customerCode: login, customerCodes: customerAccountCodes(login, db.customerMapping),
    },
    q,
  );
};

// ─── quotes ──────────────────────────────────────────────────────────────────
// TODO(fixtures): no quotation table in any extracted database. The quote list is derived from the
// customer's own rate enquiries (ecomRouteSearchLog: one row per route search) priced with the lane's
// published tariff and the equipment the customer usually books on that lane; requests raised in the
// session are added on top.

const sessionQuotes: QuoteDTO[] = [];
const DAY = 86_400_000;
/** Quotes are expressed in USD, so only USD tariff lines can price them. */
const usdTariffs = (rows: Row[]) => rows.filter(r => str(r.currency).toUpperCase() === 'USD');
export const QUOTE_VALIDITY_DAYS = 15;

export interface QuoteSources {
  searches: Row[];
  tariffs: Row[];
  bookings: Row[];
  cargo: Row[];
  commodities: Row[];
  customerCode: string;
  customer: string;
}

function modeOf<T>(values: T[]): T | undefined {
  const counts = new Map<T, number>();
  let best: T | undefined;
  let bestCount = 0;
  for (const v of values) {
    const n = (counts.get(v) ?? 0) + 1;
    counts.set(v, n);
    if (n > bestCount) { bestCount = n; best = v; }
  }
  return best;
}

/** Equipment, quantity, commodity and weight the customer usually books on a lane (20' dry FAK when unknown). */
export function laneBookingProfile(bookings: Row[], cargo: Row[], commodities: Row[], pol: string, pod: string) {
  const ids = new Set(
    bookings
      .filter(b => eq(b.originPortId, pol) && eq(b.finalPortId, pod) && !eq(b.ebook_status, 'T'))
      .map(b => str(b.ebookno).toLowerCase()),
  );
  const boxes = cargo.filter(c => ids.has(str(c.ebookno).toLowerCase()));
  const lines = commodities.filter(c => ids.has(str(c.ebookno).toLowerCase()));
  const eqpCode = modeOf(boxes.map(c => str(c.eqpSize || c.eqpType).toUpperCase()).filter(Boolean)) ?? '20DC';
  const weights = boxes.map(c => num(c.cargoWeight)).filter(w => w > 0);
  return {
    eqpType: rateEquipmentLabel(eqpCode),
    eqpQuantity: modeOf(boxes.map(c => num(c.quantity) || 1)) ?? 1,
    commodity: modeOf(lines.map(l => str(l.descr)).filter(Boolean)) ?? FAK_COMMODITY.name,
    cargoWeightKg: weights.length ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : 18_000,
  };
}

/**
 * Lifecycle by age: enquiries from the last day await review; within the first week most are quoted and
 * some already accepted (spread deterministically by the search id); after the validity lapsed they are
 * accepted or expired. Lanes without a published tariff cannot be priced, so they stay pending until the
 * validity passes.
 */
export function quoteStatusFor(ageDays: number, seed: string, validityPassed: boolean, priced = true): QuoteDTO['status'] {
  if (!priced) return validityPassed ? 'EXPIRED' : 'PENDING_REVIEW';
  if (ageDays <= 1) return 'PENDING_REVIEW';
  if (validityPassed) return stableHash(seed) % 3 === 0 ? 'ACCEPTED' : 'EXPIRED';
  const slot = stableHash(seed) % 4;
  return slot === 0 ? 'PENDING_REVIEW' : slot === 3 ? 'ACCEPTED' : 'QUOTED';
}

/**
 * Quotes from the customer's route searches: the newest search of every lane first, then earlier
 * searches of the same lanes on other days, newest first, at most `limit`.
 */
export function quotesFromRows(src: QuoteSources, now = new Date(), limit = 20): QuoteDTO[] {
  const own = src.searches
    .filter(s => eq(s.custcode, src.customerCode) && str(s.originport) && str(s.destport) && !Number.isNaN(time(s.crDate)))
    .sort((a, b) => time(b.crDate) - time(a.crDate));
  const laneOf = (s: Row) => `${str(s.originport).toUpperCase()}|${str(s.destport).toUpperCase()}`;
  const dayOf = (s: Row) => `${laneOf(s)}|${toDateOnly(new Date(time(s.crDate)))}`;
  const seenLane = new Set<string>();
  const seenDay = new Set<string>();
  const newestPerLane = own.filter(s => { const k = laneOf(s); if (seenLane.has(k)) return false; seenLane.add(k); seenDay.add(dayOf(s)); return true; });
  const earlierDays = own.filter(s => { const k = dayOf(s); if (seenDay.has(k)) return false; seenDay.add(k); return true; });
  const out: QuoteDTO[] = [];
  for (const s of [...newestPerLane, ...earlierDays]) {
    const pol = str(s.originport).toUpperCase();
    const pod = str(s.destport).toUpperCase();
    const created = new Date(time(s.crDate));
    const profile = laneBookingProfile(src.bookings, src.cargo, src.commodities, pol, pod);
    const usd = usdTariffs(src.tariffs);
    const tariff = bestTariffRow(usd, pol, pod, profile.eqpType, +created) ?? bestTariffRow(usd, pol, pod, profile.eqpType, +now);
    const tariffUsd = tariff ? num(tariff.localamount) : 0;
    const validTo = new Date(+created + QUOTE_VALIDITY_DAYS * DAY);
    const status = quoteStatusFor((+now - +created) / DAY, str(s.id), +validTo < +now, tariffUsd > 0);
    out.push({
      id: `qte-log-${str(s.id)}`,
      quoteNo: `QTE${String(created.getFullYear()).slice(-2)}${str(s.id).padStart(4, '0')}`,
      customerName: src.customer,
      originPort: pol,
      originPortName: portName(pol),
      deliveryPort: pod,
      deliveryPortName: portName(pod),
      eqpType: profile.eqpType,
      eqpQuantity: profile.eqpQuantity,
      commodity: profile.commodity,
      cargoWeightKg: profile.cargoWeightKg,
      quotedAmountUsd: status === 'PENDING_REVIEW' ? 0 : tariffUsd,
      status,
      validFrom: toDateOnly(created),
      validTo: toDateOnly(validTo),
      createdAt: toDateTimeMinute(created),
      comments: `Rate enquiry raised from the route search on ${toDateOnly(created)}`,
    });
    if (out.length >= limit) break;
  }
  return out;
}

const seededQuotes = new WeakMap<Row[], QuoteDTO[]>();
/** Quotes derived from the fixtures (cached per store generation, so resetDb() rebuilds them). */
export function fixtureQuotes(now = new Date()): QuoteDTO[] {
  const searches = db.ecomRouteSearchLog ?? [];
  let seeded = seededQuotes.get(searches);
  if (!seeded) {
    const code = currentCustomerCode();
    seeded = quotesFromRows(
      { searches, tariffs: db.tariffs, bookings: db.bookings, cargo: db.bookingCargo, commodities: db.bookingCommodity, customerCode: code, customer: customerName(code) },
      now,
    );
    seededQuotes.set(searches, seeded);
  }
  return seeded;
}

/** Session requests first, then the fixture-derived enquiries. */
export const listQuotes = (): QuoteDTO[] => [...sessionQuotes, ...fixtureQuotes()];

/** Snapshot of session-created quotes (for runtime overlay). */
export const getSessionQuotes = (): QuoteDTO[] =>
  JSON.parse(JSON.stringify(sessionQuotes)) as QuoteDTO[];

export const resetQuotes = () => { sessionQuotes.length = 0; };

/** Replace session quotes (rehydrate / tests). Clears then pushes. */
export function replaceSessionQuotes(next: QuoteDTO[] | null | undefined) {
  sessionQuotes.length = 0;
  if (!next?.length) return;
  sessionQuotes.push(...(JSON.parse(JSON.stringify(next)) as QuoteDTO[]));
}

/** Builds the PENDING_REVIEW quote: amount = the customer's expectation, else the lane's best USD tariff. */
export function buildQuote(input: CreateQuoteInput, tariffs: Row[], customer: string, now = new Date()): QuoteDTO {
  const origin = extractPortCode(input.originPort);
  const delivery = extractPortCode(input.deliveryPort);
  const tariff = bestTariffRow(usdTariffs(tariffs), origin, delivery, input.eqpType, +now);
  const tariffUsd = tariff ? num(tariff.localamount) : undefined;
  const validTo = new Date(+now + QUOTE_VALIDITY_DAYS * 86_400_000);
  const quoteNo = nextRef('QTE');
  return {
    id: `qte-${quoteNo}`,
    quoteNo,
    customerName: customer,
    originPort: origin,
    originPortName: portName(origin),
    deliveryPort: delivery,
    deliveryPortName: portName(delivery),
    eqpType: input.eqpType,
    eqpQuantity: input.eqpQuantity,
    commodity: input.commodity,
    cargoWeightKg: input.cargoWeightKg,
    quotedAmountUsd: input.expectedAmountUsd || tariffUsd || 0,
    status: 'PENDING_REVIEW',
    validFrom: toDateOnly(now),
    validTo: toDateOnly(validTo),
    createdAt: toDateTimeMinute(now),
    comments: input.comments,
  };
}

export function createQuote(input: CreateQuoteInput): QuoteDTO {
  const quote = buildQuote(input, db.tariffs, customerName(currentCustomerCode()));
  sessionQuotes.unshift(quote);
  return quote;
}
