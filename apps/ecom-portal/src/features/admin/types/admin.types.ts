// Modified by Sekar Nagarajan (2026-11-12 15:10)
import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const isoDate = (label: string) =>
  z.string().regex(ISO_DATE, `${label} must be a valid date`);

// ---------------------------------------------------------------------------
// 1. Menu Management / Module Creation (RegisterMenu.jsp parity)
// ---------------------------------------------------------------------------
export const MenuConfigSchema = z.object({
  refNo: z.string().min(1, 'Ref No is required'),
  labelValue: z.string().min(1, 'Label is required'),
  menuName: z.string().optional(),
  category: z.enum(['D', 'P']),
  classValue: z.string(),
  attrValue: z.string(),
  orderNo: z.number(),
  isEnabled: z.boolean(),
  userType: z.enum(['U', 'V']).optional(),
  menuType: z.string().optional(),
  parentMenu: z.string().optional(),
  developedBy: z.string().optional(),
  createdBy: z.string().optional(),
});
export type MenuConfig = z.infer<typeof MenuConfigSchema>;

/** POST /menu-config body — a MenuConfig whose `isEnabled` defaults to true server-side. */
export type MenuCreatePayload = Omit<MenuConfig, 'isEnabled'> & {
  isEnabled?: boolean;
};

/**
 * Register / edit form — the same field names as MenuConfig so no hand conversion is needed
 * (replaces the legacy `menuOrder` / `status` form shape).
 */
export const MenuUpsertSchema = z.object({
  menuName: z.string().min(1, 'Menu name is required').max(100),
  refNo: z.string().min(1, 'Ref No is required').max(100),
  labelValue: z.string().min(1, 'Label value is required').max(200),
  orderNo: z
    .number({ error: 'Menu order is required' })
    .int('Menu order must be a whole number')
    .min(1, 'Menu order must be at least 1'),
  userType: z.enum(['U', 'V'], { message: 'User type is required' }),
  category: z.enum(['D', 'P'], { message: 'Category is required' }),
  isEnabled: z.boolean(),
  attrValue: z.string().min(1, 'Route / attr value is required'),
  classValue: z.string(),
  menuType: z.string(),
  parentMenu: z.string(),
  developedBy: z.string(),
  createdBy: z.string(),
});
export type MenuUpsertValues = z.infer<typeof MenuUpsertSchema>;

export const MENU_UPSERT_DEFAULTS: MenuUpsertValues = {
  menuName: '',
  refNo: '',
  labelValue: '',
  orderNo: 1,
  userType: 'U',
  category: 'P',
  isEnabled: true,
  attrValue: '',
  classValue: '',
  menuType: 'M',
  parentMenu: 'ROOT',
  developedBy: '',
  createdBy: '',
};

export const MENU_USER_TYPE_OPTIONS = [
  { label: 'User', value: 'U' },
  { label: 'Vendor', value: 'V' },
] as const;

export const MENU_CATEGORY_OPTIONS = [
  { label: 'Default', value: 'D' },
  { label: 'Privileged', value: 'P' },
] as const;

// ---------------------------------------------------------------------------
// 2. Module Mapping (SpecialPrivilege.jsp parity)
// ---------------------------------------------------------------------------
/** P = available privileged, D = default (locked), NP = assigned to customer */
export const ModuleMappingCategorySchema = z.enum(['P', 'D', 'NP']);
export type ModuleMappingCategory = z.infer<typeof ModuleMappingCategorySchema>;

export const ModuleMappingMenuSchema = z.object({
  menuId: z.string(),
  menuName: z.string(),
  refNo: z.string().optional(),
  category: ModuleMappingCategorySchema,
});
export type ModuleMappingMenu = z.infer<typeof ModuleMappingMenuSchema>;

export const ModuleMappingCustomerSchema = z.object({
  custCode: z.string(),
  webId: z.string(),
  compName: z.string(),
});
export type ModuleMappingCustomer = z.infer<typeof ModuleMappingCustomerSchema>;

/** @deprecated Legacy matrix endpoint; the UI uses the Module Mapping APIs. Still served by the mocks. */
export const SpecialPrivilegeSchema = z.object({
  roleId: z.string(),
  roleName: z.string(),
  moduleCode: z.string(),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canApprove: z.boolean(),
});
/** @deprecated See SpecialPrivilegeSchema. */
export type SpecialPrivilege = z.infer<typeof SpecialPrivilegeSchema>;

// ---------------------------------------------------------------------------
// 3. Email Templates
// ---------------------------------------------------------------------------
export const EmailTemplateSchema = z.object({
  id: z.string(),
  templateCode: z.string(),
  subject: z.string(),
  bodyHtml: z.string(),
  placeholders: z.array(z.string()),
  updatedAt: z.string(),
});
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

