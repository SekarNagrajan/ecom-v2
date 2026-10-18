// Modified by Sekar Nagarajan (2026-10-16 23:35)
import { http, HttpResponse } from "msw";

import type { CreateSubUserPayload } from "../features/user-creation/types/user-creation.types";
import { bearerUser } from "./auth-token-registry";
import {
  createSubUser,
  DEMO_CUSTOMER_CODE,
  findUser,
  firstUserOfCustomer,
  setSubUserActive,
  subUsersOf,
  userLimit,
} from "./fixture-api/bridges/users.bridge";

/** Customer scope: the signed-in user's active account, else the sampled demo customer. */
function customerCodeFor(request: Request) {
  const user = bearerUser(request);
  return user?.activeSubCustomer || user?.customerCode || DEMO_CUSTOMER_CODE;
}

export const userCreationHandlers = [
  // Sub-users ← ecomuserdetails (userRole N) + EcomCustomerUser of the customer, joined to eCom_Reg_Details
  http.get("/api/v1/user-creation/sub-users", ({ request }) => {
    return HttpResponse.json({ data: subUsersOf(customerCodeFor(request)) });
  }),

  http.get("/api/v1/user-creation/limit", ({ request }) => {
    return HttpResponse.json({ data: userLimit(customerCodeFor(request)) });
  }),

  http.post("/api/v1/user-creation/sub-users", async ({ request }) => {
    const custCode = customerCodeFor(request);
    const body = (await request.json()) as CreateSubUserPayload;
    if (userLimit(custCode).limitReached) {
      return HttpResponse.json(
        { error: { code: "LIMIT_REACHED", message: "Creation of user profile limit has been reached" } },
        { status: 400 },
      );
    }
    if (findUser(body.loginName) || findUser(body.email)) {
      return HttpResponse.json(
        { error: { code: "DUPLICATE", message: "Login name or e-mail is already registered" } },
        { status: 400 },
      );
    }
    const parent = findUser(bearerUser(request)?.email ?? "") ?? firstUserOfCustomer(custCode)?.user;
    return HttpResponse.json({ data: createSubUser(custCode, body, parent) });
  }),

  http.patch("/api/v1/user-creation/sub-users/:id/status", async ({ params, request }) => {
    const body = (await request.json()) as { active: boolean };
    const updated = setSubUserActive(String(params.id), body.active);
    if (!updated) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: "Sub-user not found" } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: updated });
  }),
];
