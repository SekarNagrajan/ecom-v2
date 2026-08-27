// Modified by Sekar Nagarajan (2026-08-27 13:05)
import { useTenantStore } from "@solverminds/auth";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import { useAdminController } from "../hooks/use-admin-controller";
import type {
  CutoffConfig,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  ServiceRestriction,
} from "../types/admin.types";
import {
  ADMIN_SECTION_LABELS,
  DEFAULT_ADMIN_SECTION,
  type AdminSectionKey,
} from "../utils/admin-menu-access";
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

export function AdminLayout() {
  const search = useSearch({ strict: false }) as {
    section?: AdminSectionKey;
  };
  const effectiveSection = search.section ?? DEFAULT_ADMIN_SECTION;
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const toast = useToast();
  const controller = useAdminController();

  const handleSaveMenu = async (menus: MenuConfig[]) => {
    await controller.updateMenuConfigs(menus);
    toast.success("Global Menu Configuration Updated Successfully");
  };

  const handleCreateMenu = async (
    data: Parameters<typeof controller.createMenuConfig>[0],
  ) => {
    await controller.createMenuConfig(data);
    toast.success("Menu created successfully");
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
        onCreate={handleCreateMenu}
      />
    ),
    "special-privileges": <SpecialPrivilegesView />,
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

  const sectionTitle = ADMIN_SECTION_LABELS[effectiveSection];

  return (
    <FeaturePageShell>
      <AdminModuleStyles />
      <div className="admin-layout">
        {/* <ModuleScreenHeader
          icon={Icons.shieldCheck}
          title={sectionTitle}
          subtitle={`Tenant Scope: ${activeTenant.name} (${activeTenant.customerCode})`}
        /> */}

        <section
          className="admin-workspace admin-workspace--content-only"
          aria-label={sectionTitle}
        >
          <div className="admin-workspace__content">
            {sectionContent[effectiveSection]}
          </div>
        </section>
      </div>
    </FeaturePageShell>
  );
}