export const EmailTemplateEditSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255),
  bodyHtml: z.string().min(1, 'Template body is required'),
});
export type EmailTemplateEditValues = z.infer<typeof EmailTemplateEditSchema>;

// ---------------------------------------------------------------------------
// 4. Admin Password Reset
// ---------------------------------------------------------------------------
export const PasswordResetFormSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(100),
});
export type PasswordResetFormValues = z.infer<typeof PasswordResetFormSchema>;

/** @deprecated The reset endpoint only accepts `username`; kept for a future backend that takes options. */
export const PasswordResetRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  forceChangeNextLogin: z.boolean().default(true),
  sendNotificationEmail: z.boolean().default(true),
});
/** @deprecated See PasswordResetRequestSchema. */
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

// ---------------------------------------------------------------------------
// 5. Global Config
// ---------------------------------------------------------------------------
export const GLOBAL_CONFIG_LIMITS = {
  attemptLimit: { min: 1, max: 10 },
  accountLockDurationMinutes: { min: 5, max: 1440 },
} as const;

export const GlobalConfigSchema = z.object({
  enableLoginCaptcha: z.boolean(),
  /** reCAPTCHA *site* key — the public key rendered on the login page; never a secret. */
  captchaSecretKey: z.string(),
  attemptLimit: z
    .number({ error: 'Attempt limit is required' })
    .int()
    .min(GLOBAL_CONFIG_LIMITS.attemptLimit.min)
    .max(GLOBAL_CONFIG_LIMITS.attemptLimit.max),
  accountLockDurationMinutes: z
    .number({ error: 'Lock duration is required' })
    .int()
    .min(GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.min)
    .max(GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.max),
  enablePasswordValidation: z.boolean(),
  allowIncompletedRegToLogin: z.boolean(),
  v1DataEnableStatus: z.boolean(),
  dashboardDisplay: z.boolean(),
});
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

/** Form schema: the site key becomes mandatory while login reCAPTCHA is switched on. */
export const GlobalConfigFormSchema = GlobalConfigSchema.superRefine((values, ctx) => {
  if (values.enableLoginCaptcha && values.captchaSecretKey.trim().length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['captchaSecretKey'],
      message: 'Site key is required while login reCAPTCHA is enabled',
    });
  }
});

export const GLOBAL_CONFIG_DEFAULTS: GlobalConfig = {
  enableLoginCaptcha: false,
  captchaSecretKey: '',
  attemptLimit: 5,
  accountLockDurationMinutes: 30,
  enablePasswordValidation: true,
  allowIncompletedRegToLogin: false,
  v1DataEnableStatus: false,
  dashboardDisplay: true,
};

// ---------------------------------------------------------------------------
// 6. Field Configuration
// ---------------------------------------------------------------------------
export const FieldConfigSchema = z.object({
  id: z.string(),
  formName: z.string(),
  fieldId: z.string(),
  fieldLabel: z.string(),
  isVisible: z.boolean(),
  isRequired: z.boolean(),
});
export type FieldConfig = z.infer<typeof FieldConfigSchema>;

/** Per-row override kept while the Field Configuration grid is dirty. */
export type FieldConfigPatch = Partial<Pick<FieldConfig, 'isVisible' | 'isRequired'>>;

// ---------------------------------------------------------------------------
// 7. Service / Route Restrictions
// ---------------------------------------------------------------------------
export const ServiceRestrictionSchema = z.object({
  id: z.string(),
  polCode: z.string(),
  podCode: z.string(),
  serviceLoop: z.string(),
  tenantId: z.string(),
  isRestricted: z.boolean(),
  reason: z.string().optional(),
});
export type ServiceRestriction = z.infer<typeof ServiceRestrictionSchema>;

export const ServiceRestrictionUpsertSchema = z.object({
  polCode: z.string().min(1, 'Origin port is required'),
  podCode: z.string().min(1, 'Destination port is required'),
  serviceLoop: z.string().min(1, 'Service loop is required'),
  isRestricted: z.boolean(),
  reason: z.string().max(250, 'Reason must be 250 characters or fewer'),
});
export type ServiceRestrictionUpsertValues = z.infer<typeof ServiceRestrictionUpsertSchema>;

// ---------------------------------------------------------------------------
// 8. Banners & Assets
// ---------------------------------------------------------------------------
export const BannerConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string(),
  linkUrl: z.string().optional(),
  sortOrder: z.number(),
  isActive: z.boolean(),
});
export type BannerConfig = z.infer<typeof BannerConfigSchema>;

const URL_OR_PATH = /^(https?:\/\/\S+|\/\S*)$/;

