// Modified by Antigravity (2026-08-21)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import type {
  MenuConfig,
  SpecialPrivilege,
  EmailTemplate,
  GlobalConfig,
  FieldConfig,
  ServiceRestriction,
  BannerConfig,
  CustomerAdvisory,
  CutoffConfig,
} from '../types/admin.types';

export const ADMIN_KEYS = {
  menuConfigs: ['admin', 'menuConfigs'] as const,
  specialPrivileges: ['admin', 'specialPrivileges'] as const,
  emailTemplates: ['admin', 'emailTemplates'] as const,
  globalConfig: ['admin', 'globalConfig'] as const,
  fieldConfigs: ['admin', 'fieldConfigs'] as const,
  serviceRestrictions: ['admin', 'serviceRestrictions'] as const,
  banners: ['admin', 'banners'] as const,
  customerAdvisories: ['admin', 'customerAdvisories'] as const,
  cutoffConfigs: ['admin', 'cutoffConfigs'] as const,
};

export function useAdminController() {
  const queryClient = useQueryClient();

  // Queries
  const menuConfigsQuery = useQuery({ queryKey: ADMIN_KEYS.menuConfigs, queryFn: adminApi.getMenuConfigs });
  const specialPrivilegesQuery = useQuery({ queryKey: ADMIN_KEYS.specialPrivileges, queryFn: adminApi.getSpecialPrivileges });
  const emailTemplatesQuery = useQuery({ queryKey: ADMIN_KEYS.emailTemplates, queryFn: adminApi.getEmailTemplates });
  const globalConfigQuery = useQuery({ queryKey: ADMIN_KEYS.globalConfig, queryFn: adminApi.getGlobalConfig });
  const fieldConfigsQuery = useQuery({ queryKey: ADMIN_KEYS.fieldConfigs, queryFn: adminApi.getFieldConfigs });
  const serviceRestrictionsQuery = useQuery({ queryKey: ADMIN_KEYS.serviceRestrictions, queryFn: adminApi.getServiceRestrictions });
  const bannersQuery = useQuery({ queryKey: ADMIN_KEYS.banners, queryFn: adminApi.getBanners });
  const customerAdvisoriesQuery = useQuery({ queryKey: ADMIN_KEYS.customerAdvisories, queryFn: adminApi.getCustomerAdvisories });
  const cutoffConfigsQuery = useQuery({ queryKey: ADMIN_KEYS.cutoffConfigs, queryFn: adminApi.getCutoffConfigs });

  // Mutations
  const updateMenuMutation = useMutation({
    mutationFn: (data: MenuConfig[]) => adminApi.updateMenuConfigs(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.menuConfigs }),
  });

  const updateSpecialPrivilegesMutation = useMutation({
    mutationFn: (data: SpecialPrivilege[]) => adminApi.updateSpecialPrivileges(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.specialPrivileges }),
  });

  const updateEmailTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplate> }) => adminApi.updateEmailTemplate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.emailTemplates }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (username: string) => adminApi.resetPassword(username),
  });

  const updateGlobalConfigMutation = useMutation({
    mutationFn: (data: GlobalConfig) => adminApi.updateGlobalConfig(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.globalConfig }),
  });

  const updateFieldConfigsMutation = useMutation({
    mutationFn: (data: FieldConfig[]) => adminApi.updateFieldConfigs(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.fieldConfigs }),
  });

  const updateServiceRestrictionsMutation = useMutation({
    mutationFn: (data: ServiceRestriction[]) => adminApi.updateServiceRestrictions(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.serviceRestrictions }),
  });

  const createBannerMutation = useMutation({
    mutationFn: (data: Omit<BannerConfig, 'id'>) => adminApi.createBanner(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.banners }),
  });

  const createAdvisoryMutation = useMutation({
    mutationFn: (data: Omit<CustomerAdvisory, 'id'>) => adminApi.createCustomerAdvisory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.customerAdvisories }),
  });

  const updateCutoffConfigsMutation = useMutation({
    mutationFn: (data: CutoffConfig[]) => adminApi.updateCutoffConfigs(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.cutoffConfigs }),
  });

  return {
    // Queries
    menuConfigs: menuConfigsQuery.data ?? [],
    isLoadingMenus: menuConfigsQuery.isLoading,
    specialPrivileges: specialPrivilegesQuery.data ?? [],
    emailTemplates: emailTemplatesQuery.data ?? [],
    globalConfig: globalConfigQuery.data,
    fieldConfigs: fieldConfigsQuery.data ?? [],
    serviceRestrictions: serviceRestrictionsQuery.data ?? [],
    banners: bannersQuery.data ?? [],
    customerAdvisories: customerAdvisoriesQuery.data ?? [],
    cutoffConfigs: cutoffConfigsQuery.data ?? [],

    // Mutations
    updateMenuConfigs: updateMenuMutation.mutateAsync,
    updateSpecialPrivileges: updateSpecialPrivilegesMutation.mutateAsync,
    updateEmailTemplate: updateEmailTemplateMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateGlobalConfig: updateGlobalConfigMutation.mutateAsync,
    updateFieldConfigs: updateFieldConfigsMutation.mutateAsync,
    updateServiceRestrictions: updateServiceRestrictionsMutation.mutateAsync,
    createBanner: createBannerMutation.mutateAsync,
    createAdvisory: createAdvisoryMutation.mutateAsync,
    updateCutoffConfigs: updateCutoffConfigsMutation.mutateAsync,
  };
}
