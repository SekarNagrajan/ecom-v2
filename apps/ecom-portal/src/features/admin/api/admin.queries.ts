// Created by Sekar Nagarajan (2026-11-12 12:20)
/**
 * One React Query hook per Control Panel operation. Queries are opt-in via `enabled` so only the
 * active section fetches; mutations own their toasts (success + server error) and invalidation,
 * and return the full mutation object so views can read `isPending`.
 */
import { useToast } from '@solverminds/shared-ui/hooks';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  BannerConfig,
  CustomerAdvisory,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  MenuCreatePayload,
  ModuleMappingCustomer,
  ModuleMappingMenu,
  ServiceRestriction,
} from '../types/admin.types';
import {
  adminApi,
  type CutoffCreatePayload,
  type CutoffUpdatePayload,
} from './admin.api';
import { adminKeys } from './admin.keys';

export interface AdminQueryOptions {
  /** Defaults to true; the shell passes `false` for sections that are not on screen. */
  enabled?: boolean;
}

const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

type QueryClientLike = ReturnType<typeof useQueryClient>;

function invalidate(queryClient: QueryClientLike, queryKey: readonly unknown[]) {
  void queryClient.invalidateQueries({ queryKey });
}

// ---------------------------------------------------------------------------
// 1. Menu Config / Module Creation
// ---------------------------------------------------------------------------
export function useMenuConfigsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.menuConfigs(),
    queryFn: adminApi.getMenuConfigs,
    enabled,
  });
}

export function useUpdateMenuConfigsMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: MenuConfig[]) => adminApi.updateMenuConfigs(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.menuConfigs());
      toast.success('Menu configuration updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateMenuMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: MenuCreatePayload) => adminApi.createMenuConfig(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.menuConfigs());
      toast.success('Menu registered');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 2. Module Mapping
// ---------------------------------------------------------------------------
export function useModuleMappingCustomersQuery(
  query = '',
  { enabled = true }: AdminQueryOptions = {},
) {
  return useQuery({
    queryKey: adminKeys.moduleMapping.customers(query),
    queryFn: () => adminApi.searchModuleMappingCustomers(query),
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useModuleMappingQuery(customer: ModuleMappingCustomer | null) {
  const custCode = customer?.custCode ?? '';
  const webId = customer?.webId ?? '';
  return useQuery({
    queryKey: adminKeys.moduleMapping.menus(custCode, webId),
    queryFn: () => adminApi.getModuleMapping(custCode, webId),
    enabled: Boolean(custCode && webId),
  });
}

function describeModules(count: number, verb: string) {
  return count === 1 ? `Module ${verb}` : `${count} modules ${verb}`;
}

export function useAddModulePrivilegesMutation(
  customer: ModuleMappingCustomer | null,
) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const custCode = customer?.custCode ?? '';
  const webId = customer?.webId ?? '';
  return useMutation({
    mutationFn: (menuIds: string[]) =>
      adminApi.addModulePrivileges({ custCode, webId, menuIds }),
    onSuccess: (data: ModuleMappingMenu[], menuIds) => {
      queryClient.setQueryData(adminKeys.moduleMapping.menus(custCode, webId), data);
      toast.success(describeModules(menuIds.length, 'assigned'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRemoveModulePrivilegesMutation(
  customer: ModuleMappingCustomer | null,
) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const custCode = customer?.custCode ?? '';
  const webId = customer?.webId ?? '';
  return useMutation({
    mutationFn: (menuIds: string[]) =>
      adminApi.removeModulePrivileges({ custCode, webId, menuIds }),
    onSuccess: (data: ModuleMappingMenu[], menuIds) => {
      queryClient.setQueryData(adminKeys.moduleMapping.menus(custCode, webId), data);
      toast.success(describeModules(menuIds.length, 'removed'));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 3. Email Templates
// ---------------------------------------------------------------------------
export function useEmailTemplatesQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.emailTemplates(),
    queryFn: adminApi.getEmailTemplates,
    enabled,
  });
}

export function useUpdateEmailTemplateMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplate> }) =>
      adminApi.updateEmailTemplate(id, data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.emailTemplates());
      toast.success('Email template saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 4. Password Reset
// ---------------------------------------------------------------------------
export function useResetPasswordMutation() {
  const toast = useToast();
  return useMutation({
    mutationFn: (username: string) => adminApi.resetPassword(username),
    onSuccess: (result) => toast.success(result.message),
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 5. Global Config
// ---------------------------------------------------------------------------
export function useGlobalConfigQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.globalConfig(),
    queryFn: adminApi.getGlobalConfig,
    enabled,
  });
}

export function useUpdateGlobalConfigMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: GlobalConfig) => adminApi.updateGlobalConfig(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.globalConfig());
      toast.success('Global configuration saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 6. Field Configuration
// ---------------------------------------------------------------------------
export function useFieldConfigsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.fieldConfigs(),
    queryFn: adminApi.getFieldConfigs,
    enabled,
  });
}

export function useUpdateFieldConfigsMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: FieldConfig[]) => adminApi.updateFieldConfigs(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.fieldConfigs());
      toast.success('Field configuration saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 7. Route Restrictions
// ---------------------------------------------------------------------------
export function useServiceRestrictionsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.serviceRestrictions(),
    queryFn: adminApi.getServiceRestrictions,
    enabled,
  });
}

export function useUpdateServiceRestrictionsMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: ServiceRestriction[]) => adminApi.updateServiceRestrictions(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.serviceRestrictions());
      toast.success('Route restrictions updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 8. Banners
// ---------------------------------------------------------------------------
export function useBannersQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.banners(),
    queryFn: adminApi.getBanners,
    enabled,
  });
}

export function useCreateBannerMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: Omit<BannerConfig, 'id'>) => adminApi.createBanner(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.banners());
      toast.success('Banner added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 9. Customer Advisories
// ---------------------------------------------------------------------------
export function useCustomerAdvisoriesQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.customerAdvisories(),
    queryFn: adminApi.getCustomerAdvisories,
    enabled,
  });
}

export function useCreateAdvisoryMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: Omit<CustomerAdvisory, 'id'>) =>
      adminApi.createCustomerAdvisory(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.customerAdvisories());
      toast.success('Advisory published');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ---------------------------------------------------------------------------
// 10. Cutoff Configuration
// ---------------------------------------------------------------------------
export function useCutoffConfigsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.cutoff.configs(),
    queryFn: adminApi.getCutoffConfigs,
    enabled,
  });
}

export function useCutoffPortsQuery({ enabled = true }: AdminQueryOptions = {}) {
  return useQuery({
    queryKey: adminKeys.cutoff.ports(),
    queryFn: adminApi.getCutoffPorts,
    staleTime: TEN_MINUTES,
    enabled,
  });
}

export function useCutoffTerminalsQuery(portCode: string) {
  return useQuery({
    queryKey: adminKeys.cutoff.terminals(portCode),
    queryFn: () => adminApi.getCutoffTerminals(portCode),
    staleTime: FIVE_MINUTES,
    enabled: Boolean(portCode),
  });
}

export function useCreateCutoffMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data: CutoffCreatePayload) => adminApi.createCutoffConfig(data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.cutoff.configs());
      toast.success('Cutoff configuration added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateCutoffMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CutoffUpdatePayload }) =>
      adminApi.updateCutoffConfig(id, data),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.cutoff.configs());
      toast.success('Cutoff configuration updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteCutoffMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteCutoffConfig(id),
    onSuccess: () => {
      invalidate(queryClient, adminKeys.cutoff.configs());
      toast.success('Cutoff configuration deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
