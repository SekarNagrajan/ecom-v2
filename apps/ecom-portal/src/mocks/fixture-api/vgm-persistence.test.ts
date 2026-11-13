// Modified by Sekar Nagarajan (2026-10-19)
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { VgmSubmitPayload } from '../../features/vgm/types/vgm.types';
import { applyVgmSubmission, buildVgmDeclaration } from './bridges/vgm.bridge';
import { db, eq, nextRef, resetDb, setRefCounters, type Row } from './db';
import {
  applyVgmOverlay,
  persistVgmDb,
  rehydrateVgmDb,
  resetVgmDbReadyGate,
  snapshotVgmDb,
} from './vgm-persistence';

function sampleBookingWithCargo(): Row {
  const booking = db.bookings.find(
    (b) =>
      eq(b.ebook_status, 'A') &&
      b.extBookNo &&
      db.bookingCargo.some((c) => eq(c.ebookno, b.ebookno) && c.containerno),
  );
  if (!booking) throw new Error('No booking with cargo available for VGM persistence tests');
  return booking;
}

function submitPayload(booking: Row, weight: number): VgmSubmitPayload {
  const ref = String(booking.extBookNo);
  const declaration = buildVgmDeclaration('bookno', ref);
  if (!declaration?.containers.length) {
    throw new Error(`No VGM declaration containers for ${ref}`);
  }
  const { referenceDetails: _r, containers: _c, ...partyDetails } = declaration;
  return {
    referenceNo: ref,
    type: 'bookno',
    partyDetails,
    containers: declaration.containers.map((c) => ({
      containerNo: String(c.containerNo),
      vgmWeight: weight,
      vgmUnit: 'K',
      method: 'SM1',
      date: '2026-10-19',
    })),
    sendEmailId: 'demo@example.com',
  };
}

afterEach(() => {
  resetDb();
  resetVgmDbReadyGate();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('VGM persistence overlay', () => {
  it('applyVgmSubmission inserts active rows and supersedes prior A/C', () => {
    const booking = sampleBookingWithCargo();
    const bookNo = String(booking.extBookNo);
    const payload = submitPayload(booking, 21500);
    const containerNo = payload.containers[0].containerNo;

    const created = applyVgmSubmission(payload, 'demo.user@example.com');
    expect(created.length).toBeGreaterThan(0);
    expect(String(created[0].status).toUpperCase()).toBe('A');
    expect(Number(created[0].VGM_Weight)).toBe(21500);

    const active = db.vgm.filter(
      (v) =>
        eq(v.book_no, bookNo) &&
        eq(v.eqpid, containerNo) &&
        ['A', 'C'].includes(String(v.status ?? '').toUpperCase()),
    );
    expect(active).toHaveLength(1);
    expect(Number(active[0].VGM_Weight)).toBe(21500);
  });

  it('survives resetDb when the overlay is re-applied', () => {
    const booking = sampleBookingWithCargo();
    const bookNo = String(booking.extBookNo);
    applyVgmSubmission(submitPayload(booking, 22100), 'demo.user@example.com');

    const overlay = snapshotVgmDb();
    expect(
      overlay.tables?.vgm.some(
        (r) => eq(r.book_no, bookNo) && Number(r.VGM_Weight) === 22100 && String(r.status).toUpperCase() === 'A',
      ),
    ).toBe(true);

    resetDb();
    expect(
      db.vgm.some(
        (r) => eq(r.book_no, bookNo) && Number(r.VGM_Weight) === 22100 && String(r.status).toUpperCase() === 'A',
      ),
    ).toBe(false);

    applyVgmOverlay(overlay);
    const again = buildVgmDeclaration('bookno', bookNo);
    expect(again?.containers[0]?.vgmWeight).toBe(22100);
  });

  it('resubmit bumps Version_no and keeps prior row as I in the overlay', () => {
    const booking = sampleBookingWithCargo();
    const bookNo = String(booking.extBookNo);
    const first = applyVgmSubmission(submitPayload(booking, 20000), 'demo.user@example.com');
    const containerNo = String(first[0].eqpid);
    const firstVersion = Number(first[0].Version_no);

    const second = applyVgmSubmission(submitPayload(booking, 23000), 'demo.user@example.com');
    expect(Number(second[0].Version_no)).toBeGreaterThan(firstVersion);
    expect(Number(second[0].VGM_Weight)).toBe(23000);

    const overlay = snapshotVgmDb();
    const forContainer = overlay.tables!.vgm.filter(
      (r) => eq(r.book_no, bookNo) && eq(r.eqpid, containerNo),
    );
    expect(
      forContainer.some(
        (r) => String(r.status).toUpperCase() === 'I' && Number(r.Version_no) === firstVersion,
      ),
    ).toBe(true);
    expect(
      forContainer.some(
        (r) =>
          String(r.status).toUpperCase() === 'A' &&
          Number(r.Version_no) === Number(second[0].Version_no) &&
          Number(r.VGM_Weight) === 23000,
      ),
    ).toBe(true);

    resetDb();
    applyVgmOverlay(overlay);
    expect(buildVgmDeclaration('bookno', bookNo)?.containers[0]?.vgmWeight).toBe(23000);
  });

  it('persistVgmDb PUTs a snapshot via fetch (bypass URL)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    applyVgmSubmission(submitPayload(sampleBookingWithCargo(), 21000), 'demo.user@example.com');
    persistVgmDb();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const arg = fetchMock.mock.calls[0][0] as Request;
    expect(String(arg.url)).toContain('/api/_mock/vgm-db');
    expect(arg.method).toBe('PUT');
  });

  it('rehydrateVgmDb applies GET overlay data', async () => {
    const booking = sampleBookingWithCargo();
    const bookNo = String(booking.extBookNo);
    applyVgmSubmission(submitPayload(booking, 21999), 'demo.user@example.com');
    const overlay = snapshotVgmDb();
    resetDb();
    resetVgmDbReadyGate();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: overlay }),
      }),
    );

    await rehydrateVgmDb();
    expect(buildVgmDeclaration('bookno', bookNo)?.containers[0]?.vgmWeight).toBe(21999);
  });

  it('keeps nextRef counters from the overlay so VGM ids do not collide', () => {
    // High baseline — setRefCounters uses Math.max, and earlier tests may have bumped VGM.
    setRefCounters({ VGM: 100 });
    const first = nextRef('VGM');
    expect(first).toMatch(/VGM\d{2}0101/);

    const overlay = snapshotVgmDb();
    resetDb();
    applyVgmOverlay(overlay);

    const second = nextRef('VGM');
    expect(second).toMatch(/VGM\d{2}0102/);
    expect(second).not.toBe(first);
  });
});
