// Modified by Sekar Nagarajan (2026-10-17 00:30)
/**
 * Sailing schedules, vessel particulars and port-call sequences computed from the VSS fixtures
 * (`schedules` = VSS.allschedules_ecom, `portCalls` = VSS.arrival_master, `vessels`, `services`,
 * `terminals`, `ports`) plus Commercial.Routedetail (`routes`) and ecom_cutoffconfig (`cutoffConfig`).
 *
 * Model (mirrors EcomScheduleBean.getScheduleByPortPair):
 * - `schedules` holds one row per PORT CALL. A voyage is vessel + voyage code; the extract repeats the
 *   same call under every bound (E/W/N/S share one groupcallid), so calls are de-duplicated by
 *   port + arrival + departure and the first bound wins.
 * - A sailing POL→POD is a pair of calls of the same voyage where the POD arrival is after the POL
 *   departure. A transhipment itinerary joins a POL→X leg with a later X→POD leg of another voyage
 *   (one transhipment, X ≠ POL/POD). Hubs listed in `routes` (OpsPol1) for the lane are preferred.
 * - Cut-offs come from `cutoffConfig` (port + terminal → port + 'All' → 'All'/'All' → 48 h) as hours
 *   before ETD; `excludeweekend = 'Y'` moves a weekend deadline to the previous Friday.
 * - Clock: the VSS extract carries the booking anchor's date shift, so its window (about five weeks)
 *   can end before "today". When it does not cover [now, now + 14 d] the whole window is moved by a
 *   whole number of weeks (weekdays preserved) so that it starts WINDOW_LEAD_DAYS before `now`.
 *
 * Everything is a pure function of the tables and an injectable `now`; names resolve through
 * masters.bridge so unknown codes fall back to the code itself.
 */
import type {
  CutOffDeadlines,
  RouteLeg,
  ScheduleItem,
  ScheduleSearchParams,
  VesselParticulars,
} from '../../../features/schedules/types/schedules.types';
import { db, eq, type Row } from '../db';
import { daysBetween, extractPortCode, str, toDateTimeMinute } from './booking-shared.bridge';
import {
  countryName,
  portCoordinates,
  portName,
  serviceName,
  terminalName,
  vesselName,
  vesselRow,
} from './masters.bridge';

// ─── options ─────────────────────────────────────────────────────────────────
export interface ScheduleTables {
  schedules: Row[];
  portCalls: Row[];
  routes: Row[];
  cutoffConfig: Row[];
  bookingLeg: Row[];
}

export interface ScheduleOptions {
  now?: Date;
  tables?: Partial<ScheduleTables>;
}

function tablesOf(t?: Partial<ScheduleTables>): ScheduleTables {
  return {
    schedules: t?.schedules ?? db.schedules,
    portCalls: t?.portCalls ?? db.portCalls,
    routes: t?.routes ?? db.routes,
    cutoffConfig: t?.cutoffConfig ?? db.cutoffConfig,
    bookingLeg: t?.bookingLeg ?? db.bookingLeg,
  };
}

// ─── constants ───────────────────────────────────────────────────────────────
const DAY = 86_400_000;
const HOUR = 3_600_000;
const WEEK = 7 * DAY;
/** Days before `now` at which the aligned fixture window starts. */
export const WINDOW_LEAD_DAYS = 10;
/** The window must reach this far past `now` to be used without alignment (landing searches today + 14 d). */
const WINDOW_MIN_REACH_DAYS = 14;
/** Longest wait at the transhipment hub that still counts as a connection. */
const MAX_CONNECTION_DAYS = 14;
/** Fallback when no cut-off configuration row applies. */
const DEFAULT_CUTOFF_HOURS = 48;
/** arrival_master rows without a scheduled call are shown only this close to `now`. */
const ACTUALS_LOOKBACK_DAYS = 90;
const ACTUALS_LOOKAHEAD_DAYS = 180;

