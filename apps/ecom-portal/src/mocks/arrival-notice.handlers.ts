// Modified by Sekar Nagarajan (2026-08-26 14:50)
import { delay, http, HttpResponse } from "msw";

import type { ArrivalNoticeDTO } from "../features/arrival-notice/types/arrival-notice.types";
import {
  filterArnByArrivalDate,
  getMockArrivalNoticeDetail,
  markArnPrinted,
  mockArrivalNoticeDetails,
  mockArrivalNotices,
  resetMockArrivalNotices,
} from "../features/arrival-notice/mocks/arn.mock";

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
    const data = filterArnByArrivalDate(mockArrivalNotices, fromDate, toDate);
    return HttpResponse.json({ data });
  }),

  http.get(
    "*/api/ecom/imp/arrival-notices/:anNo/document",
    async ({ params }) => {
      await delay(400);
      const anNo = String(params.anNo);
      if (!markArnPrinted(anNo)) {
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
    const live =
      mockArrivalNoticeDetails[anNo] ?? getMockArrivalNoticeDetail(anNo);
    if (!live) {
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
    const listRow = mockArrivalNotices.find((r) => r.anNo === anNo);
    const data: ArrivalNoticeDTO = {
      ...live,
      printStatus: listRow?.printStatus ?? live.printStatus,
    };
    return HttpResponse.json({ data });
  }),
];

/** Reset store for tests */
export function resetArrivalNoticeMockStore() {
  resetMockArrivalNotices();
}

export function markArrivalNoticePrinted(anNo: string): boolean {
  return markArnPrinted(anNo);
}

export function getArrivalNoticeListSnapshot() {
  return mockArrivalNotices.map((row) => ({ ...row }));
}
