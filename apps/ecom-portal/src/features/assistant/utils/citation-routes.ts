// Modified by Sekar Nagarajan (2026-10-20 13:05)

/** Whitelisted app routes that citation chips / navigate may open. */
const ROUTE_PREFIXES = [
  "/app/dashboard",
  "/app/schedules",
  "/app/tracking",
  "/app/rates",
  "/app/booking",
  "/app/shipping-instruction",
  "/app/vgm",
  "/app/bl",
  "/app/delivery-order",
  "/app/arrival-notice",
  "/app/cro",
  "/app/payments",
  "/app/customer-stmt",
  "/app/carbon",
  "/app/quotes",
] as const;

export function isWhitelistedAppRoute(route: string): boolean {
  if (!route.startsWith("/app")) return false;
  if (route.includes("://") || route.includes("..")) return false;
  return ROUTE_PREFIXES.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`),
  );
}

export function citationOpenPath(route: string): string | null {
  return isWhitelistedAppRoute(route) ? route : null;
}