const LEG_TYPE: Record<string, RouteLeg['legType']> = { M: 'Mainline', F: 'Feeder' };
/** Routedetail orgMode / DelMode → label shown on an inland leg. */
const INLAND_MODE: Record<string, string> = { T: 'Truck', R: 'Rail', B: 'Barge', M: 'Multimodal', C: 'Coastal' };

const up = (v: unknown) => str(v).toUpperCase();
const ts = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const t = +new Date(v as string);
  return Number.isFinite(t) ? t : null;
};
const fmt = (ms: number) => toDateTimeMinute(new Date(ms).toISOString());
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const compact = (ms: number) => fmt(ms).replace(/[^0-9]/g, '');

// ─── clock alignment ─────────────────────────────────────────────────────────
/** Milliseconds to add to every VSS timestamp so the fixture window is usable from `now` (whole weeks). */
export function clockOffsetMs(schedules: Row[], now: Date): number {
  let earliest = Infinity;
  let latest = -Infinity;
  for (const r of schedules) {
    const a = ts(r.arrdate);
    const d = ts(r.depdate) ?? a;
    if (a != null && a < earliest) earliest = a;
    if (d != null && d > latest) latest = d;
  }
  if (!Number.isFinite(earliest) || !Number.isFinite(latest)) return 0;
  const today = startOfDay(now);
  if (earliest <= today && latest >= today + WINDOW_MIN_REACH_DAYS * DAY) return 0;
  return Math.round((today - WINDOW_LEAD_DAYS * DAY - earliest) / WEEK) * WEEK;
}

// ─── calls, voyages and legs ─────────────────────────────────────────────────
export interface Call {
  vessel: string;
  voyage: string;
  bound: string;
  service: string;
  port: string;
  terminal: string;
  order: number;
  arr: number;
  dep: number;
  type: string;
  callId: string;
}

/** One sailing leg: two calls of the same voyage, POD arrival after POL departure. */
export interface Leg {
  key: string;
  pol: Call;
  pod: Call;
}

const voyageKey = (c: { vessel: string; voyage: string }) => `${c.vessel}|${c.voyage}`;

/** Calls grouped by vessel + voyage, de-duplicated across bounds and sorted by arrival. */
export function buildVoyages(schedules: Row[], offsetMs: number): Map<string, Call[]> {
  const voyages = new Map<string, Call[]>();
  const seen = new Set<string>();
  for (const r of schedules) {
    const arr = ts(r.arrdate);
    const dep = ts(r.depdate) ?? arr;
    if (arr == null || dep == null) continue;
    const call: Call = {
      vessel: up(r.vessel),
      voyage: up(r.voyage),
      bound: up(r.bound),
      service: up(r.service),
      port: up(r.port),
      terminal: str(r.terminal),
      order: Number(r.callorder ?? 0),
      arr: arr + offsetMs,
      dep: dep + offsetMs,
      type: up(r.type) || 'M',
      callId: str(r.groupcallid),
    };
    if (!call.vessel || !call.port) continue;
    const key = voyageKey(call);
    const dup = `${key}|${call.port}|${call.arr}|${call.dep}`;
    if (seen.has(dup)) continue;
    seen.add(dup);
    if (!voyages.has(key)) voyages.set(key, []);
    voyages.get(key)!.push(call);
  }
  for (const calls of voyages.values()) calls.sort((a, b) => a.arr - b.arr || a.order - b.order);
  return voyages;
}

const legOf = (pol: Call, pod: Call): Leg => ({ key: voyageKey(pol), pol, pod });

/** Every POL→POD pair of a voyage (first later call at each destination port after a given call). */
export function voyageLegs(calls: Call[]): Leg[] {
  const legs: Leg[] = [];
  for (let i = 0; i < calls.length; i++) {
    const reached = new Set<string>();
    for (let j = i + 1; j < calls.length; j++) {
      const pod = calls[j];
      if (pod.port === calls[i].port || reached.has(pod.port) || pod.arr <= calls[i].dep) continue;
      reached.add(pod.port);
      legs.push(legOf(calls[i], pod));
    }
  }
  return legs;
}

