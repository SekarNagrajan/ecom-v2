// Modified by Sekar Nagarajan (2026-08-26 14:50)
import type { ApiResponse } from "../../../types/api.types";
import {
  filterArnByArrivalDate,
  getMockArrivalNoticeDetail,
  markArnPrinted,
  mockArrivalNotices,
} from "../mocks/arn.mock";
import type {
  ArrivalNoticeDTO,
  ArrivalNoticeListDTO,
  ArrivalNoticeListFilters,
} from "../types/arrival-notice.types";

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
  filters: ArrivalNoticeListFilters,
): Promise<ApiResponse<ArrivalNoticeListDTO[]> | null> {
  if (!import.meta.env.DEV) return null;
  return {
    data: filterArnByArrivalDate(
      mockArrivalNotices,
      filters.fromDate,
      filters.toDate,
    ).map((row) => ({ ...row })),
  };
}

async function mockDetailFallback(
  anNo: string,
): Promise<ApiResponse<ArrivalNoticeDTO> | null> {
  if (!import.meta.env.DEV) return null;
  const detail = getMockArrivalNoticeDetail(anNo);
  if (!detail) return null;
  const listRow = mockArrivalNotices.find((r) => r.anNo === anNo);
  return {
    data: {
      ...detail,
      printStatus: listRow?.printStatus ?? detail.printStatus,
    },
  };
}

/** Arrival Notice API — REST with DEV mock fallback (agenct parity). */
export const arnApi = {
  async fetchList(
    filters: ArrivalNoticeListFilters = {},
  ): Promise<ApiResponse<ArrivalNoticeListDTO[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.set("fromDate", filters.fromDate);
      if (filters.toDate) params.set("toDate", filters.toDate);

      const res = await fetch(
        `/api/ecom/imp/arrival-notices?${params.toString()}`,
      );
      const parsed = await readApiJson<ArrivalNoticeListDTO[]>(
        res,
        "Failed to fetch arrival notices",
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

  async fetchDetail(anNo: string): Promise<ApiResponse<ArrivalNoticeDTO>> {
    try {
      const res = await fetch(
        `/api/ecom/imp/arrival-notices/${encodeURIComponent(anNo)}`,
      );
      const parsed = await readApiJson<ArrivalNoticeDTO>(
        res,
        "Failed to fetch arrival notice detail",
      );
      if (!parsed.error) return parsed;

      const fallback = await mockDetailFallback(anNo);
      if (fallback) return fallback;
      return parsed;
    } catch (error: unknown) {
      const fallback = await mockDetailFallback(anNo);
      if (fallback) return fallback;
      const message =
        error instanceof Error ? error.message : "Network error";
      return { error: { code: "NETWORK_ERROR", message } };
    }
  },

  async downloadDocument(
    anNo: string,
  ): Promise<{ data?: Blob; error?: { code?: string; message: string } }> {
    try {
      const res = await fetch(
        `/api/ecom/imp/arrival-notices/${encodeURIComponent(anNo)}/document?format=pdf`,
      );
      if (!res.ok) {
        const parsed = await readApiJson<unknown>(
          res,
          "Failed to download arrival notice document",
        );
        return {
          error:
            parsed.error ?? {
              code: "ERROR",
              message: "Failed to download arrival notice document",
            },
        };
      }
      return { data: await res.blob() };
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        markArnPrinted(anNo);
        const content = `%PDF-1.4 Mock Arrival Notice Document for ${anNo}`;
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

/** @deprecated Prefer arnApi.fetchList */
export const getArrivalNoticeList = (fromDate?: string, toDate?: string) =>
  arnApi.fetchList({ fromDate, toDate });

/** @deprecated Prefer arnApi.fetchDetail */
export const getArrivalNoticeDetail = (anNo: string) => arnApi.fetchDetail(anNo);

/** @deprecated Prefer arnApi.downloadDocument */
export const downloadArrivalNoticeDocument = (anNo: string) =>
  arnApi.downloadDocument(anNo);
