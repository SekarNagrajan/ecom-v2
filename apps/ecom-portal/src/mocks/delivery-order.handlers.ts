// Modified by Sekar Nagarajan (2026-09-15 18:45)
import { http, HttpResponse } from "msw";

import {
  filterMockDeliveryOrders,
  markDoPrinted,
  mockDeliveryOrders,
} from "../features/delivery-order/mocks/do.mock";

export const deliveryOrderHandlers = [
  http.get("/api/ecom/imp/delivery-orders", async ({ request }) => {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("fromDate") ?? undefined;
    const toDate = url.searchParams.get("toDate") ?? undefined;
    const filtered = filterMockDeliveryOrders(mockDeliveryOrders, {
      fromDate,
      toDate,
    });

    return HttpResponse.json({
      data: filtered.map((row) => ({ ...row })),
    });
  }),

  http.get(
    "/api/ecom/imp/delivery-orders/:delOrdNo/document",
    async ({ params }) => {
      const delOrdNo = String(params.delOrdNo);
      markDoPrinted(delOrdNo);

      const content = `%PDF-1.4 Mock Delivery Order Document for ${delOrdNo}`;
      const blob = new Blob([content], { type: "application/pdf" });

      return new HttpResponse(blob, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${delOrdNo}.pdf"`,
        },
      });
    },
  ),
];