/** The next call of a voyage at a different port, when it exists. */
function nextCall(calls: Call[], i: number): Call | undefined {
  for (let j = i + 1; j < calls.length; j++) {
    if (calls[j].port !== calls[i].port && calls[j].arr > calls[i].dep) return calls[j];
  }
  return undefined;
}

function previousCall(calls: Call[], i: number): Call | undefined {
  for (let j = i - 1; j >= 0; j--) {
    if (calls[j].port !== calls[i].port && calls[i].arr > calls[j].dep) return calls[j];
  }
  return undefined;
}

// ─── cut-offs ────────────────────────────────────────────────────────────────
/** ecom_cutoffconfig row for a port call: port + terminal, then port + 'All', then 'All' + 'All'. */
export function cutoffFor(cutoffs: Row[], port: string, terminal: string): Row | undefined {
  const isAll = (v: unknown) => eq(v, 'All');
  return (
    cutoffs.find(c => eq(c.port, port) && eq(c.terminal, terminal)) ??
    cutoffs.find(c => eq(c.port, port) && isAll(c.terminal)) ??
    cutoffs.find(c => isAll(c.port) && isAll(c.terminal))
  );
}

/** Saturday → Friday, Sunday → Friday (same time of day); weekdays unchanged. */
export function previousWorkingDay(ms: number): number {
  const day = new Date(ms).getDay();
  if (day === 6) return ms - DAY;
  if (day === 0) return ms - 2 * DAY;
  return ms;
}

function hoursOf(row: Row | undefined, column: string): number {
  const h = Number(row?.[column]);
  return Number.isFinite(h) && h > 0 ? h : DEFAULT_CUTOFF_HOURS;
}

/** Deadlines as hours before ETD; weekend deadlines move to the previous Friday when the row says so. */
export function buildDeadlines(cutoff: Row | undefined, etdMs: number): CutOffDeadlines & { earliest: number } {
  const weekend = eq(cutoff?.excludeweekend, 'Y');
  const at = (column: string) => {
    const raw = etdMs - hoursOf(cutoff, column) * HOUR;
    return weekend ? previousWorkingDay(raw) : raw;
  };
  const gateIn = at('fullcntrclosing');
  const doc = at('docclosing');
  const vgm = at('vgmclosing');
  return {
    containerGateIn: fmt(gateIn),
    siDocClosing: fmt(doc),
    vgmClosing: fmt(vgm),
    earliest: Math.min(gateIn, doc, vgm),
  };
}

// ─── distance ────────────────────────────────────────────────────────────────
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function portDistanceKm(pol: string, pod: string): number {
  const a = portCoordinates(pol);
  const b = portCoordinates(pod);
  return a && b ? haversineKm(a, b) : 0;
}

// ─── items ───────────────────────────────────────────────────────────────────
interface InlandHaul {
  code: string;
  mode: string;
}

interface Itinerary {
  legs: Leg[];
  preCarriage?: InlandHaul;
  onCarriage?: InlandHaul;
  /** Timestamp the date filter applies to when it is not the itinerary's ETD/ETA (port schedule). */
  filterAt?: { dep: number; arr: number };
}

interface BuildContext {
  now: Date;
  cutoffs: Row[];
}

function legId(leg: Leg): string {
  return `${leg.pol.vessel}.${leg.pol.voyage}.${leg.pol.port}.${compact(leg.pol.dep)}.${leg.pod.port}`;
}

function toRouteLeg(leg: Leg, index: number, itineraryId: string): RouteLeg {
  return {
    id: `LEG-${itineraryId}-${index + 1}`,
    legType: LEG_TYPE[leg.pol.type] ?? 'Mainline',
    vesselName: vesselName(leg.pol.vessel),
    vesselCode: leg.pol.vessel,
    voyage: leg.pol.voyage,
    bound: leg.pol.bound,
    serviceName: serviceName(leg.pol.service),
    serviceCode: leg.pol.service,
    polPortId: leg.pol.port,
    polPortName: portName(leg.pol.port),
    podPortId: leg.pod.port,
    podPortName: portName(leg.pod.port),
    etd: fmt(leg.pol.dep),
    eta: fmt(leg.pod.arr),
    terminal: terminalName(leg.pol.terminal),
  };
}

