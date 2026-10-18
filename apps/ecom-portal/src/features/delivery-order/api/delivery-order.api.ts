// Modified by Sekar Nagarajan (2026-10-17 00:34)
import type { ApiResponse } from "../../../types/api.types";
import type { DOListFilters, DOSummaryRow } from "../types/delivery-order.types";

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
    const json = (await res.json()) as ApiResponse<T>;
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

/** Delivery Order API — REST; mock mode is served by MSW (src/mocks/delivery-order.handlers.ts). */
export const doApi = {
  async fetchList(
    filters: DOListFilters = {},
  ): Promise<ApiResponse<DOSummaryRow[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.set("fromDate", filters.fromDate);
      if (filters.toDate) params.set("toDate", filters.toDate);

      const res = await fetch(
        `/api/ecom/imp/delivery-orders?${params.toString()}`,
      );
      return await readApiJson<DOSummaryRow[]>(
        res,
        "Failed to fetch DO summary",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async downloadDocument(
    delOrdNo: string,
  ): Promise<{ data?: Blob; error?: { code?: string; message: string } }> {
    try {
      const res = await fetch(
        `/api/ecom/imp/delivery-orders/${encodeURIComponent(delOrdNo)}/document?format=pdf`,
      );
      if (!res.ok) {
        const parsed = await readApiJson<unknown>(
          res,
          "Failed to download DO document",
        );
        return {
          error:
            parsed.error ?? {
              code: "ERROR",
              message: "Failed to download DO document",
            },
        };
      }
      return { data: await res.blob() };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { message } };
    }
  },
};

/** @deprecated Prefer doApi.fetchList */
export const getDOSummary = (fromDate?: string, toDate?: string) =>
  doApi.fetchList({ fromDate, toDate });

/** @deprecated Prefer doApi.downloadDocument */
export const downloadDODocument = (delOrdNo: string) =>
  doApi.downloadDocument(delOrdNo);
