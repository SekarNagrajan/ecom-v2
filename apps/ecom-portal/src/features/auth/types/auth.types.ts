// Modified by Sekar Nagarajan (2026-09-29 12:40)
import type { LoginEntryType, SubCustomerAccount, UserProfile } from "@solverminds/auth";
import type { TFunction } from "i18next";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Customer login form schema — parity with JSP jQuery Validate + sha256
// ---------------------------------------------------------------------------
export function createLoginSchema(t: TFunction<"auth">) {
  return z.object({
    userName: z
      .string()
      .min(1, t("validation.usernameRequired"))
      .max(50, t("validation.usernameMax")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
      .max(20, t("validation.passwordMax")),
  });
}

export type LoginForm = {
  userName: string;
  password: string;
};

// ---------------------------------------------------------------------------
// Admin / Vendor login form schema — used by /cpanel, /eadmin, /admin
// ---------------------------------------------------------------------------
export function createAdminLoginSchema(t: TFunction<"auth">) {
  return z.object({
    userId: z
      .string()
      .min(1, t("validation.userIdRequired"))
      .max(50, t("validation.userIdMax")),
    password: z
      .string()
      .min(1, t("validation.passwordRequired"))
      .max(20, t("validation.passwordMax")),
  });
}

export type AdminLoginForm = {
  userId: string;
  password: string;
};

// ---------------------------------------------------------------------------
// Forgot password form schema
// ---------------------------------------------------------------------------
export function createForgotPasswordSchema(t: TFunction<"auth">) {
  return z.object({
    userName: z.string().min(1, t("validation.usernameRequired")),
    captcha: z.string().min(1, t("validation.captchaRequired")),
  });
}

export type ForgotPasswordForm = {
  userName: string;
  captcha: string;
};

// ---------------------------------------------------------------------------
// Auth API response shapes
// ---------------------------------------------------------------------------
export interface LoginSuccessResponse {
  token: string;
  user: UserProfile;
  redirectUrl?: string;
}

export interface AdminLoginSuccessResponse {
  token: string;
  user: UserProfile;
  customerList?: SubCustomerAccount[];
}

export interface AuthErrorResponse {
  code: "INVALID_CREDENTIALS" | "ACCOUNT_LOCKED" | "PASSWORD_EXPIRED" | "UNKNOWN";
  message: string;
}

export type { LoginEntryType };
