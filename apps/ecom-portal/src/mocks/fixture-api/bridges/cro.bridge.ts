// Modified by Sekar Nagarajan (2026-10-17 00:33)
// TODO(fixtures): no CRO table — derived from export bookings
/**
 * Container Release Orders (release of empties for export) derived from the booking fixtures.
 * No database holds a CRO master (only a survey table), so every row is computed:
 *   lrpBookings (status C confirmed / D cancelled) of the demo customer (lrpBookingCust)
 *                                              → one CRO per booking and equipment type
 *   lrpBookingCargo (eqpTypeId, eqpId, seal1No, GateClearance, pickupDate)
 *                                              → booked quantity and container list
 *   containerMoves (bookNo, ContainerNo, mode M empty / F full)
 *                                              → released quantity (a moved container left the depot)
 *   bookings (extBookNo, emptypickup / pickup_point, emptypickupdate) + bookingConf (bkgCutoff)
 *                                              → pick-up depot, CRO date and validity
 *   cutoffConfig (port / terminal closing hours) → validity when the booking has no confirmation
 *   depots (portcode)                          → default empty depot at the load port
 *   invoices (EXPORTINVOICE balance on the booking) → payment hold
 *   schedules (vessel + voyage + load port)    → POL arrival / departure
 *
 * Printing a CRO is remembered on the lrpBookings row (ecomCroPrints) for the session.
 */
import type {
  CROContainerRow,
  CRODTO,
  CROEligibility,
  CROListDTO,
  CROReleaseStatus,
} from '../../../features/container-release-order/types/cro.types';
import { childRows, db, eq, type Row } from '../db';
import { toIsoOrNull } from './format';
import { depotName, portLabel, vesselName } from './masters.bridge';
import { findBooking, num, str, yes } from './si-common.bridge';
import { currentCustomerCode } from './user.bridge';

const HOUR_MS = 3_600_000;
const DEFAULT_CUTOFF_HOURS = 48;

export interface CroSource {
  croNo: string;
  booking: Row;
  /** Linked e-commerce booking (bookings.extBookNo = book_no), when the sample has one. */
  ecom: Row | null;
  eqpType: string;
  /** lrpBookingCargo rows of this equipment type ([] when only e-commerce cargo exists). */
  cargo: Row[];
  qtyBooked: number;
}

const normType = (v: unknown) => str(v).toUpperCase();

/** Bookings of the demo customer (every booking when the customer has none), newest first. */
export function croBookings(customerCode = currentCustomerCode()): Row[] {
  const mine = new Set(childRows('lrpBookingCust', 'custId', customerCode).map(c => str(c.book_no).toUpperCase()));
  const rows = db.lrpBookings.filter(b => (eq(b.status, 'C') || eq(b.status, 'D')) && str(b.book_no));
  const scoped = rows.filter(b => mine.has(str(b.book_no).toUpperCase()));
  return (scoped.length ? scoped : rows).sort((a, b) => +new Date(b.bookDate) - +new Date(a.bookDate));
}

/** One CRO per booking and equipment type; the first type keeps the plain CRO-<booking> number. */
export function croSourcesFor(booking: Row): CroSource[] {
  const bookNo = str(booking.book_no);
  const ecom = findBooking(bookNo);
  const byType = new Map<string, { cargo: Row[]; qty: number }>();
  for (const c of childRows('lrpBookingCargo', 'book_no', bookNo)) {
    const type = normType(c.eqpTypeId);
    const entry = byType.get(type) ?? { cargo: [], qty: 0 };
    entry.cargo.push(c);
    entry.qty += 1;
    byType.set(type, entry);
  }
  if (!byType.size && ecom) {
    for (const c of childRows('bookingCargo', 'ebookno', ecom.ebookno)) {
      const type = normType(c.eqpSize);
      const entry = byType.get(type) ?? { cargo: [], qty: 0 };
      entry.qty += Math.max(1, num(c.quantity, 1));
      byType.set(type, entry);
    }
  }
  return [...byType.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([eqpType, entry], i) => ({
      croNo: i === 0 ? `CRO-${bookNo}` : `CRO-${bookNo}-${eqpType}`,
      booking,
      ecom,
      eqpType,
      cargo: entry.cargo,
      qtyBooked: entry.qty,
    }));
}

export const croSources = (): CroSource[] => croBookings().flatMap(croSourcesFor);

