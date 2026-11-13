// Modified by Sekar Nagarajan (2026-09-08 10:50)
import { PRECONFIGURED_TENANTS } from "@solverminds/auth";
import { http, HttpResponse } from "msw";

/**
 * GET /api/public/tenant — org branding for session splash / theme gate.
 * Host hint via `X-Tenant-Host` or falls back to TENANT_01.
 * Wildcard path so the SW still matches after HMR / absolute origins.
 */
export const publicTenantHandlers = [
  http.get("*/api/public/tenant", ({ request }) => {
    const hostHint =
      request.headers.get("X-Tenant-Host") ||
      (typeof window !== "undefined" ? window.location.hostname : "");

    const matched = Object.values(PRECONFIGURED_TENANTS).find((t) =>
      hostHint.toLowerCase().includes(t.id.toLowerCase().replace("_", "")),
    );

    const tenant = matched ?? PRECONFIGURED_TENANTS.TENANT_01;

    return HttpResponse.json({
      status: "SUCCESS",
      data: tenant,
    });
  }),
];
