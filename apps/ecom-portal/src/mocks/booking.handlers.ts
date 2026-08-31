// Modified by Sekar Nagarajan (2026-08-31 18:52)
import { delay, http, HttpResponse } from "msw";

import {
  BOOKING_LOOKUPS,
  type BookingLookupKind,
} from "../features/booking/mocks/booking-lookups.mock";
import { searchBookingCustomers } from "../features/booking/mocks/booking-customers.mock";
import {
  searchHsCodes,
  searchUnNumbers,
} from "../features/booking/mocks/booking-hs-un.mock";
import { buildMockBookingRates } from "../features/booking/mocks/booking-rates.mock";
import { buildMockBookingRoutes } from "../features/booking/mocks/booking-routing.mock";
import type { BookingListDTO } from "../features/booking/types/booking-list.types";
import type {
  BookingActivityEvent,
  BookingPayload,
} from "../features/booking/types/booking.types";
import {
  createEmptyCommodity,
  createEmptyContainer,
} from "../features/booking/types/booking.types";
import { MOCK_DEFAULT_REFERENCE_FIELDS } from "../features/booking/utils/reference-field.utils";

/** 20 list rows — Cancelled / Completed / Draft / Submitted / In Transit (4 each). */
const mockBookings: BookingListDTO[] = [
  // Draft (4)
  {
    id: "bkg-1",
    bookingNo: "AE01444001",
    onlineRefNo: "BKON7101",
    agencyRefNo: "AGY-1001",
    status: "Draft",
    origin: "AEJEA - JEBEL ALI",
    delivery: "SGSIN - SINGAPORE",
    createdDate: "28-Aug-2026 09:10",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 2,
    submittedDate: "",
  },
  {
    id: "bkg-2",
    bookingNo: "IN01444002",
    onlineRefNo: "BKON7102",
    agencyRefNo: "",
    status: "Draft",
    origin: "INNSA - NHAVA SHEVA",
    delivery: "NLRTM - ROTTERDAM",
    createdDate: "27-Aug-2026 14:22",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 1,
    submittedDate: "",
  },
  {
    id: "bkg-3",
    bookingNo: "CNSHA44003",
    onlineRefNo: "BKON7103",
    agencyRefNo: "AGY-1003",
    status: "Draft",
    origin: "CNSHA - SHANGHAI",
    delivery: "USLAX - LOS ANGELES",
    createdDate: "26-Aug-2026 11:05",
    confirmedDate: "",
    dgStatus: "Y",
    teusCount: 4,
    submittedDate: "",
  },
  {
    id: "bkg-4",
    bookingNo: "HKHKG44004",
    onlineRefNo: "BKON7104",
    agencyRefNo: "",
    status: "Draft",
    origin: "HKHKG - HONG KONG",
    delivery: "DEHAM - HAMBURG",
    createdDate: "25-Aug-2026 16:40",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 3,
    submittedDate: "",
  },
  // Submitted (4)
  {
    id: "bkg-5",
    bookingNo: "AE01444005",
    onlineRefNo: "BKON7105",
    agencyRefNo: "AGY-1005",
    status: "Submitted",
    origin: "AEJEA - JEBEL ALI",
    delivery: "GBFEL - FELIXSTOWE",
    createdDate: "24-Aug-2026 08:15",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 5,
    submittedDate: "24-Aug-2026 10:02",
  },
  {
    id: "bkg-6",
    bookingNo: "SGSIN44006",
    onlineRefNo: "BKON7106",
    agencyRefNo: "AGY-1006",
    status: "Submitted",
    origin: "SGSIN - SINGAPORE",
    delivery: "JPTYO - TOKYO",
    createdDate: "23-Aug-2026 13:30",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 2,
    submittedDate: "23-Aug-2026 15:11",
  },
  {
    id: "bkg-7",
    bookingNo: "USNYC44007",
    onlineRefNo: "BKON7107",
    agencyRefNo: "",
    status: "Submitted",
    origin: "USNYC - NEW YORK",
    delivery: "NLRTM - ROTTERDAM",
    createdDate: "22-Aug-2026 07:45",
    confirmedDate: "",
    dgStatus: "Y",
    teusCount: 6,
    submittedDate: "22-Aug-2026 09:20",
  },
  {
    id: "bkg-8",
    bookingNo: "INMAA44008",
    onlineRefNo: "BKON7108",
    agencyRefNo: "AGY-1008",
    status: "Submitted",
    origin: "INMAA - CHENNAI",
    delivery: "AEJEA - JEBEL ALI",
    createdDate: "21-Aug-2026 18:05",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 1,
    submittedDate: "21-Aug-2026 19:40",
  },
  // In Transit (4)
  {
    id: "bkg-9",
    bookingNo: "AE01444009",
    onlineRefNo: "BKON7109",
    agencyRefNo: "AGY-1009",
    status: "In Transit",
    origin: "AEJEA - JEBEL ALI",
    delivery: "SGSIN - SINGAPORE",
    createdDate: "10-Aug-2026 08:32",
    confirmedDate: "11-Aug-2026 00:26",
    dgStatus: "N",
    teusCount: 5,
    submittedDate: "10-Aug-2026 08:32",
  },
  {
    id: "bkg-10",
    bookingNo: "CNSHA44010",
    onlineRefNo: "BKON7110",
    agencyRefNo: "AGY-1010",
    status: "In Transit",
    origin: "CNSHA - SHANGHAI",
    delivery: "USLAX - LOS ANGELES",
    createdDate: "08-Aug-2026 12:00",
    confirmedDate: "09-Aug-2026 06:15",
    dgStatus: "N",
    teusCount: 8,
    submittedDate: "08-Aug-2026 12:30",
  },
  {
    id: "bkg-11",
    bookingNo: "INNSA44011",
    onlineRefNo: "BKON7111",
    agencyRefNo: "",
    status: "In Transit",
    origin: "INNSA - NHAVA SHEVA",
    delivery: "DEHAM - HAMBURG",
    createdDate: "05-Aug-2026 09:50",
    confirmedDate: "06-Aug-2026 11:10",
    dgStatus: "Y",
    teusCount: 3,
    submittedDate: "05-Aug-2026 10:20",
  },
  {
    id: "bkg-12",
    bookingNo: "HKHKG44012",
    onlineRefNo: "BKON7112",
    agencyRefNo: "AGY-1012",
    status: "In Transit",
    origin: "HKHKG - HONG KONG",
    delivery: "NLRTM - ROTTERDAM",
    createdDate: "03-Aug-2026 15:25",
    confirmedDate: "04-Aug-2026 08:00",
    dgStatus: "N",
    teusCount: 4,
    submittedDate: "03-Aug-2026 16:01",
  },
  // Completed (4)
  {
    id: "bkg-13",
    bookingNo: "AE01444013",
    onlineRefNo: "BKON7113",
    agencyRefNo: "AGY-1013",
    status: "Completed",
    origin: "AEJEA - JEBEL ALI",
    delivery: "SGSIN - SINGAPORE",
    createdDate: "15-Jul-2026 10:00",
    confirmedDate: "16-Jul-2026 09:00",
    dgStatus: "N",
    teusCount: 2,
    submittedDate: "15-Jul-2026 10:30",
  },
  {
    id: "bkg-14",
    bookingNo: "USLAX44014",
    onlineRefNo: "BKON7114",
    agencyRefNo: "AGY-1014",
    status: "Completed",
    origin: "USLAX - LOS ANGELES",
    delivery: "JPTYO - TOKYO",
    createdDate: "10-Jul-2026 07:20",
    confirmedDate: "11-Jul-2026 14:45",
    dgStatus: "N",
    teusCount: 7,
    submittedDate: "10-Jul-2026 08:00",
  },
  {
    id: "bkg-15",
    bookingNo: "GBFEL44015",
    onlineRefNo: "BKON7115",
    agencyRefNo: "",
    status: "Completed",
    origin: "GBFEL - FELIXSTOWE",
    delivery: "INNSA - NHAVA SHEVA",
    createdDate: "01-Jul-2026 11:40",
    confirmedDate: "02-Jul-2026 16:20",
    dgStatus: "Y",
    teusCount: 2,
    submittedDate: "01-Jul-2026 12:05",
  },
  {
    id: "bkg-16",
    bookingNo: "SGSIN44016",
    onlineRefNo: "BKON7116",
    agencyRefNo: "AGY-1016",
    status: "Completed",
    origin: "SGSIN - SINGAPORE",
    delivery: "AEJEA - JEBEL ALI",
    createdDate: "20-Jun-2026 09:15",
    confirmedDate: "21-Jun-2026 10:00",
    dgStatus: "N",
    teusCount: 5,
    submittedDate: "20-Jun-2026 09:45",
  },
  // Cancelled (4)
  {
    id: "bkg-17",
    bookingNo: "AE01444017",
    onlineRefNo: "BKON7117",
    agencyRefNo: "AGY-1017",
    status: "Cancelled",
    origin: "AEJEA - JEBEL ALI",
    delivery: "NLRTM - ROTTERDAM",
    createdDate: "18-Aug-2026 13:00",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 1,
    submittedDate: "18-Aug-2026 14:10",
  },
  {
    id: "bkg-18",
    bookingNo: "CNSHA44018",
    onlineRefNo: "BKON7118",
    agencyRefNo: "",
    status: "Cancelled",
    origin: "CNSHA - SHANGHAI",
    delivery: "DEHAM - HAMBURG",
    createdDate: "12-Aug-2026 10:30",
    confirmedDate: "13-Aug-2026 08:00",
    dgStatus: "N",
    teusCount: 3,
    submittedDate: "12-Aug-2026 11:00",
  },
  {
    id: "bkg-19",
    bookingNo: "INNSA44019",
    onlineRefNo: "BKON7119",
    agencyRefNo: "AGY-1019",
    status: "Cancelled",
    origin: "INNSA - NHAVA SHEVA",
    delivery: "SGSIN - SINGAPORE",
    createdDate: "05-Aug-2026 16:50",
    confirmedDate: "",
    dgStatus: "Y",
    teusCount: 2,
    submittedDate: "05-Aug-2026 17:20",
  },
  {
    id: "bkg-20",
    bookingNo: "HKHKG44020",
    onlineRefNo: "BKON7120",
    agencyRefNo: "AGY-1020",
    status: "Cancelled",
    origin: "HKHKG - HONG KONG",
    delivery: "USNYC - NEW YORK",
    createdDate: "01-Aug-2026 08:00",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 4,
    submittedDate: "01-Aug-2026 09:15",
  },
];

