// Modified by Sekar Nagarajan (2026-11-12 12:20)
/**
 * Control Panel REST client. In mock mode the routes are served by src/mocks/admin.handlers.ts.
 * Every call goes through `adminRequest`, so failures (including `{ success: false }` bodies) throw
 * an AdminApiError with the server message — the query hooks turn that into error toasts.
 */
import type {
  BannerConfig,
  CustomerAdvisory,
  CutoffConfig,
  CutoffConfigFormValues,
  CutoffPortOption,
  CutoffTerminalOption,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  MenuCreatePayload,
  ModuleMappingCustomer,
  ModuleMappingMenu,
  ServiceRestriction,
} from '../types/admin.types';
import { adminRequest } from './admin-request';

const BASE = '/api/v1/admin';

const jsonBody = (method: 'POST' | 'PUT', body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export interface ModuleMappingPayload {
  custCode: string;
  webId: string;
  menuIds: string[];
}

export type CutoffCreatePayload = CutoffConfigFormValues & {
  portName: string;
  terminalName: string;
};

export type CutoffUpdatePayload = Omit<
  CutoffConfigFormValues,
  'portCode' | 'terminalCode'
> & {
  portName?: string;
  terminalName?: string;
};

export interface PasswordResetResult {
  success: boolean;
  message: string;
}

export const adminApi = {
  // 1. Menu Config / Module Creation (RegisterMenu.jsp parity)
  getMenuConfigs: () =>
    adminRequest<MenuConfig[]>(`${BASE}/menu-config`, undefined, {
      fallbackMessage: 'Failed to load menu configuration',
    }),
  updateMenuConfigs: (data: MenuConfig[]) =>
    adminRequest<MenuConfig[]>(`${BASE}/menu-config`, jsonBody('PUT', data), {
      fallbackMessage: 'Failed to update menu configuration',
    }),
  createMenuConfig: (data: MenuCreatePayload) =>
    adminRequest<MenuConfig[]>(`${BASE}/menu-config`, jsonBody('POST', data), {
      fallbackMessage: 'Failed to register menu',
    }),

  // 2. Module Mapping (SpecialPrivilege.jsp parity)
  getModuleMapping: (custCode: string, webId: string) =>
    adminRequest<ModuleMappingMenu[]>(
      `${BASE}/module-mapping?${new URLSearchParams({ custCode, webId })}`,
      undefined,
      { fallbackMessage: 'Failed to load module mapping' },
    ),
  addModulePrivileges: (payload: ModuleMappingPayload) =>
    adminRequest<ModuleMappingMenu[]>(
      `${BASE}/module-mapping/add`,
      jsonBody('POST', payload),
      { fallbackMessage: 'Failed to assign modules' },
    ),
  removeModulePrivileges: (payload: ModuleMappingPayload) =>
    adminRequest<ModuleMappingMenu[]>(
      `${BASE}/module-mapping/remove`,
      jsonBody('POST', payload),
      { fallbackMessage: 'Failed to remove modules' },
    ),
  searchModuleMappingCustomers: (query = '') =>
    adminRequest<ModuleMappingCustomer[]>(
      `${BASE}/module-mapping/customers?${new URLSearchParams({ q: query })}`,
      undefined,
      { fallbackMessage: 'Failed to search customers' },
    ),

  // 3. Email Templates
  getEmailTemplates: () =>
    adminRequest<EmailTemplate[]>(`${BASE}/email-templates`, undefined, {
      fallbackMessage: 'Failed to load email templates',
    }),
  updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) =>
    adminRequest<EmailTemplate[]>(
      `${BASE}/email-templates/${encodeURIComponent(id)}`,
      jsonBody('PUT', data),
      { fallbackMessage: 'Failed to update email template' },
    ),

  // 4. Admin Password Reset — a 404 `{ success: false, message }` now throws.
  resetPassword: (username: string) =>
    adminRequest<PasswordResetResult>(
      `${BASE}/password-reset`,
      jsonBody('POST', { username }),
      { fallbackMessage: 'Failed to reset password' },
    ),

  // 5. Global Config
  getGlobalConfig: () =>
    adminRequest<GlobalConfig>(`${BASE}/global-config`, undefined, {
      fallbackMessage: 'Failed to load global configuration',
    }),
  updateGlobalConfig: (data: GlobalConfig) =>
    adminRequest<GlobalConfig>(`${BASE}/global-config`, jsonBody('PUT', data), {
      fallbackMessage: 'Failed to save global configuration',
    }),

  // 6. Field Configuration
  getFieldConfigs: () =>
    adminRequest<FieldConfig[]>(`${BASE}/field-config`, undefined, {
      fallbackMessage: 'Failed to load field configuration',
    }),
  updateFieldConfigs: (data: FieldConfig[]) =>
    adminRequest<FieldConfig[]>(`${BASE}/field-config`, jsonBody('PUT', data), {
      fallbackMessage: 'Failed to save field configuration',
    }),

  // 7. Service / Route Restrictions (PUT replaces the whole list)
  getServiceRestrictions: () =>
    adminRequest<ServiceRestriction[]>(`${BASE}/service-restrictions`, undefined, {
      fallbackMessage: 'Failed to load route restrictions',
    }),
  updateServiceRestrictions: (data: ServiceRestriction[]) =>
    adminRequest<ServiceRestriction[]>(
      `${BASE}/service-restrictions`,
      jsonBody('PUT', data),
      { fallbackMessage: 'Failed to update route restrictions' },
    ),

  // 8. Banners
  getBanners: () =>
    adminRequest<BannerConfig[]>(`${BASE}/banners`, undefined, {
      fallbackMessage: 'Failed to load banners',
    }),
  createBanner: (data: Omit<BannerConfig, 'id'>) =>
    adminRequest<BannerConfig>(`${BASE}/banners`, jsonBody('POST', data), {
      fallbackMessage: 'Failed to add banner',
    }),

  // 9. Customer Advisories
  getCustomerAdvisories: () =>
    adminRequest<CustomerAdvisory[]>(`${BASE}/customer-advisories`, undefined, {
      fallbackMessage: 'Failed to load advisories',
    }),
  createCustomerAdvisory: (data: Omit<CustomerAdvisory, 'id'>) =>
    adminRequest<CustomerAdvisory>(
      `${BASE}/customer-advisories`,
      jsonBody('POST', data),
      { fallbackMessage: 'Failed to publish advisory' },
    ),

  // 10. Cutoff Configuration (CutoffConfiguration.jsp parity)
  getCutoffConfigs: () =>
    adminRequest<CutoffConfig[]>(`${BASE}/cutoff-configs`, undefined, {
      fallbackMessage: 'Failed to load cutoff configurations',
    }),
  createCutoffConfig: (data: CutoffCreatePayload) =>
    adminRequest<CutoffConfig>(`${BASE}/cutoff-configs`, jsonBody('POST', data), {
      fallbackMessage: 'Failed to create cutoff configuration',
    }),
  updateCutoffConfig: (id: string, data: CutoffUpdatePayload) =>
    adminRequest<CutoffConfig>(
      `${BASE}/cutoff-configs/${encodeURIComponent(id)}`,
      jsonBody('PUT', data),
      { fallbackMessage: 'Failed to update cutoff configuration' },
    ),
  deleteCutoffConfig: async (id: string): Promise<void> => {
    await adminRequest<unknown>(
      `${BASE}/cutoff-configs/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      { fallbackMessage: 'Failed to delete cutoff configuration' },
    );
  },
  getCutoffPorts: () =>
    adminRequest<CutoffPortOption[]>(`${BASE}/cutoff-ports`, undefined, {
      fallbackMessage: 'Failed to load ports',
    }),
  getCutoffTerminals: (portCode: string) =>
    adminRequest<CutoffTerminalOption[]>(
      `${BASE}/cutoff-terminals?${new URLSearchParams({ portCode })}`,
      undefined,
      { fallbackMessage: 'Failed to load terminals' },
    ),
};
