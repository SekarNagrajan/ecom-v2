// Modified by Sekar Nagarajan (2026-10-17 00:20)
/**
 * Agency approval queue ← ecombooking / ecomSI / ecom_vgmsolas rows awaiting (or past) agency action.
 * VendorApprovalItem only knows BOOKING | SI | VGM requests, so registration approvals (eCom_Reg_Details
 * isValid P, ECOMRegHistory) cannot be represented here without changing the DTO.
 */
import type { ApprovalStatus, VendorApprovalItem } from '../../../features/vendor-approvals/types/vendor-approvals.types';
import { persistBookingDb } from '../booking-persistence';
import { db, eq, type Row } from '../db';
import { persistSiDb } from '../si-persistence';
import { persistVgmDb } from '../vgm-persistence';
import { formatListDate } from './format';
import { portLabel } from './masters.bridge';
import { companyNameFor } from './users.bridge';

const str = (v: unknown) => String(v ?? '').trim();

/** ecombooking.ebook_status → queue status (D draft, T template, I cancelled are not agency requests). */
export const BOOKING_APPROVAL: Record<string, ApprovalStatus> = { S: 'PENDING', P: 'PENDING', M: 'PENDING', A: 'APPROVED', C: 'APPROVED', V: 'REJECTED' };
/** ecomSI.status → queue status (D draft, I cancelled skipped). */
export const SI_APPROVAL: Record<string, ApprovalStatus> = { S: 'PENDING', A: 'APPROVED', C: 'APPROVED', V: 'REJECTED' };
/** ecom_vgmsolas.status → queue status (A = filed, awaiting confirmation). */
export const VGM_APPROVAL: Record<string, ApprovalStatus> = { P: 'PENDING', A: 'PENDING', C: 'APPROVED', I: 'REJECTED' };

const ID_PREFIX = { BOOKING: 'BKG', SI: 'SI', VGM: 'VGM' } as const;

interface Sources {
  bookings?: Row[];
  bookingCust?: Row[];
  si?: Row[];
  vgm?: Row[];
  users?: Row[];
}

function bookingParty(ebookno: unknown, bookingCust: Row[]) {
  return bookingCust.find(c => eq(c.ebookno, ebookno) && eq(c.custTypeId, 'AP') && str(c.name)) ?? bookingCust.find(c => eq(c.ebookno, ebookno) && str(c.name));
}

export function mapBookingApproval(b: Row, bookingCust: Row[], users: Row[]): VendorApprovalItem | null {
  const status = BOOKING_APPROVAL[str(b.ebook_status).toUpperCase()];
  if (!status) return null;
  return {
    id: `${ID_PREFIX.BOOKING}:${str(b.ebookno)}`,
    referenceNo: str(b.extBookNo) || str(b.ebookno),
    customerName: str(bookingParty(b.ebookno, bookingCust)?.name) || companyNameFor(str(b.cust_code), users, bookingCust),
    submittedDate: formatListDate(b.submitted_date ?? b.dateup ?? b.datecr),
    type: 'BOOKING',
    originPort: portLabel(str(b.originPortId) || str(b.loadPortId)),
    destPort: portLabel(str(b.finalPortId) || str(b.dischargePortId)),
    status,
  };
}

export function mapSiApproval(s: Row, bookingCust: Row[], users: Row[]): VendorApprovalItem | null {
  const status = SI_APPROVAL[str(s.status).toUpperCase()];
  if (!status) return null;
  return {
    id: `${ID_PREFIX.SI}:${str(s.eSINo)}`,
    referenceNo: str(s.eSINo),
    customerName: companyNameFor(str(s.custcode), users, bookingCust),
    submittedDate: formatListDate(s.ChgDate ?? s.CrDate),
    type: 'SI',
    originPort: portLabel(str(s.pol) || str(s.pla)),
    destPort: portLabel(str(s.pod) || str(s.pld)),
    status,
  };
}

export function mapVgmApproval(v: Row, bookings: Row[], si: Row[], bookingCust: Row[], users: Row[]): VendorApprovalItem | null {
  const status = VGM_APPROVAL[str(v.status).toUpperCase()];
  if (!status) return null;
  const booking = bookings.find(b => eq(b.extBookNo, v.book_no) || eq(b.ebookno, v.book_no));
  const instruction = si.find(s => eq(s.bookno, v.book_no));
  return {
    id: `${ID_PREFIX.VGM}:${str(v.id)}`,
    referenceNo: str(v.vgm_ref_number) || str(v.VGM_order_Number) || `VGM-${str(v.id)}`,
    customerName: str(v.VGM_Company_Name) || (booking ? companyNameFor(str(booking.cust_code), users, bookingCust) : '') || companyNameFor(str(instruction?.custcode), users, bookingCust),
    submittedDate: formatListDate(v.DateUp ?? v.Datecr),
    type: 'VGM',
    originPort: portLabel(str(booking?.originPortId) || str(instruction?.pol)),
    destPort: portLabel(str(booking?.finalPortId) || str(instruction?.pod)),
    status,
  };
}

const rawDate = (item: VendorApprovalItem) => +new Date(item.submittedDate.replace(/^(\d{2})-(\w{3})-(\d{4})/, '$2 $1 $3')) || 0;

/** The queue, newest first. */
export function vendorApprovals(src: Sources = {}): VendorApprovalItem[] {
  const bookings = src.bookings ?? db.bookings;
  const bookingCust = src.bookingCust ?? db.bookingCust;
  const si = src.si ?? db.shippingInstructions;
  const vgm = src.vgm ?? db.vgm;
  const users = src.users ?? db.users;
  const items: VendorApprovalItem[] = [];
  for (const b of bookings) { const i = mapBookingApproval(b, bookingCust, users); if (i) items.push(i); }
  for (const s of si) { const i = mapSiApproval(s, bookingCust, users); if (i) items.push(i); }
  for (const v of vgm) { const i = mapVgmApproval(v, bookings, si, bookingCust, users); if (i) items.push(i); }
  return items.sort((a, b) => rawDate(b) - rawDate(a));
}

/**
 * Approve / reject: writes the matching legacy status code back onto the fixture row.
 * When mutating the live `db` (no `src` override for that domain), persists via the
 * Booking / SI / VGM runtime overlays so the decision survives refresh.
 */
export function applyApprovalStatus(id: string, status: Exclude<ApprovalStatus, 'PENDING'>, src: Sources = {}): boolean {
  const [prefix, ...rest] = id.split(':');
  const key = rest.join(':');
  const approved = status === 'APPROVED';
  if (prefix === ID_PREFIX.BOOKING) {
    const live = !src.bookings;
    const row = (src.bookings ?? db.bookings).find(b => eq(b.ebookno, key));
    if (!row) return false;
    row.ebook_status = approved ? 'A' : 'V';
    if (live) persistBookingDb();
    return true;
  }
  if (prefix === ID_PREFIX.SI) {
    const live = !src.si;
    const row = (src.si ?? db.shippingInstructions).find(s => eq(s.eSINo, key));
    if (!row) return false;
    row.status = approved ? 'A' : 'V';
    if (live) persistSiDb();
    return true;
  }
  if (prefix === ID_PREFIX.VGM) {
    const live = !src.vgm;
    const row = (src.vgm ?? db.vgm).find(v => eq(v.id, key));
    if (!row) return false;
    row.status = approved ? 'C' : 'I';
    if (live) persistVgmDb();
    return true;
  }
  return false;
}
