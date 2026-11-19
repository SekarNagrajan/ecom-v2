// Modified by Sekar Nagarajan (2026-10-17 00:25)
/**
 * Container & cargo tracking (TrackingSearchResult) computed from the SQL-extracted fixtures:
 *
 *   lrpBookings / lrpBookingLegs / lrpBookingCargo   LRP booking header, routing legs (F feeder, M mainline,
 *                                                    R rail, T truck) and equipment of the sampled bookings
 *   lrpBl / lrpBlCargo                               B/L facts (OnboardDate, status, release) and B/L equipment
 *   containerMoves                                   LRP operationDetail — equipment released empty (mode M) or
 *                                                    received full (mode F) per booking
 *   bookings / bookingLeg / bookingCargo             e-commerce booking (ebookno BKON…, extBookNo = agency no)
 *   shippingInstructions / siCargo / vgm             B/L number ↔ booking, SI equipment, declared containers
 *   schedules / portCalls                            proforma call dates and actual timings (arrival_master)
 *   cutoffConfig                                     gate-in / doc / VGM closing hours before ETD
 *   ports / terminals / vessels (masters.bridge)     names, coordinates, vessel particulars
 *
 * Everything is derived against an injectable `now`: milestones dated in the past are achieved, future ones
 * are estimates ("Est. …" timestamps, isActual: false), and the vessel position is interpolated along the
 * great circle of the leg that is under way. The functions are pure over a TrackingTables bag so tests can
 * pass inline rows; the fixture-backed entry points default to `db`.
 */
import type {
  ContainerEquipment,
  ContainerMovementEvent,
  TrackingLiveAisPosition,
  TrackingMilestone,
  TrackingRouteMap,
  TrackingRouteMapPoint,
  TrackingSearchResult,
  TrackingSearchType,
} from '../../../features/tracking/types/tracking.types';
import { bearing, haversineNm, slerp } from '../../../features/tracking/utils/tracking-ais.utils';
import { db, eq, type Row } from '../db';
import { formatListDate } from './format';
import { equipmentRow, portCoordinates, portName, terminalName, vesselName, vesselRow } from './masters.bridge';

// ─── tables ──────────────────────────────────────────────────────────────────

/** The subset of tables the pure functions read, so tests can pass inline rows. */
export interface TrackingTables {
  bookings: Row[];
  bookingCargo: Row[];
  bookingLeg: Row[];
  shippingInstructions: Row[];
  siCargo: Row[];
  vgm: Row[];
  lrpBookings: Row[];
  lrpBookingLegs: Row[];
  lrpBookingCargo: Row[];
  lrpBl: Row[];
  lrpBlCargo: Row[];
  containerMoves: Row[];
  schedules: Row[];
  portCalls: Row[];
  cutoffConfig: Row[];
  trackingMovementCodes: Row[];
}

export function emptyTrackingTables(): TrackingTables {
  return {
    bookings: [], bookingCargo: [], bookingLeg: [], shippingInstructions: [], siCargo: [], vgm: [],
    lrpBookings: [], lrpBookingLegs: [], lrpBookingCargo: [], lrpBl: [], lrpBlCargo: [], containerMoves: [],
    schedules: [], portCalls: [], cutoffConfig: [], trackingMovementCodes: [],
  };
}

export const fixtureTrackingTables = (): TrackingTables => db;

// ─── small helpers ───────────────────────────────────────────────────────────

const text = (v: unknown): string => String(v ?? '').trim();
const upper = (v: unknown): string => text(v).toUpperCase();
const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const toDate = (v: unknown): Date | null => {
  if (v == null || v === '') return null;
  if (v instanceof Date) return Number.isNaN(+v) ? null : v;
  const d = new Date(v as string);
  return Number.isNaN(+d) ? null : d;
};
const earliest = (dates: (Date | null)[]): Date | null =>
  dates.filter((d): d is Date => d != null).sort((a, b) => +a - +b)[0] ?? null;
const latest = (dates: (Date | null)[]): Date | null =>
  dates.filter((d): d is Date => d != null).sort((a, b) => +b - +a)[0] ?? null;
const inAny = (value: unknown, list: string[]) => list.some(n => eq(value, n));
const HOUR = 3_600_000;

/** Terminal codes are often 'N' (none) or self-named placeholders; show the master name when it adds information. */
export function terminalLabel(code: unknown): string {
  const c = text(code);
  if (!c || c.toUpperCase() === 'N') return '';
  const name = terminalName(c);
  return name && name.toUpperCase() !== c.toUpperCase() ? name : c;
}

/** Equipment code as the masters spell it (DV20 → 20DC, RE40 → 40RE); the raw code when unknown. */
export function equipmentCode(code: unknown): string {
  const c = upper(code);
  return text(equipmentRow(c)?.Equiptype) || c;
}

// ─── reference resolution ────────────────────────────────────────────────────

export interface TrackingReference {
  searchType: TrackingSearchType;
  searchKey: string;
  /** Agency booking number first (lrp book_no / extBookNo), then the online ebookno. */
  bookingNos: string[];
  lrpBooking: Row | null;
  booking: Row | null;
  si: Row | null;
  lrpBl: Row | null;
  blNo: string;
  /** Set for container searches: only this unit is returned. */
  containerNo: string | null;
}

const newestSi = (rows: Row[]): Row | null =>
  [...rows].sort((a, b) => num(b.blversion) - num(a.blversion) || +new Date(b.ChgDate) - +new Date(a.ChgDate))[0] ?? null;

/** The current B/L of a booking: non-void first, then newest. */
const currentBl = (rows: Row[]): Row | null =>
  [...rows].sort((a, b) => Number(eq(a.status, 'V')) - Number(eq(b.status, 'V')) || +new Date(b.dateup ?? b.datecr) - +new Date(a.dateup ?? a.datecr))[0] ?? null;

