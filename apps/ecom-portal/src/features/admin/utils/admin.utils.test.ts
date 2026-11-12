// Created by Sekar Nagarajan (2026-11-12 14:10)
import { describe, expect, it } from 'vitest';

import { advisoryStatus, menuDisplayName, nextOrder, settleMutation, todayIsoDate } from './admin.utils';

describe('advisoryStatus', () => {
  const today = '2026-11-12';
  it('is inactive when the flag is off regardless of dates', () => {
    expect(advisoryStatus({ isActive: false, effectiveFrom: '2026-01-01', effectiveTo: '' }, today)).toBe('inactive');
  });
  it('is scheduled before the start date', () => {
    expect(advisoryStatus({ isActive: true, effectiveFrom: '2026-12-01', effectiveTo: '' }, today)).toBe('scheduled');
  });
  it('is expired after the end date and active inside the window or when open-ended', () => {
    expect(advisoryStatus({ isActive: true, effectiveFrom: '2026-10-01', effectiveTo: '2026-10-31' }, today)).toBe('expired');
    expect(advisoryStatus({ isActive: true, effectiveFrom: '2026-10-01', effectiveTo: '2026-12-31' }, today)).toBe('active');
    expect(advisoryStatus({ isActive: true, effectiveFrom: '2026-10-01', effectiveTo: '' }, today)).toBe('active');
    expect(advisoryStatus({ isActive: true, effectiveFrom: today, effectiveTo: today }, today)).toBe('active');
  });
  it('formats today as an ISO calendar date', () => {
    expect(todayIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('menuDisplayName', () => {
  it('maps known RefNos to the portal module title (OBLPrint → Bill of Lading)', () => {
    expect(menuDisplayName({ menuName: 'OBLPrint', refNo: 'BOL' })).toBe('Bill of Lading');
    expect(menuDisplayName({ menuName: 'Booking', refNo: 'bkg' })).toBe('Booking');
  });
  it('falls back to the stored name for unknown RefNos', () => {
    expect(menuDisplayName({ menuName: 'Stats Report', refNo: 'STR' })).toBe('Stats Report');
    expect(menuDisplayName({ menuName: 'Help' })).toBe('Help');
  });
});

describe('nextOrder', () => {
  it('returns max + 1 and 1 for an empty list', () => {
    expect(nextOrder([{ orderNo: 3 }, { orderNo: 7 }])).toBe(8);
    expect(nextOrder([{ sortOrder: 2 }])).toBe(3);
    expect(nextOrder([])).toBe(1);
  });
});

describe('settleMutation', () => {
  it('swallows rejections (the hook already toasted) and resolves', async () => {
    await expect(settleMutation(() => Promise.reject(new Error('boom')))).resolves.toBeUndefined();
    await expect(settleMutation(() => Promise.resolve(1))).resolves.toBeUndefined();
  });
});
