// Created by Sekar Nagarajan (2026-08-26 14:50)
import type {
  ArrivalNoticeChargeLine,
  ArrivalNoticeContainerRow,
  ArrivalNoticeDTO,
  ArrivalNoticeFreeTime,
  ArrivalNoticeListDTO,
} from "../types/arrival-notice.types";

export interface ArrivalNoticeDetailExtras {
  notifyParty: string;
  consignee: string;
  manifestRef?: string;
  igmNo?: string;
  containers: ArrivalNoticeContainerRow[];
  chargeLines: ArrivalNoticeChargeLine[];
  freeTime?: ArrivalNoticeFreeTime;
  demurrageFrom?: string;
}

/** In-memory seed — MSW handlers + mock API share this source. */
export const MOCK_ARN_LIST: ArrivalNoticeListDTO[] = [
  {
    anNo: "ARN-2001",
    blNumber: "ESLSIN123456",
    vessel: "MSC ELARA",
    voyage: "EL042N",
    dischargePort: "INNSA - NHAVA SHEVA",
    terminal: "NSICT",
    etaDate: "2026-08-20T00:00:00",
    arrivalDate: "2026-08-21T00:00:00",
    lastFreeDay: "2026-08-28T00:00:00",
    chargesDue: 12540,
    currency: "USD",
    printStatus: "N",
  },
  {
    anNo: "ARN-2002",
    blNumber: "ESLSIN123457",
    vessel: "EVER GIVEN",
    voyage: "EV001E",
    dischargePort: "USLAX - LOS ANGELES",
    terminal: "APM",
    etaDate: "2026-08-22T00:00:00",
    arrivalDate: "2026-08-23T00:00:00",
    lastFreeDay: "2026-08-30T00:00:00",
    chargesDue: 8200.5,
    currency: "USD",
    printStatus: "Y",
  },
  {
    anNo: "ARN-2003",
    blNumber: "ESLSIN123458",
    vessel: "OOCL TOKYO",
    voyage: "OT118W",
    dischargePort: "SGSIN - SINGAPORE",
    terminal: "PSA",
    etaDate: "2026-08-18T00:00:00",
    arrivalDate: "2026-08-19T00:00:00",
    chargesDue: 0,
    currency: "USD",
    printStatus: "N",
  },
  {
    anNo: "ARN-2004",
    blNumber: "ESLSIN123459",
    vessel: "MAERSK ESSEX",
    voyage: "ME204S",
    dischargePort: "NLRTM - ROTTERDAM",
    terminal: "ECT",
    etaDate: "2026-08-15T00:00:00",
    arrivalDate: "2026-08-16T00:00:00",
    lastFreeDay: "2026-08-23T00:00:00",
    chargesDue: 3450,
    currency: "EUR",
    printStatus: "N",
  },
];

