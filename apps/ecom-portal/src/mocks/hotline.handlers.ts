// Modified by Sekar Nagarajan (2026-10-16 23:35)
import { delay, http, HttpResponse } from "msw";

import { hotlineContacts } from "./fixture-api/bridges/admin.bridge";

export const hotlineHandlers = [
  /**
   * GET /api/hotline-contacts
   * Legacy: servlet-context HotlineContacts from ecomhotlinecontacts (status A), grouped by country.
   */
  http.get("/api/hotline-contacts", async () => {
    await delay(300);
    return HttpResponse.json(hotlineContacts());
  }),
];
