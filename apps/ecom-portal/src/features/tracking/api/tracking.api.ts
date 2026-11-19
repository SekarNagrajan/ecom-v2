// Modified by Sekar Nagarajan (2026-10-17 00:30)
// Container & Cargo Tracking API Client Layer
// Parity with Struts TrackingDetails.do backend facade

import type { ApiResponse } from "../../../types/api.types";
import type {
  ShareTrackingMailInput,
  ShareTrackingMailResponse,
  TrackingSearchParams,
  TrackingSearchResult,
} from "../types/tracking.types";

/**
 * Vite's SPA fallback answers unhandled /api/* routes with HTML, so never call res.json() blindly.
 * Non-JSON responses become an `{ error }` envelope.
 */
async function readApiJson<T>(
  res: Response,
  fallbackMessage: string,
): Promise<ApiResponse<T>> {
  const isJson = (res.headers.get("content-type") ?? "").includes(
    "application/json",
  );
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
 * Tracking API — served by src/mocks/tracking.handlers.ts in mock mode (fixture-backed), REST later.
 * Resolves to null when the reference is unknown (404); any other failure throws.
 */
export const trackingApi = {
  getTrackingDetails: async (
    params: TrackingSearchParams,
  ): Promise<TrackingSearchResult | null> => {
    const ref = params.searchValue.trim();
    if (!ref) return null;
    const query = new URLSearchParams({ type: params.searchType, ref });
    const res = await fetch(`/api/tracking/search?${query.toString()}`);
    if (res.status === 404) return null;
    const body = await readApiJson<TrackingSearchResult>(
      res,
      "Failed to load tracking data",
    );
    if (body.error) throw new Error(body.error.message);
    return body.data ?? null;
  },

  /** POST /api/v1/tracking/share-mail — share tracking status by email */
  async shareTrackingByMail(
    input: ShareTrackingMailInput,
  ): Promise<ShareTrackingMailResponse> {
    const res = await fetch("/api/v1/tracking/share-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error("Failed to share tracking status by email");
    }
    const json = (await res.json()) as { data: ShareTrackingMailResponse };
    return json.data;
  },
};
