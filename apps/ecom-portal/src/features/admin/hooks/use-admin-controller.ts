// Modified by Sekar Nagarajan (2026-08-27 14:30)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminApi } from '../api/admin.api';
import type {
  BannerConfig,
  CustomerAdvisory,
  CutoffConfig,
  CutoffConfigFormValues,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  ModuleMappingCustomer,
  ModuleMappingMenu,
  ServiceRestriction,
} from '../types/admin.types';

export const ADMIN_KEYS = {
  menuConfigs: ['admin', 'menuConfigs'] as const,
  moduleMapping: (custCode: string, webId: string) =>
    ['admin', 'moduleMapping', custCode, webId] as const,
  moduleMappingCustomers: ['admin', 'moduleMappingCustomers'] as const,
  emailTemplates: ['admin', 'emailTemplates'] as const,
  globalConfig: ['admin', 'globalConfig'] as const,
  fieldConfigs: ['admin', 'fieldConfigs'] as const,
  serviceRestrictions: ['admin', 'serviceRestrictions'] as const,
  banners: ['admin', 'banners'] as const,
  customerAdvisories: ['admin', 'customerAdvisories'] as const,
  cutoffConfigs: ['admin', 'cutoffConfigs'] as const,
  cutoffPorts: ['admin', 'cutoffPorts'] as const,
  cutoffTerminals: (portCode: string) =>
    ['admin', 'cutoffTerminals', portCode] as const,
};

export function useAdminController() {
  const queryClient = useQueryClient();

  const menuConfigsQuery = useQuery({
    queryKey: ADMIN_KEYS.menuConfigs,
    queryFn: adminApi.getMenuConfigs,
  });
  const emailTemplatesQuery = useQuery({
    queryKey: ADMIN_KEYS.emailTemplates,
    queryFn: adminApi.getEmailTemplates,
  });
  const globalConfigQuery = useQuery({
    queryKey: ADMIN_KEYS.globalConfig,
    queryFn: adminApi.getGlobalConfig,
  });
  const fieldConfigsQuery = useQuery({
    queryKey: ADMIN_KEYS.fieldConfigs,
    queryFn: adminApi.getFieldConfigs,
  });
  const serviceRestrictionsQuery = useQuery({
    queryKey: ADMIN_KEYS.serviceRestrictions,
    queryFn: adminApi.getServiceRestrictions,
  });
  const bannersQuery = useQuery({
    queryKey: ADMIN_KEYS.banners,
    queryFn: adminApi.getBanners,
  });
  const customerAdvisoriesQuery = useQuery({
    queryKey: ADMIN_KEYS.customerAdvisories,
    queryFn: adminApi.getCustomerAdvisories,
  });
  const cutoffConfigsQuery = useQuery({
    queryKey: ADMIN_KEYS.cutoffConfigs,
    queryFn: adminApi.getCutoffConfigs,
  });

  const updateMenuMutation = useMutation({
    mutationFn: (data: MenuConfig[]) => adminApi.updateMenuConfigs(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.menuConfigs }),
  });

  const createMenuMutation = useMutation({
    mutationFn: (data: Omit<MenuConfig, 'isEnabled'> & { isEnabled?: boolean }) =>
      adminApi.createMenuConfig(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.menuConfigs }),
  });

  const updateEmailTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplate> }) =>
      adminApi.updateEmailTemplate(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.emailTemplates }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (username: string) => adminApi.resetPassword(username),
  });

  const updateGlobalConfigMutation = useMutation({
    mutationFn: (data: GlobalConfig) => adminApi.updateGlobalConfig(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.globalConfig }),
  });

  const updateFieldConfigsMutation = useMutation({
    mutationFn: (data: FieldConfig[]) => adminApi.updateFieldConfigs(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.fieldConfigs }),
  });

  const updateServiceRestrictionsMutation = useMutation({
    mutationFn: (data: ServiceRestriction[]) =>
      adminApi.updateServiceRestrictions(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ADMIN_KEYS.serviceRestrictions,
      }),
  });

  const createBannerMutation = useMutation({
    mutationFn: (data: Omit<BannerConfig, 'id'>) => adminApi.createBanner(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.banners }),
  });

  const createAdvisoryMutation = useMutation({
    mutationFn: (data: Omit<CustomerAdvisory, 'id'>) =>
      adminApi.createCustomerAdvisory(data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ADMIN_KEYS.customerAdvisories,
      }),
  });

  const createCutoffMutation = useMutation({
    mutationFn: (
      data: CutoffConfigFormValues & {
        portName: string;
        terminalName: string;
      },
    ) => adminApi.createCutoffConfig(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.cutoffConfigs }),
  });

  const updateCutoffMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<CutoffConfigFormValues, 'portCode' | 'terminalCode'>;
    }) => adminApi.updateCutoffConfig(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.cutoffConfigs }),
  });

  const deleteCutoffMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCutoffConfig(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.cutoffConfigs }),
  });

  return {
    menuConfigs: menuConfigsQuery.data ?? [],
    isLoadingMenus: menuConfigsQuery.isLoading,
    emailTemplates: emailTemplatesQuery.data ?? [],
    globalConfig: globalConfigQuery.data,
    fieldConfigs: fieldConfigsQuery.data ?? [],
    serviceRestrictions: serviceRestrictionsQuery.data ?? [],
    banners: bannersQuery.data ?? [],
    customerAdvisories: customerAdvisoriesQuery.data ?? [],
    cutoffConfigs: cutoffConfigsQuery.data ?? [],
    isLoadingCutoffConfigs: cutoffConfigsQuery.isLoading,

    updateMenuConfigs: updateMenuMutation.mutateAsync,
    createMenuConfig: createMenuMutation.mutateAsync,
    updateEmailTemplate: updateEmailTemplateMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updateGlobalConfig: updateGlobalConfigMutation.mutateAsync,
    updateFieldConfigs: updateFieldConfigsMutation.mutateAsync,
    updateServiceRestrictions: updateServiceRestrictionsMutation.mutateAsync,
    createBanner: createBannerMutation.mutateAsync,
    createAdvisory: createAdvisoryMutation.mutateAsync,
    createCutoffConfig: createCutoffMutation.mutateAsync,
    updateCutoffConfig: updateCutoffMutation.mutateAsync,
    deleteCutoffConfig: deleteCutoffMutation.mutateAsync,
  };
}

