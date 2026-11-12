// Modified by Sekar Nagarajan (2026-11-12 12:20)
/**
 * Phase-1 shell: the section views keep their existing props, but data now comes from the
 * per-section hooks in api/admin.queries.ts. Only the active section's query is enabled, and
 * toasts (success + server error) are raised inside the mutation hooks.
 */
import { useSearch } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import {
  useBannersQuery,
  useCreateAdvisoryMutation,
  useCreateBannerMutation,
  useCreateCutoffMutation,
  useCreateMenuMutation,
  useCustomerAdvisoriesQuery,
  useCutoffConfigsQuery,
  useDeleteCutoffMutation,
  useEmailTemplatesQuery,
  useFieldConfigsQuery,
  useGlobalConfigQuery,
  useMenuConfigsQuery,
  useResetPasswordMutation,
  useServiceRestrictionsQuery,
  useUpdateCutoffMutation,
  useUpdateEmailTemplateMutation,
  useUpdateFieldConfigsMutation,
  useUpdateGlobalConfigMutation,
  useUpdateMenuConfigsMutation,
  useUpdateServiceRestrictionsMutation,
} from "../api/admin.queries";
import type {
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  MenuCreatePayload,
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

/** Errors are already surfaced as toasts by the mutation hooks; views only need the promise to settle. */
async function settle(run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch {
    /* surfaced by the mutation's onError toast */
  }
}

export function AdminLayout() {
  const search = useSearch({ strict: false }) as {
    section?: AdminSectionKey;
  };
  const effectiveSection = search.section ?? DEFAULT_ADMIN_SECTION;
  const isActive = (section: AdminSectionKey) => effectiveSection === section;

  const menuConfigsQuery = useMenuConfigsQuery({ enabled: isActive("menu-management") });
  const emailTemplatesQuery = useEmailTemplatesQuery({ enabled: isActive("email-templates") });
  const globalConfigQuery = useGlobalConfigQuery({ enabled: isActive("global-config") });
  const fieldConfigsQuery = useFieldConfigsQuery({ enabled: isActive("field-config") });
  const serviceRestrictionsQuery = useServiceRestrictionsQuery({
    enabled: isActive("service-restrictions"),
  });
  const bannersQuery = useBannersQuery({ enabled: isActive("banner-manager") });
  const advisoriesQuery = useCustomerAdvisoriesQuery({
    enabled: isActive("customer-advisories"),
  });
  const cutoffConfigsQuery = useCutoffConfigsQuery({ enabled: isActive("cutoff-config") });

  const updateMenuConfigs = useUpdateMenuConfigsMutation();
  const createMenu = useCreateMenuMutation();
  const updateEmailTemplate = useUpdateEmailTemplateMutation();
  const resetPassword = useResetPasswordMutation();
  const updateGlobalConfig = useUpdateGlobalConfigMutation();
  const updateFieldConfigs = useUpdateFieldConfigsMutation();
  const updateServiceRestrictions = useUpdateServiceRestrictionsMutation();
  const createBanner = useCreateBannerMutation();
  const createAdvisory = useCreateAdvisoryMutation();
  const createCutoff = useCreateCutoffMutation();
  const updateCutoff = useUpdateCutoffMutation();
  const deleteCutoff = useDeleteCutoffMutation();

  const sectionContent: Record<AdminSectionKey, ReactNode> = {
    "global-config": (
      <GlobalConfigAdminView
        config={globalConfigQuery.data}
        onSave={(config: GlobalConfig) =>
          settle(() => updateGlobalConfig.mutateAsync(config))
        }
      />
    ),
    "menu-management": (
      <MenuManagementView
        menus={menuConfigsQuery.data ?? []}
        onSave={(menus: MenuConfig[]) =>
          settle(() => updateMenuConfigs.mutateAsync(menus))
        }
        onCreate={(data: MenuCreatePayload) =>
          settle(() => createMenu.mutateAsync(data))
        }
      />
    ),
    "special-privileges": <SpecialPrivilegesView />,
    "email-templates": (
      <EmailTemplateEditorView
        templates={emailTemplatesQuery.data ?? []}
        onSave={(id: string, data: Partial<EmailTemplate>) =>
          settle(() => updateEmailTemplate.mutateAsync({ id, data }))
        }
      />
    ),
    "password-reset": (
      <AdminPasswordResetView onResetPassword={resetPassword.mutateAsync} />
    ),
    "field-config": (
      <FieldConfigView
        fields={fieldConfigsQuery.data ?? []}
        onSave={(fields: FieldConfig[]) =>
          settle(() => updateFieldConfigs.mutateAsync(fields))
        }
      />
    ),
    "service-restrictions": (
      <ServiceRestrictionsView
        restrictions={serviceRestrictionsQuery.data ?? []}
        onSave={(items: ServiceRestriction[]) =>
          settle(() => updateServiceRestrictions.mutateAsync(items))
        }
      />
    ),
    "banner-manager": (
      <BannerManagerView
        banners={bannersQuery.data ?? []}
        onCreate={createBanner.mutateAsync}
      />
    ),
    "customer-advisories": (
      <CustomerAdvisoryView
        advisories={advisoriesQuery.data ?? []}
        onCreate={createAdvisory.mutateAsync}
      />
    ),
    "cutoff-config": (
      <CutoffConfigView
        cutoffConfigs={cutoffConfigsQuery.data ?? []}
        isLoading={cutoffConfigsQuery.isLoading}
        onCreate={createCutoff.mutateAsync}
        onUpdate={updateCutoff.mutateAsync}
        onDelete={deleteCutoff.mutateAsync}
      />
    ),
  };

  const sectionTitle = ADMIN_SECTION_LABELS[effectiveSection];

  return (
    <FeaturePageShell>
      <AdminModuleStyles />
      <div className="admin-layout">
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
