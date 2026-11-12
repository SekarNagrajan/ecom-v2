// Created by Sekar Nagarajan (2026-11-12 12:40)
import { useAuthStore } from "@solverminds/auth";

import { adminRoute } from "../admin-route";
import {
  resolveAllowedAdminSections,
  type AdminSectionKey,
} from "../utils/admin-menu-access";

/**
 * Typed access to the active Control Panel section (`?section=`), the sections the user may see,
 * and a navigate helper that keeps the tab state in the URL (Back/Forward move between tabs).
 */
export function useAdminSection() {
  const { section } = adminRoute.useSearch();
  const navigate = adminRoute.useNavigate();
  const user = useAuthStore((state) => state.user);
  const allowedSections = resolveAllowedAdminSections(user?.vendorMenuList);

  const setSection = (next: AdminSectionKey) => {
    if (next === section) return;
    void navigate({ search: { section: next } as never });
  };

  return { section, allowedSections, setSection };
}
