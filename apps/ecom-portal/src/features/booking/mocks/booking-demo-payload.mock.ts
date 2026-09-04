// Created by Sekar Nagarajan (2026-09-03 16:12)
/**
 * Full client-demo BookingPayload — all wizard steps populated.
 * Cargo: 10 containers × 5 commodities each (50 lines) for Preview / Cargo UI demos.
 */
import type {
  BookingPayload,
  CargoData,
  CommodityItem,
  ContainerItem,
  EnsData,
  InsuranceData,
  MasterDetailsData,
  PartiesData,
  SelectedRoute,
} from "../types/booking.types";
import {
  createReferenceField,
  REFERENCE_FIELD_CATALOG,
  type ReferenceField,
} from "../utils/reference-field.utils";

const DEMO_ORIGIN = "AEJEA - Jebel Ali, UAE";
const DEMO_DELIVERY = "SGSIN - Singapore, Singapore";
const DEMO_READY = "2026-09-15";

const CONTAINER_TYPES = [
  "20DC",
  "40HC",
  "40DV",
  "20DC",
  "40HC",
  "45HC",
  "20RF",
  "40HC",
  "40OT",
  "40HC",
] as const;

const COMMODITY_POOL = [
  {
    code: "ELECTRONICS",
    hs: "8517120000",
    description: "Consumer electronics — smartphones & accessories",
    pkg: "CTN",
  },
  {
    code: "AUTO-PARTS",
    hs: "8708990000",
    description: "Automotive spare parts — brake & suspension kits",
    pkg: "PLT",
  },
  {
    code: "TEXTILES",
    hs: "6203420000",
    description: "Apparel — cotton trousers & garments",
    pkg: "CTN",
  },
  {
    code: "PLASTICS",
    hs: "3901100000",
    description: "Plastic raw materials — polyethylene pellets",
    pkg: "BAG",
  },
  {
    code: "FOODSTUFF",
    hs: "1905900000",
    description: "Foodstuffs — packaged bakery products",
    pkg: "CTN",
  },
  {
    code: "CHEM-NONDG",
    hs: "3402200000",
    description: "Non-hazardous cleaning chemicals",
    pkg: "DRM",
  },
  {
    code: "STEEL",
    hs: "7210490000",
    description: "Steel coils — galvanized flat products",
    pkg: "BDL",
  },
  {
    code: "GEN-CGO",
    hs: "4002191000",
    description: "General merchandise — mixed retail cargo",
    pkg: "BOX",
  },
] as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function buildDemoRoute(): SelectedRoute {
  return {
    routeId: "demo-route-fe1-direct",
    serviceCode: "FE1",
    serviceName: "Far East Express 1",
    vesselCode: "AGEX",
    vesselName: "ANTIGRAVITY EXPRESS",
    voyage: "024",
    bound: "E",
    polPortId: "AEJEA",
    polPortName: "Jebel Ali, UAE",
    podPortId: "SGSIN",
    podPortName: "Singapore, Singapore",
    polTerminal: "AEJEA Terminal 1",
    podTerminal: "PSA Terminal",
    etd: "2026-09-19 18:00",
    eta: "2026-10-11 06:00",
    transitTimeDays: 22,
    isDirect: true,
    isDefaultRoute: true,
    transshipmentCount: 0,
    shipmentKind: "Direct",
    gateInCutoff: "2026-09-17 12:00",
    siDocCutoff: "2026-09-18 17:00",
    vgmCutoff: "2026-09-18 12:00",
    legs: [
      {
        id: "demo-leg-aejea-sgsin",
        legType: "Mainline",
        vesselName: "ANTIGRAVITY EXPRESS",
        vesselCode: "AGEX",
        voyage: "024",
        bound: "E",
        serviceName: "Far East Express 1",
        serviceCode: "FE1",
        polPortId: "AEJEA",
        polPortName: "Jebel Ali, UAE",
        podPortId: "SGSIN",
        podPortName: "Singapore, Singapore",
        etd: "2026-09-19 18:00",
        eta: "2026-10-11 06:00",
        terminal: "AEJEA Terminal 1",
      },
    ],
  };
}