function buildSampleCargo(commodityCode: string, containerType: string, quantity: number, weight: number) {
  const commodity = createEmptyCommodity();
  commodity.commodity = commodityCode;
  commodity.hsCode = "4002191000";
  commodity.description = commodityCode;
  commodity.packageType = "BAG";
  commodity.packageQuantity = 1;
  commodity.weight = weight;
  commodity.volume = 20;
  const container = createEmptyContainer();
  container.containerType = containerType;
  container.quantity = quantity;
  container.commodities = [commodity];
  return { containers: [container] };
}

let mockTemplates = [
  {
    id: "tmpl-1",
    templateName: "Standard Electronics Export",
    origin: "AEJEA-JEBEL ALI, UAE",
    delivery: "SGSIN-SINGAPORE",
    payload: {
      masterDetails: {
        origin: "AEJEA-JEBEL ALI, UAE",
        delivery: "SGSIN-SINGAPORE",
        cargoReadyDate: "2026-09-01",
        haulageOriginType: "Merchant",
        haulageDestinationType: "Merchant",
      },
      parties: {
        shipperName: "Electronics Trading LLC",
        consigneeName: "Tech Hub Pte Ltd",
        agreementParty: "Logistics Partner",
        siSubmittingParty: "Logistics Partner",
      },
      cargo: buildSampleCargo("GEN-CGO", "20DV", 1, 5000),
      ens: null,
      insurance: null,
      documents: [],
    } satisfies BookingPayload,
  },
  {
    id: "tmpl-2",
    templateName: "Auto Parts to Europe",
    origin: "AEJEA-JEBEL ALI, UAE",
    delivery: "NLRTM-ROTTERDAM",
    payload: {
      masterDetails: {
        origin: "AEJEA-JEBEL ALI, UAE",
        delivery: "NLRTM-ROTTERDAM",
        cargoReadyDate: "2026-09-15",
        haulageOriginType: "Carrier",
        haulageDestinationType: "Carrier",
      },
      parties: {
        shipperName: "Auto Parts FZE",
        consigneeName: "Euro Spares B.V.",
        agreementParty: "Auto Parts FZE",
        siSubmittingParty: "Auto Parts FZE",
      },
      cargo: buildSampleCargo("AUTO-PARTS", "40HC", 2, 12000),
      ens: {
        euCustomsZone: true,
        blType: "Straight BL",
        ensFilingType: "Single Filing",
        paymentMethod: "Wire Transfer",
      },
      insurance: null,
      documents: [],
    } satisfies BookingPayload,
  },
];

