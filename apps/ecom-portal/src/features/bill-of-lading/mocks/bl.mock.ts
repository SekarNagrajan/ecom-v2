// Modified by Sekar Nagarajan (2026-08-28 12:22)
import {
  DEFAULT_BL_WIZARD_CONFIG,
  type BLWizardConfig,
} from "../config/bl-wizard-config";
import type {
  BLChargesDTO,
  BLDTO,
  BLListDTO,
  BLRowStatus,
  MCNDTO,
  MCNListDTO,
} from "../types/bl.types";
import {
  BL_STATUS_LABELS,
  createDefaultBlRouting,
  createEmptyBlPreview,
} from "../types/bl.types";

function listRow(
  partial: Omit<BLListDTO, "statusLabel"> & { status: BLRowStatus },
): BLListDTO {
  return {
    ...partial,
    statusLabel: BL_STATUS_LABELS[partial.status],
  };
}

const sharedContainers = [
  {
    id: "CONT-BL-1",
    containerNo: "MSKU1234567",
    eqpSize: "20DC",
    carrierSeal: "SEAL9988",
    shipperSeal: "SHP1122",
    isSoc: false,
    reeferMode: "none" as const,
    isOog: false,
    cargoLines: [
      {
        id: "CARGO-BL-1",
        marksAndNumbers: "N/M",
        description: "ELECTRONICS AND SPARE PARTS",
        commodityCode: "ELEC",
        hsCode: "85171200",
        packageCount: 120,
        packageType: "CTN",
        grossWeight: 4500,
        volume: 24.5,
      },
    ],
  },
];

const sharedParties = {
  shipper: {
    name: "Global Logistics Corp",
    address: "123 Export Ave, Suite 400",
    city: "Singapore",
    country: "SG",
    printOnBl: true,
  },
  consignee: {
    name: "Tokyo Imports Ltd",
    address: "456 Import St, Chiyoda",
    city: "Tokyo",
    country: "JP",
    printOnBl: true,
    toOrder: false,
  },
  notify: {
    name: "Customs Brokers Inc",
    address: "789 Clearance Blvd",
    city: "Tokyo",
    country: "JP",
    printOnBl: false,
  },
};

