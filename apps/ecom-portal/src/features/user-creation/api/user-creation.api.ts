// Modified by Sekar Nagarajan (2026-08-26 15:06)
import type { ApiResponse } from "../../../types/api.types";
import {
  createMockSubUser,
  getMockUserLimit,
  mockSubUsers,
  toggleMockSubUserStatus,
} from "../mocks/usc.mock";
import type {
  CreateSubUserPayload,
  SubUser,
  UserLimitResponse,
} from "../types/user-creation.types";

/**
 * Vite SPA fallback returns HTML for unhandled /api/* routes.
 * Never call res.json() blindly — that yields "Unexpected token '<'".
 */
async function readApiJson<T>(
  res: Response,
  fallbackMessage: string,
): Promise<ApiResponse<T>> {
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    return {
      error: {
        code: "INVALID_RESPONSE",
        message: `${fallbackMessage}: API returned non-JSON (check MSW handlers / mock worker).`,
      },
    };
  }

  try {
    const json = (await res.json()) as ApiResponse<T> & {
      success?: boolean;
      message?: string;
      subUser?: SubUser;
    };
    if (!res.ok) {
      return {
        error: json.error ?? {
          code: "ERROR",
          message: json.message || fallbackMessage,
        },
      };
    }
    // Legacy create shape: { success, message, subUser }
    if (json.subUser && !json.data) {
      return { data: json.subUser as T };
    }
    return json;
  } catch {
    return {
      error: {
        code: "INVALID_RESPONSE",
        message: `${fallbackMessage}: response could not be parsed as JSON.`,
      },
    };
  }
}

/** User Creation API — REST with DEV mock fallback (agenct parity). */
export const userCreationApi = {
  async fetchSubUsers(): Promise<ApiResponse<SubUser[]>> {
    try {
      const res = await fetch("/api/v1/user-creation/sub-users");
      const parsed = await readApiJson<SubUser[]>(
        res,
        "Failed to fetch sub-users",
      );
      if (!parsed.error) return parsed;
      if (import.meta.env.DEV) {
        return {
          data: mockSubUsers.map((row) => ({
            ...row,
            allowedModules: [...row.allowedModules],
          })),
        };
      }
      return parsed;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        return {
          data: mockSubUsers.map((row) => ({
            ...row,
            allowedModules: [...row.allowedModules],
          })),
        };
      }
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async fetchUserLimit(): Promise<ApiResponse<UserLimitResponse>> {
    try {
      const res = await fetch("/api/v1/user-creation/limit");
      const parsed = await readApiJson<UserLimitResponse>(
        res,
        "Failed to fetch user limits",
      );
      if (!parsed.error) return parsed;
      if (import.meta.env.DEV) return { data: getMockUserLimit() };
      return parsed;
    } catch (error: unknown) {
      if (import.meta.env.DEV) return { data: getMockUserLimit() };
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async createSubUser(
    payload: CreateSubUserPayload,
  ): Promise<ApiResponse<SubUser>> {
    try {
      const res = await fetch("/api/v1/user-creation/sub-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const parsed = await readApiJson<SubUser>(
        res,
        "Failed to create sub-user profile",
      );
      if (!parsed.error) return parsed;
      if (import.meta.env.DEV) {
        const result = createMockSubUser(payload);
        if (!result.ok) {
          return {
            error: { code: "LIMIT_REACHED", message: result.message },
          };
        }
        return { data: result.subUser };
      }
      return parsed;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        const result = createMockSubUser(payload);
        if (!result.ok) {
          return {
            error: { code: "LIMIT_REACHED", message: result.message },
          };
        }
        return { data: result.subUser };
      }
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async toggleSubUserStatus(
    id: string,
    active: boolean,
  ): Promise<ApiResponse<SubUser>> {
    try {
      const res = await fetch(`/api/v1/user-creation/sub-users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      const parsed = await readApiJson<SubUser>(
        res,
        "Failed to update user status",
      );
      if (!parsed.error) return parsed;
      if (import.meta.env.DEV) {
        const updated = toggleMockSubUserStatus(id, active);
        if (!updated) {
          return {
            error: { code: "NOT_FOUND", message: "Sub-user not found" },
          };
        }
        return { data: updated };
      }
      return parsed;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        const updated = toggleMockSubUserStatus(id, active);
        if (!updated) {
          return {
            error: { code: "NOT_FOUND", message: "Sub-user not found" },
          };
        }
        return { data: updated };
      }
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },
};
