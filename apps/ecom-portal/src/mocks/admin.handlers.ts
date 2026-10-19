// Modified by Sekar Nagarajan (2026-10-16 23:35)
import { http, HttpResponse } from 'msw';
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
} from '../features/admin/types/admin.types';
import {
  advisories,
  advisoryRow,
  applyCutoff,
  applyEmailTemplate,
  applyFieldConfigs,
  applyGlobalConfig,
  applyServiceRestrictions,
  bannerRow,
  banners,
  cutoffConfigs,
  cutoffId,
  cutoffPorts,
  cutoffRow,
  cutoffTerminals,
  emailTemplates,
  fieldConfigs,
  findCutoffRow,
  globalConfigDto,
  mapAdvisory,
  mapBanner,
  mapCutoff,
  portNameIndex,
  serviceRestrictions,
} from './fixture-api/bridges/admin.bridge';
import {
  applyMenuConfigs,
  applySpecialPrivileges,
  assignedMenuIds,
  menuConfigRow,
  menuConfigs,
  moduleMappingMenus,
  setAssignedMenuIds,
  specialPrivileges,
} from './fixture-api/bridges/menus.bridge';
import { moduleMappingCustomers, resetUserPassword } from './fixture-api/bridges/users.bridge';
import { db, eq } from './fixture-api/db';
import {
  ensureUserDbReady,
  persistUserDb,
} from './fixture-api/user-persistence';

/**
 * System-admin modules served from the SQL-extracted fixtures (src/mocks/fixtures) through the bridges in
 * ./fixture-api/bridges. Mutations write back onto the db.* arrays, so changes persist for the browser session.
 */

/** GlobalConfig fields with no fixture column (attempt limit, lock duration) are kept per session. */
let globalConfigOverrides: Partial<GlobalConfig> = {};

const notFound = (message: string) => HttpResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 });