function attachShipment(
  searchType: TrackingSearchType,
  searchKey: string,
  agencyNo: string | null,
  ebookno: string | null,
  t: TrackingTables,
  blNoHint: string | null = null,
  containerNo: string | null = null,
): TrackingReference {
  let booking = t.bookings.find(b => (agencyNo && eq(b.extBookNo, agencyNo)) || (ebookno && eq(b.ebookno, ebookno))) ?? null;
  agencyNo = agencyNo || text(booking?.extBookNo) || null;
  ebookno = ebookno || text(booking?.ebookno) || null;
  if (!booking && agencyNo) booking = t.bookings.find(b => eq(b.extBookNo, agencyNo)) ?? null;
  const lrpBooking = agencyNo ? t.lrpBookings.find(b => eq(b.book_no, agencyNo)) ?? null : null;
  const bookingNos = [agencyNo, ebookno].filter((n): n is string => !!n);
  const bls = t.lrpBl.filter(b => inAny(b.book_no, bookingNos) || (blNoHint && eq(b.bl_no, blNoHint)));
  const lrpBl = (blNoHint && bls.find(b => eq(b.bl_no, blNoHint))) || currentBl(bls);
  const sis = t.shippingInstructions.filter(s => inAny(s.bookno, bookingNos) || (blNoHint && eq(s.blno, blNoHint)));
  const si = (blNoHint && newestSi(sis.filter(s => eq(s.blno, blNoHint)))) || newestSi(sis);
  const blNo = text(blNoHint) || text(lrpBl?.bl_no) || text(si?.blno);
  return { searchType, searchKey, bookingNos, lrpBooking, booking, si, lrpBl, blNo, containerNo };
}

/** Container → (agency booking no, when) candidates across every table that carries a container id. */
function containerCandidates(containerNo: string, t: TrackingTables): { bookingNo: string; blNo: string | null; when: number }[] {
  const out: { bookingNo: string; blNo: string | null; when: number }[] = [];
  const push = (bookingNo: unknown, blNo: unknown, when: unknown) => {
    const no = text(bookingNo);
    if (no) out.push({ bookingNo: no, blNo: text(blNo) || null, when: +(toDate(when) ?? 0) });
  };
  for (const c of t.lrpBookingCargo.filter(c => eq(c.eqpId, containerNo))) {
    const head = t.lrpBookings.find(b => eq(b.book_no, c.book_no));
    push(c.book_no, null, head?.bookDate ?? head?.datecr);
  }
  for (const m of t.containerMoves.filter(m => eq(m.ContainerNo, containerNo))) push(m.bookNo, null, m.dateup ?? m.datecr);
  for (const c of t.lrpBlCargo.filter(c => eq(c.eqpId, containerNo))) {
    const bl = t.lrpBl.find(b => eq(b.bl_no, c.bl_no));
    if (bl) push(bl.book_no, bl.bl_no, bl.dateup ?? bl.datecr);
    else push(c.bl_no, null, null);
  }
  for (const c of t.siCargo.filter(c => eq(c.containerno, containerNo))) {
    const si = t.shippingInstructions.find(s => eq(s.eSINo, c.eSINo));
    if (si) push(si.bookno, si.blno, si.ChgDate ?? si.CrDate);
  }
  for (const c of t.bookingCargo.filter(c => eq(c.containerno, containerNo))) {
    const b = t.bookings.find(x => eq(x.ebookno, c.ebookno));
    if (b) push(b.extBookNo || b.ebookno, null, b.dateup ?? b.datecr);
  }
  for (const v of t.vgm.filter(v => eq(v.eqpid, containerNo))) push(v.book_no, v.bl_no, v.DateUp ?? v.Datecr);
  return out;
}

/**
 * Resolves a reference into the booking / SI / B/L rows behind it; null when the sample holds nothing.
 *   BOOKING   lrp book_no, bookings.extBookNo or bookings.ebookno (plus cargo-only bookings)
 *   BL        lrpBl.bl_no or shippingInstructions.blno (plus lrpBlCargo.bl_no)
 *   CONTAINER any table carrying the unit; the most recent shipment wins (units are re-used)
 */
export function resolveTrackingReference(searchType: TrackingSearchType, value: string, t: TrackingTables = fixtureTrackingTables()): TrackingReference | null {
  const key = upper(value);
  if (!key) return null;

  if (searchType === 'BOOKING') {
    const lrp = t.lrpBookings.find(b => eq(b.book_no, key));
    const byExt = t.bookings.find(b => eq(b.extBookNo, key));
    const byEbook = t.bookings.find(b => eq(b.ebookno, key));
    const cargoOnly =
      t.lrpBookingCargo.some(c => eq(c.book_no, key)) || t.containerMoves.some(m => eq(m.bookNo, key)) || t.lrpBl.some(b => eq(b.book_no, key)) || t.vgm.some(v => eq(v.book_no, key));
    if (!lrp && !byExt && !byEbook && !cargoOnly) return null;
    const agencyNo = lrp || byExt || cargoOnly ? key : null;
    return attachShipment(searchType, key, agencyNo, byEbook ? key : null, t);
  }

  if (searchType === 'BL') {
    const bl = t.lrpBl.find(b => eq(b.bl_no, key));
    const si = newestSi(t.shippingInstructions.filter(s => eq(s.blno, key)));
    const cargoOnly = t.lrpBlCargo.some(c => eq(c.bl_no, key)) || t.vgm.some(v => eq(v.bl_no, key));
    if (!bl && !si && !cargoOnly) return null;
    const agencyNo = text(bl?.book_no) || text(si?.bookno) || text(t.vgm.find(v => eq(v.bl_no, key))?.book_no) || (cargoOnly ? key : null);
    return attachShipment(searchType, key, agencyNo || null, null, t, key);
  }

  const candidates = containerCandidates(key, t).sort((a, b) => b.when - a.when);
  const best = candidates[0];
  if (!best) return null;
  return attachShipment(searchType, key, best.bookingNo, null, t, best.blNo, key);
}

// ─── legs ────────────────────────────────────────────────────────────────────

export type TrackingLegType = 'F' | 'M' | 'R' | 'T';
export type TransportMode = ContainerMovementEvent['transportMode'];

export interface TrackingLeg {
  legNo: number;
  legType: TrackingLegType;
  mode: TransportMode;
  vesselCode: string;
  voyage: string;
  service: string;
  bound: string;
  pol: string;
  polTerminal: string;
  pod: string;
  podTerminal: string;
  etd: Date | null;
  eta: Date | null;
}

