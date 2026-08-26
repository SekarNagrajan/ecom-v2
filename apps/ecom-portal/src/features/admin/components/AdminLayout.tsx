// Modified by Sekar Nagarajan (2026-08-26 16:35)
import { useTenantStore } from "@solverminds/auth";
import { useToast } from "@solverminds/shared-ui/hooks";
import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { useAdminController } from "../hooks/use-admin-controller";
import type {
  CutoffConfig,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  ServiceRestriction,
  SpecialPrivilege,
} from "../types/admin.types";
import { AdminModuleStyles } from "./admin-module-styles";
import { AdminPasswordResetView } from "./AdminPasswordResetView";
import { BannerManagerView } from "./BannerManagerView";
import { CustomerAdvisoryView } from "./CustomerAdvisoryView";
import { CutoffConfigView } from "./CutoffConfigView";
import { EmailTemplateEditorView } from "./EmailTemplateEditorView";
import { FieldConfigView } from "./FieldConfigView";
import { GlobalConfigAdminView } from "./GlobalConfigAdminView";
import { MenuManagementView } from "./MenuManagementView";
import { ServiceRestrictionsView } from "./ServiceRestrictionsView";
import { SpecialPrivilegesView } from "./SpecialPrivilegesView";

type AdminSectionKey =
  | "global-config"
  | "menu-management"
  | "special-privileges"
  | "email-templates"
  | "password-reset"
  | "field-config"
  | "service-restrictions"
  | "banner-manager"
  | "customer-advisories"
  | "cutoff-config";

interface AdminNavItem {
  key: AdminSectionKey;
  label: string;
  icon: LucideIcon;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { key: "global-config", label: "Global Config", icon: Icons.settings },
  { key: "menu-management", label: "Menu Management", icon: Icons.list },
  { key: "special-privileges", label: "Special Privileges", icon: Icons.key },
  { key: "email-templates", label: "Email Templates", icon: Icons.mail },
  { key: "password-reset", label: "Password Reset", icon: Icons.lock },
  { key: "field-config", label: "Field Config", icon: Icons.formInput },
  {
    key: "service-restrictions",
    label: "Route Restrictions",
    icon: Icons.stopCircle,
  },
  { key: "banner-manager", label: "Banners & Assets", icon: Icons.image },
  { key: "customer-advisories", label: "Advisories", icon: Icons.bell },
  { key: "cutoff-config", label: "Cut-off Thresholds", icon: Icons.clock },
];

export function AdminLayout() {
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const toast = useToast();
  const controller = useAdminController();
  const [activeSection, setActiveSection] =
    useState<AdminSectionKey>("global-config");

  const handleSaveMenu = async (menus: MenuConfig[]) => {
    await controller.updateMenuConfigs(menus);
    toast.success("Global Menu Configuration Updated Successfully");
  };

  const handleSavePrivileges = async (privs: SpecialPrivilege[]) => {
    await controller.updateSpecialPrivileges(privs);
    toast.success("Special Privileges Matrix Saved");
  };

  const handleSaveEmailTemplate = async (
    id: string,
    data: Partial<EmailTemplate>,
  ) => {
    await controller.updateEmailTemplate({ id, data });
    toast.success("Email Template Updated");
  };

  const handleSaveGlobalConfig = async (config: GlobalConfig) => {
    await controller.updateGlobalConfig(config);
    toast.success("Global System Configuration Saved");
  };

  const handleSaveFieldConfig = async (fields: FieldConfig[]) => {
    await controller.updateFieldConfigs(fields);
    toast.success("Form Field Configuration Saved");
  };

  const handleSaveServiceRestrictions = async (items: ServiceRestriction[]) => {
    await controller.updateServiceRestrictions(items);
    toast.success("Service Restrictions Updated");
  };

  const handleSaveCutoffConfig = async (items: CutoffConfig[]) => {
    await controller.updateCutoffConfigs(items);
    toast.success("Cut-off Threshold Matrix Saved");
  };

  const sectionContent: Record<AdminSectionKey, ReactNode> = {
    "global-config": (
      <GlobalConfigAdminView
        config={controller.globalConfig}
        onSave={handleSaveGlobalConfig}
      />
    ),
    "menu-management": (
      <MenuManagementView
        menus={controller.menuConfigs}
        onSave={handleSaveMenu}
      />
    ),
    "special-privileges": (
      <SpecialPrivilegesView
        privileges={controller.specialPrivileges}
        onSave={handleSavePrivileges}
      />
    ),
    "email-templates": (
      <EmailTemplateEditorView
        templates={controller.emailTemplates}
        onSave={handleSaveEmailTemplate}
      />
    ),
    "password-reset": (
      <AdminPasswordResetView onResetPassword={controller.resetPassword} />
    ),
    "field-config": (
      <FieldConfigView
        fields={controller.fieldConfigs}
        onSave={handleSaveFieldConfig}
      />
    ),
    "service-restrictions": (
      <ServiceRestrictionsView
        restrictions={controller.serviceRestrictions}
        onSave={handleSaveServiceRestrictions}
      />
    ),
    "banner-manager": (
      <BannerManagerView
        banners={controller.banners}
        onCreate={controller.createBanner}
      />
    ),
    "customer-advisories": (
      <CustomerAdvisoryView
        advisories={controller.customerAdvisories}
        onCreate={controller.createAdvisory}
      />
    ),
    "cutoff-config": (
      <CutoffConfigView
        cutoffConfigs={controller.cutoffConfigs}
        onSave={handleSaveCutoffConfig}
      />
    ),
  };

  const activeNav =
    ADMIN_NAV_ITEMS.find((item) => item.key === activeSection) ??
    ADMIN_NAV_ITEMS[0];

  return (
    <FeaturePageShell>
      <AdminModuleStyles />
      <div className="admin-layout">
        <ModuleScreenHeader
          icon={Icons.shieldCheck}
          title={MODULE_TITLES.admin}
          subtitle={`Tenant Scope: ${activeTenant.name} (${activeTenant.customerCode})`}
        />

        <div className="admin-workspace">
          <aside
            className="admin-workspace__nav custom-scroll"
            aria-label="Admin sections"
          >
            <p className="admin-workspace__nav-title">Admin Sections</p>
            <nav className="admin-workspace__nav-list">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive = item.key === activeSection;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={[
                      "admin-workspace__nav-item",
                      isActive
                        ? "admin-workspace__nav-item--active"
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveSection(item.key)}
                  >
                    <AppIcon icon={item.icon} size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section
            className="admin-workspace__content custom-scroll"
            aria-label={activeNav.label}
          >
            {sectionContent[activeSection]}
          </section>
        </div>
      </div>
    </FeaturePageShell>
  );
}
