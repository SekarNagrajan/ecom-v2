// Created by Sekar Nagarajan (2026-09-28 15:22)
import { delay, http, HttpResponse } from "msw";

import { MOCK_HOTLINE_CONTACTS } from "../features/agency-hotline/mocks/hotline.mock";

export const hotlineHandlers = [
  /**
   * GET /api/hotline-contacts
   * Legacy: servlet-context HotlineContacts from ecomhotlinecontacts.
   */
  http.get("/api/hotline-contacts", async () => {
    await delay(300);
    return HttpResponse.json(MOCK_HOTLINE_CONTACTS);
  }),
];
