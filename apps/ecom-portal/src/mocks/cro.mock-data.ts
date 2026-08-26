// Modified by Sekar Nagarajan (2026-08-25 12:10)
import type {
  CRODTO,
  CROEligibility,
  CROListDTO,
  CROReleaseStatus,
} from '../features/container-release-order/types/cro.types';

/** Internal seed flags used only for eligibility computation. */
export interface CROMockSeedFlags {
  paymentHold?: boolean;
  customsHold?: boolean;
}

export type CROListSeed = CROListDTO & CROMockSeedFlags;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidToExpired(validTo: string, today = todayIsoDate()): boolean {
  return validTo.slice(0, 10) < today;
}

/**
 * Mock eligibility until legacy EJB gate matrix is confirmed.
 * Blocked if releaseStatus is Blocked, validTo is past, or hold flags are set.
 */
export function computeCROEligibility(
  row: Pick<CROListSeed, 'releaseStatus' | 'validTo' | 'paymentHold' | 'customsHold'>,
  today = todayIsoDate()
): CROEligibility {
  const reasons: string[] = [];

  if (row.paymentHold) {
    reasons.push('Payment hold is active for this booking.');
  }
  if (row.customsHold) {
    reasons.push('Customs hold prevents empty container release.');
  }
  if (row.releaseStatus === 'Blocked' && reasons.length === 0) {
    reasons.push('Release status is blocked.');
  }
  if (isValidToExpired(row.validTo, today)) {
    reasons.push('CRO validity date has expired.');
  }
  if (row.releaseStatus === 'Cancelled') {
    reasons.push('This container release order has been cancelled.');
  }

  const eligible =
    reasons.length === 0 &&
    (row.releaseStatus === 'Eligible' || row.releaseStatus === 'Released');

  return { eligible, reasons };
}

function listRow(
  partial: CROListDTO & CROMockSeedFlags
): CROListSeed {
  return { ...partial };
}

export const mockCROListSeed: CROListSeed[] = [
  listRow({
    croNo: 'CRO-1001',
    bookingNo: 'BKG-778901',
    vessel: 'MSC ELARA',
    voyage: 'EL042N',
    loadPort: 'SGSIN - SINGAPORE',
    dischargePort: 'JPTYO - TOKYO',
    eqpType: '40HC',
    qtyBooked: 4,
    qtyReleased: 0,
    emptyReleaseDepot: 'PSA - Pasir Panjang',
    croDate: '2026-08-18T00:00:00',
    validTo: '2026-09-30T00:00:00',
    printStatus: 'N',
    releaseStatus: 'Eligible',
  }),
  listRow({
    croNo: 'CRO-1002',
    bookingNo: 'BKG-778902',
    vessel: 'EVER GIVEN',
    voyage: 'EV001E',
    loadPort: 'USNYC - NEW YORK',
    dischargePort: 'GBFEL - FELIXSTOWE',
    eqpType: '20GP',
    qtyBooked: 2,
    qtyReleased: 2,
    emptyReleaseDepot: 'APM - Elizabeth',
    croDate: '2026-08-10T00:00:00',
    validTo: '2026-09-15T00:00:00',
    printStatus: 'Y',
    releaseStatus: 'Eligible',
  }),
  listRow({
    croNo: 'CRO-1003',
    bookingNo: 'BKG-778903',
    vessel: 'OOCL TOKYO',
    voyage: 'OT118W',
    loadPort: 'CNSHG - SHANGHAI',
    dischargePort: 'USLAX - LOS ANGELES',
    eqpType: '40GP',
    qtyBooked: 6,
    qtyReleased: 0,
    emptyReleaseDepot: 'SIPG - Yangshan',
    croDate: '2026-08-12T00:00:00',
    validTo: '2026-09-20T00:00:00',
    printStatus: 'N',
    releaseStatus: 'Blocked',
    paymentHold: true,
  }),
  listRow({
    croNo: 'CRO-1004',
    bookingNo: 'BKG-778904',
    vessel: 'MAERSK ESSEX',
    voyage: 'ME204S',
    loadPort: 'INNSA - NHAVA SHEVA',
    dischargePort: 'NLRTM - ROTTERDAM',
    eqpType: '40HC',
    qtyBooked: 3,
    qtyReleased: 0,
    emptyReleaseDepot: 'JNPT - Empty Yard',
    croDate: '2026-08-14T00:00:00',
    validTo: '2026-09-25T00:00:00',
    printStatus: 'N',
    releaseStatus: 'Blocked',
    customsHold: true,
  }),
  listRow({
    croNo: 'CRO-1005',
    bookingNo: 'BKG-778905',
    vessel: 'HMM ALGECIRAS',
    voyage: 'HA077E',
    loadPort: 'KRPUS - BUSAN',
    dischargePort: 'DEHAM - HAMBURG',
    eqpType: '20GP',
    qtyBooked: 5,
    qtyReleased: 1,
    emptyReleaseDepot: 'BPT - Busan Port',
    croDate: '2026-07-01T00:00:00',
    validTo: '2026-07-20T00:00:00',
    printStatus: 'N',
    releaseStatus: 'Eligible',
  }),
  listRow({
    croNo: 'CRO-1006',
    bookingNo: 'BKG-778906',
    vessel: 'CMA CGM MARCO POLO',
    voyage: 'CM312N',
    loadPort: 'SGSIN - SINGAPORE',
    dischargePort: 'AEJEA - JEBEL ALI',
    eqpType: '40HC',
    qtyBooked: 8,
    qtyReleased: 8,
    emptyReleaseDepot: 'PSA - Tanjong Pagar',
    croDate: '2026-08-05T00:00:00',
    validTo: '2026-09-10T00:00:00',
    printStatus: 'Y',
    releaseStatus: 'Released',
  }),
  listRow({
    croNo: 'CRO-1007',
    bookingNo: 'BKG-778907',
    vessel: 'ONE INNOVATION',
    voyage: 'OI090W',
    loadPort: 'JPYOK - YOKOHAMA',
    dischargePort: 'USOAK - OAKLAND',
    eqpType: '40GP',
    qtyBooked: 2,
    qtyReleased: 0,
    emptyReleaseDepot: 'YICT - Yokohama',
    croDate: '2026-08-08T00:00:00',
    validTo: '2026-09-01T00:00:00',
    printStatus: 'N',
    releaseStatus: 'Cancelled',
  }),
  listRow({
    croNo: 'CRO-1008',
    bookingNo: 'BKG-778908',
    vessel: 'MSC ELARA',
    voyage: 'EL043N',
    loadPort: 'MYPKG - PORT KLANG',
    dischargePort: 'AUMEL - MELBOURNE',
    eqpType: '20GP',
    qtyBooked: 10,
    qtyReleased: 4,
    emptyReleaseDepot: 'Westports - Empty Park',
    croDate: '2026-08-20T00:00:00',
    validTo: '2026-10-05T00:00:00',
    printStatus: 'N',
    releaseStatus: 'Eligible',
  }),
  listRow({
    croNo: 'CRO-1009',
    bookingNo: 'BKG-778909',
    vessel: 'EVER GIVEN',
    voyage: 'EV002E',
    loadPort: 'THLCH - LAEM CHABANG',
    dischargePort: 'SGSIN - SINGAPORE',
    eqpType: '40HC',
    qtyBooked: 1,
    qtyReleased: 0,
    emptyReleaseDepot: 'LCB - Empty Depot',
    croDate: '2026-08-22T00:00:00',
    validTo: '2026-09-28T00:00:00',
    printStatus: 'N',
    releaseStatus: 'Eligible',
  }),
];