export function findCroSource(croNo: string): CroSource | null {
  return croSources().find(s => eq(s.croNo, croNo)) ?? null;
}

/** Containers of the type that left the depot: a container move exists or gate clearance is set. */
export function releasedContainers(source: CroSource): Row[] {
  const moved = new Set(childRows('containerMoves', 'bookNo', source.booking.book_no).map(m => str(m.ContainerNo).toUpperCase()));
  return source.cargo.filter(c => yes(c.GateClearance) || moved.has(str(c.eqpId).toUpperCase()));
}

/** Confirmed export invoices of the booking that still carry a balance. */
export function paymentHold(bookNo: unknown): boolean {
  return db.invoices.some(
    inv => eq(inv.invtype, 'EXPORTINVOICE') && eq(inv.status, 'CONFIRM') && eq(inv.invrefno, bookNo) && num(inv.amtbalance) > 0,
  );
}

/** "INNSADAMA - AMARA DEPOT": the booking's pick-up point, else the first real depot at the load port. */
export function emptyReleaseDepot(source: CroSource): string {
  const chosen = str(source.ecom?.emptypickup) || str(source.ecom?.pickup_point);
  if (chosen) return `${chosen} - ${depotName(chosen)}`;
  const port = str(source.booking.loadPortId);
  const atPort = (d: Row) => str(d.depot).toUpperCase().startsWith(port.toUpperCase());
  const candidates = childRows('depots', 'portcode', port)
    .filter(d => !/test/i.test(`${str(d.depot)} ${str(d.description)}`))
    .sort((a, b) => Number(!atPort(a)) - Number(!atPort(b)) || str(a.depot).localeCompare(str(b.depot)));
  const depot = candidates[0];
  return depot ? `${str(depot.depot)} - ${str(depot.description)}` : portLabel(port);
}

/** Full-container closing hours for the port / terminal from cutoffConfig (terminal, then port, then global). */
export function cutoffHours(port: unknown, terminal: unknown): number {
  const rows = db.cutoffConfig;
  const pick = (p: string, t: string) => rows.find(r => eq(r.port, p) && eq(r.terminal, t));
  const row = pick(str(port), str(terminal)) ?? pick(str(port), 'All') ?? pick('All', 'All');
  const hours = num(row?.fullcntrclosing);
  return hours > 0 ? hours : DEFAULT_CUTOFF_HOURS;
}

export function croDates(source: CroSource): { croDate: string; validTo: string } {
  const { booking, ecom, cargo } = source;
  const pickup = cargo.map(c => toIsoOrNull(c.pickupDate)).find(Boolean) ?? null;
  const croDate = toIsoOrNull(ecom?.emptypickupdate) ?? pickup ?? toIsoOrNull(booking.bookReady) ?? toIsoOrNull(booking.bookDate) ?? toIsoOrNull(booking.datecr) ?? new Date(0).toISOString();
  const conf = ecom ? childRows('bookingConf', 'ebookno', ecom.ebookno)[0] : undefined;
  const etd = toIsoOrNull(booking.polAt);
  const validTo =
    toIsoOrNull(conf?.bkgCutoff) ??
    (etd ? new Date(+new Date(etd) - cutoffHours(booking.loadPortId, booking.polTerminal) * HOUR_MS).toISOString() : null) ??
    toIsoOrNull(booking.bookDeadline) ??
    croDate;
  return { croDate, validTo };
}

export function croReleaseStatus(source: CroSource, qtyReleased: number, hold = paymentHold(source.booking.book_no)): CROReleaseStatus {
  if (eq(source.booking.status, 'D')) return 'Cancelled';
  if (source.qtyBooked > 0 && qtyReleased >= source.qtyBooked) return 'Released';
  if (hold) return 'Blocked';
  return 'Eligible';
}

const printsOf = (booking: Row): Record<string, number> => (booking.ecomCroPrints as Record<string, number> | undefined) ?? {};

export const croPrintCount = (source: CroSource): number => num(printsOf(source.booking)[source.croNo]);

