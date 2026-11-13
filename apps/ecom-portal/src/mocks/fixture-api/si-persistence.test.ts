// Modified by Sekar Nagarajan (2026-10-19)
import { afterEach, describe, expect, it, vi } from 'vitest';

import { findSiRow } from './bridges/si-common.bridge';
import { createSiFromBooking } from './bridges/si-write.bridge';
import { db, eq, nextRef, resetDb, setRefCounters, type Row } from './db';
import {
  applySiOverlay,
  persistSiDb,
  rehydrateSiDb,
  resetSiDbReadyGate,
  snapshotSiDb,
} from './si-persistence';

function sampleBooking(): Row {
  const booking =
    db.bookings.find((b) => {
      const status = String(b.ebook_status ?? '').toUpperCase();
      return status !== 'T' && status !== 'D' && status !== 'I';
    }) ?? db.bookings.find((b) => String(b.ebook_status ?? '').toUpperCase() !== 'T');
  if (!booking) throw new Error('No booking fixture available for SI persistence tests');
  return booking;
}

afterEach(() => {
  resetDb();
  resetSiDbReadyGate();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('SI persistence overlay', () => {
  it('createSiFromBooking inserts a new SI header and children', () => {
    const booking = sampleBooking();
    const created = createSiFromBooking(booking, 'S');
    const eSINo = String(created.eSINo);
    expect(findSiRow(eSINo)).toBeTruthy();
    expect(String(created.status).toUpperCase()).toBe('S');
    expect(db.siCust.some((r) => eq(r.eSINo, eSINo)) || db.bookingCust.length === 0).toBe(true);
  });

  it('survives resetDb when the overlay is re-applied', () => {
    const booking = sampleBooking();
    const created = createSiFromBooking(booking, 'S');
    const eSINo = String(created.eSINo);
    const overlay = snapshotSiDb();
    expect(overlay.tables?.shippingInstructions.some((r) => String(r.eSINo) === eSINo)).toBe(
      true,
    );

    resetDb();
    expect(findSiRow(eSINo)).toBeNull();

    applySiOverlay(overlay);
    expect(findSiRow(eSINo)).toBeTruthy();
    expect(String(findSiRow(eSINo)!.status).toUpperCase()).toBe('S');
  });

  it('keeps nextRef counters from the overlay so ids do not collide', () => {
    setRefCounters({ SIREQ: 5 });
    const first = nextRef('SIREQ');
    expect(first).toMatch(/SIREQ\d{2}0006/);

    const overlay = snapshotSiDb();
    resetDb();
    setRefCounters({});
    applySiOverlay(overlay);

    const second = nextRef('SIREQ');
    expect(second).toMatch(/SIREQ\d{2}0007/);
    expect(second).not.toBe(first);
  });

  it('persistSiDb PUTs a snapshot via fetch (bypass URL)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    createSiFromBooking(sampleBooking(), 'S');
    persistSiDb();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const arg = fetchMock.mock.calls[0][0] as Request;
    expect(String(arg.url)).toContain('/api/_mock/si-db');
    expect(arg.method).toBe('PUT');
  });

  it('rehydrateSiDb applies GET overlay data', async () => {
    const created = createSiFromBooking(sampleBooking(), 'S');
    const eSINo = String(created.eSINo);
    const overlay = snapshotSiDb();
    resetDb();
    resetSiDbReadyGate();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: overlay }),
      }),
    );

    await rehydrateSiDb();
    expect(findSiRow(eSINo)).toBeTruthy();
  });
});