/** Inland pre-/on-carriage leg from Routedetail. TODO(fixtures): no DB source for inland timings — both ends sit on the sea leg's date. */
function inlandLeg(haul: InlandHaul, from: string, to: string, atMs: number, index: number, itineraryId: string): RouteLeg {
  return {
    id: `LEG-${itineraryId}-${index + 1}`,
    legType: 'Inland',
    vesselName: INLAND_MODE[haul.mode] ?? 'Inland haulage',
    vesselCode: '',
    voyage: '',
    bound: '',
    serviceName: '',
    serviceCode: '',
    polPortId: from,
    polPortName: portName(from),
    podPortId: to,
    podPortName: portName(to),
    etd: fmt(atMs),
    eta: fmt(atMs),
  };
}

export interface BuiltItem {
  item: ScheduleItem;
  filterDep: number;
  filterArr: number;
}

function buildItem(it: Itinerary, ctx: BuildContext): BuiltItem {
  const first = it.legs[0];
  const last = it.legs[it.legs.length - 1];
  const main = it.legs.find(l => l.pol.type === 'M') ?? first;
  const id = it.legs.map(legId).join('_');
  const routeLegs: RouteLeg[] = [];
  if (it.preCarriage) routeLegs.push(inlandLeg(it.preCarriage, it.preCarriage.code, first.pol.port, first.pol.dep, routeLegs.length, id));
  for (const leg of it.legs) routeLegs.push(toRouteLeg(leg, routeLegs.length, id));
  if (it.onCarriage) routeLegs.push(inlandLeg(it.onCarriage, last.pod.port, it.onCarriage.code, last.pod.arr, routeLegs.length, id));

  const deadlines = buildDeadlines(cutoffFor(ctx.cutoffs, first.pol.port, first.pol.terminal), first.pol.dep);
  const nowMs = ctx.now.getTime();
  const distanceKm = Math.round(it.legs.reduce((sum, l) => sum + portDistanceKm(l.pol.port, l.pod.port), 0));
  const polPortId = it.preCarriage?.code ?? first.pol.port;
  const podPortId = it.onCarriage?.code ?? last.pod.port;

  const item: ScheduleItem = {
    id,
    serviceCode: main.pol.service,
    serviceName: serviceName(main.pol.service),
    isDefaultRoute: false,
    polPortId,
    polPortName: portName(polPortId),
    podPortId,
    podPortName: portName(podPortId),
    polTerminal: terminalName(first.pol.terminal),
    podTerminal: terminalName(last.pod.terminal),
    etd: fmt(first.pol.dep),
    eta: fmt(last.pod.arr),
    transitTimeDays: daysBetween(new Date(first.pol.dep).toISOString(), new Date(last.pod.arr).toISOString()),
    isDirect: it.legs.length === 1,
    transshipmentCount: Math.max(0, it.legs.length - 1),
    isMultimodal: Boolean(it.preCarriage || it.onCarriage),
    vesselName: vesselName(main.pol.vessel),
    vesselCode: main.pol.vessel,
    voyage: main.pol.voyage,
    bound: main.pol.bound,
    deadlines: {
      containerGateIn: deadlines.containerGateIn,
      siDocClosing: deadlines.siDocClosing,
      vgmClosing: deadlines.vgmClosing,
    },
    legs: routeLegs,
    distanceKm,
    bookingAllowed: first.pol.dep > nowMs && nowMs < deadlines.earliest,
  };
  return { item, filterDep: it.filterAt?.dep ?? first.pol.dep, filterArr: it.filterAt?.arr ?? last.pod.arr };
}

// ─── date window ─────────────────────────────────────────────────────────────
function inWindow(built: BuiltItem, params: ScheduleSearchParams): boolean {
  const from = params.fromDate ? ts(`${params.fromDate}T00:00:00`) : null;
  const to = params.toDate ? ts(`${params.toDate}T23:59:59.999`) : null;
  const at = params.dateType === 'ARRIVAL' ? built.filterArr : built.filterDep;
  if (from != null && at < from) return false;
  if (to != null && at > to) return false;
  return true;
}

