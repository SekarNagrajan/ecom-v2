// Modified by Sekar Nagarajan (2026-10-16 23:20)
/**
 * SI endpoints served from the extracted ecomSI fixtures (src/mocks/fixtures). The list and the
 * detail are derived by the bridges; submit / cancel mutate the fixture rows and persist to
 * mock-data/runtime/si/ so changes survive refresh.
 */
import { delay, http, HttpResponse } from "msw";

import { DEFAULT_SI_WIZARD_CONFIG } from "../features/shipping-instruction/config/si-wizard-config";
import { nowIso, resetDb } from "./fixture-api/db";
import { findBooking, findSiRow } from "./fixture-api/bridges/si-common.bridge";
import { fixtureSiDetail } from "./fixture-api/bridges/si-detail.bridge";
import { fixtureSiList } from "./fixture-api/bridges/si-list.bridge";
import {
  applySiBody,
  createSiFromBooking,
  type WizardBody,
} from "./fixture-api/bridges/si-write.bridge";
import {
  ensureSiDbReady,
  persistSiDb,
} from "./fixture-api/si-persistence";

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
    await ensureSiDbReady();
    return HttpResponse.json({ data: fixtureSiList() ?? [] });
  }),

  /** Submit an existing SI (by eSINo or booking number); "Create SI" for a booking creates the row.
   * Body is the wizard draft (SIDTO) — applied via applySiBody so edits are persisted. */
  http.post("*/api/si/:id/submit", async ({ params, request }) => {
    await delay(400);
    await ensureSiDbReady();
    const id = params.id as string;
    const body = (await request.json().catch(() => ({}))) as WizardBody;
    const hasBody = body && typeof body === "object" && Object.keys(body).length > 0;

    const si = findSiRow(id);
    if (si) {
      if (hasBody) applySiBody(si, body);
      si.status = "S";
      si.declined_remarks = "";
      si.ChgDate = nowIso();
      persistSiDb();
      return HttpResponse.json({ data: { siNo: String(si.eSINo) } });
    }
    const booking = findBooking(id);
    if (booking) {
      const created = createSiFromBooking(booking, "S");
      if (hasBody) applySiBody(created, body);
      persistSiDb();
      return HttpResponse.json({ data: { siNo: String(created.eSINo) } });
    }
    return HttpResponse.json(
      { error: { code: "NOT_FOUND", message: `SI ${id} not found` } },
      { status: 404 },
    );
  }),

  http.post("*/api/si/:id/cancel", async ({ params }) => {
    await delay(300);
    await ensureSiDbReady();
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
    persistSiDb();
    return HttpResponse.json({ data: { id: String(si.eSINo) } });
  }),

  http.get("*/api/si/:id", async ({ params }) => {
    await delay(200);
    await ensureSiDbReady();
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
