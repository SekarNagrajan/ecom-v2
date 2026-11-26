// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * Maps extracted `ecomSI` rows (editbl=0) onto the SIListDTO the SI list screen already renders,
 * plus one "Create SI" row per confirmed booking that has no SI yet (SISummary.jsp parity).
 * Used by src/mocks/si.handlers.ts; returns null when no SI fixtures were extracted.
 */
import type { BLStatus, SIListDTO, SIStatus } from '../../../features/shipping-instruction/types/si.types';
import { db, eq, hasFixtures, type Row } from '../db';
import { BOOKING_STATUS, label } from '../status-maps';
import { toIsoOrNull } from './format';
import { isAmendment, isPlainSi, latestVersion, portLabel, str } from './si-common.bridge';

/** ecomSI.status → list status. Cancelled SIs (I) are not listed (SISummary.jsp hides them). */
export const SI_LIST_STATUS: Record<string, SIStatus> = {
  D: 'Draft',
  S: 'Submitted',
  A: 'Accepted',
  C: 'Accepted', // confirmed by agency
  V: 'Declined',
};

/** Status of the latest B/L amendment version (editbl ≥ 1) → SI list "B/L status" column. */
export const SI_BL_STATUS: Record<string, BLStatus> = {
  D: 'Draft',
  S: 'Draft',
  A: 'Confirmed',
  C: 'Confirmed',
  P: 'Issued',
  I: 'Issued',
};

/** Bookings keyed by both the agency booking number and the online reference, lower-cased. */
export function bookingIndex(bookings: Row[]): Map<string, Row> {
  const out = new Map<string, Row>();
  for (const b of bookings) {
    for (const key of [b.extBookNo, b.ebookno]) {
      const k = String(key ?? '').trim().toLowerCase();
      if (k && !out.has(k)) out.set(k, b);
    }
  }
  return out;
}

/** B/L status per blno from the amendment versions; a blno without amendments is a Draft B/L. */
export function blStatusIndex(rows: Row[]): Map<string, BLStatus> {
  const byBl = new Map<string, Row[]>();
  for (const r of rows) {
    if (!isAmendment(r) || !str(r.blno)) continue;
    const k = str(r.blno).toLowerCase();
    byBl.set(k, [...(byBl.get(k) ?? []), r]);
  }
  const out = new Map<string, BLStatus>();
  for (const [k, versions] of byBl) {
    const latest = latestVersion(versions);
    out.set(k, SI_BL_STATUS[str(latest?.status).toUpperCase()] ?? 'Draft');
  }
  return out;
}

/** true when an active SI lock (ecomSI_locks.Status = A) exists for the booking or B/L number. */
export const isSiLocked = (si: Row, locks: Row[]) =>
  locks.some(
    l => eq(l.Status, 'A') && ((str(si.bookno) && eq(l.Book_No, si.bookno)) || (str(si.blno) && eq(l.Bl_No, si.blno))),
  );

export function mapSiRow(si: Row, booking: Row | null, blStatus?: BLStatus | null, locked = false): SIListDTO {
  const code = String(si.status ?? '').toUpperCase();
  const blNo = str(si.blno) || null;
  return {
    id: String(si.eSINo),
    siNo: String(si.eSINo),
    bookingNo: String(si.bookno ?? ''),
    blNo,
    status: locked ? 'Locked' : (SI_LIST_STATUS[code] ?? 'Draft'),
    blStatus: blNo ? (blStatus ?? 'Draft') : null,
    agencyRefNo: String(booking?.AgencyRefNo ?? ''),
    origin: portLabel(si.pla ?? si.pol, si.plaHeaderName ?? si.polHeaderName),
    delivery: portLabel(si.pld ?? si.pod, si.pldHeaderName ?? si.podHeaderName),
    submittedDate: code === 'D' ? null : toIsoOrNull(si.CrDate),
    createdDate: toIsoOrNull(si.CrDate),
    bookingStatus: booking ? label(BOOKING_STATUS, booking.ebook_status) : null,
  };
}

/** "Create SI" row for a confirmed booking without an SI; the wizard opens it by booking number. */
export function mapCreateSiRow(booking: Row): SIListDTO {
  const bookingNo = str(booking.extBookNo) || str(booking.ebookno);
  return {
    id: bookingNo,
    siNo: null,
    bookingNo,
    blNo: null,
    status: 'Create SI',
    blStatus: null,
    agencyRefNo: str(booking.agencyRefNo),
    origin: portLabel(booking.originPortId ?? booking.loadPortId),
    delivery: portLabel(booking.finalPortId ?? booking.dischargePortId),
    submittedDate: null,
    createdDate: toIsoOrNull(booking.datecr),
    bookingStatus: label(BOOKING_STATUS, booking.ebook_status),
  };
}

/** Confirmed / accepted bookings with an agency booking number and no SI of any kind. */
export function bookingsWithoutSi(bookings: Row[], sis: Row[]): Row[] {
  const withSi = new Set(sis.map(s => str(s.bookno).toLowerCase()).filter(Boolean));
  return bookings.filter(
    b => ['A', 'C'].includes(str(b.ebook_status).toUpperCase()) && str(b.extBookNo) && !withSi.has(str(b.extBookNo).toLowerCase()),
  );
}

/** SI list rows from the fixtures (B/L amendments and cancelled SIs excluded), newest first; null when no fixtures. */
export function fixtureSiList(): SIListDTO[] | null {
  if (!hasFixtures('shippingInstructions')) return null;
  const bookings = bookingIndex(db.bookings);
  const blStatus = blStatusIndex(db.shippingInstructions);
  const rows = db.shippingInstructions
    .filter(si => isPlainSi(si) && String(si.status ?? '').toUpperCase() !== 'I')
    .map(si =>
      mapSiRow(
        si,
        bookings.get(str(si.bookno).toLowerCase()) ?? null,
        blStatus.get(str(si.blno).toLowerCase()) ?? null,
        isSiLocked(si, db.siLocks),
      ),
    );
  const create = bookingsWithoutSi(db.bookings, db.shippingInstructions).map(mapCreateSiRow);
  return [...rows, ...create].sort((a, b) => +new Date(b.createdDate ?? 0) - +new Date(a.createdDate ?? 0));
}
