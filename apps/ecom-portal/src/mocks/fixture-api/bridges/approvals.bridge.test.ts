// Modified by Sekar Nagarajan (2026-10-17 00:20)
import { describe, expect, it } from 'vitest';

import type { Row } from '../db';
import { applyApprovalStatus, vendorApprovals } from './approvals.bridge';

const bookings: Row[] = [
  { ebookno: 'BKON1', extBookNo: 'SVM001', ebook_status: 'S', cust_code: '20001374', originPortId: 'INNSA', finalPortId: 'AEJEA', submitted_date: '2026-10-16T10:00:00Z', datecr: '2026-10-16T09:00:00Z' },
  { ebookno: 'BKON2', extBookNo: null, ebook_status: 'D', cust_code: '20001374', originPortId: 'INNSA', finalPortId: 'AEJEA', datecr: '2026-10-15T09:00:00Z' },
];
const bookingCust: Row[] = [{ ebookno: 'BKON1', custTypeId: 'AP', custId: '20001374', name: 'Schultz - Romaguera' }];
const si: Row[] = [{ eSINo: 'SIREQ1', bookno: 'SVM001', custcode: '20001374', status: 'V', pol: 'INNSA', pod: 'AEJEA', ChgDate: '2026-10-14T09:00:00Z' }];
const vgm: Row[] = [
  { id: 9, book_no: 'SVM001', status: 'C', vgm_ref_number: 'VGMREF9', VGM_Company_Name: '', DateUp: '2026-10-13T09:00:00Z' },
  { id: 10, book_no: 'SVM001', status: 'A', vgm_ref_number: '', VGM_Company_Name: 'Weighbridge Co', DateUp: '2026-10-12T09:00:00Z' },
];
const users: Row[] = [{ Cust_Code: '20001374', Comp_Name: 'Acme Lines', isValid: 'Y' }];

describe('vendor approvals queue', () => {
  it('maps bookings, SIs and VGMs onto VendorApprovalItem newest first', () => {
    const items = vendorApprovals({ bookings, bookingCust, si, vgm, users });
    expect(items.map(i => i.id)).toEqual(['BKG:BKON1', 'SI:SIREQ1', 'VGM:9', 'VGM:10']);
    expect(items[0]).toMatchObject({ referenceNo: 'SVM001', type: 'BOOKING', status: 'PENDING', customerName: 'Schultz - Romaguera', originPort: 'INNSA - NHAVA SHEVA,MUMBAI', destPort: 'AEJEA - JEBEL ALI, UAE' });
    expect(items[1]).toMatchObject({ type: 'SI', status: 'REJECTED', customerName: 'Schultz - Romaguera' });
    expect(items[2]).toMatchObject({ type: 'VGM', status: 'APPROVED', referenceNo: 'VGMREF9', originPort: 'INNSA - NHAVA SHEVA,MUMBAI', destPort: 'AEJEA - JEBEL ALI, UAE' });
    expect(items[3]).toMatchObject({ status: 'PENDING', referenceNo: 'VGM-10', customerName: 'Weighbridge Co' });
    expect(items[0].submittedDate).toMatch(/^\d{2}-[A-Z][a-z]{2}-\d{4} \d{2}:\d{2}$/);
  });

  it('builds a non-empty queue from the real fixtures with every status represented', () => {
    const items = vendorApprovals();
    expect(items.length).toBeGreaterThan(10);
    expect(new Set(items.map(i => i.status))).toEqual(new Set(['PENDING', 'APPROVED', 'REJECTED']));
    expect(new Set(items.map(i => i.type))).toEqual(new Set(['BOOKING', 'SI', 'VGM']));
    expect(items.every(i => i.customerName && i.referenceNo)).toBe(true);
  });

  it('writes approve / reject back onto the legacy status codes', () => {
    const b = bookings.map(r => ({ ...r }));
    const s = si.map(r => ({ ...r }));
    const v = vgm.map(r => ({ ...r }));
    expect(applyApprovalStatus('BKG:BKON1', 'APPROVED', { bookings: b })).toBe(true);
    expect(b[0].ebook_status).toBe('A');
    expect(applyApprovalStatus('SI:SIREQ1', 'REJECTED', { si: s })).toBe(true);
    expect(s[0].status).toBe('V');
    expect(applyApprovalStatus('VGM:10', 'APPROVED', { vgm: v })).toBe(true);
    expect(v[1].status).toBe('C');
    expect(applyApprovalStatus('VGM:404', 'APPROVED', { vgm: v })).toBe(false);
    expect(applyApprovalStatus('X:1', 'APPROVED')).toBe(false);
  });
});