export const mockBLListSeed: BLListDTO[] = [
  listRow({
    blNo: "BL-998824",
    mcnNo: "MCN-2026-001",
    bookingNo: "BKG-778901",
    siNo: "SIN998285",
    status: "D",
    agencyRefNo: "AGY-4457",
    origin: "SGSIN - SINGAPORE",
    loadPort: "SGSIN - SINGAPORE",
    dischargePort: "JPTYO - TOKYO",
    delivery: "JPTYO - TOKYO",
    confirmedDate: null,
    createdDate: "2026-08-24T08:00:00Z",
    printStatus: "N",
    appVersion: "2",
    isLocked: false,
    paymentEligible: true,
    paymentCompleted: false,
    payAmountUsd: 125,
    fcnNo: "FCN-001",
  }),
  listRow({
    blNo: "BL-998825",
    mcnNo: null,
    bookingNo: "BKG-778902",
    siNo: "SIN998286",
    status: "S",
    agencyRefNo: "AGY-4458",
    origin: "USNYC - NEW YORK",
    loadPort: "USNYC - NEW YORK",
    dischargePort: "GBFEL - FELIXSTOWE",
    delivery: "GBFEL - FELIXSTOWE",
    confirmedDate: null,
    createdDate: "2026-08-21T10:00:00Z",
    printStatus: "N",
    appVersion: "2",
    isLocked: false,
  }),
  listRow({
    blNo: "BL-998822",
    mcnNo: "MCN-2026-002",
    bookingNo: "BKG-778899",
    siNo: "SIN998283",
    status: "C",
    agencyRefNo: "AGY-4455",
    origin: "USNYC - NEW YORK",
    loadPort: "USNYC - NEW YORK",
    dischargePort: "GBFEL - FELIXSTOWE",
    delivery: "GBFEL - FELIXSTOWE",
    confirmedDate: "2026-08-23T14:00:00Z",
    createdDate: "2026-08-20T14:30:00Z",
    printStatus: "Y",
    appVersion: "2",
    isLocked: false,
  }),
  listRow({
    blNo: "BL-998826",
    mcnNo: null,
    bookingNo: "BKG-778903",
    siNo: "SIN998287",
    status: "I",
    agencyRefNo: "AGY-4459",
    origin: "CNSHA - SHANGHAI",
    loadPort: "CNSHA - SHANGHAI",
    dischargePort: "USLAX - LOS ANGELES",
    delivery: "USLAX - LOS ANGELES",
    confirmedDate: "2026-08-19T10:00:00Z",
    createdDate: "2026-08-18T14:30:00Z",
    printStatus: "Y",
    appVersion: "2",
    isLocked: false,
    hasInsurance: true,
    policyNo: "POL-998826",
  }),
  listRow({
    blNo: "ESLSIN123456",
    mcnNo: "MCN-2026-003",
    bookingNo: "BKG-778904",
    siNo: "SIN998288",
    status: "C",
    agencyRefNo: "AGY-4460",
    origin: "SGSIN - SINGAPORE",
    loadPort: "SGSIN - SINGAPORE",
    dischargePort: "INNSA - NHAVA SHEVA",
    delivery: "INNSA - NHAVA SHEVA",
    confirmedDate: "2026-08-22T08:00:00Z",
    createdDate: "2026-08-22T08:00:00Z",
    printStatus: "Y",
    appVersion: "2",
    isLocked: false,
  }),
  listRow({
    blNo: "BL-V1-001",
    mcnNo: null,
    bookingNo: "BKG-778905",
    siNo: "SIN998288",
    status: "D",
    agencyRefNo: "AGY-4461",
    origin: "AEJEA - JEBEL ALI",
    loadPort: "AEJEA - JEBEL ALI",
    dischargePort: "SGSIN - SINGAPORE",
    delivery: "SGSIN - SINGAPORE",
    confirmedDate: null,
    createdDate: "2026-08-23T09:00:00Z",
    printStatus: "N",
    appVersion: "1",
    isLocked: false,
  }),
  listRow({
    blNo: "BL-LOCKED-01",
    mcnNo: null,
    bookingNo: "BKG-778906",
    siNo: null,
    status: "D",
    agencyRefNo: "AGY-4462",
    origin: "SGSIN - SINGAPORE",
    loadPort: "SGSIN - SINGAPORE",
    dischargePort: "HKHKG - HONG KONG",
    delivery: "HKHKG - HONG KONG",
    confirmedDate: null,
    createdDate: "2026-08-22T11:00:00Z",
    printStatus: "N",
    appVersion: "2",
    isLocked: true,
  }),
  listRow({
    blNo: "BL-VOY-CLOSED",
    mcnNo: null,
    bookingNo: "BKG-778907",
    siNo: "SIN998289",
    status: "C",
    agencyRefNo: "AGY-4463",
    origin: "INNSA - NHAVA SHEVA",
    loadPort: "INNSA - NHAVA SHEVA",
    dischargePort: "DEHAM - HAMBURG",
    delivery: "DEHAM - HAMBURG",
    confirmedDate: "2026-08-20T12:00:00Z",
    createdDate: "2026-08-19T08:00:00Z",
    printStatus: "N",
    appVersion: "2",
    isLocked: false,
  }),
  listRow({
    blNo: "BL-BATCH-01",
    mcnNo: null,
    bookingNo: "BKG-779001",
    siNo: "SIN999001",
    status: "C",
    agencyRefNo: "AGY-4501",
    origin: "SGSIN - SINGAPORE",
    loadPort: "SGSIN - SINGAPORE",
    dischargePort: "JPTYO - TOKYO",
    delivery: "JPTYO - TOKYO",
    confirmedDate: "2026-08-24T10:00:00Z",
    createdDate: "2026-08-23T10:00:00Z",
    printStatus: "Y",
    appVersion: "2",
    isLocked: false,
  }),
  listRow({
    blNo: "BL-BATCH-02",
    mcnNo: null,
    bookingNo: "BKG-779002",
    siNo: "SIN999002",
    status: "C",
    agencyRefNo: "AGY-4502",
    origin: "CNSHA - SHANGHAI",
    loadPort: "CNSHA - SHANGHAI",
    dischargePort: "USLAX - LOS ANGELES",
    delivery: "USLAX - LOS ANGELES",
    confirmedDate: "2026-08-24T11:00:00Z",
    createdDate: "2026-08-23T11:00:00Z",
    printStatus: "Y",
    appVersion: "2",
    isLocked: false,
  }),
  listRow({
    blNo: "BL-BATCH-03",
    mcnNo: null,
    bookingNo: "BKG-779003",
    siNo: "SIN999003",
    status: "C",
    agencyRefNo: "AGY-4503",
    origin: "HKHKG - HONG KONG",
    loadPort: "HKHKG - HONG KONG",
    dischargePort: "SGSIN - SINGAPORE",
    delivery: "SGSIN - SINGAPORE",
    confirmedDate: "2026-08-24T12:00:00Z",
    createdDate: "2026-08-23T12:00:00Z",
    printStatus: "Y",
    appVersion: "2",
    isLocked: false,
  }),
];