/** CROListDTO for a source. */
export function mapCro(source: CroSource): CROListDTO {
  const { booking } = source;
  const qtyReleased = Math.min(source.qtyBooked, releasedContainers(source).length);
  const { croDate, validTo } = croDates(source);
  return {
    croNo: source.croNo,
    bookingNo: str(booking.book_no),
    vessel: vesselName(booking.vesselCode),
    voyage: str(booking.voyageCode),
    loadPort: portLabel(booking.loadPortId),
    dischargePort: portLabel(booking.dischargePortId),
    eqpType: source.eqpType,
    qtyBooked: source.qtyBooked,
    qtyReleased,
    emptyReleaseDepot: emptyReleaseDepot(source),
    croDate,
    validTo,
    printStatus: croPrintCount(source) > 0 || qtyReleased > 0 ? 'Y' : 'N',
    releaseStatus: croReleaseStatus(source, qtyReleased),
  };
}

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

/**
 * Eligibility for releasing (more) empties: blocked by a payment hold, a cancelled booking or an
 * expired validity. Customs holds have no source in the fixtures. Pure, so tests can pin `today`.
 */
export function computeCroEligibility(
  row: Pick<CROListDTO, 'releaseStatus' | 'validTo'> & { paymentHold?: boolean; customsHold?: boolean },
  today = todayIsoDate(),
): CROEligibility {
  const reasons: string[] = [];
  if (row.paymentHold) reasons.push('Payment hold is active for this booking.');
  if (row.customsHold) reasons.push('Customs hold prevents empty container release.');
  if (row.releaseStatus === 'Blocked' && reasons.length === 0) reasons.push('Release status is blocked.');
  if (row.validTo.slice(0, 10) < today) reasons.push('CRO validity date has expired.');
  if (row.releaseStatus === 'Cancelled') reasons.push('This container release order has been cancelled.');
  const eligible = reasons.length === 0 && (row.releaseStatus === 'Eligible' || row.releaseStatus === 'Released');
  return { eligible, reasons };
}

export const croEligibilityOf = (source: CroSource, today?: string): CROEligibility =>
  computeCroEligibility({ ...mapCro(source), paymentHold: paymentHold(source.booking.book_no) }, today);

export function croContainers(source: CroSource): CROContainerRow[] {
  return source.cargo
    .filter(c => str(c.eqpId))
    .map(c => ({ containerNo: str(c.eqpId), eqpSize: normType(c.eqpTypeId) || source.eqpType, sealNo: str(c.seal1No) || undefined }));
}

/** CRODTO for a CRO number, or null. */
export function croDetail(croNo: string): CRODTO | null {
  const source = findCroSource(croNo);
  if (!source) return null;
  const row = mapCro(source);
  const { booking } = source;
  const call = db.schedules.find(
    s => eq(s.vessel, booking.vesselCode) && eq(s.voyage, booking.voyageCode) && eq(s.port, booking.loadPortId),
  );
  const prints = croPrintCount(source);
  return {
    ...row,
    containers: croContainers(source),
    eligibility: computeCroEligibility({ ...row, paymentHold: paymentHold(booking.book_no) }),
    polArrival: toIsoOrNull(call?.arrdate) ?? undefined,
    polDeparture: toIsoOrNull(call?.depdate) ?? toIsoOrNull(booking.polAt) ?? undefined,
    printCount: prints > 0 ? prints : row.printStatus === 'Y' ? 1 : 0,
  };
}

export const croList = (): CROListDTO[] =>
  croSources().map(mapCro).sort((a, b) => +new Date(b.croDate) - +new Date(a.croDate));

/** Inclusive YYYY-MM-DD filter on the CRO date. */
export function filterCros(rows: CROListDTO[], fromDate?: string | null, toDate?: string | null): CROListDTO[] {
  return rows.filter(row => {
    const day = row.croDate.slice(0, 10);
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  });
}

/** Eligibility for a booking number (LRP book_no or e-commerce ebookno / extBookNo). */
export function croEligibilityByBooking(bookingNo: string): CROEligibility {
  const key = str(bookingNo);
  const ecom = findBooking(key);
  const source = croSources().find(
    s => eq(s.booking.book_no, key) || (ecom && (eq(s.booking.book_no, ecom.extBookNo) || eq(s.booking.book_no, ecom.ebookno))),
  );
  if (!source) return { eligible: false, reasons: ['No container release order found for this booking.'] };
  return croEligibilityOf(source);
}

/** Print side effect: counts the print on the booking row. Returns false when the CRO is unknown. */
export function markCroPrinted(croNo: string): boolean {
  const source = findCroSource(croNo);
  if (!source) return false;
  const prints = { ...printsOf(source.booking) };
  prints[source.croNo] = num(prints[source.croNo]) + 1;
  source.booking.ecomCroPrints = prints;
  return true;
}
