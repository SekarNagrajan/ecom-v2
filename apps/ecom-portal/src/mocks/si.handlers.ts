// Modified by Sekar Nagarajan (2026-09-07 17:50)
import { delay, http, HttpResponse } from "msw";

import { DEFAULT_SI_WIZARD_CONFIG } from "../features/shipping-instruction/config/si-wizard-config";
import {
  getMockSiDetail,
  MOCK_SI_LIST,
} from "../features/shipping-instruction/mocks/si.mock";
import type { SIListDTO } from "../features/shipping-instruction/types/si.types";

function cloneList(): SIListDTO[] {
  return MOCK_SI_LIST.map((row) => ({ ...row }));
}

let mockSiList = cloneList();

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
    return HttpResponse.json({ data: mockSiList.map((row) => ({ ...row })) });
  }),

  http.post("*/api/si/:id/submit", async ({ params }) => {
    await delay(400);
    const id = params.id as string;
    const idx = mockSiList.findIndex(
      (row) => row.id === id || row.bookingNo === id,
    );
    const siNo =
      idx !== -1 && mockSiList[idx].siNo
        ? mockSiList[idx].siNo!
        : `SIN-${id}`;
    if (idx !== -1) {
      mockSiList[idx] = {
        ...mockSiList[idx],
        siNo,
        status: "Submitted",
        submittedDate: new Date().toISOString(),
      };
    }
    return HttpResponse.json({ data: { siNo } });
  }),

  http.post("*/api/si/:id/cancel", async ({ params }) => {
    await delay(300);
    const id = params.id as string;
    return HttpResponse.json({ data: { id } });
  }),

  http.get("*/api/si/:id", async ({ params }) => {
    await delay(200);
    const id = params.id as string;
    const detail = getMockSiDetail(id);
    if (!detail) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: `SI ${id} not found` } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: detail });
  }),
];

/** Reset store for tests */
export function resetSIMockStore() {
  mockSiList = cloneList();
}
