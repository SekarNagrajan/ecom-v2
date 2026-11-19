// Modified by Sekar Nagarajan (2026-11-12 16:20)
import { useAuthStore } from "@solverminds/auth";
import { useNavigate, useSearch } from "@tanstack/react-router";

import type { AdminRouteSearch } from "../utils/admin-landing";
import {
  resolveAllowedAdminSections,
  type AdminSectionKey,
} from "../utils/admin-menu-access";

/** The admin route's path; used instead of importing the route object to avoid a module cycle. */
export const ADMIN_ROUTE_PATH = "/app/admin" as const;

/**
 * Typed access to the active Control Panel section (`?section=`), the sections the user may see,
 * and a navigate helper that keeps the tab state in the URL (Back/Forward move between tabs).
 */
export function useAdminSection() {
  const search = useSearch({ strict: false }) as Partial<AdminRouteSearch>;
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const allowedSections = resolveAllowedAdminSections(user?.vendorMenuList);
  const section: AdminSectionKey =
    search.section && allowedSections.includes(search.section)
      ? search.section
      : (allowedSections[0] ?? "module-mapping");

  const setSection = (next: AdminSectionKey) => {
    if (next === section) return;
    void navigate({ to: ADMIN_ROUTE_PATH, search: { section: next } } as never);
  };

  /** Update a sub-selection (e.g. the open template) without pushing a history entry. */
  const setSubSelection = (patch: Partial<Omit<AdminRouteSearch, "section">>) => {
    void navigate({
      to: ADMIN_ROUTE_PATH,
      search: { ...search, section, ...patch },
      replace: true,
    } as never);
  };

  return { section, allowedSections, setSection, search, setSubSelection };
}