const byEtd = (a: BuiltItem, b: BuiltItem) => a.filterDep - b.filterDep || a.item.id.localeCompare(b.item.id);

function finish(built: BuiltItem[], params: ScheduleSearchParams): ScheduleItem[] {
  return built.filter(b => inWindow(b, params)).sort(byEtd).map(b => b.item);
}

// ─── point to point ──────────────────────────────────────────────────────────
interface SeaEnd {
  port: string;
  inland?: InlandHaul;
}

/** A searched code that never appears as a port call is an inland origin/delivery of Routedetail → its sea port. */
function resolveSeaEnd(code: string, side: 'origin' | 'delivery', voyages: Map<string, Call[]>, routes: Row[]): SeaEnd {
  if (!code) return { port: code };
  for (const calls of voyages.values()) if (calls.some(c => c.port === code)) return { port: code };
  const counts = new Map<string, { n: number; mode: string }>();
  for (const r of routes) {
    if (!eq(r[side], code)) continue;
    const sea = up(side === 'origin' ? r.BLPOL : r.BlPod);
    const mode = up(side === 'origin' ? r.orgMode : r.DelMode);
    if (!sea || sea === code) continue;
    const cur = counts.get(sea) ?? { n: 0, mode };
    cur.n += 1;
    if (!cur.mode && mode) cur.mode = mode;
    counts.set(sea, cur);
  }
  const best = [...counts.entries()].sort((a, b) => b[1].n - a[1].n)[0];
  return best ? { port: best[0], inland: { code, mode: best[1].mode } } : { port: code };
}

/** Routedetail rows for the sea lane (BLPOL → BlPod). */
export function laneRoutes(routes: Row[], pol: string, pod: string): Row[] {
  return routes.filter(r => eq(r.BLPOL, pol) && eq(r.BlPod, pod));
}

/** Direct sailings plus one-transhipment combinations, hubs from Routedetail preferred. */
export function pointToPointItineraries(voyages: Map<string, Call[]>, pol: string, pod: string, routes: Row[]): Leg[][] {
  const fromPol: Leg[] = [];
  const toPod: Leg[] = [];
  const direct: Leg[] = [];
  for (const calls of voyages.values()) {
    for (const leg of voyageLegs(calls)) {
      if (leg.pol.port === pol && leg.pod.port === pod) direct.push(leg);
      else if (leg.pol.port === pol) fromPol.push(leg);
      else if (leg.pod.port === pod) toPod.push(leg);
    }
  }
  const out: Leg[][] = direct.map(l => [l]);

  const routeHubs = new Set(laneRoutes(routes, pol, pod).map(r => up(r.OpsPol1)).filter(Boolean));
  const combine = (hubFilter: (hub: string) => boolean): Leg[][] => {
    const combos: Leg[][] = [];
    for (const first of fromPol) {
      const hub = first.pod.port;
      if (!hubFilter(hub)) continue;
      let best: Leg | undefined;
      for (const second of toPod) {
        if (second.pol.port !== hub || second.key === first.key) continue;
        const wait = second.pol.dep - first.pod.arr;
        if (wait <= 0 || wait > MAX_CONNECTION_DAYS * DAY) continue;
        if (!best || second.pol.dep < best.pol.dep) best = second;
      }
      if (best) combos.push([first, best]);
    }
    return combos;
  };
  const viaRoutes = routeHubs.size ? combine(h => routeHubs.has(h)) : [];
  out.push(...(viaRoutes.length ? viaRoutes : combine(() => true)));
  return out;
}

