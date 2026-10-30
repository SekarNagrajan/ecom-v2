// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Small helpers shared by the SI / B/L bridges: value coercion, port / charge labels (resolved
 * through the master fixtures) and the booking / leg lookups every SI-derived DTO needs.
 * Column names are the exact ecomSI* / ecombooking* names the dump produced.
 */
import { childRows, db, eq, type Row } from '../db';
import { toIsoOrNull } from './format';
import { chargeName, portName, vesselName } from './masters.bridge';

export const str = (v: unknown): string => (v == null ? '' : String(v).trim());

export function num(v: unknown, fallback = 0): number {
  if (v == null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const yes = (v: unknown): boolean => str(v).toUpperCase() === 'Y';

/**
 * "INNSA - NHAVA SHEVA,MUMBAI": the header name the SI stores when given, else the name from the
 * ports master; just the code when neither knows the port, just the name when there is no code.
 */
export function portLabel(code: unknown, name?: unknown): string {
  const c = str(code);
  const n = str(name) || (c ? portName(c) : '');
  if (c && n && !eq(c, n)) return `${c} - ${n}`;
  return c || n;
}

/** ecomSI_charges.custtypeid / ecomSI_cust.custTypeId → payer wording used by the charge grids. */
export const PARTY_TYPE_LABELS: Record<string, string> = {
  AP: 'Agreement Party',
  BP: 'Booking Party',
  SH: 'Shipper',
  CN: 'Consignee',
  NT: 'Notify Party',
  N1: 'Notify Party 2',
  N2: 'Notify Party 3',
  FW: 'Forwarder',
  WH: 'Warehouse',
};
export const partyTypeLabel = (code: unknown) => PARTY_TYPE_LABELS[str(code).toUpperCase()] ?? str(code);
export const partyTypeCode = (label: unknown) =>
  Object.entries(PARTY_TYPE_LABELS).find(([, l]) => eq(l, label))?.[0] ?? (str(label).toUpperCase() || 'AP');

/** Charge code → chargename from the charges master; unknown codes fall back to the code itself. */
export const chargeLabel = (code: unknown) => chargeName(str(code));

/** ecombooking_leg.legTypeId → wording of the routing card. */
export const LEG_TYPE_LABELS: Record<string, string> = { M: 'Main', F: 'Feeder', R: 'Rail', T: 'Truck' };

/** Booking by agency booking number (extBookNo) or online reference (ebookno). */
export function findBooking(bookNo: unknown): Row | null {
  const key = str(bookNo);
  if (!key) return null;
  return db.bookings.find(b => eq(b.extBookNo, key) || eq(b.ebookno, key)) ?? null;
}

/** Legs of a booking ordered by leg_no; [] without a booking. */
export function bookingLegs(booking: Row | null): Row[] {
  if (!booking) return [];
  return childRows('bookingLeg', 'ebookno', booking.ebookno).sort((a, b) => num(a.leg_no) - num(b.leg_no));
}

/** The ocean main leg (legTypeId M), else the first leg. */
export const mainLeg = (legs: Row[]): Row | null => legs.find(l => eq(l.legTypeId, 'M')) ?? legs[0] ?? null;

/** Routing leg shape shared by SIRoutingLeg (no legType) and BLRoutingLeg (legType required). */
export interface RoutingLeg {
  id: string;
  legType: string;
  vesselName: string;
  voyage?: string;
  polPortName: string;
  podPortName: string;
  etd: string;
  eta: string;
}

export function mapRoutingLeg(leg: Row): RoutingLeg {
  return {
    id: str(leg.id) || `${str(leg.ebookno)}-${num(leg.leg_no)}`,
    legType: LEG_TYPE_LABELS[str(leg.legTypeId).toUpperCase()] ?? 'Ocean',
    vesselName: vesselName(str(leg.vesselCode)),
    voyage: str(leg.voyageCode) || undefined,
    polPortName: portName(str(leg.loadPortId)),
    podPortName: portName(str(leg.dischargePortId)),
    etd: toIsoOrNull(leg.etdDate) ?? '',
    eta: toIsoOrNull(leg.etaDate) ?? '',
  };
}

/** true when the main leg already sailed (ETD before `now`). */
export function voyageClosed(legs: Row[], now: number = Date.now()): boolean {
  const main = mainLeg(legs);
  if (!main) return false;
  const etd = +new Date(main.etdDate);
  return Number.isFinite(etd) && etd < now;
}

/** ecomSI rows that are plain shipping instructions (not B/L amendment versions). */
export const isPlainSi = (si: Row) => num(si.editbl) === 0;
/** ecomSI rows that are B/L amendment versions (editbl ≥ 1). */
export const isAmendment = (si: Row) => num(si.editbl) >= 1;

/** SI row by eSINo (plain SI preferred), or the newest plain SI of a booking number. */
export function findSiRow(id: unknown): Row | null {
  const key = str(id);
  if (!key) return null;
  const byNo = db.shippingInstructions.filter(si => eq(si.eSINo, key));
  if (byNo.length) return byNo.find(isPlainSi) ?? byNo[0];
  return (
    db.shippingInstructions
      .filter(si => isPlainSi(si) && eq(si.bookno, key))
      .sort((a, b) => +new Date(b.ChgDate) - +new Date(a.ChgDate))[0] ?? null
  );
}

/** Highest blversion (then newest ChgDate) among the rows carrying a B/L number. */
export function latestVersion(rows: Row[]): Row | null {
  return (
    [...rows].sort(
      (a, b) => num(b.blversion) - num(a.blversion) || +new Date(b.ChgDate) - +new Date(a.ChgDate),
    )[0] ?? null
  );
}

/** Latest ecomSI row for a B/L number (cancelled plain SIs never count). */
export function findBlRow(blNo: unknown): Row | null {
  const key = str(blNo);
  if (!key) return null;
  return latestVersion(
    db.shippingInstructions.filter(si => eq(si.blno, key) && !(isPlainSi(si) && eq(si.status, 'I'))),
  );
}
