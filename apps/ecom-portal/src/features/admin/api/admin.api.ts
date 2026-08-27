// Modified by Sekar Nagarajan (2026-08-27 12:42)
import type {
  BannerConfig,
  CustomerAdvisory,
  CutoffConfig,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  ModuleMappingCustomer,
  ModuleMappingMenu,
  ServiceRestriction,
  SpecialPrivilege,
} from '../types/admin.types';

export const adminApi = {
  // 1. Menu Config
  getMenuConfigs: async (): Promise<MenuConfig[]> => {
    const res = await fetch('/api/v1/admin/menu-config');
    return res.json();
  },
  updateMenuConfigs: async (data: MenuConfig[]): Promise<MenuConfig[]> => {
    const res = await fetch('/api/v1/admin/menu-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // 2. Module Mapping (SpecialPrivilege.jsp parity)
  getModuleMapping: async (
    custCode: string,
    webId: string,
  ): Promise<ModuleMappingMenu[]> => {
    const params = new URLSearchParams({ custCode, webId });
    const res = await fetch(`/api/v1/admin/module-mapping?${params}`);
    if (!res.ok) throw new Error('Failed to load module mapping');
    const json = (await res.json()) as { data: ModuleMappingMenu[] };
    return json.data;
  },
  addModulePrivileges: async (payload: {
    custCode: string;
    webId: string;
    menuIds: string[];
  }): Promise<ModuleMappingMenu[]> => {
    const res = await fetch('/api/v1/admin/module-mapping/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to add privileges');
    const json = (await res.json()) as { data: ModuleMappingMenu[] };
    return json.data;
  },
  removeModulePrivileges: async (payload: {
    custCode: string;
    webId: string;
    menuIds: string[];
  }): Promise<ModuleMappingMenu[]> => {
    const res = await fetch('/api/v1/admin/module-mapping/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to remove privileges');
    const json = (await res.json()) as { data: ModuleMappingMenu[] };
    return json.data;
  },
  searchModuleMappingCustomers: async (
    query = '',
  ): Promise<ModuleMappingCustomer[]> => {
    const params = new URLSearchParams({ q: query });
    const res = await fetch(
      `/api/v1/admin/module-mapping/customers?${params}`,
    );
    if (!res.ok) throw new Error('Failed to search customers');
    const json = (await res.json()) as { data: ModuleMappingCustomer[] };
    return json.data;
  },

  // Legacy matrix endpoints (unused by Module Mapping UI)
  getSpecialPrivileges: async (): Promise<SpecialPrivilege[]> => {
    const res = await fetch('/api/v1/admin/special-privileges');
    return res.json();
  },
  updateSpecialPrivileges: async (
    data: SpecialPrivilege[],
  ): Promise<SpecialPrivilege[]> => {
    const res = await fetch('/api/v1/admin/special-privileges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  createMenuConfig: async (
    data: Omit<MenuConfig, 'isEnabled'> & { isEnabled?: boolean },
  ): Promise<MenuConfig[]> => {
    const res = await fetch('/api/v1/admin/menu-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create menu');
    const json = (await res.json()) as { data: MenuConfig[] };
    return json.data;
  },

  // 3. Email Templates
  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    const res = await fetch('/api/v1/admin/email-templates');
    return res.json();
  },
  updateEmailTemplate: async (id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate[]> => {
    const res = await fetch(`/api/v1/admin/email-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // 4. Admin Password Reset
  resetPassword: async (username: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/v1/admin/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return res.json();
  },

  // 5. Global Config
  getGlobalConfig: async (): Promise<GlobalConfig> => {
    const res = await fetch('/api/v1/admin/global-config');
    return res.json();
  },
  updateGlobalConfig: async (data: GlobalConfig): Promise<GlobalConfig> => {
    const res = await fetch('/api/v1/admin/global-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // 6. Field Configuration
  getFieldConfigs: async (): Promise<FieldConfig[]> => {
    const res = await fetch('/api/v1/admin/field-config');
    return res.json();
  },
  updateFieldConfigs: async (data: FieldConfig[]): Promise<FieldConfig[]> => {
    const res = await fetch('/api/v1/admin/field-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // 7. Service Restrictions
  getServiceRestrictions: async (): Promise<ServiceRestriction[]> => {
    const res = await fetch('/api/v1/admin/service-restrictions');
    return res.json();
  },
  updateServiceRestrictions: async (data: ServiceRestriction[]): Promise<ServiceRestriction[]> => {
    const res = await fetch('/api/v1/admin/service-restrictions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // 8. Banners
  getBanners: async (): Promise<BannerConfig[]> => {
    const res = await fetch('/api/v1/admin/banners');
    return res.json();
  },
  createBanner: async (data: Omit<BannerConfig, 'id'>): Promise<BannerConfig> => {
    const res = await fetch('/api/v1/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // 9. Customer Advisories
  getCustomerAdvisories: async (): Promise<CustomerAdvisory[]> => {
    const res = await fetch('/api/v1/admin/customer-advisories');
    return res.json();
  },
  createCustomerAdvisory: async (data: Omit<CustomerAdvisory, 'id'>): Promise<CustomerAdvisory> => {
    const res = await fetch('/api/v1/admin/customer-advisories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // 10. Cutoff Configuration
  getCutoffConfigs: async (): Promise<CutoffConfig[]> => {
    const res = await fetch('/api/v1/admin/cutoff-configs');
    return res.json();
  },
  updateCutoffConfigs: async (data: CutoffConfig[]): Promise<CutoffConfig[]> => {
    const res = await fetch('/api/v1/admin/cutoff-configs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },
};