/** Flags exactly one recommended itinerary: priority route match → default-route service match → earliest direct → earliest. */
export function markDefaultRoute(items: ScheduleItem[], lane: Row[]): ScheduleItem[] {
  if (items.length === 0) return items;
  const matches = (r: Row, item: ScheduleItem) => {
    const sea = item.legs.filter(l => l.legType !== 'Inland');
    const hub = up(r.OpsPol1);
    if (!eq(r.BLPOLSvc, sea[0]?.serviceCode)) return false;
    if (!hub) return sea.length === 1;
    return sea.length === 2 && sea[0].podPortId === hub;
  };
  const sorted = [...items].sort((a, b) => a.etd.localeCompare(b.etd));
  const pick =
    sorted.find(i => lane.some(r => eq(r.priority1, 'Y') && matches(r, i))) ??
    sorted.find(i => i.isDirect && lane.some(r => eq(r.DefRoute, 'Y') && matches(r, i))) ??
    sorted.find(i => i.isDirect) ??
    sorted[0];
  return items.map((i): ScheduleItem => (i === pick ? { ...i, isDefaultRoute: true } : i));
}

// ─── booking-leg fallback ────────────────────────────────────────────────────
/**
 * Itineraries of the sampled bookings (ecombooking_leg grouped by ebookno) whose first load port and
 * last discharge port match the lane — keeps the demo lanes answering when the VSS sample has no call.
 */
function bookingLegItineraries(legs: Row[], pol: string, pod: string): Leg[][] {
  const byBooking = new Map<string, Row[]>();
  for (const l of legs) {
    const k = str(l.ebookno);
    if (!byBooking.has(k)) byBooking.set(k, []);
    byBooking.get(k)!.push(l);
  }
  const out: Leg[][] = [];
  const seen = new Set<string>();
  for (const rows of byBooking.values()) {
    const sorted = [...rows].sort((a, b) => Number(a.leg_no ?? 0) - Number(b.leg_no ?? 0));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (up(first.loadPortId) !== pol || up(last.dischargePortId) !== pod) continue;
    const itinerary: Leg[] = [];
    for (const l of sorted) {
      const dep = ts(l.etdDate);
      const arr = ts(l.etaDate);
      if (dep == null || arr == null) break;
      const base = {
        vessel: up(l.vesselCode) || 'TBN',
        voyage: up(l.voyageCode),
        bound: up(l.bound) || up(l.dbound),
        service: up(l.serviceCode),
        type: up(l.legTypeId) === 'F' ? 'F' : 'M',
        callId: str(l.callIdLoading),
      };
      itinerary.push(
        legOf(
          { ...base, port: up(l.loadPortId), terminal: str(l.loadTerminal ?? l.polTerminal), order: 1, arr: dep, dep },
          { ...base, port: up(l.dischargePortId), terminal: str(l.dischargeTerminal ?? l.podTerminal), order: 2, arr, dep: arr, callId: str(l.callIdDischarge) },
        ),
      );
    }
    if (itinerary.length !== sorted.length) continue;
    const sig = itinerary.map(legId).join('_');
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(itinerary);
  }
  return out;
}

// ─── search ──────────────────────────────────────────────────────────────────
function searchPointToPoint(params: ScheduleSearchParams, voyages: Map<string, Call[]>, t: ScheduleTables, ctx: BuildContext): ScheduleItem[] {
  const polCode = extractPortCode(params.polCode ?? '');
  const podCode = extractPortCode(params.podCode ?? '');
  const origin = resolveSeaEnd(polCode, 'origin', voyages, t.routes);
  const delivery = resolveSeaEnd(podCode, 'delivery', voyages, t.routes);
  let legSets = pointToPointItineraries(voyages, origin.port, delivery.port, t.routes);
  if (legSets.length === 0) legSets = bookingLegItineraries(t.bookingLeg, origin.port, delivery.port);
  const built = legSets.map(legs => buildItem({ legs, preCarriage: origin.inland, onCarriage: delivery.inland }, ctx));
  return markDefaultRoute(finish(built, params), laneRoutes(t.routes, origin.port, delivery.port));
}

/** Vessel codes matching a code or a (partial) vessel name. */
export function matchVesselCodes(query: string, voyages: Map<string, Call[]>): Set<string> {
  const q = up(query);
  const codes = new Set<string>();
  if (!q) return codes;
  for (const v of db.vessels ?? []) {
    const code = up(v.VesselCode);
    if (code === q || up(v.VesselName).includes(q)) codes.add(code);
  }
  for (const calls of voyages.values()) if (calls[0].vessel === q) codes.add(q);
  // partial code match only when nothing matched exactly
  if (codes.size === 0) for (const calls of voyages.values()) if (calls[0].vessel.includes(q)) codes.add(calls[0].vessel);
  return codes;
}

