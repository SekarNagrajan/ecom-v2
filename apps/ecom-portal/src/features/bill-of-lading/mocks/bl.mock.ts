// Modified by Sekar Nagarajan (2026-08-31 16:43)
import { MOCK_DEFAULT_REFERENCE_FIELDS } from "../../booking/utils/reference-field.utils";
import {
  DEFAULT_BL_WIZARD_CONFIG,
  type BLWizardConfig,
} from "../config/bl-wizard-config";
import type {
  BLChargesDTO,
  BLDTO,
  BLListDTO,
  BLRouting,
  BLRoutingLeg,
  BLRowStatus,
  MCNDTO,
  MCNListDTO,
} from "../types/bl.types";
import {
  BL_STATUS_LABELS,
  createDefaultBlRouting,
  createEmptyBlPreview,
} from "../types/bl.types";

/** "SGSIN - SINGAPORE" → "Singapore" for vessel card port labels. */
function portDisplayName(portLabel: string): string {
  const parts = portLabel.split(" - ");
  const name = (parts[1] ?? parts[0] ?? portLabel).trim();
  if (!name) return "—";
  return name
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function oceanLeg(
  partial: Omit<BLRoutingLeg, "legType"> & { legType?: string },
): BLRoutingLeg {
  return { legType: "Ocean", ...partial };
}

/**
 * Per–B/L vessel schedule mocks for Master Details.
 * Keyed by blNo so opening different BLs shows distinct vessel / voyage / legs.
 */
const mockBlVesselByBlNo: Record<
  string,
  { vesselName: string; voyage: string; legs: BLRoutingLeg[] }
> = {
  "BL-998824": {
    vesselName: "MSC ELARA",
    voyage: "EL042N",
    legs: [
      oceanLeg({
        id: "LEG-BL-998824-1",
        vesselName: "MSC ELARA",
        voyage: "EL042N",
        polPortName: "Singapore",
        podPortName: "Colombo",
        etd: "2026-09-01",
        eta: "2026-09-05",
      }),
      oceanLeg({
        id: "LEG-BL-998824-2",
        vesselName: "MSC ELARA",
        voyage: "EL042N",
        polPortName: "Colombo",
        podPortName: "Tokyo",
        etd: "2026-09-06",
        eta: "2026-09-12",
      }),
    ],
  },
  "BL-998825": {
    vesselName: "MAERSK ESSEX",
    voyage: "ME118E",
    legs: [
      oceanLeg({
        id: "LEG-BL-998825-1",
        vesselName: "MAERSK ESSEX",
        voyage: "ME118E",
        polPortName: "New York",
        podPortName: "Halifax",
        etd: "2026-09-03",
        eta: "2026-09-06",
      }),
      oceanLeg({
        id: "LEG-BL-998825-2",
        vesselName: "MAERSK ESSEX",
        voyage: "ME118E",
        polPortName: "Halifax",
        podPortName: "Felixstowe",
        etd: "2026-09-07",
        eta: "2026-09-14",
      }),
    ],
  },
  "BL-998822": {
    vesselName: "APL SENTOSA",
    voyage: "AS091W",
    legs: [
      oceanLeg({
        id: "LEG-BL-998822-1",
        vesselName: "APL SENTOSA",
        voyage: "AS091W",
        polPortName: "New York",
        podPortName: "Felixstowe",
        etd: "2026-08-28",
        eta: "2026-09-08",
      }),
    ],
  },
  "BL-998826": {
    vesselName: "COSCO SHIPPING UNIVERSE",
    voyage: "CU055E",
    legs: [
      oceanLeg({
        id: "LEG-BL-998826-1",
        vesselName: "COSCO SHIPPING UNIVERSE",
        voyage: "CU055E",
        polPortName: "Shanghai",
        podPortName: "Busan",
        etd: "2026-08-25",
        eta: "2026-08-28",
      }),
      oceanLeg({
        id: "LEG-BL-998826-2",
        vesselName: "COSCO SHIPPING UNIVERSE",
        voyage: "CU055E",
        polPortName: "Busan",
        podPortName: "Los Angeles",
        etd: "2026-08-29",
        eta: "2026-09-10",
      }),
    ],
  },
  ESLSIN123456: {
    vesselName: "EVER GIVEN",
    voyage: "EG023W",
    legs: [
      oceanLeg({
        id: "LEG-ESLSIN123456-1",
        vesselName: "EVER GIVEN",
        voyage: "EG023W",
        polPortName: "Singapore",
        podPortName: "Colombo",
        etd: "2026-09-02",
        eta: "2026-09-06",
      }),
      oceanLeg({
        id: "LEG-ESLSIN123456-2",
        vesselName: "EVER GIVEN",
        voyage: "EG023W",
        polPortName: "Colombo",
        podPortName: "Nhava Sheva",
        etd: "2026-09-07",
        eta: "2026-09-12",
      }),
    ],
  },
  "BL-V1-001": {
    vesselName: "HMM ALGECIRAS",
    voyage: "HA014E",
    legs: [
      oceanLeg({
        id: "LEG-BL-V1-001-1",
        vesselName: "HMM ALGECIRAS",
        voyage: "HA014E",
        polPortName: "Jebel Ali",
        podPortName: "Singapore",
        etd: "2026-09-04",
        eta: "2026-09-11",
      }),
    ],
  },
  "BL-LOCKED-01": {
    vesselName: "OOCL TOKYO",
    voyage: "OT088N",
    legs: [
      oceanLeg({
        id: "LEG-BL-LOCKED-01-1",
        vesselName: "OOCL TOKYO",
        voyage: "OT088N",
        polPortName: "Singapore",
        podPortName: "Hong Kong",
        etd: "2026-09-05",
        eta: "2026-09-08",
      }),
    ],
  },
  "BL-VOY-CLOSED": {
    vesselName: "MSC OSCAR",
    voyage: "MO201W",
    legs: [
      oceanLeg({
        id: "LEG-BL-VOY-CLOSED-1",
        vesselName: "MSC OSCAR",
        voyage: "MO201W",
        polPortName: "Nhava Sheva",
        podPortName: "Jeddah",
        etd: "2026-08-22",
        eta: "2026-08-27",
      }),
      oceanLeg({
        id: "LEG-BL-VOY-CLOSED-2",
        vesselName: "MSC OSCAR",
        voyage: "MO201W",
        polPortName: "Jeddah",
        podPortName: "Hamburg",
        etd: "2026-08-28",
        eta: "2026-09-09",
      }),
    ],
  },
  "BL-BATCH-01": {
    vesselName: "ONE COMPETENCE",
    voyage: "OC033E",
    legs: [
      oceanLeg({
        id: "LEG-BL-BATCH-01-1",
        vesselName: "ONE COMPETENCE",
        voyage: "OC033E",
        polPortName: "Singapore",
        podPortName: "Tokyo",
        etd: "2026-09-01",
        eta: "2026-09-09",
      }),
    ],
  },
  "BL-BATCH-02": {
    vesselName: "CMA CGM MARCO POLO",
    voyage: "CM077E",
    legs: [
      oceanLeg({
        id: "LEG-BL-BATCH-02-1",
        vesselName: "CMA CGM MARCO POLO",
        voyage: "CM077E",
        polPortName: "Shanghai",
        podPortName: "Los Angeles",
        etd: "2026-09-02",
        eta: "2026-09-16",
      }),
    ],
  },
  "BL-BATCH-03": {
    vesselName: "YANG MING WELLNESS",
    voyage: "YW012S",
    legs: [
      oceanLeg({
        id: "LEG-BL-BATCH-03-1",
        vesselName: "YANG MING WELLNESS",
        voyage: "YW012S",
        polPortName: "Hong Kong",
        podPortName: "Singapore",
        etd: "2026-09-03",
        eta: "2026-09-07",
      }),
    ],
  },
};

/** Build vessel routing for a list row — explicit seed by blNo, else a direct fallback leg. */
export function createMockBlRouting(row: BLListDTO): BLRouting {
  const base = createDefaultBlRouting(row);
  const seeded = mockBlVesselByBlNo[row.blNo];
  if (seeded) {
    return {
      ...base,
      vesselVoyage: `${seeded.vesselName} / ${seeded.voyage}`,
      scheduleLegs: seeded.legs.map((leg) => ({ ...leg })),
    };
  }

  const pol = portDisplayName(row.loadPort);
  const pod = portDisplayName(row.dischargePort);
  const vesselName = "MOCK VESSEL";
  const voyage = "MV001E";
  return {
    ...base,
    vesselVoyage: `${vesselName} / ${voyage}`,
    scheduleLegs: [
      oceanLeg({
        id: `LEG-${row.blNo}-1`,
        vesselName,
        voyage,
        polPortName: pol,
        podPortName: pod,
        etd: "2026-09-01",
        eta: "2026-09-10",
      }),
    ],
  };
}

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
    // Modified by Sekar Nagarajan (2026-08-31 16:43) — per–BL vessel schedule mock
    routing: createMockBlRouting(row),
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
    // Existing non-draft BLs keep saved references; draft/create starts empty
    referenceFields:
      row.status === "D"
        ? []
        : structuredClone(MOCK_DEFAULT_REFERENCE_FIELDS),
    ens: null,
  };
  return { ...base, ...overrides };
}

export const mockBLDetailsSeed: Record<string, BLDTO> = {
  // Vessel routing comes from createMockBlRouting via buildDetailFromList
  "BL-998824": buildDetailFromList(mockBLListSeed[0], {
    printCount: 0,
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
