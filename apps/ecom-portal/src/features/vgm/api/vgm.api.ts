// Modified by Sekar Nagarajan (2026-10-16 23:40)
import type { ApiResponse } from "../../../types/api.types";
import type { VgmDeclarationDTO, VgmSubmitPayload } from "../types/vgm.types";

/**
 * Vite SPA fallback returns HTML for unhandled /api/* routes, so never call res.json() blindly.
 * Returns the JSON envelope; non-JSON or non-2xx responses become an `{ error }` envelope.
 */
async function readApiJson<T>(res: Response, fallbackMessage: string): Promise<ApiResponse<T>> {
  const isJson = (res.headers.get("content-type") ?? "").includes("application/json");
  if (!isJson) {
    return {
      error: {
        code: "INVALID_RESPONSE",
        message: `${fallbackMessage}: API returned non-JSON (check MSW handlers / mock worker).`,
      },
    };
  }
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok) {
    return { error: json.error ?? { code: "ERROR", message: fallbackMessage } };
  }
  return json;
}

/**
 * VGM API — served by src/mocks/vgm.handlers.ts in mock mode (fixture-backed), REST later.
 * Errors are thrown as `{ error: { code, message } }` so extractVgmErrorMessage keeps working.
 */
export const vgmApi = {
  async searchReference(
    type: "bookno" | "blno",
    referenceNo: string,
  ): Promise<ApiResponse<VgmDeclarationDTO>> {
    const params = new URLSearchParams({ type, ref: referenceNo.trim() });
    const res = await fetch(`/api/vgm/search?${params.toString()}`);
    const body = await readApiJson<VgmDeclarationDTO>(res, "Invalid Booking or BL Number.");
    if (body.error) throw { error: body.error };
    return body;
  },

  async submit(
    payload: VgmSubmitPayload,
  ): Promise<ApiResponse<{ message: string }>> {
    const res = await fetch("/api/vgm/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await readApiJson<{ message: string }>(res, "An error occurred during submission");
    if (body.error) throw { error: body.error };
    return body;
  },
};

/** @deprecated Prefer vgmApi */
export const searchVgmReference = (
  type: "bookno" | "blno",
  referenceNo: string,
) => vgmApi.searchReference(type, referenceNo);

/** @deprecated Prefer vgmApi */
export const submitVgm = (payload: VgmSubmitPayload) => vgmApi.submit(payload);
