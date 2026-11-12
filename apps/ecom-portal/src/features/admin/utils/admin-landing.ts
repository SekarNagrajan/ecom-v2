// Modified by Sekar Nagarajan (2026-11-12 14:40)
import { useAuthStore } from "@solverminds/auth";

import {
  resolveAllowedAdminSections,
  resolveDefaultAdminSection,
  type AdminSectionKey,
} from "./admin-menu-access";

export interface AdminRouteSearch {
  section: AdminSectionKey;
  /** Sub-selection inside a section (e.g. the open email template id). */
  template?: string;
}

/**
 * Where an admin lands when opening the Control Panel: Module Mapping when allowed, else the
 * first allowed tab. Shared by the /cpanel redirect, the cpanel login page and the sidebar so
 * the route module itself is not imported from layout code.
 */
export function resolveAdminLandingSearch(): AdminRouteSearch {
  const user = useAuthStore.getState().user;
  return {
    section: resolveDefaultAdminSection(
      resolveAllowedAdminSections(user?.vendorMenuList),
    ),
  };
}
