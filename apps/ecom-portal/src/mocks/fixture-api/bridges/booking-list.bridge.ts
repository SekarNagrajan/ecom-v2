// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Maps extracted `ecombooking` rows onto the BookingListDTO the booking list screen already renders.
 * Used by src/mocks/booking.handlers.ts; returns null when no booking fixtures were extracted.
 */
import type { BookingListDTO, BookingListStatus } from '../../../features/booking/types/booking-list.types';
import { db, eq, hasFixtures, type Row } from '../db';
import { formatListDate } from './format';
import { equipmentTeus, portLabel } from './masters.bridge';

/**
 * ecombooking.ebook_status → list status.
 * Official wording comes from statusDescriptions (module BKG): D Draft, S Submitted, P Awaiting Acceptance,
 * C Confirmed, L Cancelled, V Rejected, I Void, X Cancellation Submitted. The list's status union has no
 * "Void" / "Cancellation Submitted", so I and X render as Cancelled. 'A' (accepted by the agency — the
 * dominant value in the sample, always with extBookNo set) and 'M' (amendment requested) are not in
 * statusDescriptions and map to Confirmed / Submitted.
 */
export const BOOKING_LIST_STATUS: Record<string, BookingListStatus> = {
  D: 'Draft',
  S: 'Submitted',
  M: 'Submitted', // amendment requested
  P: 'Awaiting Acceptance', // pending with agency
  A: 'Confirmed', // accepted by agency
  C: 'Confirmed',
  V: 'Rejected', // declined
  I: 'Cancelled', // void
  L: 'Cancelled',
  X: 'Cancelled', // cancellation submitted
};

/** ecombooking rows saved as templates (ebook_status T) are never listed as bookings. */
export const isTemplateRow = (b: Row) => String(b.ebook_status ?? '').toUpperCase() === 'T';

/** Booking header by online reference (ebookno) or agency booking number (extBookNo); undefined when unknown. */
export function findBookingRow(id: string): Row | undefined {
  const key = String(id ?? '').trim();
  if (!key) return undefined;
  return db.bookings.find(b => eq(b.ebookno, key)) ?? db.bookings.find(b => b.extBookNo && eq(b.extBookNo, key));
}

/** Template rows (ebook_status T), newest first. */
export function fixtureBookingTemplateRows(): Row[] {
  return db.bookings.filter(isTemplateRow).sort((a, b) => +new Date(b.dateup) - +new Date(a.dateup));
}

/** TEUs per cargo line from the equipments master (Teus column); unknown codes count 1 for 20' boxes, else 2. */
const teuOf = (c: Row) => Number(c.quantity ?? 1) * equipmentTeus(c.eqpSize ?? c.eqpType);

export function mapBookingRow(b: Row, cargo: Row[]): BookingListDTO {
  const status = BOOKING_LIST_STATUS[String(b.ebook_status ?? '').toUpperCase()] ?? 'Submitted';
  const confirmed = status === 'Confirmed' ? formatListDate(b.dateup) : '';
  return {
    id: String(b.ebookno),
    bookingNo: String(b.extBookNo ?? ''),
    onlineRefNo: String(b.ebookno),
    agencyRefNo: String(b.AgencyRefNo ?? ''),
    status,
    origin: portLabel(b.originPortId),
    delivery: portLabel(b.finalPortId),
    createdDate: formatListDate(b.datecr),
    confirmedDate: confirmed || undefined,
    dgStatus: cargo.some(c => String(c.dgFlag ?? '').toUpperCase() === 'Y') ? 'Y' : 'N',
    teusCount: cargo.reduce((sum, c) => sum + teuOf(c), 0),
    submittedDate: formatListDate(b.submitted_date),
  };
}

/** Rows grouped by a key column, lower-cased. */
export function groupBy(rows: Row[], column: string): Map<string, Row[]> {
  const out = new Map<string, Row[]>();
  for (const r of rows) {
    const k = String(r[column] ?? '').trim().toLowerCase();
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(r);
  }
  return out;
}

/** List rows from the extracted bookings (templates excluded), newest first; null when no fixtures. */
export function fixtureBookingList(): BookingListDTO[] | null {
  if (!hasFixtures('bookings')) return null;
  const cargoByBooking = groupBy(db.bookingCargo, 'ebookno');
  return db.bookings
    .filter(b => !isTemplateRow(b))
    .sort((a, b) => +new Date(b.dateup) - +new Date(a.dateup))
    .map(b => mapBookingRow(b, cargoByBooking.get(String(b.ebookno).trim().toLowerCase()) ?? []));
}