const legTypeOf = (v: unknown): TrackingLegType => {
  const c = upper(v);
  return c === 'M' || c === 'R' || c === 'T' ? c : 'F';
};
const modeOf = (legType: TrackingLegType): TransportMode => (legType === 'R' ? 'RAIL' : legType === 'T' ? 'TRUCK' : 'VESSEL');
export const isVesselLeg = (l: TrackingLeg) => l.mode === 'VESSEL';

function makeLeg(legNo: number, legType: TrackingLegType, r: Partial<Record<'vesselCode' | 'voyage' | 'service' | 'bound' | 'pol' | 'polTerminal' | 'pod' | 'podTerminal', unknown>>, etd: unknown, eta: unknown): TrackingLeg {
  return {
    legNo,
    legType,
    mode: modeOf(legType),
    vesselCode: upper(r.vesselCode),
    voyage: text(r.voyage),
    service: upper(r.service),
    bound: upper(r.bound),
    pol: upper(r.pol),
    polTerminal: text(r.polTerminal),
    pod: upper(r.pod),
    podTerminal: text(r.podTerminal),
    etd: toDate(etd),
    eta: toDate(eta),
  };
}

/** schedules.voyage is '4422' or '4422-W' / '4422W'; legs carry the bare voyage. */
const voyageMatches = (scheduleVoyage: unknown, voyage: string, bound: string): boolean => {
  const s = upper(scheduleVoyage);
  const v = upper(voyage);
  if (!s || !v) return false;
  return s === v || s === `${v}-${bound}` || s === `${v}${bound}` || s.replace(/[-\s]?[NSEW]$/, '') === v;
};

/** Fills missing ETD/ETA of a vessel leg from the proforma schedule (depdate at POL, arrdate at POD). */
export function fillLegDatesFromSchedules(leg: TrackingLeg, schedules: Row[]): TrackingLeg {
  if (!isVesselLeg(leg) || !leg.vesselCode || (leg.etd && leg.eta)) return leg;
  const calls = schedules.filter(s => eq(s.vessel, leg.vesselCode) && voyageMatches(s.voyage, leg.voyage, leg.bound));
  const etd = leg.etd ?? toDate(calls.find(s => eq(s.port, leg.pol))?.depdate);
  const eta = leg.eta ?? toDate(calls.find(s => eq(s.port, leg.pod))?.arrdate);
  return { ...leg, etd, eta };
}

/**
 * Routing legs of the shipment, leg order preserved:
 * lrpBookingLegs → bookingLeg → one leg from the LRP booking / B/L / SI / e-com booking / container moves.
 */
export function shipmentLegs(ref: TrackingReference, t: TrackingTables): TrackingLeg[] {
  const { lrpBooking, booking, si, lrpBl } = ref;
  let legs: TrackingLeg[] = [];

  const lrpLegs = t.lrpBookingLegs.filter(l => inAny(l.book_no, ref.bookingNos)).sort((a, b) => num(a.leg_no) - num(b.leg_no));
  if (lrpLegs.length) {
    legs = lrpLegs.map((l, i) =>
      makeLeg(l.leg_no == null ? i + 1 : num(l.leg_no), legTypeOf(l.legTypeId), {
        vesselCode: l.vesselCode, voyage: l.voyageCode, service: l.serviceCode, bound: l.bound,
        pol: l.loadPortId, polTerminal: l.polTerminal, pod: l.dischargePortId, podTerminal: l.podTerminal,
      }, l.etdDate, l.etaDate),
    );
  } else if (booking) {
    const ecomLegs = t.bookingLeg.filter(l => eq(l.ebookno, booking.ebookno)).sort((a, b) => num(a.leg_no) - num(b.leg_no));
    legs = ecomLegs.map((l, i) =>
      makeLeg(l.leg_no == null ? i + 1 : num(l.leg_no), legTypeOf(l.legTypeId), {
        vesselCode: l.vesselCode, voyage: l.voyageCode, service: l.serviceCode, bound: l.bound,
        pol: l.loadPortId, polTerminal: l.loadTerminal, pod: l.dischargePortId, podTerminal: l.dischargeTerminal,
      }, l.etdDate, l.etaDate),
    );
  }

  if (!legs.length) {
    const move = t.containerMoves.find(m => inAny(m.bookNo, ref.bookingNos)) ?? null;
    const head = lrpBooking ?? lrpBl;
    if (head) {
      legs = [makeLeg(1, 'M', {
        vesselCode: head.vesselCode, voyage: head.voyageCode, service: head.serviceCode, bound: head.bound,
        pol: head.loadPortId, polTerminal: head.polTerminal, pod: head.dischargePortId, podTerminal: head.podTerminal,
      }, head.polAt, head.podAt)];
    } else if (si) {
      legs = [makeLeg(1, 'M', { vesselCode: si.Vessel, voyage: si.Voyage, bound: si.bound, pol: si.pol, pod: si.pod }, null, null)];
    } else if (move) {
      legs = [makeLeg(1, 'M', {
        vesselCode: move.VesselCode, voyage: move.Voyage, service: move.ServiceCode, bound: move.Bound,
        pol: move.opspol, polTerminal: move.opspolTerminal, pod: move.opspod, podTerminal: move.opspodTerminal,
      }, null, null)];
    } else if (booking) {
      legs = [makeLeg(1, 'M', {
        pol: booking.loadPortId || booking.originPortId, pod: booking.dischargePortId || booking.finalPortId,
      }, null, null)];
    }
  }

  // Vessel legs that lost their vessel (blank in booking_leg) inherit the booking header's vessel.
  const header = lrpBooking ?? lrpBl;
  return legs.map(l => {
    let leg = l;
    if (isVesselLeg(leg) && !leg.vesselCode && header) {
      leg = { ...leg, vesselCode: upper(header.vesselCode), voyage: leg.voyage || text(header.voyageCode), service: leg.service || upper(header.serviceCode), bound: leg.bound || upper(header.bound) };
    }
    return fillLegDatesFromSchedules(leg, t.schedules);
  });
}

/** The leg whose vessel heads the shipment: the first mainline, else the first vessel leg, else the first leg. */
export const mainLeg = (legs: TrackingLeg[]): TrackingLeg | null =>
  legs.find(l => l.legType === 'M') ?? legs.find(isVesselLeg) ?? legs[0] ?? null;

