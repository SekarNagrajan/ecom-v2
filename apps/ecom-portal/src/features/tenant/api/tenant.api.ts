// Modified by Sekar Nagarajan (2026-09-07 17:24)
import {
  PRECONFIGURED_TENANTS,
  type TenantConfig,
} from "@solverminds/auth";

/**
 * Resolve public tenant branding for the current host.
 * Until a real BE exists, map host → preset (DEV) or default TENANT_01.
 */
export async function fetchPublicTenant(): Promise<TenantConfig> {
  const res = await fetch("/api/public/tenant", {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      "Failed to load organization configuration. Please refresh the page or contact support.",
    );
  }

  const json = (await res.json()) as { data: TenantConfig };
  return json.data;
}

/** Fallback when MSW/API is unavailable — keeps local demo usable. */
export function resolveLocalPublicTenant(): TenantConfig {
  return PRECONFIGURED_TENANTS.TENANT_01;
}
