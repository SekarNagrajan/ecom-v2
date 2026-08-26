// Modified by Sekar Nagarajan (2026-08-26 14:57)
import type { ApiResponse } from "../../../types/api.types";
import {
  filterCroByDate,
  getMockCRODetail,
  getMockCROEligibilityByBooking,
  markCroPrinted,
  mockContainerReleaseOrders,
} from "../mocks/cro.mock";
import type {
  CRODTO,
  CROEligibility,
  CROListDTO,
  CROListFilters,
} from "../types/cro.types";

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
  filters: CROListFilters,
): Promise<ApiResponse<CROListDTO[]> | null> {
  if (!import.meta.env.DEV) return null;
  return {
    data: filterCroByDate(
      mockContainerReleaseOrders,
      filters.fromDate,
      filters.toDate,
    ).map((row) => ({ ...row })),
  };
}

async function mockDetailFallback(
  croNo: string,
): Promise<ApiResponse<CRODTO> | null> {
  if (!import.meta.env.DEV) return null;
  const detail = getMockCRODetail(croNo);
  if (!detail) return null;
  const listRow = mockContainerReleaseOrders.find((r) => r.croNo === croNo);
  return {
    data: {
      ...detail,
      printStatus: listRow?.printStatus ?? detail.printStatus,
      printCount:
        listRow?.printStatus === "Y"
          ? Math.max(1, detail.printCount)
          : detail.printCount,
    },
  };
}

/** Container Release Order API — REST with DEV mock fallback (agenct parity). */
export const croApi = {
  async fetchList(
    filters: CROListFilters = {},
  ): Promise<ApiResponse<CROListDTO[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.set("fromDate", filters.fromDate);
      if (filters.toDate) params.set("toDate", filters.toDate);

      const res = await fetch(
        `/api/ecom/imp/container-release-orders?${params.toString()}`,
      );
      const parsed = await readApiJson<CROListDTO[]>(
        res,
        "Failed to fetch CRO summary",
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

  async fetchDetail(croNo: string): Promise<ApiResponse<CRODTO>> {
    try {
      const res = await fetch(
        `/api/ecom/imp/container-release-orders/${encodeURIComponent(croNo)}`,
      );
      const parsed = await readApiJson<CRODTO>(
        res,
        "Failed to fetch CRO detail",
      );
      if (!parsed.error) return parsed;

      const fallback = await mockDetailFallback(croNo);
      if (fallback) return fallback;
      return parsed;
    } catch (error: unknown) {
      const fallback = await mockDetailFallback(croNo);
      if (fallback) return fallback;
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async fetchEligibility(
    bookingNo: string,
  ): Promise<ApiResponse<CROEligibility>> {
    try {
      const params = new URLSearchParams({ bookingNo });
      const res = await fetch(
        `/api/ecom/imp/container-release-orders/eligibility?${params.toString()}`,
      );
      const parsed = await readApiJson<CROEligibility>(
        res,
        "Failed to fetch CRO eligibility",
      );
      if (!parsed.error) return parsed;

      if (import.meta.env.DEV) {
        return { data: getMockCROEligibilityByBooking(bookingNo) };
      }
      return parsed;
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        return { data: getMockCROEligibilityByBooking(bookingNo) };
      }
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async downloadDocument(
    croNo: string,
  ): Promise<{ data?: Blob; error?: { code?: string; message: string } }> {
    try {
      const res = await fetch(
        `/api/ecom/imp/container-release-orders/${encodeURIComponent(croNo)}/document?format=pdf`,
      );
      if (!res.ok) {
        const parsed = await readApiJson<unknown>(
          res,
          "Failed to download CRO document",
        );
        return {
          error:
            parsed.error ?? {
              code: "ERROR",
              message: "Failed to download CRO document",
            },
        };
      }
      return { data: await res.blob() };
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        markCroPrinted(croNo);
        const content = `%PDF-1.4 Mock Container Release Order for ${croNo}`;
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

/** @deprecated Prefer croApi.fetchList */
export const getCROSummary = (fromDate?: string, toDate?: string) =>
  croApi.fetchList({ fromDate, toDate });

/** @deprecated Prefer croApi.fetchDetail */
export const getCRODetail = (croNo: string) => croApi.fetchDetail(croNo);

/** @deprecated Prefer croApi.fetchEligibility */
export const getCROEligibility = (bookingNo: string) =>
  croApi.fetchEligibility(bookingNo);

/** @deprecated Prefer croApi.downloadDocument */
export const downloadCRODocument = (croNo: string) =>
  croApi.downloadDocument(croNo);
