// Modified by Sekar Nagarajan (2026-10-17 00:33)
/**
 * Arrival Notice MSW handlers, served from the SQL-extracted fixtures through
 * fixture-api/bridges/arrival-notice.bridge.ts (arrivalNotices / invoices / invoiceCharges /
 * lrpBl / lrpBlCargo / lrpBlCust). Downloading the document marks the notice printed in-session.
 */
import { delay, http, HttpResponse } from "msw";

import {
  arrivalNoticeDetail,
  arrivalNoticeList,
  filterArrivalNotices,
  markArrivalNoticePrinted as markPrinted,
} from "./fixture-api/bridges/arrival-notice.bridge";
import { resetDb } from "./fixture-api/db";

/**
 * Specific paths before `/:anNo` so list / document
 * are never swallowed by the parametric detail route.
 */
export const arrivalNoticeHandlers = [
  http.get("*/api/ecom/imp/arrival-notices", async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const data = filterArrivalNotices(arrivalNoticeList(), fromDate, toDate);
    return HttpResponse.json({ data });
  }),

  http.get(
    "*/api/ecom/imp/arrival-notices/:anNo/document",
    async ({ params }) => {
      await delay(400);
      const anNo = String(params.anNo);
      if (!markPrinted(anNo)) {
        return HttpResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "Arrival notice not found",
            },
          },
          { status: 404 },
        );
      }
      const content = `%PDF-1.4 Mock Arrival Notice Document for ${anNo}`;
      return new HttpResponse(
        new Blob([content], { type: "application/pdf" }),
        {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${anNo}.pdf"`,
          },
        },
      );
    },
  ),

  http.get("*/api/ecom/imp/arrival-notices/:anNo", async ({ params }) => {
    await delay(200);
    const anNo = String(params.anNo);
    const data = arrivalNoticeDetail(anNo);
    if (!data) {
      return HttpResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Arrival notice not found",
          },
        },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data });
  }),
];

/** Reset store for tests (restores the pristine fixtures). */
export function resetArrivalNoticeMockStore() {
  resetDb();
}

export function markArrivalNoticePrinted(anNo: string): boolean {
  return markPrinted(anNo);
}

export function getArrivalNoticeListSnapshot() {
  return arrivalNoticeList();
}