// ─── actual timings (arrival_master) ─────────────────────────────────────────

/** The arrival_master row of a vessel call: voyage there is '4422-W' while legs carry '4422'. */
export function portCallOf(portCalls: Row[], vesselCode: string, voyage: string, bound: string, port: string): Row | null {
  return portCalls.find(p => eq(p.vesselcode, vesselCode) && eq(p.portcode, port) && voyageMatches(p.voyage, voyage, bound)) ?? null;
}

// ─── deadlines (ecom_cutoffconfig) ───────────────────────────────────────────

export interface CutoffHours { gateIn: number; doc: number; vgm: number }

/** Port + terminal row → port 'All' → global 'All' → built-in default. */
export function cutoffHours(cutoffConfig: Row[], port: string, terminal: string): CutoffHours {
  const rows = cutoffConfig.filter(r => !r.status || eq(r.status, 'A'));
  const pick =
    rows.find(r => eq(r.port, port) && terminal && eq(r.terminal, terminal)) ??
    rows.find(r => eq(r.port, port) && eq(r.terminal, 'All')) ??
    rows.find(r => eq(r.port, 'All'));
  if (pick) return { gateIn: num(pick.fullcntrclosing), doc: num(pick.docclosing), vgm: num(pick.vgmclosing) };
  // TODO(fixtures): ecom_cutoffconfig has no row for this port and no global 'All' row — SOLAS-style defaults.
  return { gateIn: 48, doc: 24, vgm: 48 };
}

// ─── geometry ────────────────────────────────────────────────────────────────

const coord = (port: string): TrackingRouteMapPoint | null => {
  const c = portCoordinates(port);
  return c ? { lat: c.lat, lng: c.lng, label: port } : null;
};

/** Ordered distinct ports of the sea passage (POL, transhipment ports, POD). */
export function seaRoutePorts(legs: TrackingLeg[]): string[] {
  const sea = legs.filter(isVesselLeg);
  const ports: string[] = [];
  for (const l of sea) {
    if (l.pol && ports[ports.length - 1] !== l.pol) ports.push(l.pol);
    if (l.pod && ports[ports.length - 1] !== l.pod) ports.push(l.pod);
  }
  return ports;
}

export function buildRouteMap(legs: TrackingLeg[], fallbackPol: string, fallbackPod: string): TrackingRouteMap | undefined {
  const ports = seaRoutePorts(legs);
  const polCode = ports[0] ?? fallbackPol;
  const podCode = ports[ports.length - 1] ?? fallbackPod;
  const pol = coord(polCode);
  const pod = coord(podCode);
  if (!pol || !pod || polCode === podCode) return undefined;
  const waypoints = ports.slice(1, -1).map(coord).filter((p): p is TrackingRouteMapPoint => p != null);
  return waypoints.length ? { pol, pod, waypoints } : { pol, pod };
}

/**
 * Where the vessel is at `now`: at POL before the first ETD, at POD after the last ETA, at the transhipment
 * port between legs, otherwise interpolated along the great circle of the leg under way (speed = leg
 * distance / leg duration, capped at a container-ship pace).
 */
export function vesselPosition(legs: TrackingLeg[], now: Date): TrackingLiveAisPosition | undefined {
  const sea = legs.filter(l => isVesselLeg(l) && l.etd && l.eta && portCoordinates(l.pol) && portCoordinates(l.pod));
  if (!sea.length) return undefined;
  const at = (port: string, nextPort: string | null, label: string, speedKn = 0): TrackingLiveAisPosition => {
    const p = portCoordinates(port)!;
    const n = nextPort ? portCoordinates(nextPort) : null;
    return {
      lat: +p.lat.toFixed(4), lng: +p.lng.toFixed(4), speedKn,
      headingDeg: n ? Math.round(bearing([p.lat, p.lng], [n.lat, n.lng])) : 0,
      lastUpdate: formatListDate(now), locationLabel: label, source: 'Schedule-derived position (fixtures)',
    };
  };
  const first = sea[0];
  const last = sea[sea.length - 1];
  if (now < first.etd!) return at(first.pol, first.pod, `${portName(first.pol)} — awaiting departure`);
  if (now >= last.eta!) return at(last.pod, null, `${portName(last.pod)} — arrived`);
  for (let i = 0; i < sea.length; i++) {
    const leg = sea[i];
    if (now >= leg.etd! && now < leg.eta!) {
      const a = portCoordinates(leg.pol)!;
      const b = portCoordinates(leg.pod)!;
      const f = (+now - +leg.etd!) / Math.max(1, +leg.eta! - +leg.etd!);
      const [lat, lng] = slerp([a.lat, a.lng], [b.lat, b.lng], f);
      const hours = Math.max(1, (+leg.eta! - +leg.etd!) / HOUR);
      const speedKn = Math.min(24, Math.max(6, haversineNm([a.lat, a.lng], [b.lat, b.lng]) / hours));
      return {
        lat: +lat.toFixed(4), lng: +lng.toFixed(4), speedKn: +speedKn.toFixed(1),
        headingDeg: Math.round(bearing([lat, lng], [b.lat, b.lng])),
        lastUpdate: formatListDate(now),
        locationLabel: `En route ${portName(leg.pol)} → ${portName(leg.pod)}`,
        source: 'Schedule-derived position (fixtures)',
      };
    }
    const next = sea[i + 1];
    if (next && now >= leg.eta! && now < next.etd!) return at(leg.pod, next.pod, `${portName(leg.pod)} — transhipment`);
  }
  return at(last.pod, null, `${portName(last.pod)} — arrived`);
}

// ─── vessel particulars ──────────────────────────────────────────────────────

export interface TrackingVesselParticulars {
  code: string;
  name: string;
  imoNumber: string;
  callSign: string;
  flag: string;
  vesselType: string;
  builtYear: string;
  teuNominal: number | null;
  grossTonnage: number | null;
}

export function vesselParticulars(code: string): TrackingVesselParticulars | undefined {
  const r = vesselRow(code);
  if (!r) return undefined;
  return {
    code: upper(code), name: text(r.VesselName) || upper(code), imoNumber: text(r.ImoNumber), callSign: text(r.CallSign),
    flag: text(r.Flag), vesselType: text(r.VesselType), builtYear: text(r.BuiltYear),
    teuNominal: r.TeuNominal != null ? num(r.TeuNominal) : null, grossTonnage: r.GrossTonnage != null ? num(r.GrossTonnage) : null,
  };
}

