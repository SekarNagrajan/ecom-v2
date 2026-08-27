// Modified by Sekar Nagarajan (2026-08-27 14:30)
import { http, HttpResponse } from 'msw';
import type {
  BannerConfig,
  CustomerAdvisory,
  CutoffConfig,
  CutoffPortOption,
  CutoffTerminalOption,
  EmailTemplate,
  FieldConfig,
  GlobalConfig,
  MenuConfig,
  ModuleMappingCustomer,
  ModuleMappingMenu,
  ServiceRestriction,
  SpecialPrivilege,
} from '../features/admin/types/admin.types';

// Mock Initial States for System Admin Modules

let MOCK_MENU_CONFIGS: MenuConfig[] = [
  { refNo: 'DBD', labelValue: 'ecom.dashboard', category: 'D', classValue: 'icon-dashboard', attrValue: '/app/dashboard', orderNo: 1, isEnabled: true },
  { refNo: 'BLS', labelValue: 'ecom.schedules', category: 'D', classValue: 'icon-calendar', attrValue: '/app/schedules', orderNo: 2, isEnabled: true },
  { refNo: 'TRK', labelValue: 'ecom.tracking', category: 'D', classValue: 'icon-compass', attrValue: '/app/tracking', orderNo: 3, isEnabled: true },
  { refNo: 'BKG', labelValue: 'ecom.booking', category: 'P', classValue: 'icon-book', attrValue: '/app/booking', orderNo: 4, isEnabled: true },
  { refNo: 'SHI', labelValue: 'ecom.shippingins', category: 'P', classValue: 'icon-file-text', attrValue: '/app/shipping-instruction', orderNo: 5, isEnabled: true },
  { refNo: 'VGM', labelValue: 'ecom.vgm', category: 'P', classValue: 'icon-shield', attrValue: '/app/vgm', orderNo: 6, isEnabled: true },
  { refNo: 'BOL', labelValue: 'ecom.billoflading', category: 'P', classValue: 'icon-file-check', attrValue: '/app/bl', orderNo: 7, isEnabled: true },
  { refNo: 'DEO', labelValue: 'ecom.deliveryorder', category: 'P', classValue: 'icon-truck', attrValue: '/app/delivery-order', orderNo: 8, isEnabled: true },
  { refNo: 'CRO', labelValue: 'ecom.containerrelease', category: 'P', classValue: 'icon-box', attrValue: '/app/cro', orderNo: 9, isEnabled: true },
  { refNo: 'ARN', labelValue: 'ecom.arrival', category: 'P', classValue: 'icon-bell', attrValue: '/app/arrival-notice', orderNo: 10, isEnabled: true },
  { refNo: 'STMT', labelValue: 'ecom.statement', category: 'P', classValue: 'icon-contact', attrValue: '/app/customer-stmt', orderNo: 11, isEnabled: true },
];

