// Modified by Sekar Nagarajan (2026-08-31 16:45)
import { describe, expect, it } from 'vitest';

import { mockBLListSeed } from './mocks/bl.mock';
import { BL_STATUS_LABELS } from './types/bl.types';
import { getBLListStatusColor, getBLStatusColor } from './utils/bl-status';

describe('bill-of-lading mock data', () => {
  it('covers all primary BL row statuses', () => {
    const statuses = new Set(mockBLListSeed.map((row) => row.status));
    expect(statuses.has('D')).toBe(true);
    expect(statuses.has('S')).toBe(true);
    expect(statuses.has('C')).toBe(true);
    expect(statuses.has('I')).toBe(true);
  });

  it('links BL-998824 to SI SIN998285', () => {
    const row = mockBLListSeed.find((r) => r.blNo === 'BL-998824');
    expect(row?.siNo).toBe('SIN998285');
    expect(row?.bookingNo).toBe('BKG-778901');
  });

  it('includes batch-print eligible confirmed rows', () => {
    const batchRows = mockBLListSeed.filter((r) => r.blNo.startsWith('BL-BATCH-'));
    expect(batchRows.length).toBeGreaterThanOrEqual(3);
    expect(batchRows.every((r) => r.status === 'C' && r.printStatus === 'Y')).toBe(true);
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
