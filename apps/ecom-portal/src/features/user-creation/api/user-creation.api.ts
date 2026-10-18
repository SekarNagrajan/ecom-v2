// Modified by Sekar Nagarajan (2026-10-16 23:35)
import type { ApiResponse } from "../../../types/api.types";
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

function networkError(error: unknown): { error: { code: string; message: string } } {
  const message = error instanceof Error ? error.message : "Network error";
  return { error: { code: "NETWORK_ERROR", message } };
}

/** User Creation API — REST; in mock mode the routes are served by src/mocks/user-creation.handlers.ts. */
export const userCreationApi = {
  async fetchSubUsers(): Promise<ApiResponse<SubUser[]>> {
    try {
      const res = await fetch("/api/v1/user-creation/sub-users");
      return await readApiJson<SubUser[]>(res, "Failed to fetch sub-users");
    } catch (error: unknown) {
      return networkError(error);
    }
  },

  async fetchUserLimit(): Promise<ApiResponse<UserLimitResponse>> {
    try {
      const res = await fetch("/api/v1/user-creation/limit");
      return await readApiJson<UserLimitResponse>(
        res,
        "Failed to fetch user limits",
      );
    } catch (error: unknown) {
      return networkError(error);
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
      return await readApiJson<SubUser>(
        res,
        "Failed to create sub-user profile",
      );
    } catch (error: unknown) {
      return networkError(error);
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
      return await readApiJson<SubUser>(res, "Failed to update user status");
    } catch (error: unknown) {
      return networkError(error);
    }
  },
};