let MOCK_SPECIAL_PRIVILEGES: SpecialPrivilege[] = [
  { roleId: 'ROLE_AGENCY_ADMIN', roleName: 'Agency Administrator', moduleCode: 'BKG', canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
  { roleId: 'ROLE_AGENCY_ADMIN', roleName: 'Agency Administrator', moduleCode: 'SHI', canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true },
  { roleId: 'ROLE_AGENCY_USER', roleName: 'Agency Desk Officer', moduleCode: 'BKG', canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false },
  { roleId: 'ROLE_VENDOR_DOCS', roleName: 'Documentation Partner', moduleCode: 'BOL', canView: true, canCreate: false, canEdit: true, canDelete: false, canApprove: true },
];

/** Per-customer assigned privileged menus (NP). Key = `${custCode}|${webId}` */
const MOCK_CUSTOMER_ASSIGNED: Record<string, string[]> = {
  'CUST-001|APEXWEB': ['4', '5'],
};

const MOCK_MAPPING_CUSTOMERS: ModuleMappingCustomer[] = [
  { custCode: 'CUST-001', webId: 'APEXWEB', compName: 'Apex Logistics Global' },
  { custCode: 'CUST-002', webId: 'OCEANWEB', compName: 'Ocean Freight Partners' },
  { custCode: 'CUST-003', webId: 'PACIFIC01', compName: 'Pacific Container Lines' },
];

function buildModuleMapping(
  custCode: string,
  webId: string,
): ModuleMappingMenu[] {
  const key = `${custCode}|${webId}`;
  const assigned = new Set(MOCK_CUSTOMER_ASSIGNED[key] ?? []);

  return MOCK_MENU_CONFIGS.filter((m) => m.isEnabled).map((menu, index) => {
    const menuId = String(index + 1);
    let category: ModuleMappingMenu['category'] = menu.category;
    if (menu.category === 'P' && assigned.has(menuId)) {
      category = 'NP';
    }
    return {
      menuId,
      menuName: menu.menuName || menu.labelValue.replace(/^ecom\./, ''),
      refNo: menu.refNo,
      category,
    };
  });
}

let MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'TPL_001',
    templateCode: 'BOOKING_CONFIRMATION',
    subject: 'Booking Confirmation - @bookingNo',
    bodyHtml: '<p>Dear Customer,</p><p>Your booking <strong>@bookingNo</strong> has been confirmed for vessel <strong>@vesselName</strong>.</p><p>Link: <a href="@url">View Booking</a></p>',
    placeholders: ['@bookingNo', '@vesselName', '@url', '@customerName'],
    updatedAt: '2026-08-20 14:30',
  },
  {
    id: 'TPL_002',
    templateCode: 'SI_ACCEPTED',
    subject: 'Shipping Instruction Accepted - @siNo',
    bodyHtml: '<p>Dear Customer,</p><p>SI <strong>@siNo</strong> was approved by agency team.</p>',
    placeholders: ['@siNo', '@url', '@customerName'],
    updatedAt: '2026-08-19 11:15',
  },
  {
    id: 'TPL_003',
    templateCode: 'PASSWORD_RESET_OTP',
    subject: 'E-Com Portal Security - Temporary Password',
    bodyHtml: '<p>Dear @loginName,</p><p>Your temporary password is <strong>@tempPass</strong>. Valid for 10 minutes.</p>',
    placeholders: ['@loginName', '@tempPass', '@tenantName'],
    updatedAt: '2026-08-21 09:00',
  },
];

let MOCK_GLOBAL_CONFIG: GlobalConfig = {
  enableLoginCaptcha: true,
  captchaSecretKey: '6Ld_MOCK_SECRET_KEY_FOR_RECAPTCHA_V2',
  attemptLimit: 3,
  accountLockDurationMinutes: 30,
  enablePasswordValidation: true,
  allowIncompletedRegToLogin: true,
  v1DataEnableStatus: true,
  dashboardDisplay: true,
};

let MOCK_FIELD_CONFIGS: FieldConfig[] = [
  { id: 'FC_01', formName: 'Registration Form', fieldId: 'taxId', fieldLabel: 'Tax Identification Number (GST/VAT)', isVisible: true, isRequired: true },
  { id: 'FC_02', formName: 'Registration Form', fieldId: 'faxNo', fieldLabel: 'Fax Number', isVisible: true, isRequired: false },
  { id: 'FC_03', formName: 'Booking Form', fieldId: 'commodityDetails', fieldLabel: 'Cargo Commodity Description', isVisible: true, isRequired: true },
  { id: 'FC_04', formName: 'SI Form', fieldId: 'hsCode', fieldLabel: '6-Digit HS Code', isVisible: true, isRequired: true },
];

let MOCK_SERVICE_RESTRICTIONS: ServiceRestriction[] = [
  { id: 'SR_01', polCode: 'SGSIN', podCode: 'USNYC', serviceLoop: 'FE1_EAST_COAST', tenantId: 'TENANT_01', isRestricted: false },
  { id: 'SR_02', polCode: 'CNSHA', podCode: 'DEHAM', serviceLoop: 'EU2_NORTH_EUROPE', tenantId: 'TENANT_02', isRestricted: true, reason: 'High congestion at Hamburg terminal' },
];

let MOCK_BANNERS: BannerConfig[] = [
  { id: 'BN_01', title: 'Global Maritime Logistics Network 2026', imageUrl: '/hero-bg.png', linkUrl: '/schedules', sortOrder: 1, isActive: true },
  { id: 'BN_02', title: 'SOLAS VGM Electronic Filing Portal', imageUrl: '/hero_shipping_bg.png', linkUrl: '/vgm', sortOrder: 2, isActive: true },
];

let MOCK_CUSTOMER_ADVISORIES: CustomerAdvisory[] = [
  { id: 'ADV_01', title: 'Typhoon Notice - Shanghai Port Operations', message: 'Vessel berthing delayed by 24 hours at Shanghai container terminal due to weather conditions.', severity: 'WARNING', effectiveFrom: '2026-08-20', effectiveTo: '2026-08-25', isActive: true },
  { id: 'ADV_02', title: 'New SOLAS Container Weighing Requirements', message: 'Updated VGM submission window enforced effective Sept 1st.', severity: 'INFO', effectiveFrom: '2026-08-15', effectiveTo: '2026-09-15', isActive: true },
];