function toListDTO(seed: CROListSeed): CROListDTO {
  return {
    croNo: seed.croNo,
    bookingNo: seed.bookingNo,
    vessel: seed.vessel,
    voyage: seed.voyage,
    loadPort: seed.loadPort,
    dischargePort: seed.dischargePort,
    eqpType: seed.eqpType,
    qtyBooked: seed.qtyBooked,
    qtyReleased: seed.qtyReleased,
    emptyReleaseDepot: seed.emptyReleaseDepot,
    croDate: seed.croDate,
    validTo: seed.validTo,
    printStatus: seed.printStatus,
    releaseStatus: seed.releaseStatus,
  };
}

export function cloneCROListSeed(): CROListDTO[] {
  return mockCROListSeed.map((row) => toListDTO(row));
}

function buildDetail(seed: CROListSeed): CRODTO {
  const list = toListDTO(seed);
  const eligibility = computeCROEligibility(seed);
  const containers =
    seed.qtyReleased > 0
      ? Array.from({ length: Math.min(seed.qtyReleased, 3) }, (_, i) => ({
          containerNo: `MSKU${String(1000000 + Number(seed.croNo.slice(-3)) * 10 + i)}`,
          eqpSize: seed.eqpType,
          sealNo: `SL${seed.croNo.slice(-3)}${i + 1}`,
        }))
      : seed.releaseStatus === 'Eligible' || seed.releaseStatus === 'Blocked'
        ? [
            {
              containerNo: `TCLU${String(2000000 + Number(seed.croNo.slice(-3)))}`,
              eqpSize: seed.eqpType,
              sealNo: undefined,
            },
          ]
        : [];

  return {
    ...list,
    containers,
    eligibility,
    polArrival: seed.croDate,
    polDeparture: seed.validTo,
    printCount: seed.printStatus === 'Y' ? 1 : 0,
  };
}

/** Three richly populated details + lazy build for the rest. */
export const mockCRODetailsSeed: Record<string, CRODTO> = {
  'CRO-1001': buildDetail(mockCROListSeed[0]!),
  'CRO-1003': buildDetail(mockCROListSeed[2]!),
  'CRO-1005': buildDetail(mockCROListSeed[4]!),
};

export function getMockCRODetail(croNo: string): CRODTO | undefined {
  if (mockCRODetailsSeed[croNo]) {
    return { ...mockCRODetailsSeed[croNo]! };
  }
  const seed = mockCROListSeed.find((r) => r.croNo === croNo);
  return seed ? buildDetail(seed) : undefined;
}

export function getMockCROEligibilityByBooking(bookingNo: string): CROEligibility {
  const seed = mockCROListSeed.find((r) => r.bookingNo === bookingNo);
  if (!seed) {
    return {
      eligible: false,
      reasons: ['No container release order found for this booking.'],
    };
  }
  return computeCROEligibility(seed);
}

export function getCROReleaseStatusesCovered(): CROReleaseStatus[] {
  return [...new Set(mockCROListSeed.map((r) => r.releaseStatus))];
}
