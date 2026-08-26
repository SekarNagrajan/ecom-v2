// Modified by Sekar Nagarajan (2026-08-26 14:57)
import { delay, http, HttpResponse } from "msw";

import type { CRODTO } from "../features/container-release-order/types/cro.types";
import {
  filterCroByDate,
  getMockCRODetail,
  getMockCROEligibilityByBooking,
  markCroPrinted,
  mockContainerReleaseOrders,
  mockCroDetails,
  resetMockContainerReleaseOrders,
} from "../features/container-release-order/mocks/cro.mock";

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
    const data = filterCroByDate(
      mockContainerReleaseOrders,
      fromDate,
      toDate,
    );
    return HttpResponse.json({ data });
  }),

  http.get(
    "*/api/ecom/imp/container-release-orders/eligibility",
    async ({ request }) => {
      await delay(150);
      const url = new URL(request.url);
      const bookingNo = url.searchParams.get("bookingNo") ?? "";
      return HttpResponse.json({
        data: getMockCROEligibilityByBooking(bookingNo),
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
      const live = mockCroDetails[croNo] ?? getMockCRODetail(croNo);
      if (!live) {
        return HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "CRO not found" } },
          { status: 404 },
        );
      }
      const listRow = mockContainerReleaseOrders.find((r) => r.croNo === croNo);
      const data: CRODTO = {
        ...live,
        printStatus: listRow?.printStatus ?? live.printStatus,
        printCount:
          listRow?.printStatus === "Y"
            ? Math.max(1, live.printCount)
            : live.printCount,
      };
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

/** Reset store for tests */
export function resetCROMockStore() {
  resetMockContainerReleaseOrders();
}

export function markCROPrinted(croNo: string): boolean {
  return markCroPrinted(croNo);
}

export function getCROListSnapshot() {
  return mockContainerReleaseOrders.map((row) => ({ ...row }));
}