// ─── milestones & movements ──────────────────────────────────────────────────

/** Legacy ecomtrackingmovementcode wording (Tracking.jsp); the activity code comes from the fixture map. */
const ECOM_EVENT_NAMES: Record<string, string> = {
  STS: 'SENT TO SHIPPER',
  RFS: 'RECEIVED FROM SHIPPER',
  GIN: 'GATE IN',
  LOF: 'LOAD FULL',
  LOT: 'LOAD TRANSHIPMENT',
  DIT: 'DISCHARGE TRANSHIPMENT',
  DIF: 'DISCHARGE FULL',
  DLV: 'DELIVERED',
};

/** ecomcode → activitycode from ecomtrackingmovementcode; the ecom code itself when unmapped. */
export function activityCode(codes: Row[], ecomCode: string): string {
  return upper(codes.find(c => eq(c.ecomcode, ecomCode))?.activitycode) || ecomCode;
}

export interface ShipmentFacts {
  ref: TrackingReference;
  legs: TrackingLeg[];
  polCode: string;
  podCode: string;
  polTerminalCode: string;
  etd: Date | null;
  eta: Date | null;
  actualEtd: Date | null;
  actualEta: Date | null;
  bookedAt: Date | null;
  pickupAt: Date | null;
  gateInAt: Date | null;
  gateInDeadline: Date | null;
  onboardAt: Date | null;
  blReleased: boolean;
  deliveredAt: Date | null;
}

const blIsReleased = (bl: Row | null): boolean =>
  !!bl && (eq(bl.status, 'C') || num(bl.printedOriginals) > 0 || eq(bl.isvoyageclosed, 'Y'));

/** Everything the milestones, container status and progress are computed from. */
export function shipmentFacts(ref: TrackingReference, t: TrackingTables, now: Date): ShipmentFacts {
  const legs = shipmentLegs(ref, t);
  const { lrpBooking, booking, lrpBl } = ref;
  const sea = legs.filter(isVesselLeg);
  const firstSea = sea[0] ?? null;
  const lastSea = sea[sea.length - 1] ?? null;
  const main = mainLeg(legs);
  const polCode = upper(lrpBooking?.loadPortId) || firstSea?.pol || legs[0]?.pol || upper(lrpBl?.loadPortId ?? ref.si?.pol ?? booking?.loadPortId);
  const podCode = upper(lrpBooking?.dischargePortId) || lastSea?.pod || legs[legs.length - 1]?.pod || upper(lrpBl?.dischargePortId ?? ref.si?.pod ?? booking?.dischargePortId);
  const polTerminalCode = text(lrpBooking?.polTerminal) || firstSea?.polTerminal || text(t.containerMoves.find(m => inAny(m.bookNo, ref.bookingNos))?.opspolTerminal);

  const etd = firstSea?.etd ?? toDate(lrpBooking?.polAt ?? lrpBl?.polAt);
  const eta = lastSea?.eta ?? toDate(lrpBooking?.podAt ?? lrpBl?.podAt);
  const onboardAt = toDate(lrpBl?.OnboardDate);

  const polCall = firstSea ? portCallOf(t.portCalls, firstSea.vesselCode, firstSea.voyage, firstSea.bound, firstSea.pol) : null;
  const podCall = lastSea ? portCallOf(t.portCalls, lastSea.vesselCode, lastSea.voyage, lastSea.bound, lastSea.pod) : null;
  const past = (d: Date | null) => (d && d <= now ? d : null);
  const actualEtd = past(toDate(polCall?.pulloutfromberth)) ?? (etd && etd <= now ? past(onboardAt) : null);
  const actualEta = past(toDate(podCall?.allfastfwe ?? podCall?.eosp));

  const cargo = t.lrpBookingCargo.filter(c => inAny(c.book_no, ref.bookingNos));
  const moves = t.containerMoves.filter(m => inAny(m.bookNo, ref.bookingNos));
  const bookedAt = toDate(lrpBooking?.bookDate ?? lrpBooking?.datecr ?? booking?.submitted_date ?? booking?.datecr ?? lrpBl?.datecr);
  const pickupAt =
    earliest(cargo.map(c => toDate(c.pickupDate))) ??
    toDate(booking?.emptypickupdate ?? booking?.pickupdate) ??
    earliest(moves.filter(m => eq(m.mode, 'M')).map(m => toDate(m.actDate ?? m.datecr)));
  const hours = cutoffHours(t.cutoffConfig, polCode, polTerminalCode);
  const gateInDeadline = etd ? new Date(+etd - hours.gateIn * HOUR) : null;
  const gateInAt =
    earliest(cargo.map(c => toDate(c.GateInClearanceDate))) ??
    earliest(moves.filter(m => eq(m.mode, 'F')).map(m => toDate(m.actDate ?? m.datecr)));
  const onCarriage = legs.slice(legs.findIndex(l => l === lastSea) + 1).filter(l => !isVesselLeg(l));
  const blReleased = blIsReleased(lrpBl);
  const deliveredAt = onCarriage.length ? onCarriage[onCarriage.length - 1].eta : null;

  return { ref, legs, polCode, podCode, polTerminalCode, etd, eta, actualEtd, actualEta, bookedAt, pickupAt, gateInAt, gateInDeadline, onboardAt, blReleased, deliveredAt };
}

const stamp = (d: Date | null, now: Date): string | undefined => (d ? (d <= now ? formatListDate(d) : `Est. ${formatListDate(d)}`) : undefined);