function buildDemoMasterDetails(): MasterDetailsData {
  return {
    origin: DEMO_ORIGIN,
    delivery: DEMO_DELIVERY,
    cargoReadyDate: DEMO_READY,
    haulageOriginType: "Merchant",
    haulageDestinationType: "Carrier",
    carriageContract: "CY/CY",
    onlineBookingNo: "BKON-DEMO-7101",
    agreementParty: "Global Shipping Solutions Ltd.",
    preferredAgency: "AEJEA",
    additionalInformation: "Client demo booking — full wizard sample data.",
    rateReference: "RRF-2026-00142",
    agencyReference: "AGY-SIN-88421",
    oceanFreight: "Prepaid",
    placeOfFinalReceipt: "AEJEA-CY",
    natCode: "NAT-7781",
    haulageType: "Pickup & Drop",
    pickupDate: "2026-09-16",
    dropDate: "2026-09-17",
    haulerCode: "HAU-DXB-01",
    customerPo: "PO-2026-88901",
    refType: "Normal",
    exportRef: "EXP-AE-55210",
    emptyPickupPoint: "Terminal",
    emptyPickupFacility: "AEJEA-T1",
    emptyPickupDate: "2026-09-16",
    customerReference: "CUST-REF-DEMO-01",
    acid: "ACID-44521",
    dpwShipperType: "EXPORTER",
    dpwShipperCode: "DPW-EXP-10021",
    selectedRoute: buildDemoRoute(),
    selectedRate: {
      rateNo: "RT-2026-1001",
      itemNo: "1",
      amdNo: "0",
      rateType: "CMS",
      eqpType: "40HC",
      amount: 1850,
      currency: "USD",
      customer: "SolverMinds Solutions",
      customerCode: "INSVM001",
    },
  };
}

function buildDemoParties(): PartiesData {
  return {
    shipperName: "Global Shipping Solutions Ltd.",
    shipperReference: "SHP-DEMO-001",
    shipperContact: "John Smith",
    shipperAddress: "123 Harbor Street, Jebel Ali Free Zone",
    shipperCity: "Dubai",
    shipperCountry: "AE",
    shipperEmail: "john.smith@globalshipping.com",
    shipperPhone: "+971 4 123 4567",
    consigneeName: "Pacific Trade Hub Pte Ltd",
    consigneeContact: "Mei Lin Tan",
    consigneeAddress: "88 Science Park Drive, #04-12",
    consigneeCity: "Singapore",
    consigneeCountry: "SG",
    consigneeEmail: "mei.lin@pacifictrade.sg",
    consigneePhone: "+65 6123 8890",
    notifyPartyName: "Harbor Notify Services",
    notifyPartyContact: "Aisha Rahman",
    notifyPartyAddress: "12 Keppel Road",
    notifyPartyCity: "Singapore",
    notifyPartyCountry: "SG",
    notifyPartyEmail: "notify@harborservices.sg",
    notifyPartyPhone: "+65 6222 1001",
    notifyParty2Name: "Asia Logistics Notify Desk",
    notifyParty2Contact: "Rajesh Kumar",
    freightForwarder: "Ocean Forwarding FZE",
    freightForwarderContact: "Sara Al Maktoum",
    agreementParty: "Global Shipping Solutions Ltd.",
    agreementPartyContact: "John Smith",
    siSubmittingParty: "Ocean Forwarding FZE",
    siSubmittingPartyContact: "Sara Al Maktoum",
  };
}

function buildDemoCommodity(
  containerIndex: number,
  commodityIndex: number,
): CommodityItem {
  const pool = COMMODITY_POOL[(containerIndex + commodityIndex) % COMMODITY_POOL.length];
  const isDg =
    containerIndex === 3 && commodityIndex === 0
      ? true
      : false;

  return {
    id: `demo-cgo-${pad2(containerIndex + 1)}-${pad2(commodityIndex + 1)}`,
    commodity: pool.code,
    hsCode: pool.hs,
    classCode: "",
    weight: 420 + containerIndex * 35 + commodityIndex * 18,
    volume: 1.2 + commodityIndex * 0.35 + containerIndex * 0.05,
    packageType: pool.pkg,
    packageQuantity: 12 + commodityIndex * 4 + containerIndex,
    description: `${pool.description} (C${containerIndex + 1}-L${commodityIndex + 1})`,
    marksAndNumbers: `MK-${pad2(containerIndex + 1)}${pad2(commodityIndex + 1)}`,
    isDangerousGoods: isDg,
    unNumber: isDg ? "1263" : "",
    dgClass: isDg ? "3" : "",
    flashPoint: isDg ? "23C" : "",
    marinePollutant: false,
    shippingName: isDg ? "PAINT RELATED MATERIAL" : "",
  };
}

