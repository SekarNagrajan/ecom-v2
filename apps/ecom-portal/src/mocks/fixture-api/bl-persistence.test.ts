// Modified by Sekar Nagarajan (2026-10-19)
/**
 * B/L + MCN mutations share the SI overlay (runtime/si/). These tests exercise the
 * amendment clone + status lifecycle and confirm the overlay round-trips after resetDb.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { fixtureMcnDetail } from './bridges/bl-detail.bridge';
import { mcnIdOf } from './bridges/bl-list.bridge';
import {
  findBlRow,
  isAmendment,
  isPlainSi,
  str,
} from './bridges/si-common.bridge';
import { cloneSiAsAmendment, createSiFromBooking } from './bridges/si-write.bridge';
import { db, eq, nowIso, resetDb, type Row } from './db';
import { applySiOverlay, resetSiDbReadyGate, snapshotSiDb } from './si-persistence';

const BL_CANCEL_REMARKS = 'Bill of lading amendment cancelled by the customer.';

function samplePlainSiWithBl(): Row {
  const plain = db.shippingInstructions.find(
    (si) => isPlainSi(si) && str(si.blno) && !eq(si.status, 'I'),
  );
  if (!plain) throw new Error('No plain SI with blno available for B/L persistence tests');
  return plain;
}

function setStatus(row: Row, status: string, remarks?: string) {
  row.status = status;
  if (remarks !== undefined) row.declined_remarks = remarks;
  row.ChgDate = nowIso();
}

/** Mirror bl.handlers amendmentFor */
function amendmentFor(blNo: string): Row | null {
  const row = findBlRow(blNo);
  if (!row) return null;
  return isAmendment(row) ? row : cloneSiAsAmendment(row);
}

afterEach(() => {
  resetDb();
  resetSiDbReadyGate();
});