function buildDetailFromList(
  row: BLListDTO,
  overrides: Partial<BLDTO> = {},
): BLDTO {
  const base: BLDTO = {
    id: row.blNo,
    blNo: row.blNo,
    siNo: row.siNo ?? "",
    bookingNo: row.bookingNo,
    status: row.status,
    blType: "Original",
    releaseType: "O",
    freightOption: "PREPAID",
    appVersion: row.appVersion,
    printCount: row.printStatus === "Y" ? 1 : 0,
    issuedAt: row.status === "I" ? row.confirmedDate : null,
    mcnNo: row.mcnNo,
    agencyRefNo: row.agencyRefNo,
    origin: row.origin,
    loadPort: row.loadPort,
    dischargePort: row.dischargePort,
    delivery: row.delivery,
    loadPortCountry: row.loadPort.startsWith("US") ? "US" : undefined,
    t2lFiling: false,
    nvocc: false,
    ensFiling: "N",
    routing: createDefaultBlRouting(row),
    preview: createEmptyBlPreview(),
    parties: { ...sharedParties },
    containers: sharedContainers.map((c) => ({
      ...c,
      cargoLines: c.cargoLines.map((l) => ({ ...l })),
    })),
    charges: [
      {
        id: "CHG-1",
        chargeCode: "OFR",
        description: "Ocean Freight",
        amount: 850,
        currency: "USD",
        prepaidCollect: "PREPAID",
        payByCustType: "Shipper",
        prepaidAmount: 850,
        collectAmount: 0,
        payAtAmount: 0,
      },
      {
        id: "CHG-2",
        chargeCode: "THC",
        description: "Terminal Handling",
        amount: 120,
        currency: "USD",
        prepaidCollect: "COLLECT",
        payByCustType: "Consignee",
        prepaidAmount: 0,
        collectAmount: 120,
        payAtAmount: 0,
      },
    ],
    insurance: {
      isInsuranceRequired: true,
      currency: "USD",
      cargoValue: 25000,
      termsAccepted: true,
      policyNo: row.policyNo ?? undefined,
    },
    cargoProtect: [
      {
        id: "CP-1",
        productCode: "CP-STD",
        description: "Standard Cargo Protect",
        amount: 45,
        currency: "USD",
      },
    ],
    files: [],
    ens: null,
  };
  return { ...base, ...overrides };
}

export const mockBLDetailsSeed: Record<string, BLDTO> = {
  "BL-998824": buildDetailFromList(mockBLListSeed[0], {
    printCount: 0,
    routing: {
      ...createDefaultBlRouting(mockBLListSeed[0]),
      vesselVoyage: "MSC ELARA / EL042N",
      scheduleLegs: [
        {
          id: "LEG-1",
          legType: "Ocean",
          vesselName: "MSC ELARA",
          voyage: "EL042N",
          polPortName: "SGSIN - SINGAPORE",
          podPortName: "JPTYO - TOKYO",
          etd: "2026-09-01",
          eta: "2026-09-08",
        },
      ],
    },
    parties: {
      ...sharedParties,
      notify2: {
        name: "Secondary Notify Co",
        address: "12 Notify Lane",
        city: "Tokyo",
        country: "JP",
        printOnBl: false,
      },
      forwarder: {
        name: "Global Forwarders Pte",
        address: "88 Forwarder Rd",
        city: "Singapore",
        country: "SG",
        printOnBl: true,
      },
    },
  }),
  "BL-998822": buildDetailFromList(mockBLListSeed[2], { printCount: 1 }),
  "BL-998826": buildDetailFromList(mockBLListSeed[3], {
    blType: "Seaway",
    printCount: 1,
    issuedAt: "2026-08-19T12:00:00Z",
    parties: {
      ...sharedParties,
      consignee: { ...sharedParties.consignee, toOrder: true },
    },
  }),
};

export const mockBLConfig: BLWizardConfig = { ...DEFAULT_BL_WIZARD_CONFIG };

export const mockBLInsuranceSeed: Record<
  string,
  {
    blNo: string;
    policyNo: string;
    provider: string;
    coverageAmount: number;
    currency: string;
    effectiveDate: string;
  }
