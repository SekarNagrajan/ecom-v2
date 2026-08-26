// Modified by Sekar Nagarajan (2026-08-25 12:20)
import { beforeEach, describe, expect, it } from 'vitest';

import {
  getArrivalNoticeListSnapshot,
  markArrivalNoticePrinted,
  resetArrivalNoticeMockStore,
} from '../../mocks/arrival-notice.handlers';
import {
  getMockArrivalNoticeDetail,
  mockArrivalNoticeListSeed,
} from '../../mocks/arrival-notice.mock-data';
import {
  formatArrivalNoticeAmount,
  getArrivalNoticePrintStatusColor,
} from './types/arrival-notice.types';

describe('arrival-notice mock data', () => {
  it('seeds at least 3 arrival notice list rows', () => {
    expect(mockArrivalNoticeListSeed.length).toBeGreaterThanOrEqual(3);
  });

  it('covers printed and not-printed statuses', () => {
    const statuses = new Set(mockArrivalNoticeListSeed.map((row) => row.printStatus));
    expect(statuses.has('Y')).toBe(true);
    expect(statuses.has('N')).toBe(true);
  });

  it('includes a zero-charges row for conditional charges UI', () => {
    const zeroCharges = mockArrivalNoticeListSeed.find((r) => r.chargesDue === 0);
    expect(zeroCharges?.anNo).toBe('ARN-2003');
  });

  it('links ARN-2001 to B/L ESLSIN123456', () => {
    const row = mockArrivalNoticeListSeed.find((r) => r.anNo === 'ARN-2001');
    expect(row?.blNumber).toBe('ESLSIN123456');
    expect(row?.printStatus).toBe('N');
  });
});

describe('arrival-notice detail seed', () => {
  beforeEach(() => {
    resetArrivalNoticeMockStore();
  });

  it('returns detail with containers and charge lines for ARN-2001', () => {
    const detail = getMockArrivalNoticeDetail('ARN-2001');
    expect(detail?.anNo).toBe('ARN-2001');
    expect(detail?.containers.length).toBeGreaterThan(0);
    expect(detail?.chargeLines.length).toBeGreaterThan(0);
    expect(detail?.freeTime?.days).toBe(7);
  });

  it('returns empty charge lines for zero-dues notice', () => {
    const detail = getMockArrivalNoticeDetail('ARN-2003');
    expect(detail?.chargeLines).toEqual([]);
    expect(detail?.freeTime).toBeUndefined();
  });

  it('flips printStatus to Y when document is printed', () => {
    expect(
      getArrivalNoticeListSnapshot().find((r) => r.anNo === 'ARN-2001')?.printStatus
    ).toBe('N');
    expect(markArrivalNoticePrinted('ARN-2001')).toBe(true);
    expect(
      getArrivalNoticeListSnapshot().find((r) => r.anNo === 'ARN-2001')?.printStatus
    ).toBe('Y');
  });
});

describe('arrival-notice status helpers', () => {
  it('returns ant tag colors for print statuses', () => {
    expect(getArrivalNoticePrintStatusColor('Y')).toBe('success');
    expect(getArrivalNoticePrintStatusColor('N')).toBe('default');
  });

  it('formats amounts with currency', () => {
    expect(formatArrivalNoticeAmount(12540, 'USD')).toBe('12,540.00 USD');
  });
});
