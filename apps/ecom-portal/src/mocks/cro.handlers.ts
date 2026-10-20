// Modified by Sekar Nagarajan (2026-10-17 00:33)
/**
 * Container Release Order MSW handlers, served from the SQL-extracted fixtures through
 * fixture-api/bridges/cro.bridge.ts. No database holds a CRO table, so the rows are derived
 * from confirmed export bookings (lrpBookings / lrpBookingCargo / containerMoves / bookings /
 * bookingConf / cutoffConfig / depots). Downloading the document counts a print in-session.
 */
import { delay, http, HttpResponse } from "msw";

import {
  croDetail,
  croEligibilityByBooking,
  croList,
  filterCros,
  markCroPrinted,
} from "./fixture-api/bridges/cro.bridge";
import { resetDb } from "./fixture-api/db";

/**
 * Specific paths before `/:croNo` so list / eligibility / document
 * are never swallowed by the parametric detail route.
 */
export const croHandlers = [
  http.get("*/api/ecom/imp/container-release-orders", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const data = filterCros(croList(), fromDate, toDate);
    return HttpResponse.json({ data });
  }),

  http.get(
    "*/api/ecom/imp/container-release-orders/eligibility",
    async ({ request }) => {
      await delay(150);
      const url = new URL(request.url);
      const bookingNo = url.searchParams.get("bookingNo") ?? "";
      return HttpResponse.json({
        data: croEligibilityByBooking(bookingNo),
      });
    },
  ),

  http.get(
    "*/api/ecom/imp/container-release-orders/:croNo/document",
    async ({ params }) => {
      await delay(400);
      const croNo = String(params.croNo);
      if (!markCroPrinted(croNo)) {
        return HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "CRO not found" } },
          { status: 404 },
        );
      }
      const content = `%PDF-1.4 Mock Container Release Order for ${croNo}`;
      return new HttpResponse(
        new Blob([content], { type: "application/pdf" }),
        {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${croNo}.pdf"`,
          },
        },
      );
    },
  ),

  http.get(
    "*/api/ecom/imp/container-release-orders/:croNo",
    async ({ params }) => {
      await delay(200);
      const croNo = String(params.croNo);
      const data = croDetail(croNo);
      if (!data) {
        return HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "CRO not found" } },
          { status: 404 },
        );
      }
      return HttpResponse.json({ data });
    },
  ),

  // P2 stubs — handlers exist; UI CTA stays disabled
  http.post("*/api/ecom/imp/container-release-orders", async () => {
    return HttpResponse.json(
      {
        error: {
          code: "NOT_IMPLEMENTED",
          message: "CRO generate is planned for P2",
        },
      },
      { status: 501 },
    );
  }),

  http.post(
    "*/api/ecom/imp/container-release-orders/:croNo/haulier",
    async () => {
      return HttpResponse.json(
        {
          error: {
            code: "NOT_IMPLEMENTED",
            message: "Haulier assignment is planned for P2",
          },
        },
        { status: 501 },
      );
    },
  ),

  http.post(
    "*/api/ecom/imp/container-release-orders/:croNo/cancel",
    async () => {
      return HttpResponse.json(
        {
          error: {
            code: "NOT_IMPLEMENTED",
            message: "CRO cancel is planned for P2",
          },
        },
        { status: 501 },
      );
    },
  ),
];

/** Reset store for tests (restores the pristine fixtures). */
export function resetCROMockStore() {
  resetDb();
}

export function markCROPrinted(croNo: string): boolean {
  return markCroPrinted(croNo);
}

export function getCROListSnapshot() {
  return croList();
}
