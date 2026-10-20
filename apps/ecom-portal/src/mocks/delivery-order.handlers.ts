// Modified by Sekar Nagarajan (2026-10-17 00:33)
/**
 * Delivery Order MSW handlers, served from the SQL-extracted fixtures through
 * fixture-api/bridges/delivery-order.bridge.ts (invoices / invoiceBls / invoiceCharges / lrpBl /
 * lrpBlCargo / deliveryOrderVersions). Downloading the document marks the DO printed in-session.
 */
import { http, HttpResponse } from "msw";

import {
  deliveryOrderDocument,
  deliveryOrderList,
  filterDeliveryOrders,
  markDeliveryOrderPrinted,
} from "./fixture-api/bridges/delivery-order.bridge";
import { currentLogin } from "./fixture-api/bridges/user.bridge";

export const deliveryOrderHandlers = [
  http.get("/api/ecom/imp/delivery-orders", async ({ request }) => {
    const url = new URL(request.url);
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    return HttpResponse.json({
      data: filterDeliveryOrders(deliveryOrderList(), fromDate, toDate),
    });
  }),

  http.get(
    "/api/ecom/imp/delivery-orders/:delOrdNo/document",
    async ({ params }) => {
      const delOrdNo = String(params.delOrdNo);
      markDeliveryOrderPrinted(delOrdNo, currentLogin() || "ecom");

      const blob = new Blob([deliveryOrderDocument(delOrdNo)], {
        type: "application/pdf",
      });

      return new HttpResponse(blob, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${delOrdNo}.pdf"`,
        },
      });
    },
  ),
];

/** Snapshot of the derived list (tests). */
export function getDeliveryOrderListSnapshot() {
  return deliveryOrderList();
}
