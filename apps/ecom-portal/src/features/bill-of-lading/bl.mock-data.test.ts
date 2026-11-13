// Modified by Sekar Nagarajan (2026-10-16 23:20)
import { beforeEach, describe, expect, it } from 'vitest';

import { fixtureBlList } from '../../mocks/fixture-api/bridges/bl-list.bridge';
import { db, eq, resetDb } from '../../mocks/fixture-api/db';
import { getMockBLDetail, mockMCNDetailsSeed, VOYAGE_CLOSED_BL_NOS } from './mocks/bl.mock';
import { BL_STATUS_LABELS } from './types/bl.types';
import { getBLListStatusColor, getBLStatusColor, isBatchOriginalPrintEligible } from './utils/bl-status';

describe('bill-of-lading fixture-derived mock data', () => {
  beforeEach(() => resetDb());

  it('covers all primary BL row statuses from the extracted ecomSI rows', () => {
    const statuses = new Set(fixtureBlList()!.map((row) => row.status));
    expect(statuses.has('D')).toBe(true);
    expect(statuses.has('S')).toBe(true);
    expect(statuses.has('C')).toBe(true);
    expect(statuses.has('I')).toBe(true);
  });

  it('links every B/L row to the SI and booking number of its ecomSI row', () => {
    for (const row of fixtureBlList()!) {
      const si = db.shippingInstructions.find((s) => eq(s.eSINo, row.siNo));
      expect(si, row.blNo).toBeTruthy();
      expect(row.bookingNo).toBe(String(si!.bookno));
      expect(row.statusLabel).toBe(BL_STATUS_LABELS[row.status]);
    }
  });

  it('marks confirmed, unlocked rows as batch-print eligible', () => {
    const rows = fixtureBlList()!;
    const confirmed = rows.filter((r) => r.status === 'C');
    expect(confirmed.length).toBeGreaterThan(0);
    expect(confirmed.every((r) => r.printStatus === 'Y')).toBe(true);
    expect(confirmed.filter((r) => !r.isLocked).every(isBatchOriginalPrintEligible)).toBe(true);
    expect(rows.filter((r) => r.status === 'D').every((r) => r.printStatus === 'N')).toBe(true);
  });

  it('keeps the DEV fall-back shim in sync with the fixtures', () => {
    const [row] = fixtureBlList()!;
    expect(getMockBLDetail(row.blNo)?.blNo).toBe(row.blNo);
    expect(getMockBLDetail('UNKNOWN')).toBeUndefined();
    expect(typeof VOYAGE_CLOSED_BL_NOS.has(row.blNo)).toBe('boolean');
    const withMcn = fixtureBlList()!.find((r) => r.mcnNo);
    expect(withMcn).toBeTruthy();
    expect(mockMCNDetailsSeed[withMcn!.mcnNo!]?.blNo).toBe(withMcn!.blNo);
    expect(mockMCNDetailsSeed['MCN-NOPE']).toBeUndefined();
  });
});

describe('BL status helpers', () => {
  it('maps status codes to labels', () => {
    expect(BL_STATUS_LABELS.D).toBe('Draft');
    expect(BL_STATUS_LABELS.I).toBe('Issued');
  });

  it('maps status codes to tag colors', () => {
    expect(getBLStatusColor('I')).toBe('blue');
    expect(getBLStatusColor('D')).toBe('default');
    expect(getBLStatusColor('S')).toBe('warning');
    expect(getBLStatusColor('C')).toBe('success');
  });

  it('uses error color for locked list rows', () => {
    expect(getBLListStatusColor({ status: 'D', isLocked: true })).toBe('error');
    expect(getBLListStatusColor({ status: 'D', isLocked: false })).toBe('default');
  });
});