const detailExtrasByAnNo: Record<string, ArrivalNoticeDetailExtras> = {
  "ARN-2001": {
    notifyParty: "Acme Logistics Pvt Ltd",
    consignee: "Acme Trading Co.",
    manifestRef: "MF-778901",
    igmNo: "IGM/2026/08121",
    containers: [
      { containerNo: "MSKU1234567", eqpSize: "40HC", sealNo: "SL20011" },
      { containerNo: "MSKU1234568", eqpSize: "40HC", sealNo: "SL20012" },
    ],
    chargeLines: [
      {
        chargeCode: "THC",
        description: "Terminal handling charge",
        amount: 4500,
        currency: "USD",
      },
      {
        chargeCode: "DOC",
        description: "Documentation fee",
        amount: 150,
        currency: "USD",
      },
      {
        chargeCode: "DEM",
        description: "Demurrage estimate",
        amount: 7890,
        currency: "USD",
      },
    ],
    freeTime: { days: 7, lastFreeDay: "2026-08-28T00:00:00" },
    demurrageFrom: "2026-08-29T00:00:00",
  },
  "ARN-2002": {
    notifyParty: "Pacific Freight Notify Desk",
    consignee: "Pacific Line Importers",
    manifestRef: "MF-778902",
    igmNo: "IGM/2026/08231",
    containers: [
      { containerNo: "TCLU7654321", eqpSize: "20GP", sealNo: "SL20021" },
    ],
    chargeLines: [
      {
        chargeCode: "THC",
        description: "Terminal handling charge",
        amount: 2800,
        currency: "USD",
      },
      {
        chargeCode: "CFS",
        description: "CFS charge",
        amount: 5400.5,
        currency: "USD",
      },
    ],
    freeTime: { days: 7, lastFreeDay: "2026-08-30T00:00:00" },
  },
  "ARN-2003": {
    notifyParty: "Global Cargo Notify",
    consignee: "Global Cargo Pte Ltd",
    manifestRef: "MF-778903",
    containers: [
      { containerNo: "OOLU5566778", eqpSize: "40GP", sealNo: "SL20031" },
      { containerNo: "OOLU5566779", eqpSize: "40GP" },
    ],
    chargeLines: [],
  },
  "ARN-2004": {
    notifyParty: "Rotterdam Forwarders BV",
    consignee: "Euro Trade BV",
    igmNo: "IGM/NL/2026/0816",
    containers: [
      { containerNo: "MRKU9988776", eqpSize: "40HC", sealNo: "SL20041" },
      { containerNo: "MRKU9988777", eqpSize: "40HC", sealNo: "SL20042" },
      { containerNo: "MRKU9988778", eqpSize: "20GP", sealNo: "SL20043" },
    ],
    chargeLines: [
      {
        chargeCode: "THC",
        description: "Terminal handling charge",
        amount: 2100,
        currency: "EUR",
      },
      {
        chargeCode: "STORAGE",
        description: "Storage charge",
        amount: 1350,
        currency: "EUR",
      },
    ],
    freeTime: { days: 7, lastFreeDay: "2026-08-23T00:00:00" },
    demurrageFrom: "2026-08-24T00:00:00",
  },
};

function buildDetail(seed: ArrivalNoticeListDTO): ArrivalNoticeDTO {
  const extras = detailExtrasByAnNo[seed.anNo] ?? {
    notifyParty: "Notify Party",
    consignee: "Consignee",
    containers: [],
    chargeLines: [],
  };
  return { ...seed, ...extras };
}

export const MOCK_ARN_DETAILS: Record<string, ArrivalNoticeDTO> =
  Object.fromEntries(
    MOCK_ARN_LIST.map((row) => [row.anNo, buildDetail(row)]),
  );

/** Mutable print-status store for mock download side effects. */
export let mockArrivalNotices: ArrivalNoticeListDTO[] = MOCK_ARN_LIST.map(
  (row) => ({ ...row }),
);

export let mockArrivalNoticeDetails: Record<string, ArrivalNoticeDTO> = {
  ...MOCK_ARN_DETAILS,
};

export function resetMockArrivalNotices() {
  mockArrivalNotices = MOCK_ARN_LIST.map((row) => ({ ...row }));
  mockArrivalNoticeDetails = { ...MOCK_ARN_DETAILS };
}

export function getMockArrivalNoticeDetail(
  anNo: string,
): ArrivalNoticeDTO | undefined {
  const live = mockArrivalNoticeDetails[anNo];
  if (live) return { ...live };
  const seed = MOCK_ARN_LIST.find((r) => r.anNo === anNo);
  return seed ? buildDetail(seed) : undefined;
}

export function markArnPrinted(anNo: string): boolean {
  const idx = mockArrivalNotices.findIndex((r) => r.anNo === anNo);
  if (idx === -1) return false;
  mockArrivalNotices[idx] = {
    ...mockArrivalNotices[idx],
    printStatus: "Y",
  };
  const detail = getMockArrivalNoticeDetail(anNo);
  if (detail) {
    mockArrivalNoticeDetails[anNo] = { ...detail, printStatus: "Y" };
  }
  return true;
}

export function filterArnByArrivalDate(
  rows: ArrivalNoticeListDTO[],
  fromDate?: string | null,
  toDate?: string | null,
): ArrivalNoticeListDTO[] {
  return rows.filter((row) => {
    const day = (row.arrivalDate || row.etaDate).slice(0, 10);
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  });
}

/** @deprecated Prefer MOCK_ARN_LIST — kept for existing tests */
export const mockArrivalNoticeListSeed = MOCK_ARN_LIST;
