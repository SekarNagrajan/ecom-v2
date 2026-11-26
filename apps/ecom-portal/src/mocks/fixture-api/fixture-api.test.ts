// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { describe, expect, it } from 'vitest';

import { latestBlVersions, mapBlRow } from './bridges/bl-list.bridge';
import { BOOKING_LIST_STATUS, groupBy, mapBookingRow } from './bridges/booking-list.bridge';
import { formatListDate, toIsoOrNull } from './bridges/format';
import { mapPort } from './bridges/lookups.bridge';
import { bookingIndex, mapSiRow } from './bridges/si-list.bridge';
import { db, eq, nextRef } from './db';
import { BOOKING_STATUS, label } from './status-maps';

const booking = {
  ebookno: 'EBK260001', extBookNo: 'BKG-778901', AgencyRefNo: 'AG-1', ebook_status: 'C',
  originPortId: 'CNSHA', finalPortId: 'AEJEA',
  datecr: '2026-10-01T04:00:00Z', dateup: '2026-10-03T04:00:00Z', submitted_date: '2026-10-02T04:00:00Z',
};
const cargo = [
  { ebookno: 'EBK260001', eqpSize: '20', eqpType: '20GP', quantity: 2, dgFlag: 'N' },
  { ebookno: 'EBK260001', eqpSize: '40', eqpType: '40HC', quantity: 1, dgFlag: 'Y' },
];

describe('fixture-api db helpers', () => {
  it('exposes every known table as an array even without fixtures', () => {
    expect(Array.isArray(db.bookings)).toBe(true);
    expect(Array.isArray(db.ports)).toBe(true);
  });

  it('compares codes case-insensitively and ignores surrounding whitespace', () => {
    expect(eq(' cnsha ', 'CNSHA')).toBe(true);
    expect(eq(null, '')).toBe(true);
    expect(eq('A', 'B')).toBe(false);
  });

  it('generates sequential demo references', () => {
    expect(nextRef('TST')).toMatch(/^TST\d{2}0001$/);
    expect(nextRef('TST')).toMatch(/^TST\d{2}0002$/);
  });

  it('falls back to the raw code for unknown statuses', () => {
    expect(label(BOOKING_STATUS, 'C')).toBe('Confirmed');
    expect(label(BOOKING_STATUS, 'ZZ')).toBe('ZZ');
  });
});

describe('date formatting', () => {
  it('formats as dd-MMM-yyyy HH:mm in local time', () => {
    expect(formatListDate(new Date(2026, 2, 5, 9, 7))).toBe('05-Mar-2026 09:07');
  });
  it('returns empty / null for non-dates', () => {
    expect(formatListDate('not a date')).toBe('');
    expect(formatListDate(null)).toBe('');
    expect(toIsoOrNull('')).toBeNull();
    expect(toIsoOrNull('2026-10-01T04:00:00Z')).toBe('2026-10-01T04:00:00.000Z');
  });
});

describe('booking list bridge', () => {
  it('maps an ecombooking row + cargo onto BookingListDTO', () => {
    const row = mapBookingRow(booking, cargo);
    expect(row.id).toBe('EBK260001');
    expect(row.bookingNo).toBe('BKG-778901');
    expect(row.onlineRefNo).toBe('EBK260001');
    expect(row.status).toBe('Confirmed');
    expect(row.origin).toBe('CNSHA - SHANGHAI HONGQIAO INTERNATI:ONAL APT'); // ports master name
    expect(row.delivery).toBe('AEJEA - JEBEL ALI, UAE');
    expect(row.teusCount).toBe(4); // 2 x 20' + 1 x 40' (equipments master Teus)
    expect(row.dgStatus).toBe('Y');
    expect(row.confirmedDate).toBeTruthy();
    expect(row.createdDate).toMatch(/^\d{2}-[A-Z][a-z]{2}-\d{4} \d{2}:\d{2}$/);
  });

  it('defaults unknown status codes to Submitted and leaves confirmedDate empty', () => {
    const row = mapBookingRow({ ...booking, ebook_status: 'ZZ', extBookNo: null }, []);
    expect(row.status).toBe('Submitted');
    expect(row.bookingNo).toBe('');
    expect(row.confirmedDate).toBeUndefined();
    expect(row.teusCount).toBe(0);
    expect(row.dgStatus).toBe('N');
  });

  it('covers every status the EJB layer emits for list rows', () => {
    for (const code of ['D', 'S', 'M', 'P', 'A', 'C', 'V', 'I']) expect(BOOKING_LIST_STATUS[code]).toBeTruthy();
  });

  it('groups child rows by parent key case-insensitively', () => {
    const grouped = groupBy([{ ebookno: 'ebk1' }, { ebookno: 'EBK1' }, { ebookno: 'EBK2' }], 'ebookno');
    expect(grouped.get('ebk1')).toHaveLength(2);
    expect(grouped.get('ebk2')).toHaveLength(1);
  });
});