/** Shipment pipeline: booked → empty pick-up → pre-carriage → gate in → loaded → transhipment(s) → discharged → on-carriage → delivered. */
export function buildMilestones(f: ShipmentFacts, now: Date): TrackingMilestone[] {
  const { legs } = f;
  const sea = legs.filter(isVesselLeg);
  const firstSeaIdx = legs.findIndex(isVesselLeg);
  const lastSeaIdx = legs.length - 1 - [...legs].reverse().findIndex(isVesselLeg);
  const pre = firstSeaIdx >= 0 ? legs.slice(0, firstSeaIdx).filter(l => !isVesselLeg(l)) : [];
  const post = firstSeaIdx >= 0 ? legs.slice(lastSeaIdx + 1).filter(l => !isVesselLeg(l)) : legs.filter(l => !isVesselLeg(l));
  const origin = upper(f.ref.lrpBooking?.originPortId ?? f.ref.booking?.originPortId) || f.polCode;
  const destination = upper(f.ref.lrpBooking?.finalPortId ?? f.ref.booking?.finalPortId) || f.podCode;
  const modeWord = (m: TransportMode) => (m === 'RAIL' ? 'Rail' : m === 'TRUCK' ? 'Truck' : 'Vessel');

  type Draft = { stepName: string; location: string; at: Date | null; done: boolean; mode?: TransportMode };
  const drafts: Draft[] = [];
  drafts.push({ stepName: 'Booking Confirmed', location: portName(origin), at: f.bookedAt, done: !!f.bookedAt && f.bookedAt <= now });
  const pickupPoint = text(f.ref.booking?.pickup_point);
  drafts.push({ stepName: 'Empty Pick-up', location: pickupPoint || portName(origin), at: f.pickupAt, done: !!f.pickupAt && f.pickupAt <= now, mode: 'TRUCK' });
  for (const l of pre) {
    drafts.push({ stepName: `Pre-carriage (${modeWord(l.mode)})`, location: `${portName(l.pol)} → ${portName(l.pod)}`, at: l.etd, done: !!l.etd && l.etd <= now, mode: l.mode });
  }
  const gateInAt = f.gateInAt ?? f.gateInDeadline;
  const polLabel = [portName(f.polCode), terminalLabel(f.polTerminalCode)].filter(Boolean).join(' · ');
  drafts.push({ stepName: 'Gate In', location: polLabel, at: gateInAt, done: !!f.gateInAt && f.gateInAt <= now, mode: 'TRUCK' });
  sea.forEach((l, i) => {
    const departed = i === 0 ? f.actualEtd ?? l.etd : l.etd;
    if (i === 0) drafts.push({ stepName: 'Loaded on Board', location: portName(l.pol), at: departed, done: !!departed && departed <= now, mode: 'VESSEL' });
    if (i < sea.length - 1) drafts.push({ stepName: 'Transhipment', location: portName(l.pod), at: l.eta, done: !!l.eta && l.eta <= now, mode: 'VESSEL' });
  });
  const arrived = f.actualEta ?? f.eta;
  drafts.push({ stepName: 'Discharged', location: portName(f.podCode), at: arrived, done: !!arrived && arrived <= now, mode: 'VESSEL' });
  for (const l of post) {
    drafts.push({ stepName: `On-carriage (${modeWord(l.mode)})`, location: `${portName(l.pol)} → ${portName(l.pod)}`, at: l.etd, done: !!l.etd && l.etd <= now, mode: l.mode });
  }
  const deliveredDone = !!arrived && arrived <= now && (f.blReleased || (!!f.deliveredAt && f.deliveredAt <= now));
  drafts.push({ stepName: 'Delivered', location: portName(destination), at: f.deliveredAt, done: deliveredDone, mode: post.length ? post[post.length - 1].mode : undefined });

  // A later achieved step implies the earlier ones are achieved too (no dates for every event in the sample).
  let lastDone = -1;
  drafts.forEach((d, i) => { if (d.done) lastDone = i; });
  const currentIdx = lastDone >= 0 && lastDone < drafts.length - 1 ? lastDone + 1 : -1;
  return drafts.map((d, i): TrackingMilestone => {
    const isCompleted = i <= lastDone;
    const milestone: TrackingMilestone = { id: `m${i + 1}`, stepName: d.stepName, location: d.location, isCompleted, isCurrent: i === currentIdx };
    const ts = isCompleted && d.at && d.at > now ? formatListDate(d.at) : stamp(d.at, now);
    if (ts) milestone.timestamp = ts;
    if (d.mode) milestone.transportMode = d.mode;
    return milestone;
  });
}

/** Completed steps plus the time fraction of the step under way, as a percentage. */
export function progressPercent(milestones: TrackingMilestone[], f: ShipmentFacts, now: Date): number {
  if (!milestones.length) return 0;
  const done = milestones.filter(m => m.isCompleted).length;
  if (done === milestones.length) return 100;
  let partial = 0;
  const sailing = f.etd && f.eta && f.etd <= now && now < f.eta;
  if (sailing) partial = (+now - +f.etd!) / Math.max(1, +f.eta! - +f.etd!);
  return Math.max(0, Math.min(100, Math.round(((done + partial) / milestones.length) * 100)));
}

interface ContainerSource {
  containerNo: string;
  type: string;
  seal: string;
  tare: number;
  payload: number;
  moves: Row[];
  gateInAt: Date | null;
}