function searchVessel(params: ScheduleSearchParams, voyages: Map<string, Call[]>, ctx: BuildContext): ScheduleItem[] {
  const codes = matchVesselCodes(params.vesselCode ?? '', voyages);
  const built: BuiltItem[] = [];
  for (const calls of voyages.values()) {
    if (!codes.has(calls[0].vessel)) continue;
    for (let i = 0; i < calls.length; i++) {
      const next = nextCall(calls, i);
      if (next) built.push(buildItem({ legs: [legOf(calls[i], next)] }, ctx));
    }
  }
  return finish(built, params);
}

function searchPort(params: ScheduleSearchParams, voyages: Map<string, Call[]>, ctx: BuildContext): ScheduleItem[] {
  const port = extractPortCode(params.portCode ?? '');
  const built: BuiltItem[] = [];
  for (const calls of voyages.values()) {
    for (let i = 0; i < calls.length; i++) {
      const call = calls[i];
      if (call.port !== port) continue;
      const filterAt = { dep: call.dep, arr: call.arr };
      const next = nextCall(calls, i);
      const prev = previousCall(calls, i);
      // The call itself is the row: onward sailing when known, else the arriving sailing, else the bare call.
      const leg = next ? legOf(call, next) : prev ? legOf(prev, call) : legOf(call, { ...call, arr: call.dep });
      built.push(buildItem({ legs: [leg], filterAt }, ctx));
    }
  }
  return finish(built, params);
}

/** Schedule search over the fixtures (POINT_TO_POINT, VESSEL_SCHEDULE, PORT_SCHEDULE). */
export function searchSchedules(params: ScheduleSearchParams, options: ScheduleOptions = {}): ScheduleItem[] {
  const now = options.now ?? new Date();
  const t = tablesOf(options.tables);
  const voyages = buildVoyages(t.schedules, clockOffsetMs(t.schedules, now));
  const ctx: BuildContext = { now, cutoffs: t.cutoffConfig };
  if (params.searchType === 'VESSEL_SCHEDULE') return searchVessel(params, voyages, ctx);
  if (params.searchType === 'PORT_SCHEDULE') return searchPort(params, voyages, ctx);
  return searchPointToPoint(params, voyages, t, ctx);
}

// ─── vessel particulars ──────────────────────────────────────────────────────
type PortCallStatus = NonNullable<VesselParticulars['portCalls']>[number]['status'];
type VesselPortCall = NonNullable<VesselParticulars['portCalls']>[number];

function unit(value: unknown, suffix: string): string {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `${n.toLocaleString('en-US')} ${suffix}` : '';
}

/** arrival_master actuals: departed → COMPLETED, end of sea passage reached → IN_PORT, else EXPECTED. */
function statusFromActuals(actual: Row, offsetMs: number, nowMs: number): PortCallStatus {
  const departed = ts(actual.pulloutfromberth) ?? ts(actual.etd);
  if (departed != null && departed + offsetMs <= nowMs) return 'COMPLETED';
  const arrived = ts(actual.eosp) ?? ts(actual.pob);
  if (arrived != null && arrived + offsetMs <= nowMs) return 'IN_PORT';
  return 'EXPECTED';
}

function statusFromSchedule(call: Call, nowMs: number): PortCallStatus {
  if (call.dep <= nowMs) return 'COMPLETED';
  if (call.arr <= nowMs) return 'IN_PORT';
  return 'EXPECTED';
}