let MOCK_CUTOFF_CONFIGS: CutoffConfig[] = [
  {
    id: 'SGSIN|PSA',
    portCode: 'SGSIN',
    portName: 'Singapore',
    terminalCode: 'PSA',
    terminalName: 'PSA Terminal',
    cfsClosing: 48,
    vgmClosing: 24,
    documentClosing: 36,
    ediDecClosing: 30,
    fullCntrGateClosing: 24,
    excludeWeekends: true,
  },
  {
    id: 'CNSHA|All',
    portCode: 'CNSHA',
    portName: 'Shanghai',
    terminalCode: 'All',
    terminalName: 'All Terminal',
    cfsClosing: 72,
    vgmClosing: 36,
    documentClosing: 48,
    ediDecClosing: 42,
    fullCntrGateClosing: 36,
    excludeWeekends: false,
  },
];

const MOCK_CUTOFF_PORTS: CutoffPortOption[] = [
  { portCode: 'All', portName: 'All Port', label: 'All - All Port' },
  { portCode: 'SGSIN', portName: 'Singapore', label: 'SGSIN - Singapore' },
  { portCode: 'CNSHA', portName: 'Shanghai', label: 'CNSHA - Shanghai' },
  { portCode: 'USNYC', portName: 'New York', label: 'USNYC - New York' },
  { portCode: 'DEHAM', portName: 'Hamburg', label: 'DEHAM - Hamburg' },
  { portCode: 'NLRTM', portName: 'Rotterdam', label: 'NLRTM - Rotterdam' },
  { portCode: 'INMAA', portName: 'Chennai', label: 'INMAA - Chennai' },
];

const MOCK_CUTOFF_TERMINALS: CutoffTerminalOption[] = [
  { portCode: 'SGSIN', terminalCode: 'PSA', terminalName: 'PSA Terminal' },
  { portCode: 'SGSIN', terminalCode: 'JUR', terminalName: 'Jurong Terminal' },
  { portCode: 'CNSHA', terminalCode: 'YANG', terminalName: 'Yangshan' },
  { portCode: 'CNSHA', terminalCode: 'WGQ', terminalName: 'Waigaoqiao' },
  { portCode: 'USNYC', terminalCode: 'APM', terminalName: 'APM Elizabeth' },
  { portCode: 'DEHAM', terminalCode: 'CTA', terminalName: 'CTA Hamburg' },
  { portCode: 'NLRTM', terminalCode: 'ECT', terminalName: 'ECT Delta' },
  { portCode: 'INMAA', terminalCode: 'CIT', terminalName: 'Chennai CIT' },
];

function cutoffId(portCode: string, terminalCode: string) {
  return `${portCode}|${terminalCode}`;
}

