// Modified by Sekar Nagarajan (2026-08-31 15:01)
import type { ApiResponse } from "../../../types/api.types";
import {
  DEFAULT_SI_WIZARD_CONFIG,
  type SIWizardConfig,
} from "../config/si-wizard-config";
import type { SIDTO, SIListDTO } from "../types/si.types";

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
      error?: { code: string; message: string };
    };
    if (!res.ok) {
      return {
        error: json.error ?? { code: "ERROR", message: fallbackMessage },
      };
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

/** SI API — REST via MSW in DEV; preserves ApiResponse `{ data }`. */
export const siApi = {
  async fetchList(): Promise<ApiResponse<SIListDTO[]>> {
    try {
      const res = await fetch("/api/si/list");
      return readApiJson<SIListDTO[]>(res, "Failed to fetch SI list");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async fetchDetails(id: string): Promise<ApiResponse<SIDTO>> {
    try {
      const res = await fetch(`/api/si/${encodeURIComponent(id)}`);
      return readApiJson<SIDTO>(res, "Failed to fetch SI details");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async fetchWizardConfig(): Promise<ApiResponse<SIWizardConfig>> {
    try {
      const res = await fetch("/api/si/config");
      const parsed = await readApiJson<SIWizardConfig>(
        res,
        "Failed to fetch SI config",
      );
      if (!parsed.error) return parsed;
      if (import.meta.env.DEV) {
        return { data: DEFAULT_SI_WIZARD_CONFIG };
      }
      return parsed;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        return { data: DEFAULT_SI_WIZARD_CONFIG };
      }
      const message = error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async submit(id: string): Promise<ApiResponse<{ siNo: string }>> {
    try {
      const res = await fetch(`/api/si/${encodeURIComponent(id)}/submit`, {
        method: "POST",
      });
      return readApiJson<{ siNo: string }>(res, "Failed to submit SI");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async cancel(id: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const res = await fetch(`/api/si/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
      });
      return readApiJson<{ id: string }>(res, "Failed to cancel SI");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },
};

export const fetchSiWizardConfig = () => siApi.fetchWizardConfig();

/** @deprecated Prefer siApi — kept for gradual migration of call sites */
export const fetchSIList = () => siApi.fetchList();
export const fetchSIDetails = (id: string) => siApi.fetchDetails(id);