/** Hook for SpecialPrivilege.jsp Module Mapping flow */
export function useModuleMappingController(
  customer: ModuleMappingCustomer | null,
) {
  const queryClient = useQueryClient();
  const custCode = customer?.custCode ?? '';
  const webId = customer?.webId ?? '';

  const mappingQuery = useQuery({
    queryKey: ADMIN_KEYS.moduleMapping(custCode, webId),
    queryFn: () => adminApi.getModuleMapping(custCode, webId),
    enabled: Boolean(custCode && webId),
  });

  const customersQuery = useQuery({
    queryKey: ADMIN_KEYS.moduleMappingCustomers,
    queryFn: () => adminApi.searchModuleMappingCustomers(''),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addMutation = useMutation({
    mutationFn: (menuIds: string[]) =>
      adminApi.addModulePrivileges({ custCode, webId, menuIds }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ADMIN_KEYS.moduleMapping(custCode, webId),
        data,
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (menuIds: string[]) =>
      adminApi.removeModulePrivileges({ custCode, webId, menuIds }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ADMIN_KEYS.moduleMapping(custCode, webId),
        data,
      );
    },
  });

  return {
    menus: (mappingQuery.data ?? []) as ModuleMappingMenu[],
    isLoadingMenus: mappingQuery.isLoading,
    customers: (customersQuery.data ?? []) as ModuleMappingCustomer[],
    isLoadingCustomers: customersQuery.isLoading,
    addPrivileges: addMutation.mutateAsync,
    removePrivileges: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
