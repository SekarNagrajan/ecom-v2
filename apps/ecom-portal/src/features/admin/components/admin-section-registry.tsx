// Created by Sekar Nagarajan (2026-11-12 12:40)
/**
 * The only place that imports section screens. Each section is code-split so opening the Control
 * Panel loads just the shell and the active tab; views are self-contained (they fetch their own
 * data through api/admin.queries.ts).
 */
import type { LucideIcon } from "lucide-react";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import type { AdminSectionKey } from "../utils/admin-menu-access";
import { SECTION_ICONS } from "../utils/admin-section-nav";

export interface AdminSectionDefinition {
  key: AdminSectionKey;
  icon: LucideIcon;
  Component: LazyExoticComponent<ComponentType>;
}

function lazySection<TModule extends Record<string, unknown>>(
  loader: () => Promise<TModule>,
  exportName: keyof TModule,
): LazyExoticComponent<ComponentType> {
  return lazy(() =>
    loader().then((module) => ({
      default: module[exportName] as ComponentType,
    })),
  );
}

const SECTION_COMPONENTS: Record<AdminSectionKey, LazyExoticComponent<ComponentType>> = {
  "module-mapping": lazySection(
    () => import("./SpecialPrivilegesView"),
    "SpecialPrivilegesView",
  ),
  "module-creation": lazySection(
    () => import("./sections/ModuleCreationSection"),
    "ModuleCreationSection",
  ),
  "password-reset": lazySection(
    () => import("./sections/PasswordResetSection"),
    "PasswordResetSection",
  ),
  "global-config": lazySection(
    () => import("./sections/GlobalConfigSection"),
    "GlobalConfigSection",
  ),
  "field-config": lazySection(
    () => import("./sections/FieldConfigSection"),
    "FieldConfigSection",
  ),
  "email-templates": lazySection(
    () => import("./sections/EmailTemplatesSection"),
    "EmailTemplatesSection",
  ),
  "customer-advisories": lazySection(
    () => import("./sections/CustomerAdvisoriesSection"),
    "CustomerAdvisoriesSection",
  ),
  "banner-manager": lazySection(
    () => import("./sections/BannersSection"),
    "BannersSection",
  ),
  "cutoff-config": lazySection(
    () => import("./sections/CutoffConfigSection"),
    "CutoffConfigSection",
  ),
  "route-restrictions": lazySection(
    () => import("./sections/RouteRestrictionsSection"),
    "RouteRestrictionsSection",
  ),
};

export const ADMIN_SECTIONS: Record<AdminSectionKey, AdminSectionDefinition> =
  Object.fromEntries(
    (Object.keys(SECTION_COMPONENTS) as AdminSectionKey[]).map((key) => [
      key,
      { key, icon: SECTION_ICONS[key], Component: SECTION_COMPONENTS[key] },
    ]),
  ) as Record<AdminSectionKey, AdminSectionDefinition>;
