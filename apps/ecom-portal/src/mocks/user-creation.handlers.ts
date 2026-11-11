// Modified by Sekar Nagarajan (2026-10-16 23:35)
import { http, HttpResponse } from "msw";

import type {
  CreateSubUserPayload,
  UpdateSubUserPayload,
} from "../features/user-creation/types/user-creation.types";
import { bearerUser } from "./auth-token-registry";
import {
  createSubUser,
  deleteSubUser,
  DEMO_CUSTOMER_CODE,
  findUser,
  firstUserOfCustomer,
  resendSubUserInvite,
  setSubUserActive,
  subUsersOf,
  updateSubUser,
  userLimit,
} from "./fixture-api/bridges/users.bridge";
import {
  ensureUserDbReady,
  persistUserDb,
} from "./fixture-api/user-persistence";

/** Customer scope: the signed-in user's active account, else the sampled demo customer. */
function customerCodeFor(request: Request) {
  const user = bearerUser(request);
  return user?.activeSubCustomer || user?.customerCode || DEMO_CUSTOMER_CODE;
}

export const userCreationHandlers = [
  // Sub-users ← ecomuserdetails (userRole N) + EcomCustomerUser of the customer, joined to eCom_Reg_Details
  http.get("/api/v1/user-creation/sub-users", async ({ request }) => {
    await ensureUserDbReady();
    return HttpResponse.json({ data: subUsersOf(customerCodeFor(request)) });
  }),

  http.get("/api/v1/user-creation/limit", async ({ request }) => {
    await ensureUserDbReady();
    return HttpResponse.json({ data: userLimit(customerCodeFor(request)) });
  }),

  http.post("/api/v1/user-creation/sub-users", async ({ request }) => {
    await ensureUserDbReady();
    const custCode = customerCodeFor(request);
    const body = (await request.json()) as CreateSubUserPayload;
    if (userLimit(custCode).limitReached) {
      return HttpResponse.json(
        {
          error: {
            code: "LIMIT_REACHED",
            message: "Creation of user profile limit has been reached",
          },
        },
        { status: 400 },
      );
    }
    if (findUser(body.loginName) || findUser(body.email)) {
      return HttpResponse.json(
        {
          error: {
            code: "DUPLICATE",
            message: "Login name or e-mail is already registered",
          },
        },
        { status: 400 },
      );
    }
    if (
      body.provisionMode === "PASSWORD" &&
      (!body.password || body.password.length < 6)
    ) {
      return HttpResponse.json(
        {
          error: {
            code: "VALIDATION",
            message: "Password must be at least 6 characters",
          },
        },
        { status: 400 },
      );
    }
    const parent =
      findUser(bearerUser(request)?.email ?? "") ??
      firstUserOfCustomer(custCode)?.user;
    const created = createSubUser(custCode, body, parent);
    persistUserDb();
    return HttpResponse.json({ data: created });
  }),

  http.put("/api/v1/user-creation/sub-users/:id", async ({ params, request }) => {
    await ensureUserDbReady();
    const body = (await request.json()) as UpdateSubUserPayload;
    const updated = updateSubUser(String(params.id), body);
    if (!updated) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: "Sub-user not found" } },
        { status: 404 },
      );
    }
    persistUserDb();
    return HttpResponse.json({ data: updated });
  }),

  http.delete("/api/v1/user-creation/sub-users/:id", async ({ params }) => {
    await ensureUserDbReady();
    const ok = deleteSubUser(String(params.id));
    if (!ok) {
      return HttpResponse.json(
        { error: { code: "NOT_FOUND", message: "Sub-user not found" } },
        { status: 404 },
      );
    }
    persistUserDb();
    return HttpResponse.json({ data: { success: true } });
  }),

  http.post(
    "/api/v1/user-creation/sub-users/:id/resend-invite",
    async ({ params }) => {
      await ensureUserDbReady();
      const updated = resendSubUserInvite(String(params.id));
      if (!updated) {
        return HttpResponse.json(
          {
            error: {
              code: "NOT_FOUND",
              message: "Pending invitation not found for this sub-user",
            },
          },
          { status: 404 },
        );
      }
      persistUserDb();
      return HttpResponse.json({ data: updated });
    },
  ),

  http.patch(
    "/api/v1/user-creation/sub-users/:id/status",
    async ({ params, request }) => {
      await ensureUserDbReady();
      const body = (await request.json()) as { active: boolean };
      const updated = setSubUserActive(String(params.id), body.active);
      if (!updated) {
        return HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Sub-user not found" } },
          { status: 404 },
        );
      }
      persistUserDb();
      return HttpResponse.json({ data: updated });
    },
  ),
];
