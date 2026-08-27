// Modified by Sekar Nagarajan (2026-08-27 14:30)
import { z } from 'zod';

// 1. Menu Management / Module Creation Types (RegisterMenu.jsp parity)
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

export const MenuCreateSchema = z.object({
  menuName: z.string().min(1, 'Menu name is required'),
  menuOrder: z.number({ error: 'Menu order is required' }).min(1, 'Menu order is required'),
  userType: z.enum(['U', 'V'], { message: 'User type is required' }),
  developedBy: z.string().optional(),
  refNo: z.string().min(1, 'Ref No is required').max(100),
  status: z.enum(['A', 'I']),
  category: z.enum(['D', 'P']),
  createdBy: z.string().optional(),
  classValue: z.string().optional(),
  attrValue: z.string().min(1, 'Route / attr value is required'),
  labelValue: z.string().min(1, 'Label value is required'),
  menuType: z.string().optional(),
  parentMenu: z.string().optional(),
});
export type MenuCreateForm = z.infer<typeof MenuCreateSchema>;

// 2. Module Mapping Types (SpecialPrivilege.jsp parity)
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

/** @deprecated Prefer Module Mapping APIs */
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
export type SpecialPrivilege = z.infer<typeof SpecialPrivilegeSchema>;

// 3. Email Template Types
export const EmailTemplateSchema = z.object({
  id: z.string(),
  templateCode: z.string(),
  subject: z.string(),
  bodyHtml: z.string(),
  placeholders: z.array(z.string()),
  updatedAt: z.string(),
});
export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

// 4. Admin Password Reset Types
export const PasswordResetRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  forceChangeNextLogin: z.boolean().default(true),
  sendNotificationEmail: z.boolean().default(true),
});
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

// 5. Global Config Admin Types
export const GlobalConfigSchema = z.object({
  enableLoginCaptcha: z.boolean(),
  captchaSecretKey: z.string(),
  attemptLimit: z.number().min(1).max(10),
  accountLockDurationMinutes: z.number().min(5),
  enablePasswordValidation: z.boolean(),
  allowIncompletedRegToLogin: z.boolean(),
  v1DataEnableStatus: z.boolean(),
  dashboardDisplay: z.boolean(),
});
export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

// 6. Field Configuration Types
export const FieldConfigSchema = z.object({
  id: z.string(),
  formName: z.string(),
  fieldId: z.string(),
  fieldLabel: z.string(),
  isVisible: z.boolean(),
  isRequired: z.boolean(),
});
export type FieldConfig = z.infer<typeof FieldConfigSchema>;

// 7. Service Restrictions Types
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

// 8. Banner Manager Types
export const BannerConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string(),
  linkUrl: z.string().optional(),
  sortOrder: z.number(),
  isActive: z.boolean(),
});
export type BannerConfig = z.infer<typeof BannerConfigSchema>;

// 9. Customer Advisory Types
export const CustomerAdvisorySchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(['INFO', 'WARNING', 'URGENT']),
  effectiveFrom: z.string(),
  effectiveTo: z.string(),
  isActive: z.boolean(),
});
export type CustomerAdvisory = z.infer<typeof CustomerAdvisorySchema>;

// 10. Cut-off Configuration Types (CutoffConfiguration.jsp parity)
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
  cfsClosing: z.number({ error: 'CFS closing is required' }).int().min(1).max(999),
  vgmClosing: z.number({ error: 'VGM closing is required' }).int().min(1).max(999),
  documentClosing: z
    .number({ error: 'Document closing is required' })
    .int()
    .min(1)
    .max(999),
  ediDecClosing: z
    .number({ error: 'EDI declaration closing is required' })
    .int()
    .min(1)
    .max(999),
  fullCntrGateClosing: z
    .number({ error: 'Full container gate-in closing is required' })
    .int()
    .min(1)
    .max(999),
  excludeWeekends: z.boolean(),
});
export type CutoffConfigFormValues = z.infer<typeof CutoffConfigFormSchema>;

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