/** Port-call sequence: scheduled calls of the vessel, statuses from arrival_master actuals when a matching row exists. */
export function vesselPortCalls(code: string, t: ScheduleTables, now: Date): VesselPortCall[] {
  const offsetMs = clockOffsetMs(t.schedules, now);
  const nowMs = now.getTime();
  const voyages = buildVoyages(t.schedules, offsetMs);
  const actuals = t.portCalls.filter(p => eq(p.vesselcode, code));
  const used = new Set<Row>();
  const rows: { at: number; call: VesselPortCall }[] = [];
  for (const calls of voyages.values()) {
    if (calls[0].vessel !== code) continue;
    for (const c of calls) {
      const actual = actuals.find(p => !used.has(p) && eq(p.voyage, c.voyage) && eq(p.portcode, c.port));
      if (actual) used.add(actual);
      rows.push({
        at: c.arr,
        call: {
          portCode: c.port,
          portName: portName(c.port),
          terminal: terminalName(c.terminal),
          eta: fmt(c.arr),
          etd: fmt(c.dep),
          status: actual ? statusFromActuals(actual, offsetMs, nowMs) : statusFromSchedule(c, nowMs),
        },
      });
    }
  }
  // Actual calls with no scheduled counterpart (other voyages of the vessel) — only those near the current
  // window; arrival_master also holds stale test rows (1900-… / years-old timings) that would lead the list.
  for (const actual of actuals) {
    if (used.has(actual)) continue;
    const eta = ts(actual.eosp) ?? ts(actual.pob) ?? ts(actual.allfastfwe);
    const etd = ts(actual.pulloutfromberth) ?? ts(actual.etd);
    if (eta == null && etd == null) continue;
    const atMs = (eta ?? etd ?? 0) + offsetMs;
    if (atMs < nowMs - ACTUALS_LOOKBACK_DAYS * DAY || atMs > nowMs + ACTUALS_LOOKAHEAD_DAYS * DAY) continue;
    const port = up(actual.portcode);
    rows.push({
      at: atMs,
      call: {
        portCode: port,
        portName: portName(port),
        terminal: '',
        eta: eta != null ? fmt(eta + offsetMs) : '',
        etd: etd != null ? fmt(etd + offsetMs) : '',
        status: statusFromActuals(actual, offsetMs, nowMs),
      },
    });
  }
  return rows.sort((a, b) => a.at - b.at).map(r => r.call);
}

/**
 * Vessel select options for the Schedules "By Vessel" tab.
 * Built from codes that appear in sailing schedules, labelled with the vessel master name
 * (`CODE - NAME`). Falls back to the bare code when the master has no row.
 */
export function listVesselSelectOptions(limit = 40): { value: string; label: string }[] {
  const counts = new Map<string, number>();
  for (const row of db.schedules ?? []) {
    const code = up(row.vessel);
    if (!code) continue;
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([code]) => {
      const name = vesselName(code);
      const label = name && name !== code ? `${code} - ${name}` : code;
      return { value: code, label };
    });
}

/** Vessel particulars from the vessel master plus the port-call sequence; null when the code is unknown everywhere. */
export function getVesselDetails(vesselCode: string, options: ScheduleOptions = {}): VesselParticulars | null {
  const code = up(vesselCode);
  if (!code) return null;
  const now = options.now ?? new Date();
  const t = tablesOf(options.tables);
  const row = vesselRow(code);
  const portCalls = vesselPortCalls(code, t, now);
  if (!row && portCalls.length === 0) return null;
  return {
    vesselName: str(row?.VesselName) || vesselName(code),
    vesselCode: code,
    callSign: str(row?.CallSign),
    // TODO(fixtures): no DB source — the vessel master carries no operator column.
    vesselOperator: '',
    vesselOwner: str(row?.VesselOwner),
    vesselType: str(row?.VesselType),
    flag: row?.Flag ? countryName(row.Flag) : '',
    portOfRegistry: row?.PortOfRegistry ? portName(row.PortOfRegistry) : '',
    builtYear: str(row?.BuiltYear),
    imoNumber: str(row?.ImoNumber),
    lengthOverall: unit(row?.LengthOverall, 'm'),
    teuNominal: unit(row?.TeuNominal, 'TEU'),
    grossTonnage: unit(row?.GrossTonnage, 'GT'),
    netTonnage: unit(row?.NetTonnage, 'NT'),
    portCalls,
  };
}
