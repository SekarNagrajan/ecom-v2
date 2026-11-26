// Created by Sekar Nagarajan (2026-11-13 00:40)
/**
 * API path convention.
 *
 *   - `VITE_API_URL` is the backend **host only** (e.g. `https://api.example.com`). It is used in
 *     real mode; in mock mode every request stays same-origin so MSW can intercept it.
 *   - Paths carry the versioned prefix themselves: `/api/v1/booking/list`. Build them with
 *     `apiPath("/booking/list")` so the prefix lives in one place.
 *
 * Today feature code still mixes literal `/api/...` and `/api/v1/...` paths. Roadmap B1 rewrites
 * every call site onto the shared `http` client and `apiPath()` in one pass; until then the base
 * URL below guarantees real mode never produces `…/api/v1/api/…`.
 */

export const API_PREFIX = "/api/v1";

/** `apiPath("booking/list")` → `/api/v1/booking/list`; already-prefixed paths are returned as-is. */
export function apiPath(path: string): string {
  const normalized = `/${path.replace(/^\/+/, "")}`;
  return normalized.startsWith(`${API_PREFIX}/`) || normalized === API_PREFIX
    ? normalized
    : `${API_PREFIX}${normalized}`;
}

export interface ApiBaseUrlEnv {
  VITE_API_MODE: "mock" | "real";
  VITE_API_URL: string;
}

/**
 * Base URL for the HTTP client: `""` (same origin) in mock mode, otherwise the configured host
 * with any trailing slash or legacy `/api[/v1]` suffix removed, because paths already carry it.
 */
export function resolveApiBaseUrl(env: ApiBaseUrlEnv): string {
  if (env.VITE_API_MODE === "mock") return "";
  let base = env.VITE_API_URL.trim().replace(/\/+$/, "");
  const legacySuffix = /\/api(\/v\d+)?$/i;
  if (legacySuffix.test(base)) {
    console.warn(
      `[platform] VITE_API_URL should be the backend host only; dropping "${base.match(legacySuffix)?.[0]}" because API paths already include it.`,
    );
    base = base.replace(legacySuffix, "");
  }
  return base;
}