describe('B/L + MCN shared SI overlay', () => {
  it('draft on plain SI clones an amendment that survives overlay re-apply', () => {
    const plain = samplePlainSiWithBl();
    const blNo = str(plain.blno);
    const sourceEsi = str(plain.eSINo);

    const amendment = amendmentFor(blNo)!;
    expect(isAmendment(amendment)).toBe(true);
    expect(str(amendment.eSINo)).not.toBe(sourceEsi);
    expect(Number(amendment.blversion)).toBeGreaterThan(Number(plain.blversion ?? 0));
    expect(db.siCargo.filter((c) => eq(c.eSINo, amendment.eSINo)).length).toBe(
      db.siCargo.filter((c) => eq(c.eSINo, sourceEsi)).length,
    );

    const overlay = snapshotSiDb();
    expect(
      overlay.tables?.shippingInstructions.some(
        (r) => str(r.eSINo) === str(amendment.eSINo) && Number(r.editbl) >= 1,
      ),
    ).toBe(true);

    resetDb();
    expect(findBlRow(blNo)?.eSINo).not.toBe(amendment.eSINo);

    applySiOverlay(overlay);
    const restored = findBlRow(blNo);
    expect(restored).toBeTruthy();
    expect(isAmendment(restored!)).toBe(true);
    expect(str(restored!.eSINo)).toBe(str(amendment.eSINo));
  });

  it('submit / verify / cancel / issue status transitions survive rehydrate', () => {
    const plain = samplePlainSiWithBl();
    const blNo = str(plain.blno);
    const row = amendmentFor(blNo)!;

    setStatus(row, 'S', '');
    let overlay = snapshotSiDb();
    resetDb();
    applySiOverlay(overlay);
    expect(String(findBlRow(blNo)!.status).toUpperCase()).toBe('S');

    setStatus(findBlRow(blNo)!, 'A', 'Accepted');
    overlay = snapshotSiDb();
    resetDb();
    applySiOverlay(overlay);
    expect(String(findBlRow(blNo)!.status).toUpperCase()).toBe('A');

    setStatus(findBlRow(blNo)!, 'D', BL_CANCEL_REMARKS);
    overlay = snapshotSiDb();
    resetDb();
    applySiOverlay(overlay);
    const cancelled = findBlRow(blNo)!;
    expect(String(cancelled.status).toUpperCase()).toBe('D');
    expect(String(cancelled.declined_remarks)).toBe(BL_CANCEL_REMARKS);

    setStatus(findBlRow(blNo)!, 'I', 'Released');
    overlay = snapshotSiDb();
    resetDb();
    applySiOverlay(overlay);
    expect(String(findBlRow(blNo)!.status).toUpperCase()).toBe('I');
  });

  it('print-original status I is captured in the overlay', () => {
    const plain = samplePlainSiWithBl();
    const blNo = str(plain.blno);
    const row = amendmentFor(blNo)!;
    setStatus(row, 'I');

    const overlay = snapshotSiDb();
    resetDb();
    applySiOverlay(overlay);

    expect(String(findBlRow(blNo)!.status).toUpperCase()).toBe('I');
  });

  it('MCN PUT remarks / freight / cargo survive rehydrate; submit sets S', () => {
    const plain = samplePlainSiWithBl();
    const blNo = str(plain.blno);
    const row = amendmentFor(blNo)!;
    setStatus(row, 'D', '');

    const eSINo = str(row.eSINo);
    row.custremarks = 'MCN overlay remarks';
    row.Freight = 'C';
    const commodities = db.siCommodity.filter((c) => eq(c.eSINo, eSINo));
    if (commodities.length) {
      commodities[0].marksDesc = 'Steel coils demo';
      for (let i = 1; i < commodities.length; i++) commodities[i].marksDesc = '';
    } else {
      db.siCommodity.push({
        id: 999001,
        eSINo,
        conId: 1,
        containerno: 'TEST0000001',
        itemno: 1,
        marksDesc: 'Steel coils demo',
      } as Row);
    }
    for (const charge of db.siCharges.filter((c) => eq(c.esino, eSINo) && eq(c.chargeid, 'OFR'))) {
      charge.prepaidcollect = 'C';
    }

    let overlay = snapshotSiDb();
    resetDb();
    applySiOverlay(overlay);

    const mcnId = mcnIdOf(findBlRow(blNo)!);
    const detail = fixtureMcnDetail(mcnId);
    expect(detail).toBeTruthy();
    expect(detail!.remarks).toBe('MCN overlay remarks');
    expect(detail!.freightTerms).toBe('Collect');
    expect(detail!.cargoDescription).toContain('Steel coils demo');

    setStatus(findBlRow(blNo)!, 'S', '');
    overlay = snapshotSiDb();
    resetDb();
    applySiOverlay(overlay);

    const submitted = findBlRow(blNo)!;
    expect(String(submitted.status).toUpperCase()).toBe('S');
    expect(fixtureMcnDetail(mcnIdOf(submitted))).toBeTruthy();
  });

  it('shared overlay holds both SI create and B/L amendment in one snapshot', () => {
    const booking =
      db.bookings.find((b) => {
        const status = String(b.ebook_status ?? '').toUpperCase();
        return status !== 'T' && status !== 'D' && status !== 'I';
      }) ?? db.bookings[0];
    if (!booking) throw new Error('No booking for shared overlay test');

    const created = createSiFromBooking(booking, 'S');
    const plain = samplePlainSiWithBl();
    const amendment = amendmentFor(str(plain.blno))!;

    const overlay = snapshotSiDb();
    expect(
      overlay.tables?.shippingInstructions.some((r) => str(r.eSINo) === str(created.eSINo)),
    ).toBe(true);
    expect(
      overlay.tables?.shippingInstructions.some(
        (r) => str(r.eSINo) === str(amendment.eSINo) && Number(r.editbl) >= 1,
      ),
    ).toBe(true);

    resetDb();
    applySiOverlay(overlay);
    expect(db.shippingInstructions.some((r) => str(r.eSINo) === str(created.eSINo))).toBe(true);
    expect(
      db.shippingInstructions.some(
        (r) => str(r.eSINo) === str(amendment.eSINo) && Number(r.editbl) >= 1,
      ),
    ).toBe(true);
  });
});
