// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { useTenantStore } from "@solverminds/auth";
import { AppTabs } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Space } from "antd";

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

export function AdminLayout() {
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const toast = useToast();
  const controller = useAdminController();

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

  const tabItems = [
    {
      key: "global-config",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.settings} size={16} />
          <span>Global Config</span>
        </Space>
      ),
      children: (
        <GlobalConfigAdminView
          config={controller.globalConfig}
          onSave={handleSaveGlobalConfig}
        />
      ),
    },
    {
      key: "menu-management",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.list} size={16} />
          <span>Menu Management</span>
        </Space>
      ),
      children: (
        <MenuManagementView
          menus={controller.menuConfigs}
          onSave={handleSaveMenu}
        />
      ),
    },
    {
      key: "special-privileges",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.key} size={16} />
          <span>Special Privileges</span>
        </Space>
      ),
      children: (
        <SpecialPrivilegesView
          privileges={controller.specialPrivileges}
          onSave={handleSavePrivileges}
        />
      ),
    },
    {
      key: "email-templates",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.mail} size={16} />
          <span>Email Templates</span>
        </Space>
      ),
      children: (
        <EmailTemplateEditorView
          templates={controller.emailTemplates}
          onSave={handleSaveEmailTemplate}
        />
      ),
    },
    {
      key: "password-reset",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.lock} size={16} tone="muted" />
          <span>Password Reset</span>
        </Space>
      ),
      children: (
        <AdminPasswordResetView onResetPassword={controller.resetPassword} />
      ),
    },
    {
      key: "field-config",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.formInput} size={16} />
          <span>Field Config</span>
        </Space>
      ),
      children: (
        <FieldConfigView
          fields={controller.fieldConfigs}
          onSave={handleSaveFieldConfig}
        />
      ),
    },
    {
      key: "service-restrictions",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.stopCircle} size={16} />
          <span>Route Restrictions</span>
        </Space>
      ),
      children: (
        <ServiceRestrictionsView
          restrictions={controller.serviceRestrictions}
          onSave={handleSaveServiceRestrictions}
        />
      ),
    },
    {
      key: "banner-manager",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.image} size={16} />
          <span>Banners & Assets</span>
        </Space>
      ),
      children: (
        <BannerManagerView
          banners={controller.banners}
          onCreate={controller.createBanner}
        />
      ),
    },
    {
      key: "customer-advisories",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.bell} size={16} />
          <span>Advisories</span>
        </Space>
      ),
      children: (
        <CustomerAdvisoryView
          advisories={controller.customerAdvisories}
          onCreate={controller.createAdvisory}
        />
      ),
    },
    {
      key: "cutoff-config",
      label: (
        <Space size={8} align="center">
          <AppIcon icon={Icons.clock} size={16} />
          <span>Cut-off Thresholds</span>
        </Space>
      ),
      children: (
        <CutoffConfigView
          cutoffConfigs={controller.cutoffConfigs}
          onSave={handleSaveCutoffConfig}
        />
      ),
    },
  ];

  return (
    <FeaturePageShell>
      <AdminModuleStyles />
      <div className="admin-layout">
        <ModuleScreenHeader
          icon={Icons.shieldCheck}
          title={MODULE_TITLES.admin}
          subtitle={`Tenant Scope: ${activeTenant.name} (${activeTenant.customerCode})`}
        />

        <AppTabs
          items={tabItems}
          size="middle"
          className="admin-redesigned-tabs"
        />
      </div>
    </FeaturePageShell>
  );
}
