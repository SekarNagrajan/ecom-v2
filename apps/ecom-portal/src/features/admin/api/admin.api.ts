// Modified by sekar nagarajan (2026-08-21)
import type {
  BannerConfig,
  CustomerAdvisory,
  CutoffConfig,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
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

  // 2. Special Privileges
  getSpecialPrivileges: async (): Promise<SpecialPrivilege[]> => {
    const res = await fetch('/api/v1/admin/special-privileges');
    return res.json();
  },
  updateSpecialPrivileges: async (data: SpecialPrivilege[]): Promise<SpecialPrivilege[]> => {
    const res = await fetch('/api/v1/admin/special-privileges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
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
