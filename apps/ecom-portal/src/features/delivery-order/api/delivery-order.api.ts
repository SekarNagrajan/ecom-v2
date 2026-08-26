// Modified by Sekar Nagarajan (2026-08-26 14:26)
import type { ApiResponse } from "../../../types/api.types";
import {
  markDoPrinted,
  mockDeliveryOrders,
} from "../mocks/do.mock";
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

async function mockListFallback(
  filters: DOListFilters,
): Promise<ApiResponse<DOSummaryRow[]> | null> {
  if (!import.meta.env.DEV) return null;
  void filters;
  return { data: mockDeliveryOrders.map((row) => ({ ...row })) };
}

/** Delivery Order API — REST with DEV mock fallback (agenct parity). */
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
      const parsed = await readApiJson<DOSummaryRow[]>(
        res,
        "Failed to fetch DO summary",
      );
      if (!parsed.error) return parsed;

      const fallback = await mockListFallback(filters);
      if (fallback) return fallback;
      return parsed;
    } catch (error: unknown) {
      const fallback = await mockListFallback(filters);
      if (fallback) return fallback;
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
      if (import.meta.env.DEV) {
        markDoPrinted(delOrdNo);
        const content = `%PDF-1.4 Mock Delivery Order Document for ${delOrdNo}`;
        return {
          data: new Blob([content], { type: "application/pdf" }),
        };
      }
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
