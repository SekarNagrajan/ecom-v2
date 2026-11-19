// Created by Sekar Nagarajan (2026-11-12 12:20)
/**
 * React Query key factory for the Control Panel (admin) module.
 * Every section owns a leaf under `['admin']` so a section can be invalidated on its own,
 * while `adminKeys.all` still clears the whole module (e.g. on tenant switch).
 */
export const adminKeys = {
  all: ['admin'] as const,
  menuConfigs: () => [...adminKeys.all, 'menu-configs'] as const,
  moduleMapping: {
    all: () => [...adminKeys.all, 'module-mapping'] as const,
    customers: (query = '') =>
      [...adminKeys.moduleMapping.all(), 'customers', query] as const,
    menus: (custCode: string, webId: string) =>
      [...adminKeys.moduleMapping.all(), 'menus', custCode, webId] as const,
  },
  emailTemplates: () => [...adminKeys.all, 'email-templates'] as const,
  globalConfig: () => [...adminKeys.all, 'global-config'] as const,
  fieldConfigs: () => [...adminKeys.all, 'field-configs'] as const,
  serviceRestrictions: () => [...adminKeys.all, 'service-restrictions'] as const,
  banners: () => [...adminKeys.all, 'banners'] as const,
  customerAdvisories: () => [...adminKeys.all, 'customer-advisories'] as const,
  cutoff: {
    all: () => [...adminKeys.all, 'cutoff'] as const,
    configs: () => [...adminKeys.cutoff.all(), 'configs'] as const,
    ports: () => [...adminKeys.cutoff.all(), 'ports'] as const,
    terminals: (portCode: string) =>
      [...adminKeys.cutoff.all(), 'terminals', portCode] as const,
  },
};
