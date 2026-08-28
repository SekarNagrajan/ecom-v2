// Modified by Sekar Nagarajan (2026-08-26 13:04)
import type { BLWizardConfig } from "../config/bl-wizard-config";
import { DEFAULT_BL_WIZARD_CONFIG } from "../config/bl-wizard-config";
import type {
  ApiResponse,
  BLChargesDTO,
  BLDTO,
  BLInsuranceDTO,
  BLListDTO,
  BLListFilters,
  BLPaymentIntentDTO,
  BLPrintType,
  MCNDTO,
  MCNListDTO
} from "../types/bl.types";

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

async function mockDetailFallback(
  blNo: string,
): Promise<ApiResponse<BLDTO> | null> {
  if (!import.meta.env.DEV) return null;
  try {
    const { getMockBLDetail } = await import("../mocks/bl.mock");
    const detail = getMockBLDetail(blNo);
    return detail ? { data: detail } : null;
  } catch {
    return null;
  }
}

export async function fetchBLConfig(): Promise<ApiResponse<BLWizardConfig>> {
  try {
    const res = await fetch("/api/bl/config");
    return readApiJson<BLWizardConfig>(res, "Failed to fetch B/L config");
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      return { data: DEFAULT_BL_WIZARD_CONFIG };
    }
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchBLList(
  filters: BLListFilters = {},
): Promise<ApiResponse<BLListDTO[]>> {
  try {
    const params = new URLSearchParams();
    if (filters.startRow !== undefined)
      params.set("startRow", String(filters.startRow));
    if (filters.endRow !== undefined)
      params.set("endRow", String(filters.endRow));
    const res = await fetch(`/api/bl/list?${params.toString()}`);
    return readApiJson<BLListDTO[]>(res, "Failed to fetch B/L list");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchBLDetail(blNo: string): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}`);
    const parsed = await readApiJson<BLDTO>(res, "Failed to fetch B/L detail");
    if (!parsed.error) return parsed;

    const fallback = await mockDetailFallback(blNo);
    if (fallback) return fallback;
    return parsed;
  } catch (error: unknown) {
    const fallback = await mockDetailFallback(blNo);
    if (fallback) return fallback;
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchBLFromSI(siNo: string): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/from-si/${encodeURIComponent(siNo)}`);
    return readApiJson<BLDTO>(res, "Failed to build B/L from SI");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function saveBLDraft(
  blNo: string,
  payload: Partial<BLDTO>,
): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return readApiJson<BLDTO>(res, "Failed to save draft");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function updateMCN(
  mcnId: string,
  payload: Partial<MCNDTO>,
): Promise<ApiResponse<MCNDTO>> {
  try {
    const res = await fetch(`/api/mcn/${encodeURIComponent(mcnId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return readApiJson<MCNDTO>(res, "Failed to update MCN");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function submitMCN(mcnId: string): Promise<ApiResponse<MCNDTO>> {
  try {
    const res = await fetch(`/api/mcn/${encodeURIComponent(mcnId)}/submit`, {
      method: "POST",
    });
    return readApiJson<MCNDTO>(res, "Failed to submit MCN");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function updateBL(
  blNo: string,
  payload: Partial<BLDTO>,
): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return readApiJson<BLDTO>(res, "Failed to update B/L");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function verifyBL(blNo: string): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}/verify`, {
      method: "POST",
    });
    return readApiJson<BLDTO>(res, "Failed to verify B/L");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function cancelBL(blNo: string): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}/cancel`, {
      method: "POST",
    });
    return readApiJson<BLDTO>(res, "Failed to cancel B/L");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchBLInsurance(
  blNo: string,
): Promise<ApiResponse<BLInsuranceDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}/insurance`);
    return readApiJson<BLInsuranceDTO>(res, "Failed to fetch insurance");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function createBLPaymentIntent(
  blNos: string[],
  amountUsd: number,
): Promise<ApiResponse<BLPaymentIntentDTO>> {
  try {
    const res = await fetch("/api/bl/payment/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blNos, amountUsd }),
    });
    return readApiJson<BLPaymentIntentDTO>(
      res,
      "Failed to create payment intent",
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function importBLCargo(
  blNo: string,
  file: File,
): Promise<ApiResponse<{ containers: BLDTO["containers"] }>> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(
      `/api/bl/${encodeURIComponent(blNo)}/cargo/import`,
      {
        method: "POST",
        body: formData,
      },
    );
    return readApiJson<{ containers: BLDTO["containers"] }>(
      res,
      "Failed to import cargo",
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function exportBLCargoTemplate(
  blNo: string,
  template: "standard" | "customize" = "standard",
): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const params = new URLSearchParams({ template });
    const res = await fetch(
      `/api/bl/${encodeURIComponent(blNo)}/cargo/export?${params.toString()}`,
    );
    if (!res.ok) {
      const parsed = await readApiJson<unknown>(res, "Export failed");
      return { error: parsed.error ?? { message: "Export failed" } };
    }
    return { data: await res.blob() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { message } };
  }
}

export async function sendBLAmendmentMail(
  blNo: string,
): Promise<ApiResponse<{ sent: boolean }>> {
  try {
    const res = await fetch(
      `/api/bl/${encodeURIComponent(blNo)}/amendment-mail`,
      {
        method: "POST",
      },
    );
    return readApiJson<{ sent: boolean }>(res, "Failed to send amendment mail");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function submitBL(blNo: string): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}/submit`, {
      method: "POST",
    });
    return readApiJson<BLDTO>(res, "Failed to submit B/L");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function issueBL(blNo: string): Promise<ApiResponse<BLDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}/issue`, {
      method: "POST",
    });
    return readApiJson<BLDTO>(res, "Failed to issue B/L");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function downloadBLDocument(
  blNo: string,
  type: BLPrintType,
  appVersion?: "1" | "2",
): Promise<{ data?: Blob; error?: { message: string; code?: string } }> {
  try {
    const params = new URLSearchParams({ type });
    if (appVersion) params.set("appVersion", appVersion);
    const res = await fetch(
      `/api/bl/${encodeURIComponent(blNo)}/print?${params.toString()}`,
    );
    if (!res.ok) {
      const parsed = await readApiJson<unknown>(
        res,
        "Failed to download B/L document",
      );
      return {
        error: parsed.error ?? {
          code: "ERROR",
          message: "Failed to download B/L document",
        },
      };
    }
    return { data: await res.blob() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { message } };
  }
}

export async function batchPrintBL(
  blNos: string[],
): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const res = await fetch("/api/bl/print/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blNos }),
    });
    if (!res.ok) {
      const parsed = await readApiJson<unknown>(res, "Batch print failed");
      return { error: parsed.error ?? { message: "Batch print failed" } };
    }
    return { data: await res.blob() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { message } };
  }
}