export const BannerUpsertSchema = z.object({
  title: z.string().trim().min(1, 'Banner title is required').max(120),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Image URL is required')
    .regex(URL_OR_PATH, 'Enter an absolute URL or a path starting with /'),
  linkUrl: z
    .string()
    .trim()
    .refine((v) => v === '' || URL_OR_PATH.test(v), 'Enter an absolute URL or a path starting with /'),
  sortOrder: z
    .number({ error: 'Display order is required' })
    .int('Display order must be a whole number')
    .min(1, 'Display order must be at least 1'),
  isActive: z.boolean(),
});
export type BannerUpsertValues = z.infer<typeof BannerUpsertSchema>;

export const BANNER_UPSERT_DEFAULTS: BannerUpsertValues = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 1,
  isActive: true,
};

// ---------------------------------------------------------------------------
// 9. Customer Advisories
// ---------------------------------------------------------------------------
export const ADVISORY_SEVERITIES = ['INFO', 'WARNING', 'URGENT'] as const;
export type AdvisorySeverity = (typeof ADVISORY_SEVERITIES)[number];

export const CustomerAdvisorySchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(ADVISORY_SEVERITIES),
  /** ISO calendar date (YYYY-MM-DD). */
  effectiveFrom: z.string(),
  /** ISO calendar date, or '' when the advisory is open-ended. */
  effectiveTo: z.string(),
  isActive: z.boolean(),
});
export type CustomerAdvisory = z.infer<typeof CustomerAdvisorySchema>;

export const AdvisoryUpsertSchema = z
  .object({
    severity: z.enum(ADVISORY_SEVERITIES, { message: 'Severity is required' }),
    title: z.string().trim().min(1, 'Advisory headline is required').max(120),
    message: z.string().trim().min(1, 'Announcement message is required').max(1000),
    effectiveFrom: isoDate('Effective from'),
    effectiveTo: z
      .string()
      .refine((v) => v === '' || ISO_DATE.test(v), 'Effective to must be a valid date'),
  })
  .superRefine((values, ctx) => {
    if (values.effectiveTo && values.effectiveTo < values.effectiveFrom) {
      ctx.addIssue({
        code: 'custom',
        path: ['effectiveTo'],
        message: 'Effective to must be on or after effective from',
      });
    }
  });
export type AdvisoryUpsertValues = z.infer<typeof AdvisoryUpsertSchema>;

export const ADVISORY_SEVERITY_OPTIONS = [
  { label: 'Info', value: 'INFO' },
  { label: 'Warning', value: 'WARNING' },
  { label: 'Urgent', value: 'URGENT' },
] as const;

// ---------------------------------------------------------------------------
// 10. Cut-off Configuration (CutoffConfiguration.jsp parity)
// ---------------------------------------------------------------------------
const closingHours = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .int(`${label} must be whole hours`)
    .min(1, `${label} must be at least 1 hour`)
    .max(999, `${label} must be 999 hours or fewer`);

export const CutoffConfigSchema = z.object({
  id: z.string(),
  portCode: z.string().min(1),
  portName: z.string(),
  terminalCode: z.string().min(1),
  terminalName: z.string(),
  cfsClosing: z.number().int().min(1).max(999),
  vgmClosing: z.number().int().min(1).max(999),
  documentClosing: z.number().int().min(1).max(999),
  ediDecClosing: z.number().int().min(1).max(999),
  fullCntrGateClosing: z.number().int().min(1).max(999),
  excludeWeekends: z.boolean(),
});
export type CutoffConfig = z.infer<typeof CutoffConfigSchema>;

export const CutoffConfigFormSchema = z.object({
  portCode: z.string().min(1, 'Port is required'),
  terminalCode: z.string().min(1, 'Terminal is required'),
  cfsClosing: closingHours('CFS closing'),
  vgmClosing: closingHours('VGM closing'),
  documentClosing: closingHours('Document closing'),
  ediDecClosing: closingHours('EDI declaration closing'),
  fullCntrGateClosing: closingHours('Full container gate-in closing'),
  excludeWeekends: z.boolean(),
});
export type CutoffConfigFormValues = z.infer<typeof CutoffConfigFormSchema>;
/** Form input type — numbers may be unset before validation (no `undefined as unknown as number`). */
export type CutoffConfigFormInput = z.input<typeof CutoffConfigFormSchema>;

export const CUTOFF_FORM_DEFAULTS: Partial<CutoffConfigFormInput> = {
  portCode: '',
  terminalCode: '',
  excludeWeekends: false,
};

export const CutoffPortOptionSchema = z.object({
  portCode: z.string(),
  portName: z.string(),
  label: z.string(),
});
export type CutoffPortOption = z.infer<typeof CutoffPortOptionSchema>;

export const CutoffTerminalOptionSchema = z.object({
  terminalCode: z.string(),
  terminalName: z.string(),
  portCode: z.string(),
});
export type CutoffTerminalOption = z.infer<typeof CutoffTerminalOptionSchema>;
