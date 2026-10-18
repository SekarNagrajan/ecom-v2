// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * SI endpoints served from the extracted ecomSI fixtures (src/mocks/fixtures). The list and the
 * detail are derived by the bridges; submit / cancel mutate the fixture rows so the change is
 * visible for the rest of the browser session.
 */
import { delay, http, HttpResponse } from "msw";

import { DEFAULT_SI_WIZARD_CONFIG } from "../features/shipping-instruction/config/si-wizard-config";
import { nowIso, resetDb } from "./fixture-api/db";
import { findBooking, findSiRow } from "./fixture-api/bridges/si-common.bridge";
import { fixtureSiDetail } from "./fixture-api/bridges/si-detail.bridge";
import { fixtureSiList } from "./fixture-api/bridges/si-list.bridge";
import { createSiFromBooking } from "./fixture-api/bridges/si-write.bridge";

const SI_CANCEL_REMARKS = "Shipping instruction cancelled by the customer.";

/**
 * Specific paths before `/api/si/:id` so config / list
 * are never swallowed by the parametric detail route.
 */
export const siHandlers = [
  http.get("*/api/si/config", async () => {
    await delay(200);
    return HttpResponse.json({ data: DEFAULT_SI_WIZARD_CONFIG });
  }),

  http.get("*/api/si/list", async () => {
    await delay(300);
    return HttpResponse.json({ data: fixtureSiList() ?? [] });
  }),

  /** Submit an existing SI (by eSINo or booking number); "Create SI" for a booking creates the row. */
  http.post("*/api/si/:id/submit", async ({ params }) => {
    await delay(400);
    const id = params.id as string;
    const si = findSiRow(id);
    if (si) {
      si.status = "S";
      si.declined_remarks = "";
      si.ChgDate = nowIso();
      return HttpResponse.json({ data: { siNo: String(si.eSINo) } });
    }
    const booking = findBooking(id);
    if (booking) {
      const created = createSiFromBooking(booking, "S");
      return HttpResponse.json({ data: { siNo: String(created.eSINo) } });
    }
    return HttpResponse.json(
      { error: { code: "NOT_FOUND", message: `SI ${id} not found` } },
      { status: 404 },
    );
  }),

  http.post("*/api/si/:id/cancel", async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    const si = findSiRow(id);
    if (!si) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: `SI ${id} not found` } },
        { status: 404 },
      );
    }
    si.status = "I";
    si.declined_remarks = SI_CANCEL_REMARKS;
    si.ChgDate = nowIso();
    return HttpResponse.json({ data: { id: String(si.eSINo) } });
  }),

  http.get("*/api/si/:id", async ({ params }) => {
    await delay(200);
    const id = params.id as string;
    const detail = fixtureSiDetail(id);
    if (!detail) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: `SI ${id} not found` } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: detail });
  }),
];

/** Reset store for tests — restores the pristine fixtures. */
export function resetSIMockStore() {
  resetDb();
}
