// Modified by Sekar Nagarajan (2026-10-16 23:15)
/**
 * Activity timeline for GET /api/booking/:id/activity, derived from the ecombooking audit columns
 * (datecr / submitted_date / dateup / ebook_status / declined_remarks) and ecombooking_cancel rows.
 */
import type { BookingActivityEvent } from '../../../features/booking/types/booking.types';
import { db, eq, type Row } from '../db';
import { str } from './booking-shared.bridge';
import { findBookingRow } from './booking-list.bridge';
import { formatListDate } from './format';

/** Cancel rows for a booking: matched on the online reference or the agency booking number. */
export function cancelRowsFor(b: Row, cancels: Row[]): Row[] {
  return cancels.filter(c => (str(c.eBookNo) && eq(c.eBookNo, b.ebookno)) || (str(b.extBookNo) && eq(c.extBookNo, b.extBookNo)));
}

export function activityFromRows(b: Row, cancels: Row[]): BookingActivityEvent[] {
  const id = str(b.ebookno);
  const status = str(b.ebook_status).toUpperCase();
  const createdBy = str(b.usercr) || 'Customer User';
  const updatedBy = str(b.userup) || createdBy;
  const events: BookingActivityEvent[] = [
    { id: `${id}-created`, action: status === 'T' ? 'Template Saved' : 'Booking Created', by: createdBy, at: formatListDate(b.datecr) },
  ];
  if (b.submitted_date && !['D', 'T'].includes(status)) {
    events.push({ id: `${id}-submitted`, action: 'Submitted', by: createdBy, at: formatListDate(b.submitted_date) });
  }
  if (str(b.isAmendment).toUpperCase() === 'Y' || status === 'M') {
    events.push({ id: `${id}-amended`, action: 'Amendment Requested', by: updatedBy, at: formatListDate(b.dateup) });
  }
  if (['A', 'C'].includes(status)) {
    events.push({
      id: `${id}-confirmed`,
      action: 'Confirmed',
      by: str(b.agencyid) ? `${str(b.agencyid)} agency` : 'Agency',
      at: formatListDate(b.dateup),
      note: str(b.extBookNo) ? `Booking No. ${str(b.extBookNo)}` : undefined,
    });
  }
  if (status === 'V') {
    events.push({
      id: `${id}-rejected`,
      action: 'Rejected',
      by: str(b.agencyid) ? `${str(b.agencyid)} agency` : 'Agency',
      at: formatListDate(b.dateup),
      note: str(b.declined_remarks) || undefined,
    });
  }
  const sortedCancels = [...cancels].sort((x, y) => +new Date(x.datecr) - +new Date(y.datecr));
  sortedCancels.forEach((c, i) => {
    const note = [str(c.reason), str(c.remarks)].filter(Boolean).join(' — ');
    events.push({
      id: `${id}-cancel-${i + 1}`,
      action: str(c.status).toUpperCase() === 'A' ? 'Cancellation Approved' : 'Cancellation Requested',
      by: str(c.usercr) || createdBy,
      at: formatListDate(c.datecr),
      note: note || undefined,
    });
  });
  if (['I', 'L', 'X'].includes(status) && sortedCancels.length === 0) {
    events.push({ id: `${id}-cancelled`, action: 'Cancelled', by: updatedBy, at: formatListDate(b.dateup), note: str(b.declined_remarks) || undefined });
  }
  return events;
}

export function fixtureBookingActivity(id: string): BookingActivityEvent[] | null {
  const b = findBookingRow(id);
  if (!b) return null;
  return activityFromRows(b, cancelRowsFor(b, db.bookingCancel));
}