const bookingDetailsById: Record<string, BookingPayload> = {
  "bkg-1": {
    masterDetails: {
      origin: "AEJEA-JEBEL ALI, UAE",
      delivery: "SGSIN-SINGAPORE",
      cargoReadyDate: "2026-09-01",
      haulageOriginType: "Merchant",
      haulageDestinationType: "Merchant",
      carriageContract: "CY/CY",
      preferredAgency: "AEJEA",
      selectedRoute: null,
    },
    parties: {
      shipperName: "Electronics Trading LLC",
      shipperReference: "SHP-001",
      shipperAddress: "123 Harbor St",
      shipperCity: "Dubai",
      shipperCountry: "AE",
      consigneeName: "Tech Hub Pte Ltd",
      consigneeAddress: "88 Science Park",
      consigneeCity: "Singapore",
      consigneeCountry: "SG",
      notifyPartyName: "Notify One",
      notifyParty2Name: "Notify Two",
      agreementParty: "Logistics Partner",
      siSubmittingParty: "Logistics Partner",
    },
    cargo: buildSampleCargo("GEN-CGO", "20DV", 1, 5000),
    ens: null,
    insurance: {
      isInsuranceRequired: true,
      currency: "USD",
      cargoValue: 50000,
      termsAccepted: true,
    },
    documents: [
      {
        id: "doc-1",
        type: "PACKING_LIST",
        fileName: "packing-list.pdf",
        uploadedAt: "2026-08-10T08:32:00.000Z",
      },
    ],
    // Existing booking already has references — amend shows them for edit
    referenceFields: structuredClone(MOCK_DEFAULT_REFERENCE_FIELDS),
  },
};