describe('SI list bridge', () => {
  const si = { eSINo: 'ESI1', bookno: 'BKG-778901', blno: null, status: 'A', pol: 'CNSHA', pod: 'AEJEA', pla: null, pld: 'AEDXB', CrDate: '2026-10-05T01:00:00Z', ChgDate: '2026-10-06T01:00:00Z' };

  it('maps an ecomSI row onto SIListDTO and links the booking', () => {
    const row = mapSiRow(si, booking);
    expect(row.status).toBe('Accepted');
    expect(row.blNo).toBeNull();
    expect(row.blStatus).toBeNull();
    expect(row.agencyRefNo).toBe('AG-1');
    expect(row.origin).toBe('CNSHA - SHANGHAI HONGQIAO INTERNATI:ONAL APT'); // header name missing → ports master
    expect(row.delivery).toMatch(/^AEDXB - .+/);
    expect(row.submittedDate).toBe('2026-10-05T01:00:00.000Z');
    expect(row.bookingStatus).toBe('Confirmed');
  });

  it('drafts have no submitted date and unknown bookings no agency ref', () => {
    const row = mapSiRow({ ...si, status: 'D' }, null);
    expect(row.status).toBe('Draft');
    expect(row.submittedDate).toBeNull();
    expect(row.agencyRefNo).toBe('');
    expect(row.bookingStatus).toBeNull();
  });

  it('indexes bookings by agency number and online reference', () => {
    const index = bookingIndex([booking]);
    expect(index.get('bkg-778901')).toBe(booking);
    expect(index.get('ebk260001')).toBe(booking);
  });
});

describe('B/L list bridge', () => {
  const v1 = { eSINo: 'EBL1', blno: 'BL-1', bookno: 'BKG-778901', status: 'S', editbl: 1, blversion: 1, appversion: 'V1', pol: 'CNSHA', pod: 'AEJEA', CrDate: '2026-10-07T00:00:00Z', ChgDate: '2026-10-07T00:00:00Z' };
  const v2 = { ...v1, eSINo: 'EBL2', status: 'A', blversion: 2, appversion: 'V2', ChgDate: '2026-10-08T00:00:00Z' };

  it('keeps only the latest version per blno and ignores plain SIs', () => {
    const rows = latestBlVersions([v1, v2, { ...v1, eSINo: 'ESI9', editbl: 0 }]);
    expect(rows).toHaveLength(1);
    expect(rows[0].eSINo).toBe('EBL2');
  });

  it('maps the amendment onto BLListDTO', () => {
    const row = mapBlRow(v2, booking, true);
    expect(row.blNo).toBe('BL-1');
    expect(row.status).toBe('C');
    expect(row.statusLabel).toBe('Confirmed');
    expect(row.appVersion).toBe('2');
    expect(row.confirmedDate).toBe('2026-10-08T00:00:00.000Z');
    expect(row.hasInsurance).toBe(true);
    expect(row.agencyRefNo).toBe('AG-1');
    expect(mapBlRow(v1, null, false).confirmedDate).toBeNull();
  });
});

describe('lookup bridge', () => {
  it('normalises port codes and builds the typeahead label', () => {
    expect(mapPort({ portcode: ' cnsha', portname: 'SHANGHAI ' })).toEqual({ portCode: 'CNSHA', portName: 'SHANGHAI', label: 'CNSHA - SHANGHAI' });
  });
});
