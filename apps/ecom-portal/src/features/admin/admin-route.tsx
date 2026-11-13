// Modified by Sekar Nagarajan (2026-11-12 14:40)
/**
 * /app/admin — the Control Panel. One route, one lazily loaded shell; the active section lives in
 * `?section=` (aliases from the old URL keys are normalised and redirected to the canonical key).
 */
import { useAuthStore } from "@solverminds/auth";
import {
  createRoute,
  lazyRouteComponent,
  redirect,
} from "@tanstack/react-router";

import { appRoute, assertAdminAccess } from "../../app/router";
import { AppRoutePendingFallback } from "../../components/pending/app-route-pending";
import type { AdminRouteSearch } from "./utils/admin-landing";
import {
  DEFAULT_ADMIN_SECTION,
  normalizeAdminSectionKey,
  resolveAllowedAdminSections,
  resolveDefaultAdminSection,
} from "./utils/admin-menu-access";


export const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/admin",
  validateSearch: (search: Record<string, unknown>): AdminRouteSearch => ({
    section: normalizeAdminSectionKey(search.section) ?? DEFAULT_ADMIN_SECTION,
    ...(typeof search.template === "string" && search.template
      ? { template: search.template }
      : {}),
  }),
  beforeLoad: ({ search, location }) => {
    assertAdminAccess();
    const allowed = resolveAllowedAdminSections(
      useAuthStore.getState().user?.vendorMenuList,
    );
    const target = allowed.includes(search.section)
      ? search.section
      : resolveDefaultAdminSection(allowed);
    // Keep the address bar canonical: aliases, unknown values, disallowed sections and a missing
    // param all redirect (replace, so Back never lands on the bad URL).
    const raw = new URLSearchParams(location.searchStr).get("section");
    if (raw !== target) {
      throw redirect({
        to: "/app/admin",
        search: { section: target } as never,
        replace: true,
      });
    }
  },
  pendingComponent: () => <AppRoutePendingFallback />,
  component: lazyRouteComponent(
    () => import("./components/AdminShell"),
    "AdminShell",
  ),
});
