// Modified by Antigravity (2026-08-21)
import { z } from 'zod';

// 1. Menu Management Types
export const MenuConfigSchema = z.object({
  refNo: z.string(),
  labelValue: z.string(),
  category: z.enum(['D', 'P']), // D = Default, P = Permission Restricted
  classValue: z.string(),
  attrValue: z.string(),
  orderNo: z.number(),
  isEnabled: z.boolean(),
});
export type MenuConfig = z.infer<typeof MenuConfigSchema>;

// 2. Special Privileges Types
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

// 10. Cut-off Time Config Types
export const CutoffConfigSchema = z.object({
  id: z.string(),
  portCode: z.string(),
  vesselName: z.string(),
  voyageNo: z.string(),
  vgmCutoffHours: z.number(),
  siCutoffHours: z.number(),
  bookingCutoffHours: z.number(),
});
export type CutoffConfig = z.infer<typeof CutoffConfigSchema>;