function buildDemoContainer(index: number): ContainerItem {
  const type = CONTAINER_TYPES[index] ?? "40HC";
  const isReefer = type.includes("RF") || type.includes("RH");
  const isOog = type.includes("OT") || type.includes("FR");

  return {
    id: `demo-ctn-${pad2(index + 1)}`,
    containerType: type,
    containerNo: `MSCU${String(4500000 + index * 111)}`,
    quantity: 1,
    eqpStatus: "LADEN",
    tareWeight: type.startsWith("20") ? 2200 : 3900,
    isSoc: index === 5,
    reeferMode: isReefer ? "operating" : "none",
    setTemp: isReefer ? -18 : undefined,
    minTemp: isReefer ? -25 : undefined,
    maxTemp: isReefer ? -15 : undefined,
    tempUnit: "Celsius",
    isLcl: false,
    isOog: isOog,
    olForward: isOog ? 30 : undefined,
    olAft: isOog ? 20 : undefined,
    owLeft: isOog ? 15 : undefined,
    owRight: isOog ? 15 : undefined,
    oh: isOog ? 40 : undefined,
    dimensionUnit: "CM",
    commodities: Array.from({ length: 5 }, (_, j) =>
      buildDemoCommodity(index, j),
    ),
  };
}

/** 10 containers × 5 commodities. */
export function buildClientDemoCargo(
  containerCount = 10,
  commoditiesPerContainer = 5,
): CargoData {
  return {
    containers: Array.from({ length: containerCount }, (_, i) => {
      const container = buildDemoContainer(i);
      if (commoditiesPerContainer !== 5) {
        container.commodities = Array.from(
          { length: commoditiesPerContainer },
          (_, j) => buildDemoCommodity(i, j),
        );
      }
      return container;
    }),
  };
}

function buildDemoEns(): EnsData {
  return {
    euCustomsZone: true,
    blType: "Straight BL",
    ensFilingType: "Single Filing",
    paymentMethod: "Wire Transfer",
    declarantName: "",
    declarantAddress: "",
    declarantCity: "",
    declarantCountry: "",
    declarantEori: "",
    declarantEmail: "",
    buyerName: "Pacific Trade Hub Pte Ltd",
    buyerAddress: "88 Science Park Drive, #04-12",
    buyerCity: "Singapore",
    buyerCountry: "SG",
    sellerName: "Global Shipping Solutions Ltd.",
    sellerAddress: "123 Harbor Street, Jebel Ali Free Zone",
    sellerCity: "Dubai",
    sellerCountry: "AE",
  };
}

function buildDemoInsurance(): InsuranceData {
  return {
    isInsuranceRequired: true,
    currency: "USD",
    cargoValue: 1250000,
    termsAccepted: true,
  };
}

function buildDemoDocuments() {
  return [
    {
      id: "demo-doc-1",
      type: "PACKING_LIST",
      fileName: "packing-list-demo.pdf",
      uploadedAt: "2026-09-10T08:32:00.000Z",
    },
    {
      id: "demo-doc-2",
      type: "VGM",
      fileName: "vgm-certificate-demo.pdf",
      uploadedAt: "2026-09-10T09:05:00.000Z",
    },
    {
      id: "demo-doc-3",
      type: "MSDS",
      fileName: "msds-paint-related.pdf",
      uploadedAt: "2026-09-10T09:18:00.000Z",
    },
    {
      id: "demo-doc-4",
      type: "COMMERCIAL_INVOICE",
      fileName: "commercial-invoice-demo.pdf",
      uploadedAt: "2026-09-10T09:40:00.000Z",
    },
  ];
}

function buildDemoReferenceFields(): ReferenceField[] {
  const values: Partial<Record<(typeof REFERENCE_FIELD_CATALOG)[number]["key"], string>> =
    {
      rateRefNo: "RRF-2026-00142",
      agencyRefNo: "AGY-SIN-88421",
      oceanFreightTerms: "Prepaid",
      natCode: "NAT-7781",
      emptyPickupLocation: "AEJEA Terminal 1 Empty Yard",
      finalReceiptPlace: "Jebel Ali Container Yard",
      haulierCode: "HAU-DXB-01",
    };

  return REFERENCE_FIELD_CATALOG.map((item) => {
    const field = createReferenceField(item, values[item.key]);
    field.id = `demo-ref-${item.key}`;
    return field;
  });
}

/** Full BookingPayload for client demos (New Booking / Amend / Template / Preview). */
export function buildClientDemoBookingPayload(): BookingPayload {
  return {
    masterDetails: buildDemoMasterDetails(),
    parties: buildDemoParties(),
    cargo: buildClientDemoCargo(10, 5),
    ens: buildDemoEns(),
    insurance: buildDemoInsurance(),
    documents: buildDemoDocuments(),
    referenceFields: buildDemoReferenceFields(),
    draftId: "draft-client-demo",
  };
}