export const adminHandlers = [
  // 1. Menu Management / Module Creation ← MenuRegistration
  http.get('/api/v1/admin/menu-config', () => HttpResponse.json(menuConfigs())),
  http.put('/api/v1/admin/menu-config', async ({ request }) => {
    applyMenuConfigs((await request.json()) as MenuConfig[]);
    return HttpResponse.json({ success: true, data: menuConfigs() });
  }),
  http.post('/api/v1/admin/menu-config', async ({ request }) => {
    const body = (await request.json()) as Omit<MenuConfig, 'isEnabled'> & { isEnabled?: boolean };
    db.menus.push(menuConfigRow({ ...body, isEnabled: body.isEnabled ?? true, classValue: body.classValue || '', menuName: body.menuName || body.labelValue }));
    return HttpResponse.json({ success: true, data: menuConfigs() });
  }),

  // 2. Module Mapping (SpecialPrivilege.jsp parity) ← SplPrivilegeMenu + eCom_Reg_Details + EcomCustomerMapping
  http.get('/api/v1/admin/module-mapping/customers', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? '';
    return HttpResponse.json({ data: moduleMappingCustomers(q) });
  }),
  http.get('/api/v1/admin/module-mapping', ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({ data: moduleMappingMenus(url.searchParams.get('custCode') ?? '', url.searchParams.get('webId') ?? '') });
  }),
  http.post('/api/v1/admin/module-mapping/add', async ({ request }) => {
    const body = (await request.json()) as { custCode: string; webId: string; menuIds: string[] };
    setAssignedMenuIds(body.custCode, body.webId, [...assignedMenuIds(body.custCode, body.webId), ...body.menuIds]);
    return HttpResponse.json({ data: moduleMappingMenus(body.custCode, body.webId) });
  }),
  http.post('/api/v1/admin/module-mapping/remove', async ({ request }) => {
    const body = (await request.json()) as { custCode: string; webId: string; menuIds: string[] };
    const remove = new Set(body.menuIds.map(String));
    setAssignedMenuIds(body.custCode, body.webId, assignedMenuIds(body.custCode, body.webId).filter(id => !remove.has(id)));
    return HttpResponse.json({ data: moduleMappingMenus(body.custCode, body.webId) });
  }),

  // Legacy special-privileges matrix ← SplPrivilegeMenu joined to MenuRegistration
  http.get('/api/v1/admin/special-privileges', () => HttpResponse.json(specialPrivileges())),
  http.put('/api/v1/admin/special-privileges', async ({ request }) => {
    applySpecialPrivileges((await request.json()) as SpecialPrivilege[]);
    return HttpResponse.json({ success: true, data: specialPrivileges() });
  }),

  // 3. Email Templates ← EcomEmailTemplate
  http.get('/api/v1/admin/email-templates', () => HttpResponse.json(emailTemplates())),
  http.put('/api/v1/admin/email-templates/:id', async ({ params, request }) => {
    const row = db.emailTemplates.find(t => eq(t.id, params.id));
    if (!row) return notFound('Email template not found');
    applyEmailTemplate(row, (await request.json()) as Partial<EmailTemplate>);
    return HttpResponse.json({ success: true, data: emailTemplates() });
  }),

  // 4. Admin Password Reset → ecomuserdetails (lastpwdup / lock counters)
  http.post('/api/v1/admin/password-reset', async ({ request }) => {
    await ensureUserDbReady();
    const body = (await request.json()) as { username: string };
    if (!resetUserPassword(body.username)) {
      return HttpResponse.json({ success: false, message: `No user found for ${body.username}.` }, { status: 404 });
    }
    persistUserDb();
    return HttpResponse.json({ success: true, message: `Password for ${body.username} reset successfully. Temporary OTP dispatched to user email.` });
  }),

  // 5. Global Config ← globalconfigproduct + EcomConfiguration
  http.get('/api/v1/admin/global-config', () => HttpResponse.json({ ...globalConfigDto(), ...globalConfigOverrides })),
  http.put('/api/v1/admin/global-config', async ({ request }) => {
    const body = (await request.json()) as GlobalConfig;
    applyGlobalConfig(body);
    globalConfigOverrides = { attemptLimit: body.attemptLimit, accountLockDurationMinutes: body.accountLockDurationMinutes };
    return HttpResponse.json({ success: true, data: { ...globalConfigDto(), ...globalConfigOverrides } });
  }),

  // 6. Field Configuration ← fieldconfigdetails + fieldnameconfig
  http.get('/api/v1/admin/field-config', () => HttpResponse.json(fieldConfigs())),
  http.put('/api/v1/admin/field-config', async ({ request }) => {
    applyFieldConfigs((await request.json()) as FieldConfig[]);
    return HttpResponse.json({ success: true, data: fieldConfigs() });
  }),

  // 7. Service Restrictions ← ecom_service_restrict
  http.get('/api/v1/admin/service-restrictions', () => HttpResponse.json(serviceRestrictions())),
  http.put('/api/v1/admin/service-restrictions', async ({ request }) => {
    applyServiceRestrictions((await request.json()) as ServiceRestriction[]);
    return HttpResponse.json({ success: true, data: serviceRestrictions() });
  }),

  // 8. Banner Manager ← EcomImageUpload
  http.get('/api/v1/admin/banners', () => HttpResponse.json(banners())),
  http.post('/api/v1/admin/banners', async ({ request }) => {
    const body = (await request.json()) as Omit<BannerConfig, 'id'>;
    return HttpResponse.json({ success: true, data: mapBanner(bannerRow(body)) });
  }),

  // 9. Customer Advisories ← EcomCustomerAdvisory
  http.get('/api/v1/admin/customer-advisories', () => HttpResponse.json(advisories())),
  http.post('/api/v1/admin/customer-advisories', async ({ request }) => {
    const body = (await request.json()) as Omit<CustomerAdvisory, 'id'>;
    return HttpResponse.json({ success: true, data: { ...mapAdvisory(advisoryRow(body)), severity: body.severity, effectiveTo: body.effectiveTo } });
  }),

  // 10. Cutoff Configuration (CutoffConfiguration.jsp parity) ← ecom_cutoffconfig
  http.get('/api/v1/admin/cutoff-configs', () => HttpResponse.json({ data: cutoffConfigs() })),
  http.post('/api/v1/admin/cutoff-configs', async ({ request }) => {
    const body = (await request.json()) as Omit<CutoffConfig, 'id'> & { id?: string };
    if (findCutoffRow(cutoffId(body.portCode, body.terminalCode))) {
      return HttpResponse.json({ error: { code: 'DUPLICATE', message: 'Duplicate port and terminal' } }, { status: 409 });
    }
    return HttpResponse.json({ success: true, data: mapCutoff(cutoffRow(body), portNameIndex()) });
  }),
  http.put('/api/v1/admin/cutoff-configs/:id', async ({ params, request }) => {
    const row = findCutoffRow(decodeURIComponent(String(params.id)));
    if (!row) return notFound('Cutoff config not found');
    applyCutoff(row, (await request.json()) as Partial<CutoffConfig>);
    return HttpResponse.json({ success: true, data: mapCutoff(row, portNameIndex()) });
  }),
  http.delete('/api/v1/admin/cutoff-configs/:id', ({ params }) => {
    const row = findCutoffRow(decodeURIComponent(String(params.id)));
    if (!row) return notFound('Cutoff config not found');
    db.cutoffConfig.splice(db.cutoffConfig.indexOf(row), 1);
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/v1/admin/cutoff-ports', () => HttpResponse.json({ data: cutoffPorts() })),
  http.get('/api/v1/admin/cutoff-terminals', ({ request }) => {
    const portCode = new URL(request.url).searchParams.get('portCode') ?? '';
    return HttpResponse.json({ data: cutoffTerminals(portCode) });
  }),
];
