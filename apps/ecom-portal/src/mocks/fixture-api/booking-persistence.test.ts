// Modified by Sekar Nagarajan (2026-10-19)
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applyBookingOverlay,
  persistBookingDb,
  rehydrateBookingDb,
  resetBookingDbReadyGate,
  snapshotBookingDb,
} from './booking-persistence';
import {
  childrenOf,
  insertBooking,
  rowsFromPayload,
  type BookingChildren,
} from './bridges/booking-detail.bridge';
import { findBookingRow, fixtureBookingList } from './bridges/booking-list.bridge';
import { db, nextRef, resetDb, setRefCounters, type Row } from './db';

const emptyChildren = (): BookingChildren => ({
  parties: [],
  cargo: [],
  commodities: [],
  dg: [],
  oog: [],
  reefer: [],
  legs: [],
  haulage: [],
  cutoffs: [],
  files: [],
  ens: [],
  insurance: [],
  references: [],
});

afterEach(() => {
  resetDb();
  resetBookingDbReadyGate();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('booking persistence overlay', () => {
  it('inserts a new booking at the top of the list by dateup', () => {
    const source = findBookingRow(String(db.bookings.find((b) => b.ebook_status !== 'T')?.ebookno ?? ''))!;
    expect(source).toBeTruthy();
    const payload = {
      masterDetails: {
        origin: String(source.originPortId),
        delivery: String(source.finalPortId),
        cargoReadyDate: '2026-10-20',
      },
      parties: { shipperName: 'Demo Shipper', agreementParty: 'AP', siSubmittingParty: 'SI' },
      cargo: {
        containers: [
          {
            id: 'c1',
            containerType: '20DV',
            containerNo: '',
            quantity: 1,
            eqpStatus: 'F' as const,
            isSoc: false,
            reeferMode: 'N' as const,
            isLcl: false,
            isOog: false,
            tempUnit: 'C' as const,
            dimensionUnit: 'C' as const,
            tareWeight: 0,
            commodities: [
              {
                id: 'm1',
                commodity: '01',
                hsCode: '0102100000',
                weight: 100,
                volume: 1,
                packageType: 'BAGS',
                packageQuantity: 1,
                description: 'Test',
                marksAndNumbers: '',
                isDangerousGoods: false,
                unNumber: '',
                dgClass: '',
                flashPoint: '',
                marinePollutant: false,
                shippingName: '',
              },
            ],
          },
        ],
      },
    };
    const { header, children } = rowsFromPayload(payload as never, {
      ebookno: 'BKON9999',
      status: 'S',
      custCode: '20001374',
      agencyId: 'INDMUM',
      userEmail: 'demo@example.com',
    });
    insertBooking(header, children.length ? children : { ...emptyChildren(), ...children });

    const list = fixtureBookingList()!;
    expect(list[0]?.id).toBe('BKON9999');
    expect(list[0]?.status).toBe('Submitted');
  });

  it('survives resetDb when the overlay is re-applied', () => {
    const { header, children } = rowsFromPayload(
      {
        masterDetails: {
          origin: 'INNSA',
          delivery: 'AEJEA',
          cargoReadyDate: '2026-10-20',
        },
        parties: {},
        cargo: { containers: [] },
      } as never,
      {
        ebookno: 'BKON8888',
        status: 'S',
        custCode: '20001374',
        agencyId: 'INDMUM',
        userEmail: 'demo@example.com',
      },
    );
    insertBooking(header, children);
    expect(fixtureBookingList()![0]?.id).toBe('BKON8888');

    const overlay = snapshotBookingDb();
    expect(overlay.tables?.bookings.some((b) => String(b.ebookno) === 'BKON8888')).toBe(true);

    resetDb();
    expect(findBookingRow('BKON8888')).toBeUndefined();

    applyBookingOverlay(overlay);
    expect(findBookingRow('BKON8888')).toBeTruthy();
    expect(fixtureBookingList()![0]?.id).toBe('BKON8888');
    expect(childrenOf(findBookingRow('BKON8888')!).cargo).toEqual(
      expect.any(Array),
    );
  });

  it('keeps nextRef counters from the overlay so ids do not collide', () => {
    setRefCounters({ BKON: 5 });
    const first = nextRef('BKON');
    expect(first).toMatch(/BKON\d{2}0006/);

    const overlay = snapshotBookingDb();
    resetDb();
    setRefCounters({});
    applyBookingOverlay(overlay);

    const second = nextRef('BKON');
    expect(second).toMatch(/BKON\d{2}0007/);
    expect(second).not.toBe(first);
  });

  it('persistBookingDb PUTs a snapshot via fetch (bypass URL)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    insertBooking(
      {
        ebookno: 'BKON7777',
        ebook_status: 'S',
        originPortId: 'INNSA',
        finalPortId: 'AEJEA',
        datecr: new Date().toISOString(),
        dateup: new Date().toISOString(),
        submitted_date: new Date().toISOString(),
      } as Row,
      emptyChildren(),
    );
    persistBookingDb();

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const arg = fetchMock.mock.calls[0][0] as Request;
    expect(String(arg.url)).toContain('/api/_mock/booking-db');
    expect(arg.method).toBe('PUT');
  });

  it('rehydrateBookingDb applies GET overlay data', async () => {
    const { header, children } = rowsFromPayload(
      {
        masterDetails: { origin: 'INNSA', delivery: 'AEJEA', cargoReadyDate: '2026-10-21' },
        parties: {},
        cargo: { containers: [] },
      } as never,
      {
        ebookno: 'BKON6666',
        status: 'S',
        custCode: '20001374',
        agencyId: 'INDMUM',
        userEmail: 'demo@example.com',
      },
    );
    insertBooking(header, children);
    const overlay = snapshotBookingDb();
    resetDb();
    resetBookingDbReadyGate();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: overlay }),
      }),
    );

    await rehydrateBookingDb();
    expect(findBookingRow('BKON6666')).toBeTruthy();
    expect(fixtureBookingList()![0]?.id).toBe('BKON6666');
  });
});
