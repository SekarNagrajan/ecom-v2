// Modified by Sekar Nagarajan (2026-10-16 23:25)
/**
 * MSW handlers for the booking module, served from the SQL-extracted fixtures (src/mocks/fixtures).
 * Every response is derived through src/mocks/fixture-api/bridges/booking-*.bridge.ts; mutations
 * write back into the in-memory `db` so the list / detail / activity endpoints stay consistent
 * for the browser session. Route paths and response envelopes are unchanged.
 */
import { delay, http, HttpResponse } from "msw";

import type {
  BulkBookingImportResult,
  BookingImportPayload,
} from "../features/booking-import/types/booking-import.types";
import type { BookingTemplate, BookingPayload } from "../features/booking/types/booking.types";
import { fixtureBookingActivity } from "./fixture-api/bridges/booking-activity.bridge";
import {
  childrenOf,
  deleteBooking,
  demoBookingContext,
  fixtureBookingPayload,
  insertBooking,
  payloadFromRows,
  replaceBooking,
  rowsFromPayload,
} from "./fixture-api/bridges/booking-detail.bridge";
import { findBookingRow, fixtureBookingList, fixtureBookingTemplateRows } from "./fixture-api/bridges/booking-list.bridge";
import {
  fixtureBookingCustomers,
  fixtureBookingHsCodes,
  fixtureBookingLookups,
  fixtureBookingUnNumbers,
  type BookingLookupKind,
} from "./fixture-api/bridges/booking-lookups.bridge";
import { fixtureBookingRates } from "./fixture-api/bridges/booking-rates.bridge";
import { fixtureBookingRoutes } from "./fixture-api/bridges/booking-routing.bridge";
import { str } from "./fixture-api/bridges/booking-shared.bridge";
import { ciRow, db, nextRef, nowIso, type Row } from "./fixture-api/db";

const RESERVED_IDS = new Set(["templates", "list", "submit", "draft", "amend", "import"]);

/** Online booking reference for rows the demo creates (same BKON… family as the extracted data). */
const newOnlineRef = () => nextRef("BKON");

/** Insert (or, when the payload carries a known draft / online ref, update) a booking from a wizard payload. */
function saveBooking(payload: BookingPayload, status: "D" | "S"): Row {
  const ctx = demoBookingContext();
  const existingId = str(payload.draftId) || str(payload.masterDetails?.onlineBookingNo);
  const existing = existingId ? findBookingRow(existingId) : undefined;
  const editable = existing && ["D", "T"].includes(str(existing.ebook_status).toUpperCase()) ? existing : undefined;
  const ebookno = editable ? str(editable.ebookno) : newOnlineRef();
  const { header, children } = rowsFromPayload(payload, { ebookno, status, existing: editable, ...ctx });
  if (editable) {
    header.isAmendment = null;
    header.templatename = null;
    replaceBooking(editable, header, children);
    return editable;
  }
  insertBooking(header, children);
  return db.bookings[0];
}

function validateImportPayload(
  payload: BookingImportPayload,
  rowNumber: number,
): string | null {
  if (!payload.masterDetails?.origin?.trim()) {
    return `Row ${rowNumber}: Origin is required`;
  }
  if (!payload.masterDetails?.delivery?.trim()) {
    return `Row ${rowNumber}: Delivery is required`;
  }
  if (!payload.masterDetails?.cargoReadyDate?.trim()) {
    return `Row ${rowNumber}: Cargo Ready Date is required`;
  }
  if (!payload.parties?.shipperName?.trim()) {
    return `Row ${rowNumber}: Shipper Name is required`;
  }
  if (!payload.parties?.agreementParty?.trim()) {
    return `Row ${rowNumber}: Agreement Party is required`;
  }
  if (!payload.parties?.siSubmittingParty?.trim()) {
    return `Row ${rowNumber}: SI Submitting Party is required`;
  }
  const container = payload.cargo?.containers?.[0];
  if (!container?.containerType?.trim()) {
    return `Row ${rowNumber}: Container Type is required`;
  }
  if (!container.quantity || container.quantity < 1) {
    return `Row ${rowNumber}: Quantity must be at least 1`;
  }
  const commodity = container.commodities?.[0];
  if (!commodity?.hsCode?.trim()) {
    return `Row ${rowNumber}: HS Code is required`;
  }
  if (!commodity.weight || commodity.weight < 1) {
    return `Row ${rowNumber}: Weight must be at least 1`;
  }
  return null;
}