export const adminHandlers = [
  // 1. Menu Management / Module Creation
  http.get('/api/v1/admin/menu-config', () => {
    return HttpResponse.json(MOCK_MENU_CONFIGS);
  }),
  http.put('/api/v1/admin/menu-config', async ({ request }) => {
    const updated = (await request.json()) as MenuConfig[];
    MOCK_MENU_CONFIGS = updated;
    return HttpResponse.json({ success: true, data: MOCK_MENU_CONFIGS });
  }),
  http.post('/api/v1/admin/menu-config', async ({ request }) => {
    const body = (await request.json()) as Omit<MenuConfig, 'isEnabled'> & {
      isEnabled?: boolean;
    };
    const created: MenuConfig = {
      ...body,
      isEnabled: body.isEnabled ?? true,
      classValue: body.classValue || '',
      menuName: body.menuName || body.labelValue,
    };
    MOCK_MENU_CONFIGS = [...MOCK_MENU_CONFIGS, created];
    return HttpResponse.json({ success: true, data: MOCK_MENU_CONFIGS });
  }),

  // 2. Module Mapping (SpecialPrivilege.jsp parity)
  http.get('/api/v1/admin/module-mapping/customers', ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const data = MOCK_MAPPING_CUSTOMERS.filter(
      (c) =>
        !q ||
        c.custCode.toLowerCase().includes(q) ||
        c.compName.toLowerCase().includes(q) ||
        c.webId.toLowerCase().includes(q),
    );
    return HttpResponse.json({ data });
  }),
  http.get('/api/v1/admin/module-mapping', ({ request }) => {
    const url = new URL(request.url);
    const custCode = url.searchParams.get('custCode') ?? '';
    const webId = url.searchParams.get('webId') ?? '';
    return HttpResponse.json({
      data: buildModuleMapping(custCode, webId),
    });
  }),
  http.post('/api/v1/admin/module-mapping/add', async ({ request }) => {
    const body = (await request.json()) as {
      custCode: string;
      webId: string;
      menuIds: string[];
    };
    const key = `${body.custCode}|${body.webId}`;
    const current = new Set(MOCK_CUSTOMER_ASSIGNED[key] ?? []);
    for (const id of body.menuIds) current.add(id);
    MOCK_CUSTOMER_ASSIGNED[key] = [...current];
    return HttpResponse.json({
      data: buildModuleMapping(body.custCode, body.webId),
    });
  }),
  http.post('/api/v1/admin/module-mapping/remove', async ({ request }) => {
    const body = (await request.json()) as {
      custCode: string;
      webId: string;
      menuIds: string[];
    };
    const key = `${body.custCode}|${body.webId}`;
    const removeSet = new Set(body.menuIds);
    MOCK_CUSTOMER_ASSIGNED[key] = (MOCK_CUSTOMER_ASSIGNED[key] ?? []).filter(
      (id) => !removeSet.has(id),
    );
    return HttpResponse.json({
      data: buildModuleMapping(body.custCode, body.webId),
    });
  }),

  // Legacy special-privileges matrix (kept for compatibility)
  http.get('/api/v1/admin/special-privileges', () => {
    return HttpResponse.json(MOCK_SPECIAL_PRIVILEGES);
  }),
  http.put('/api/v1/admin/special-privileges', async ({ request }) => {
    const updated = (await request.json()) as SpecialPrivilege[];
    MOCK_SPECIAL_PRIVILEGES = updated;
    return HttpResponse.json({ success: true, data: MOCK_SPECIAL_PRIVILEGES });
  }),

  // 3. Email Templates
  http.get('/api/v1/admin/email-templates', () => {
    return HttpResponse.json(MOCK_EMAIL_TEMPLATES);
  }),
  http.put('/api/v1/admin/email-templates/:id', async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as Partial<EmailTemplate>;
    MOCK_EMAIL_TEMPLATES = MOCK_EMAIL_TEMPLATES.map((t) => (t.id === id ? { ...t, ...body, updatedAt: new Date().toISOString() } : t));
    return HttpResponse.json({ success: true, data: MOCK_EMAIL_TEMPLATES });
  }),

  // 4. Admin Password Reset
  http.post('/api/v1/admin/password-reset', async ({ request }) => {
    const body = (await request.json()) as { username: string };
    return HttpResponse.json({
      success: true,
      message: `Password for ${body.username} reset successfully. Temporary OTP dispatched to user email.`,
    });
  }),

  // 5. Global Config
  http.get('/api/v1/admin/global-config', () => {
    return HttpResponse.json(MOCK_GLOBAL_CONFIG);
  }),
  http.put('/api/v1/admin/global-config', async ({ request }) => {
    const body = (await request.json()) as GlobalConfig;
    MOCK_GLOBAL_CONFIG = body;
    return HttpResponse.json({ success: true, data: MOCK_GLOBAL_CONFIG });
  }),

  // 6. Field Configuration
  http.get('/api/v1/admin/field-config', () => {
    return HttpResponse.json(MOCK_FIELD_CONFIGS);
  }),
  http.put('/api/v1/admin/field-config', async ({ request }) => {
    const updated = (await request.json()) as FieldConfig[];
    MOCK_FIELD_CONFIGS = updated;
    return HttpResponse.json({ success: true, data: MOCK_FIELD_CONFIGS });
  }),

  // 7. Service Restrictions
  http.get('/api/v1/admin/service-restrictions', () => {
    return HttpResponse.json(MOCK_SERVICE_RESTRICTIONS);
  }),
  http.put('/api/v1/admin/service-restrictions', async ({ request }) => {
    const updated = (await request.json()) as ServiceRestriction[];
    MOCK_SERVICE_RESTRICTIONS = updated;
    return HttpResponse.json({ success: true, data: MOCK_SERVICE_RESTRICTIONS });
  }),

  // 8. Banner Manager
  http.get('/api/v1/admin/banners', () => {
    return HttpResponse.json(MOCK_BANNERS);
  }),
  http.post('/api/v1/admin/banners', async ({ request }) => {
    const body = (await request.json()) as Omit<BannerConfig, 'id'>;
    const newBanner: BannerConfig = { ...body, id: `BN_0${MOCK_BANNERS.length + 1}` };
    MOCK_BANNERS.push(newBanner);
    return HttpResponse.json({ success: true, data: newBanner });
  }),

  // 9. Customer Advisories
  http.get('/api/v1/admin/customer-advisories', () => {
    return HttpResponse.json(MOCK_CUSTOMER_ADVISORIES);
  }),
  http.post('/api/v1/admin/customer-advisories', async ({ request }) => {
    const body = (await request.json()) as Omit<CustomerAdvisory, 'id'>;
    const newAdv: CustomerAdvisory = { ...body, id: `ADV_0${MOCK_CUSTOMER_ADVISORIES.length + 1}` };
    MOCK_CUSTOMER_ADVISORIES.push(newAdv);
    return HttpResponse.json({ success: true, data: newAdv });
  }),

  // 10. Cutoff Configuration (CutoffConfiguration.jsp parity)
  http.get('/api/v1/admin/cutoff-configs', () => {
    return HttpResponse.json({ data: MOCK_CUTOFF_CONFIGS });
  }),
  http.post('/api/v1/admin/cutoff-configs', async ({ request }) => {
    const body = (await request.json()) as Omit<CutoffConfig, 'id'> & {
      id?: string;
    };
    const id = cutoffId(body.portCode, body.terminalCode);
    if (MOCK_CUTOFF_CONFIGS.some((row) => row.id === id)) {
      return HttpResponse.json(
        {
          error: {
            code: 'DUPLICATE',
            message: 'Duplicate port and terminal',
          },
        },
        { status: 409 },
      );
    }
    const created: CutoffConfig = {
      id,
      portCode: body.portCode,
      portName: body.portName,
      terminalCode: body.terminalCode,
      terminalName: body.terminalName,
      cfsClosing: body.cfsClosing,
      vgmClosing: body.vgmClosing,
      documentClosing: body.documentClosing,
      ediDecClosing: body.ediDecClosing,
      fullCntrGateClosing: body.fullCntrGateClosing,
      excludeWeekends: body.excludeWeekends,
    };
    MOCK_CUTOFF_CONFIGS = [...MOCK_CUTOFF_CONFIGS, created];
    return HttpResponse.json({ success: true, data: created });
  }),
  http.put('/api/v1/admin/cutoff-configs/:id', async ({ params, request }) => {
    const id = decodeURIComponent(String(params.id));
    const body = (await request.json()) as Partial<CutoffConfig>;
    const index = MOCK_CUTOFF_CONFIGS.findIndex((row) => row.id === id);
    if (index < 0) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Cutoff config not found' } },
        { status: 404 },
      );
    }
    const current = MOCK_CUTOFF_CONFIGS[index];
    const updated: CutoffConfig = {
      ...current,
      cfsClosing: body.cfsClosing ?? current.cfsClosing,
      vgmClosing: body.vgmClosing ?? current.vgmClosing,
      documentClosing: body.documentClosing ?? current.documentClosing,
      ediDecClosing: body.ediDecClosing ?? current.ediDecClosing,
      fullCntrGateClosing:
        body.fullCntrGateClosing ?? current.fullCntrGateClosing,
      excludeWeekends: body.excludeWeekends ?? current.excludeWeekends,
    };
    MOCK_CUTOFF_CONFIGS = MOCK_CUTOFF_CONFIGS.map((row, i) =>
      i === index ? updated : row,
    );
    return HttpResponse.json({ success: true, data: updated });
  }),
  http.delete('/api/v1/admin/cutoff-configs/:id', ({ params }) => {
    const id = decodeURIComponent(String(params.id));
    const before = MOCK_CUTOFF_CONFIGS.length;
    MOCK_CUTOFF_CONFIGS = MOCK_CUTOFF_CONFIGS.filter((row) => row.id !== id);
    if (MOCK_CUTOFF_CONFIGS.length === before) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Cutoff config not found' } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/v1/admin/cutoff-ports', () => {
    return HttpResponse.json({ data: MOCK_CUTOFF_PORTS });
  }),
  http.get('/api/v1/admin/cutoff-terminals', ({ request }) => {
    const url = new URL(request.url);
    const portCode = url.searchParams.get('portCode') ?? '';
    const terminals: CutoffTerminalOption[] = [
      {
        portCode,
        terminalCode: 'All',
        terminalName: 'All Terminal',
      },
      ...MOCK_CUTOFF_TERMINALS.filter((t) => t.portCode === portCode),
    ];
    return HttpResponse.json({ data: terminals });
  }),
];
