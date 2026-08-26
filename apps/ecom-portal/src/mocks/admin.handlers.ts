// Modified by Sekar Nagarajan (2026-08-25 12:45)
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
  { id: 'CO_01', portCode: 'SGSIN', vesselName: 'APEX EXPRESS', voyageNo: 'V.2026E', vgmCutoffHours: 12, siCutoffHours: 24, bookingCutoffHours: 48 },
  { id: 'CO_02', portCode: 'CNSHA', vesselName: 'ATLANTIC STAR', voyageNo: 'V.108W', vgmCutoffHours: 18, siCutoffHours: 36, bookingCutoffHours: 72 },
];

export const adminHandlers = [
  // 1. Menu Management
  http.get('/api/v1/admin/menu-config', () => {
    return HttpResponse.json(MOCK_MENU_CONFIGS);
  }),
  http.put('/api/v1/admin/menu-config', async ({ request }) => {
    const updated = (await request.json()) as MenuConfig[];
    MOCK_MENU_CONFIGS = updated;
    return HttpResponse.json({ success: true, data: MOCK_MENU_CONFIGS });
  }),

  // 2. Special Privileges
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

  // 10. Cutoff Configuration
  http.get('/api/v1/admin/cutoff-configs', () => {
    return HttpResponse.json(MOCK_CUTOFF_CONFIGS);
  }),
  http.put('/api/v1/admin/cutoff-configs', async ({ request }) => {
    const updated = (await request.json()) as CutoffConfig[];
    MOCK_CUTOFF_CONFIGS = updated;
    return HttpResponse.json({ success: true, data: MOCK_CUTOFF_CONFIGS });
  }),
];