/** Equipment of the shipment from every table that carries container ids, de-duplicated in source order. */
export function collectContainers(ref: TrackingReference, t: TrackingTables): ContainerSource[] {
  const out = new Map<string, ContainerSource>();
  const add = (id: unknown, type: unknown, seal: unknown, tare: unknown, payload: unknown, gateIn: unknown = null) => {
    const containerNo = upper(id);
    if (!containerNo) return;
    const cur = out.get(containerNo) ?? { containerNo, type: '', seal: '', tare: 0, payload: 0, moves: [], gateInAt: null };
    cur.type ||= equipmentCode(type);
    cur.seal ||= text(seal);
    cur.tare ||= num(tare);
    cur.payload ||= num(payload);
    cur.gateInAt ??= toDate(gateIn);
    out.set(containerNo, cur);
  };
  t.lrpBookingCargo.filter(c => inAny(c.book_no, ref.bookingNos)).forEach(c => add(c.eqpId, c.eqpTypeId, c.seal1No, c.tareWeight, c.cargoWeight, c.GateInClearanceDate));
  t.lrpBlCargo.filter(c => (ref.blNo && eq(c.bl_no, ref.blNo)) || inAny(c.bl_no, ref.bookingNos)).forEach(c => add(c.eqpId, c.eqpTypeId, c.seal1No, c.tareWeight, c.cargoWeight));
  t.containerMoves.filter(m => inAny(m.bookNo, ref.bookingNos)).forEach(m => add(m.ContainerNo, m.EquipmentType, m.SealNo, null, m.Wt));
  if (ref.si) t.siCargo.filter(c => eq(c.eSINo, ref.si!.eSINo)).forEach(c => add(c.containerno, c.eqpSize, c.carrierSeal || c.ShipperSeal, c.tareWeight, c.cargoWeight));
  if (ref.booking) t.bookingCargo.filter(c => eq(c.ebookno, ref.booking!.ebookno)).forEach(c => add(c.containerno, c.eqpSize, null, c.tareWeight, c.cargoWeight));
  t.vgm.filter(v => inAny(v.book_no, ref.bookingNos) || (ref.blNo && eq(v.bl_no, ref.blNo))).forEach(v => add(v.eqpid, v.eqptype, null, null, null));
  if (ref.containerNo) {
    add(ref.containerNo, null, null, null, null); // a unit found only through another table still gets a row
  }
  for (const c of out.values()) {
    c.moves = t.containerMoves.filter(m => eq(m.ContainerNo, c.containerNo) && inAny(m.bookNo, ref.bookingNos)).sort((a, b) => +new Date(a.datecr) - +new Date(b.datecr));
  }
  const all = [...out.values()];
  return ref.containerNo ? all.filter(c => c.containerNo === ref.containerNo) : all;
}

function eventAt(id: string, ecomCode: string, codes: Row[], port: string, terminal: string, at: Date, mode: TransportMode, leg: TrackingLeg | null, now: Date): ContainerMovementEvent {
  const isActual = at <= now;
  const name = ECOM_EVENT_NAMES[ecomCode] ?? ecomCode;
  const c = portCoordinates(port);
  const ev: ContainerMovementEvent = {
    id,
    eventCode: activityCode(codes, ecomCode),
    eventName: isActual ? name : `${name} (EST.)`,
    locationCode: port,
    locationName: portName(port),
    facility: terminalLabel(terminal),
    eventDate: formatListDate(at),
    transportMode: mode,
    isActual,
  };
  if (leg?.vesselCode) {
    ev.vesselCode = leg.vesselCode;
    ev.vesselName = vesselName(leg.vesselCode);
    ev.voyage = leg.voyage;
    ev.bound = leg.bound;
  }
  if (c) { ev.lat = c.lat; ev.lng = c.lng; }
  return ev;
}

/**
 * Movement log of one container, oldest first: operationDetail rows (empty released / full received),
 * then the leg events (load / tranship / discharge, pre- and on-carriage). Future events carry isActual: false.
 */
export function buildMovements(c: ContainerSource, f: ShipmentFacts, t: TrackingTables, now: Date): ContainerMovementEvent[] {
  const codes = t.trackingMovementCodes;
  const { legs } = f;
  const sea = legs.filter(isVesselLeg);
  const firstSea = sea[0] ?? null;
  const events: ContainerMovementEvent[] = [];
  const key = c.containerNo;
  const legFor = (vesselCode: unknown, voyage: unknown) => sea.find(l => eq(l.vesselCode, vesselCode) && eq(l.voyage, voyage)) ?? firstSea;

  c.moves.forEach((m, i) => {
    const at = toDate(m.actDate ?? m.dateup ?? m.datecr);
    if (!at) return;
    const empty = eq(m.mode, 'M');
    events.push(eventAt(`${key}-op${i + 1}`, empty ? 'STS' : 'RFS', codes, upper(m.opspol) || f.polCode, text(m.opspolTerminal), at, 'TRUCK', legFor(m.VesselCode, m.Voyage), now));
  });
  if (c.gateInAt && !c.moves.some(m => eq(m.mode, 'F'))) {
    events.push(eventAt(`${key}-gin`, 'GIN', codes, f.polCode, f.polTerminalCode, c.gateInAt, 'TRUCK', firstSea, now));
  }
  let seaIdx = 0;
  legs.forEach((l, i) => {
    if (isVesselLeg(l)) {
      const first = seaIdx === 0;
      const last = seaIdx === sea.length - 1;
      const departed = first ? f.actualEtd ?? l.etd : l.etd;
      if (departed) events.push(eventAt(`${key}-l${i + 1}-load`, first ? 'LOF' : 'LOT', codes, l.pol, l.polTerminal, departed, 'VESSEL', l, now));
      const arrived = last ? f.actualEta ?? l.eta : l.eta;
      if (arrived) events.push(eventAt(`${key}-l${i + 1}-disc`, last ? 'DIF' : 'DIT', codes, l.pod, l.podTerminal, arrived, 'VESSEL', l, now));
      seaIdx += 1;
    } else {
      const word = l.mode === 'RAIL' ? 'RAIL' : 'TRUCK';
      if (l.etd) events.push({ ...eventAt(`${key}-l${i + 1}-dep`, `${word}-DEP`, codes, l.pol, l.polTerminal, l.etd, l.mode, null, now), eventName: `${word} DEPARTURE${l.etd <= now ? '' : ' (EST.)'}` });
      if (l.eta) events.push({ ...eventAt(`${key}-l${i + 1}-arr`, `${word}-ARR`, codes, l.pod, l.podTerminal, l.eta, l.mode, null, now), eventName: `${word} ARRIVAL${l.eta <= now ? '' : ' (EST.)'}` });
    }
  });
  if (f.deliveredAt || (f.blReleased && f.eta)) {
    const at = f.deliveredAt ?? f.eta!;
    events.push(eventAt(`${key}-dlv`, 'DLV', codes, upper(f.ref.lrpBooking?.finalPortId) || f.podCode, '', at, legs.length && !isVesselLeg(legs[legs.length - 1]) ? legs[legs.length - 1].mode : 'TRUCK', null, now));
  }
  return events.sort((a, b) => parseStamp(a.eventDate) - parseStamp(b.eventDate));
}

