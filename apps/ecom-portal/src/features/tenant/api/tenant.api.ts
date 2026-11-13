// Modified by Sekar Nagarajan (2026-09-08 10:50)
import {
  PRECONFIGURED_TENANTS,
  type TenantConfig,
} from "@solverminds/auth";

/** Fallback when MSW/API is unavailable — keeps local demo usable. */
export function resolveLocalPublicTenant(): TenantConfig {
  return PRECONFIGURED_TENANTS.TENANT_01;
}

/**
 * Resolve public tenant branding for the current host.
 * Until a real BE exists, map host → preset (DEV) or default TENANT_01.
 * In DEV, fall back to local preset when MSW/SW misses the request.
 */
export async function fetchPublicTenant(): Promise<TenantConfig> {
  try {
    const res = await fetch("/api/public/tenant", {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (import.meta.env.DEV) {
        return resolveLocalPublicTenant();
      }
      throw new Error(
        "Failed to load organization configuration. Please refresh the page or contact support.",
      );
    }

    const json = (await res.json()) as { data?: TenantConfig };
    if (!json?.data) {
      if (import.meta.env.DEV) {
        return resolveLocalPublicTenant();
      }
      throw new Error(
        "Failed to load organization configuration. Please refresh the page or contact support.",
      );
    }
    return json.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      return resolveLocalPublicTenant();
    }
    throw error instanceof Error
      ? error
      : new Error(
          "Failed to load organization configuration. Please refresh the page or contact support.",
        );
  }
}
