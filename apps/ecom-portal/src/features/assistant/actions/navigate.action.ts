// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { isWhitelistedAppRoute } from "../utils/citation-routes";

export function resolveNavigateRoute(
  args: Record<string, unknown>,
): string | null {
  const route = typeof args.route === "string" ? args.route.trim() : "";
  if (!route || !isWhitelistedAppRoute(route)) return null;
  return route;
}
