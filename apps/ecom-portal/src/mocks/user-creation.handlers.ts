// Modified by Sekar Nagarajan (2026-08-26 15:06)
import { http, HttpResponse } from "msw";

import type { CreateSubUserPayload } from "../features/user-creation/types/user-creation.types";
import {
  createMockSubUser,
  getMockUserLimit,
  mockSubUsers,
  toggleMockSubUserStatus,
} from "../features/user-creation/mocks/usc.mock";

export const userCreationHandlers = [
  http.get("/api/v1/user-creation/sub-users", () => {
    return HttpResponse.json({
      data: mockSubUsers.map((row) => ({
        ...row,
        allowedModules: [...row.allowedModules],
      })),
    });
  }),

  http.get("/api/v1/user-creation/limit", () => {
    return HttpResponse.json({ data: getMockUserLimit() });
  }),

  http.post("/api/v1/user-creation/sub-users", async ({ request }) => {
    const body = (await request.json()) as CreateSubUserPayload;
    const result = createMockSubUser(body);
    if (!result.ok) {
      return HttpResponse.json(
        {
          error: {
            code: "LIMIT_REACHED",
            message: result.message,
          },
        },
        { status: 400 },
      );
    }
    return HttpResponse.json({ data: result.subUser });
  }),

  http.patch(
    "/api/v1/user-creation/sub-users/:id/status",
    async ({ params, request }) => {
      const id = String(params.id);
      const body = (await request.json()) as { active: boolean };
      const updated = toggleMockSubUserStatus(id, body.active);
      if (!updated) {
        return HttpResponse.json(
          {
            error: { code: "NOT_FOUND", message: "Sub-user not found" },
          },
          { status: 404 },
        );
      }
      return HttpResponse.json({ data: updated });
    },
  ),
];