const MONTH_INDEX: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
/** Parses the dd-MMM-yyyy HH:mm strings this bridge emits (local time, like formatListDate). */
export function parseStamp(value: string): number {
  const m = /^(\d{2})-([A-Za-z]{3})-(\d{4}) (\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return 0;
  return +new Date(Number(m[3]), MONTH_INDEX[m[2]] ?? 0, Number(m[1]), Number(m[4]), Number(m[5]));
}

export function containerStatus(f: ShipmentFacts, now: Date): ContainerEquipment['status'] {
  const arrived = f.actualEta ?? f.eta;
  const departed = f.actualEtd ?? f.etd;
  if (arrived && arrived <= now && (f.blReleased || (f.deliveredAt && f.deliveredAt <= now))) return 'DELIVERED';
  if (arrived && arrived <= now) return 'DISCHARGED';
  if (departed && departed <= now) return 'IN_TRANSIT';
  if (f.onboardAt && f.onboardAt <= now) return 'LOADED';
  // Pre-departure (received full or still awaiting the terminal): GATE_IN is the only pre-sailing state the type offers.
  return 'GATE_IN';
}

export function buildContainer(c: ContainerSource, f: ShipmentFacts, t: TrackingTables, now: Date): ContainerEquipment {
  const movements = buildMovements(c, f, t, now);
  const achieved = movements.filter(m => m.isActual);
  const last = achieved[achieved.length - 1] ?? null;
  return {
    containerNo: c.containerNo,
    containerType: c.type,
    sealNo: c.seal,
    tareWeightKg: c.tare,
    payloadKg: c.payload,
    latestActivity: last?.eventName ?? 'BOOKING CONFIRMED',
    activityLocation: last?.locationName ?? portName(upper(f.ref.lrpBooking?.originPortId) || f.polCode),
    activityDate: last?.eventDate ?? (f.bookedAt ? formatListDate(f.bookedAt) : ''),
    status: containerStatus(f, now),
    movements,
  };
}

// ─── result ──────────────────────────────────────────────────────────────────

/** TrackingSearchResult plus the vessel master particulars (extra field, ignored by today's screens). */
export interface TrackingBridgeResult extends TrackingSearchResult {
  vesselParticulars?: TrackingVesselParticulars;
}

export function buildTrackingResult(ref: TrackingReference, t: TrackingTables = fixtureTrackingTables(), now: Date = new Date()): TrackingBridgeResult {
  const f = shipmentFacts(ref, t, now);
  const main = mainLeg(f.legs);
  const vesselCode = main?.vesselCode || upper(ref.lrpBooking?.vesselCode ?? ref.lrpBl?.vesselCode ?? ref.si?.Vessel);
  const milestones = buildMilestones(f, now);
  const containers = collectContainers(ref, t).map(c => buildContainer(c, f, t, now));
  const hours = cutoffHours(t.cutoffConfig, f.polCode, f.polTerminalCode);
  const minus = (h: number) => (f.etd ? formatListDate(new Date(+f.etd - h * HOUR)) : '');
  const podTerminalCode = text(ref.lrpBooking?.podTerminal) || f.legs.filter(isVesselLeg).slice(-1)[0]?.podTerminal || '';

  const result: TrackingBridgeResult = {
    searchKey: ref.searchKey,
    bookingNo: ref.bookingNos[0] ?? '',
    blNo: ref.blNo,
    polPortCode: f.polCode,
    polPortName: portName(f.polCode),
    polTerminal: terminalLabel(f.polTerminalCode),
    podPortCode: f.podCode,
    podPortName: portName(f.podCode),
    podTerminal: terminalLabel(podTerminalCode),
    vesselCode,
    vesselName: vesselCode ? vesselName(vesselCode) : '',
    voyage: main?.voyage || text(ref.lrpBooking?.voyageCode ?? ref.lrpBl?.voyageCode),
    bound: main?.bound || upper(ref.lrpBooking?.bound ?? ref.lrpBl?.bound ?? ref.si?.bound),
    etd: f.etd ? formatListDate(f.etd) : '',
    eta: f.eta ? formatListDate(f.eta) : '',
    progressPercent: progressPercent(milestones, f, now),
    deadlines: { containerGateIn: minus(hours.gateIn), siDocClosing: minus(hours.doc), vgmClosing: minus(hours.vgm) },
    milestones,
    containers,
  };
  if (f.actualEtd) result.actualEtd = formatListDate(f.actualEtd);
  if (f.actualEta) result.actualEta = formatListDate(f.actualEta);
  const routeMap = buildRouteMap(f.legs, f.polCode, f.podCode);
  if (routeMap) result.routeMap = routeMap;
  const liveAis = vesselPosition(f.legs, now);
  if (liveAis) result.liveAis = liveAis;
  const particulars = vesselCode ? vesselParticulars(vesselCode) : undefined;
  if (particulars) result.vesselParticulars = particulars;
  return result;
}

/** The whole lookup: null when the reference is unknown to the sample. */
export function fixtureTrackingResult(searchType: TrackingSearchType, value: string, t: TrackingTables = fixtureTrackingTables(), now: Date = new Date()): TrackingBridgeResult | null {
  const ref = resolveTrackingReference(searchType, value, t);
  return ref ? buildTrackingResult(ref, t, now) : null;
}

/**
 * Demo references for the search UI: the newest LRP booking that has operationDetail moves and an
 * e-commerce booking, one of its containers, and the newest B/L that carries equipment.
 */
export function trackingSampleReferences(t: TrackingTables = fixtureTrackingTables()): { container: string; booking: string; bl: string } {
  const byDate = (col: string) => (a: Row, b: Row) => +new Date(b[col]) - +new Date(a[col]);
  const withMoves = [...t.lrpBookings].sort(byDate('bookDate')).filter(b => t.containerMoves.some(m => eq(m.bookNo, b.book_no)));
  const booking = withMoves.find(b => t.bookings.some(e => eq(e.extBookNo, b.book_no))) ?? withMoves[0] ?? t.lrpBookings[0] ?? null;
  const bookingNo = text(booking?.book_no);
  const container = text(t.containerMoves.find(m => eq(m.bookNo, bookingNo))?.ContainerNo) || text(t.lrpBookingCargo.find(c => eq(c.book_no, bookingNo))?.eqpId);
  const bl = [...t.lrpBl].sort(byDate('datecr')).find(b => !eq(b.status, 'V') && t.lrpBlCargo.some(c => eq(c.bl_no, b.bl_no)));
  return { container, booking: bookingNo, bl: text(bl?.bl_no) };
}
