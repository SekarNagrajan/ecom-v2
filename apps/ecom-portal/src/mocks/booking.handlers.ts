// Modified by Sekar Nagarajan (2026-08-28 10:32)
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
import type {
  BookingActivityEvent,
  BookingPayload,
} from "../features/booking/types/booking.types";
import {
  createEmptyCommodity,
  createEmptyContainer,
} from "../features/booking/types/booking.types";

const mockBookings = [
  {
    id: "bkg-1",
    bookingNo: "AE01444000",
    onlineRefNo: "BKON7045",
    agencyRefNo: "",
    status: "Confirmed",
    origin: "AEJEA-JEBEL ALI, UAE",
    delivery: "SGSIN-SINGAPORE",
    createdDate: "10-Aug-2026 08:32",
    confirmedDate: "11-Aug-2026 00:26",
    dgStatus: "N",
    teusCount: 5.0,
    submittedDate: "10-Aug-2026 08:32",
  },
  {
    id: "bkg-2",
    bookingNo: "AE01443500",
    onlineRefNo: "BKON7041",
    agencyRefNo: "",
    status: "Confirmed",
    origin: "AEJEA-JEBEL ALI, UAE",
    delivery: "SGSIN-SINGAPORE",
    createdDate: "10-Aug-2026 05:33",
    confirmedDate: "10-Aug-2026 07:05",
    dgStatus: "N",
    teusCount: 5.0,
    submittedDate: "10-Aug-2026 05:33",
  },
  {
    id: "bkg-3",
    bookingNo: "IN01443000",
    onlineRefNo: "BKON7038",
    agencyRefNo: "",
    status: "Awaiting Acceptance",
    origin: "INNSA-NHAVA SHEVA...",
    delivery: "AEJEA-JEBEL ALI, UAE",
    createdDate: "10-Aug-2026 04:33",
    confirmedDate: "",
    dgStatus: "N",
    teusCount: 1.0,
    submittedDate: "10-Aug-2026 04:33",
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
