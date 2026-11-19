// Modified by Sekar Nagarajan (2026-08-26 15:06)
import { z } from "zod";

export const inviteStatusSchema = z.enum(["NONE", "PENDING", "ACCEPTED"]);
export type InviteStatus = z.infer<typeof inviteStatusSchema>;

export const provisionModeSchema = z.enum(["PASSWORD", "INVITE"]);
export type ProvisionMode = z.infer<typeof provisionModeSchema>;

export const subUserSchema = z.object({
  id: z.string(),
  loginName: z.string().min(3, "Login name must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string(),
  custCountryCode: z.string().default("+1"),
  custPhoneCode: z.string().default("212"),
  custPhoneNo: z.string(),
  mobileCode: z.string().default("+1"),
  mobileNo: z.string().optional(),
  defLanguage: z.string().default("en"),
  prefLanguage: z.string().default("en"),
  isActive: z.boolean().default(true),
  createdDate: z.string(),
  allowedModules: z.array(z.string()).default([]),
  inviteStatus: inviteStatusSchema.default("NONE"),
  lastInvitedAt: z.string().optional(),
});

export type SubUser = z.infer<typeof subUserSchema>;

const baseCreateFields = {
  loginName: z.string().min(3, "Login name must be at least 3 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().min(1, "Company name is required"),
  custCountryCode: z.string().default("+1"),
  custPhoneCode: z.string().default("212"),
  custPhoneNo: z.string().min(5, "Phone number is required"),
  mobileCode: z.string().default("+1"),
  mobileNo: z.string().optional(),
  defLanguage: z.string().default("en"),
  prefLanguage: z.string().default("en"),
  allowedModules: z
    .array(z.string())
    .min(1, "Select at least one module"),
  provisionMode: provisionModeSchema.default("PASSWORD"),
  password: z.string().optional(),
};

export const createSubUserSchema = z
  .object(baseCreateFields)
  .superRefine((values, ctx) => {
    if (values.provisionMode === "PASSWORD") {
      if (!values.password || values.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password must be at least 6 characters",
        });
      }
    }
  });

export type CreateSubUserPayload = z.infer<typeof createSubUserSchema>;

export const updateSubUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().min(1, "Company name is required"),
  custCountryCode: z.string().default("+1"),
  custPhoneCode: z.string().default("212"),
  custPhoneNo: z.string().min(5, "Phone number is required"),
  mobileCode: z.string().default("+1"),
  mobileNo: z.string().optional(),
  defLanguage: z.string().default("en"),
  prefLanguage: z.string().default("en"),
  allowedModules: z
    .array(z.string())
    .min(1, "Select at least one module"),
});

export type UpdateSubUserPayload = z.infer<typeof updateSubUserSchema>;

export interface UserLimitResponse {
  allowedUserLimit: number;
  currentlyAllocated: number;
  remainingSlots: number;
  limitReached: boolean;
}

export const USC_MODULE_OPTIONS = [
  { label: "Schedules (SCH)", value: "SCH" },
  { label: "Tracking (TRK)", value: "TRK" },
  { label: "e-Booking (BKG)", value: "BKG" },
  { label: "Shipping Instruction (SI)", value: "SI" },
  { label: "VGM Filing", value: "VGM" },
  { label: "Bill of Lading (BL)", value: "BL" },
] as const;

export const CREATE_SUB_USER_DEFAULTS: CreateSubUserPayload = {
  loginName: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  companyName: "",
  custCountryCode: "+1",
  custPhoneCode: "212",
  custPhoneNo: "",
  mobileCode: "+1",
  defLanguage: "en",
  prefLanguage: "en",
  allowedModules: ["SCH", "TRK", "BKG", "SI"],
  provisionMode: "PASSWORD",
};

export const EMPTY_USER_LIMIT: UserLimitResponse = {
  allowedUserLimit: 5,
  currentlyAllocated: 0,
  remainingSlots: 5,
  limitReached: false,
};