export async function fetchBLCharges(
  blNo: string,
): Promise<ApiResponse<BLChargesDTO>> {
  try {
    const res = await fetch(`/api/bl/${encodeURIComponent(blNo)}/charges`);
    return readApiJson<BLChargesDTO>(res, "Failed to fetch charges");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function checkVoyageClosed(
  blNo: string,
): Promise<{ closed: boolean }> {
  try {
    const res = await fetch(
      `/api/bl/guards/voyage-closed?blNo=${encodeURIComponent(blNo)}`,
    );
    const parsed = await readApiJson<{ closed: boolean }>(
      res,
      "Voyage guard failed",
    );
    if (!parsed.error && parsed.data) return parsed.data;
  } catch {
    // fall through to local mock in DEV
  }

  if (import.meta.env.DEV) {
    try {
      const { VOYAGE_CLOSED_BL_NOS } = await import("../mocks/bl.mock");
      return { closed: VOYAGE_CLOSED_BL_NOS.has(blNo) };
    } catch {
      return { closed: false };
    }
  }
  return { closed: false };
}

export async function fetchMCNList(): Promise<ApiResponse<MCNListDTO[]>> {
  try {
    const res = await fetch("/api/mcn/list");
    return readApiJson<MCNListDTO[]>(res, "Failed to fetch MCN list");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchMCNDetail(
  mcnId: string,
): Promise<ApiResponse<MCNDTO>> {
  try {
    const res = await fetch(`/api/mcn/${encodeURIComponent(mcnId)}`);
    const parsed = await readApiJson<MCNDTO>(res, "Failed to fetch MCN detail");
    if (!parsed.error) return parsed;

    if (import.meta.env.DEV) {
      const { mockMCNDetailsSeed } = await import("../mocks/bl.mock");
      const detail = mockMCNDetailsSeed[mcnId];
      if (detail) return { data: detail };
    }
    return parsed;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function fetchBLExcelTemplate(
  blNo: string,
): Promise<{ data?: Blob; error?: { message: string; code?: string } }> {
  try {
    const res = await fetch(
      `/api/bl/${encodeURIComponent(blNo)}/excel/template`,
    );
    if (!res.ok) {
      const parsed = await readApiJson<unknown>(
        res,
        "Failed to download Excel template",
      );
      return {
        error: parsed.error ?? {
          code: "ERROR",
          message: "Failed to download Excel template",
        },
      };
    }
    return { data: await res.blob() };
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      return {
        data: new Blob(["BL Excel template stub"], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      };
    }
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { message } };
  }
}

export async function importBLExcel(
  blNo: string,
  file: File,
): Promise<ApiResponse<{ importedRows: number }>> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(
      `/api/bl/${encodeURIComponent(blNo)}/excel/import`,
      {
        method: "POST",
        body: formData,
      },
    );
    return readApiJson<{ importedRows: number }>(res, "Failed to import Excel");
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      return { data: { importedRows: 1 } };
    }
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function downloadMCNManifest(
  mcnId: string,
  manifestType = "full",
): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const res = await fetch(
      `/api/mcn/${encodeURIComponent(
        mcnId,
      )}/print?manifestType=${encodeURIComponent(manifestType)}`,
    );
    if (!res.ok) {
      const parsed = await readApiJson<unknown>(res, "Manifest print failed");
      return { error: parsed.error ?? { message: "Manifest print failed" } };
    }
    return { data: await res.blob() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { message } };
  }
}