export const bookingHandlers = [
  http.get("/api/booking/routing", async ({ request }) => {
    await delay(600);
    const url = new URL(request.url);
    const origin = url.searchParams.get("origin") || "";
    const delivery = url.searchParams.get("delivery") || "";
    const cargoReadyDate = url.searchParams.get("cargoReadyDate") || "";
    const data = buildMockBookingRoutes({ origin, delivery, cargoReadyDate });
    return HttpResponse.json({ data });
  }),

  http.get("/api/booking/rates", async ({ request }) => {
    await delay(350);
    const url = new URL(request.url);
    const origin = url.searchParams.get("origin") || "";
    const delivery = url.searchParams.get("delivery") || "";
    return HttpResponse.json({
      data: buildMockBookingRates({ origin, delivery }),
    });
  }),

  http.get("/api/booking/customers", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    return HttpResponse.json({ data: searchBookingCustomers(q) });
  }),

  http.get("/api/booking/hs-codes", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    return HttpResponse.json({ data: searchHsCodes(q) });
  }),

  http.get("/api/booking/un-numbers", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    return HttpResponse.json({ data: searchUnNumbers(q) });
  }),

  http.get("/api/booking/lookups/:kind", async ({ params }) => {
    await delay(200);
    const kind = String(params.kind) as BookingLookupKind;
    const data = BOOKING_LOOKUPS[kind] ?? [];
    return HttpResponse.json({ data });
  }),

  http.post("/api/booking/contracts/validate", async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { ref?: string };
    const ref = (body.ref || "").trim();
    if (!ref) {
      return HttpResponse.json({
        data: { valid: false, message: "Contract reference is required" },
      });
    }
    const valid = ref.length >= 4;
    return HttpResponse.json({
      data: {
        valid,
        contractId: valid ? `CTR-${ref}` : undefined,
        contractName: valid ? `Contract ${ref}` : undefined,
        message: valid
          ? "Contract reference is valid"
          : "Contract reference not found",
      },
    });
  }),

  http.post("/api/booking/eori/validate", async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { eori?: string };
    const eori = (body.eori || "").trim().toUpperCase();
    const valid = /^[A-Z]{2}[A-Z0-9]{8,15}$/.test(eori);
    return HttpResponse.json({
      data: {
        valid,
        message: valid ? "EORI is valid" : "Invalid EORI format",
        eori,
      },
    });
  }),

  http.post("/api/booking/upload", async ({ request }) => {
    await delay(600);
    const form = await request.formData();
    const file = form.get("file");
    const type = String(form.get("type") || "OTHER");
    const fileName =
      file && typeof file === "object" && "name" in file
        ? String((file as File).name)
        : "document.pdf";
    return HttpResponse.json({
      data: {
        id: `doc-${Date.now()}`,
        type,
        fileName,
        uploadedAt: new Date().toISOString(),
      },
    });
  }),

  http.get("/api/booking/list", async () => {
    await delay(500);
    return HttpResponse.json({ data: mockBookings });
  }),

  // Static paths must be registered before `/api/booking/:id` so
  // `/api/booking/templates` is not treated as a booking id.
  http.get("/api/booking/templates", async () => {
    await delay(300);
    return HttpResponse.json({ data: mockTemplates });
  }),

  http.delete("/api/booking/templates/:id", async ({ params }) => {
    await delay(300);
    const { id } = params;
    mockTemplates = mockTemplates.filter((t) => t.id !== id);
    return new HttpResponse(null, { status: 200 });
  }),

  http.get("/api/booking/:id", async ({ params }) => {
    await delay(400);
    const id = String(params.id);
    if (id === "templates" || id === "list") {
      return new HttpResponse(null, { status: 404 });
    }
    const detail = bookingDetailsById[id] ?? bookingDetailsById["bkg-1"];
    return HttpResponse.json({ data: detail });
  }),

  http.post("/api/booking/:id/cancel", async ({ params }) => {
    await delay(500);
    const id = String(params.id);
    const idx = mockBookings.findIndex((b) => b.id === id);
    if (idx >= 0) {
      mockBookings[idx] = { ...mockBookings[idx], status: "Cancelled" };
    }
    return HttpResponse.json({ data: { id, status: "Cancelled" } });
  }),

  http.get("/api/booking/:id/activity", async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    const listRow = mockBookings.find((b) => b.id === id);
    const events: BookingActivityEvent[] = [
      {
        id: `${id}-a1`,
        action: "Booking Created",
        by: "System",
        at: listRow?.createdDate || "10-Aug-2026 08:00",
      },
      {
        id: `${id}-a2`,
        action: "Submitted",
        by: "Customer User",
        at: listRow?.submittedDate || "10-Aug-2026 08:32",
      },
    ];
    if (listRow?.status === "Confirmed") {
      events.push({
        id: `${id}-a3`,
        action: "Confirmed",
        by: "CRO Agent",
        at: listRow.confirmedDate || "11-Aug-2026 00:26",
      });
    }
    if (listRow?.status === "Cancelled") {
      events.push({
        id: `${id}-a4`,
        action: "Cancelled",
        by: "Customer User",
        at: "12-Aug-2026 09:00",
        note: "Cancelled by user request",
      });
    }
    return HttpResponse.json({ data: events });
  }),

  http.get("/api/booking/:id/pdf", async ({ params }) => {
    await delay(400);
    const id = String(params.id);
    const detail = bookingDetailsById[id] ?? bookingDetailsById["bkg-1"];
    const text = [
      "BOOKING SUMMARY (mock PDF)",
      `ID: ${id}`,
      `Origin: ${detail.masterDetails?.origin ?? ""}`,
      `Delivery: ${detail.masterDetails?.delivery ?? ""}`,
      `Shipper: ${detail.parties?.shipperName ?? ""}`,
      `Consignee: ${detail.parties?.consigneeName ?? ""}`,
    ].join("\n");
    return new HttpResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking-${id}.pdf"`,
      },
    });
  }),

  http.post("/api/booking/draft", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as BookingPayload;
    const draftId =
      body.draftId ||
      `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return HttpResponse.json({ data: { draftId } });
  }),

  http.post("/api/booking/submit", async () => {
    await delay(1500);
    return HttpResponse.json({
      data: {
        bookingReference: `BKG-${new Date().getFullYear()}-${Math.floor(
          10000 + Math.random() * 90000,
        )}`,
        status: "CONFIRMED",
        submittedAt: new Date().toISOString(),
      },
    });
  }),

  http.put("/api/booking/amend", async () => {
    await delay(1500);
    return HttpResponse.json({
      data: {
        bookingReference: `BKG-AMD-${new Date().getFullYear()}-${Math.floor(
          10000 + Math.random() * 90000,
        )}`,
        status: "CONFIRMED",
        submittedAt: new Date().toISOString(),
      },
    });
  }),
];
