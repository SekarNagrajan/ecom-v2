// Modified by Sekar Nagarajan (2026-08-26 14:26)
import { http, HttpResponse } from "msw";

import {
  markDoPrinted,
  mockDeliveryOrders,
} from "../features/delivery-order/mocks/do.mock";

export const deliveryOrderHandlers = [
  http.get("/api/ecom/imp/delivery-orders", async () => {
    return HttpResponse.json({
      data: mockDeliveryOrders.map((row) => ({ ...row })),
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