function templateFromRow(b: Row): BookingTemplate {
  return {
    id: str(b.ebookno),
    templateName: str(b.templatename) || str(b.ebookno),
    origin: str(b.originPortId).toUpperCase(),
    delivery: str(b.finalPortId).toUpperCase(),
    payload: payloadFromRows(b, childrenOf(b)),
  };
}

export const bookingHandlers = [
  http.get("/api/booking/routing", async ({ request }) => {
    await delay(600);
    const url = new URL(request.url);
    const origin = url.searchParams.get("origin") || "";
    const delivery = url.searchParams.get("delivery") || "";
    const cargoReadyDate = url.searchParams.get("cargoReadyDate") || "";
    const data = fixtureBookingRoutes({ origin, delivery, cargoReadyDate });
    return HttpResponse.json({ data });
  }),

  http.get("/api/booking/rates", async ({ request }) => {
    await delay(350);
    const url = new URL(request.url);
    const origin = url.searchParams.get("origin") || "";
    const delivery = url.searchParams.get("delivery") || "";
    return HttpResponse.json({ data: fixtureBookingRates({ origin, delivery }) });
  }),

  http.get("/api/booking/customers", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    return HttpResponse.json({ data: fixtureBookingCustomers(q) });
  }),

  http.get("/api/booking/hs-codes", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    return HttpResponse.json({ data: fixtureBookingHsCodes(q) });
  }),

  http.get("/api/booking/un-numbers", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "";
    return HttpResponse.json({ data: fixtureBookingUnNumbers(q) });
  }),

  http.get("/api/booking/lookups/:kind", async ({ params }) => {
    await delay(200);
    const kind = String(params.kind) as BookingLookupKind;
    return HttpResponse.json({ data: fixtureBookingLookups(kind) });
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

  // Static mutations before `/api/booking/:id*` so they never collide.
  http.post("*/api/booking/draft", async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as BookingPayload;
    const row = saveBooking(body, "D");
    return HttpResponse.json({ data: { draftId: str(row.ebookno) } });
  }),

  http.post("*/api/booking/submit", async ({ request }) => {
    await delay(1500);
    const body = (await request.json()) as BookingPayload;
    const row = saveBooking(body, "S");
    return HttpResponse.json({
      data: {
        bookingReference: str(row.ebookno),
        status: "CONFIRMED",
        submittedAt: str(row.submitted_date) || new Date().toISOString(),
      },
    });
  }),

  http.post("*/api/booking/import", async ({ request }) => {
    await delay(800);
    const body = (await request.json()) as {
      dryRun?: boolean;
      bookings?: BookingImportPayload[];
    };
    const dryRun = Boolean(body.dryRun);
    const bookings = Array.isArray(body.bookings) ? body.bookings : [];

    const created: BulkBookingImportResult["created"] = [];
    const errors: BulkBookingImportResult["errors"] = [];

    bookings.forEach((payload, index) => {
      const rowNumber = index + 1;
      const validationError = validateImportPayload(payload, rowNumber);
      if (validationError) {
        errors.push({
          rowNumber,
          field: null,
          message: validationError,
        });
        return;
      }

      if (dryRun) {
        created.push({ rowNumber, bookingReference: null });
        return;
      }

      const row = saveBooking({ ...payload, draftId: undefined }, "S");
      created.push({ rowNumber, bookingReference: str(row.ebookno) });
    });

    const result: BulkBookingImportResult = {
      totalRows: bookings.length,
      successCount: created.length,
      failedCount: errors.length,
      dryRun,
      created,
      errors,
    };

    return HttpResponse.json({ data: result });
  }),

  http.put("*/api/booking/amend", async ({ request }) => {
    await delay(1500);
    const body = (await request.json()) as BookingPayload;
    const ref = str(body.masterDetails?.onlineBookingNo) || str(body.draftId);
    const existing = ref ? findBookingRow(ref) : undefined;
    if (!existing) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: `Booking ${ref || "(no reference)"} not found` } },
        { status: 404 },
      );
    }
    const ctx = demoBookingContext();
    const currentStatus = str(existing.ebook_status).toUpperCase();
    const { header, children } = rowsFromPayload(body, {
      ebookno: str(existing.ebookno),
      status: currentStatus === "D" ? "D" : "S",
      existing,
      ...ctx,
    });
    // Amending keeps the agency's acceptance status; rowsFromPayload already flags the row as an amendment with a new version.
    header.ebook_status = currentStatus;
    header.submitted_date = existing.submitted_date ?? header.submitted_date;
    replaceBooking(existing, header, children);
    return HttpResponse.json({
      data: {
        bookingReference: str(existing.extBookNo) || str(existing.ebookno),
        status: "CONFIRMED",
        submittedAt: new Date().toISOString(),
      },
    });
  }),

  http.get("/api/booking/list", async () => {
    await delay(500);
    return HttpResponse.json({ data: fixtureBookingList() ?? [] });
  }),

  // Static paths must be registered before `/api/booking/:id` so
  // `/api/booking/templates` is not treated as a booking id.
  http.get("/api/booking/templates", async () => {
    await delay(300);
    return HttpResponse.json({ data: fixtureBookingTemplateRows().map(templateFromRow) });
  }),

  http.delete("/api/booking/templates/:id", async ({ params }) => {
    await delay(300);
    const row = findBookingRow(String(params.id));
    if (row && str(row.ebook_status).toUpperCase() === "T") {
      deleteBooking(str(row.ebookno));
    }
    return new HttpResponse(null, { status: 200 });
  }),

  http.get("/api/booking/:id", async ({ params }) => {
    await delay(400);
    const id = String(params.id);
    if (RESERVED_IDS.has(id)) {
      return new HttpResponse(null, { status: 404 });
    }
    const detail = fixtureBookingPayload(id);
    if (!detail) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: `Booking ${id} not found` } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: detail });
  }),

  http.post("/api/booking/:id/cancel", async ({ params, request }) => {
    await delay(500);
    const id = String(params.id);
    const row = findBookingRow(id);
    if (row) {
      const body = (await request.json().catch(() => ({}))) as { reason?: string; remarks?: string };
      const ts = nowIso();
      const ctx = demoBookingContext();
      row.ebook_status = "I";
      row.dateup = ts;
      row.userup = ctx.userEmail;
      db.bookingCancel.unshift(
        ciRow({
          id: String(db.bookingCancel.length + 1),
          eBookNo: str(row.ebookno),
          extBookNo: str(row.extBookNo),
          reason: str(body.reason) || "Cancelled by user request",
          remarks: str(body.remarks),
          declineRemarks: null,
          status: "S",
          usercr: ctx.userEmail,
          datecr: ts,
          userup: ctx.userEmail,
          dateup: ts,
        }),
      );
    }
    return HttpResponse.json({ data: { id, status: "Cancelled" } });
  }),

  http.get("/api/booking/:id/activity", async ({ params }) => {
    await delay(300);
    const id = String(params.id);
    return HttpResponse.json({ data: fixtureBookingActivity(id) ?? [] });
  }),

  http.get("/api/booking/:id/pdf", async ({ params }) => {
    await delay(400);
    const id = String(params.id);
    const detail = fixtureBookingPayload(id);
    const text = [
      "BOOKING SUMMARY (mock PDF)",
      `ID: ${id}`,
      `Origin: ${detail?.masterDetails?.origin ?? ""}`,
      `Delivery: ${detail?.masterDetails?.delivery ?? ""}`,
      `Shipper: ${detail?.parties?.shipperName ?? ""}`,
      `Consignee: ${detail?.parties?.consigneeName ?? ""}`,
    ].join("\n");
    return new HttpResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking-${id}.pdf"`,
      },
    });
  }),
];