> = {
  "BL-998826": {
    blNo: "BL-998826",
    policyNo: "POL-998826",
    provider: "Mock Marine Insurance",
    coverageAmount: 50000,
    currency: "USD",
    effectiveDate: "2026-08-19",
  },
};

export function getMockBLDetail(blNo: string): BLDTO | undefined {
  if (mockBLDetailsSeed[blNo]) {
    return structuredClone(mockBLDetailsSeed[blNo]);
  }
  const row = mockBLListSeed.find((r) => r.blNo === blNo);
  if (!row) return undefined;
  return buildDetailFromList(row);
}

export const mockBLChargesSeed: Record<string, BLChargesDTO> = {
  "BL-998824": {
    blNo: "BL-998824",
    lines: [
      {
        id: "CHG-1",
        chargeCode: "OFR",
        description: "Ocean Freight",
        amount: 850,
        currency: "USD",
        prepaidCollect: "PREPAID",
        payByCustType: "Shipper",
        prepaidAmount: 850,
        collectAmount: 0,
        payAtAmount: 0,
      },
      {
        id: "CHG-2",
        chargeCode: "THC",
        description: "Terminal Handling",
        amount: 120,
        currency: "USD",
        prepaidCollect: "COLLECT",
        payByCustType: "Consignee",
        prepaidAmount: 0,
        collectAmount: 120,
        payAtAmount: 0,
      },
    ],
    totals: [
      {
        currency: "USD",
        prepaid: 850,
        collect: 120,
        payAt: 0,
        grandTotal: 970,
      },
    ],
  },
  "BL-998822": {
    blNo: "BL-998822",
    lines: [
      {
        id: "CHG-3",
        chargeCode: "OFR",
        description: "Ocean Freight",
        amount: 1200,
        currency: "USD",
        prepaidCollect: "PREPAID",
        payByCustType: "Shipper",
        prepaidAmount: 1200,
        collectAmount: 0,
        payAtAmount: 0,
      },
    ],
    totals: [
      {
        currency: "USD",
        prepaid: 1200,
        collect: 0,
        payAt: 0,
        grandTotal: 1200,
      },
    ],
  },
};

export const mockMCNListSeed: MCNListDTO[] = [
  {
    mcnId: "MCN-2026-001",
    blNo: "BL-998824",
    bookingNo: "BKG-778901",
    status: "Draft",
    origin: "SGSIN - SINGAPORE",
    delivery: "JPTYO - TOKYO",
  },
  {
    mcnId: "MCN-2026-002",
    blNo: "BL-998822",
    bookingNo: "BKG-778899",
    status: "Confirmed",
    origin: "USNYC - NEW YORK",
    delivery: "GBFEL - FELIXSTOWE",
  },
  {
    mcnId: "MCN-2026-003",
    blNo: "ESLSIN123456",
    bookingNo: "BKG-778904",
    status: "Submitted",
    origin: "SGSIN - SINGAPORE",
    delivery: "INNSA - NHAVA SHEVA",
  },
];

export const mockMCNDetailsSeed: Record<string, MCNDTO> = {
  "MCN-2026-001": {
    mcnId: "MCN-2026-001",
    blNo: "BL-998824",
    bookingNo: "BKG-778901",
    status: "Draft",
    vessel: "MSC ELARA",
    voyage: "EL042N",
    loadPort: "SGSIN - SINGAPORE",
    dischargePort: "JPTYO - TOKYO",
    containerCount: 1,
    remarks: "Draft manifest for review",
  },
  "MCN-2026-002": {
    mcnId: "MCN-2026-002",
    blNo: "BL-998822",
    bookingNo: "BKG-778899",
    status: "Confirmed",
    vessel: "EVER GIVEN",
    voyage: "EV001E",
    loadPort: "USNYC - NEW YORK",
    dischargePort: "GBFEL - FELIXSTOWE",
    containerCount: 2,
  },
  "MCN-2026-003": {
    mcnId: "MCN-2026-003",
    blNo: "ESLSIN123456",
    bookingNo: "BKG-778904",
    status: "Submitted",
    vessel: "APL SENTOSA",
    voyage: "AS088W",
    loadPort: "SGSIN - SINGAPORE",
    dischargePort: "INNSA - NHAVA SHEVA",
    containerCount: 3,
    remarks: "Awaiting carrier confirmation",
  },
};

export const VOYAGE_CLOSED_BL_NOS = new Set(["BL-VOY-CLOSED"]);
export const REPRINT_BLOCKED_BL_NOS = new Set(["BL-998826"]);
