// Modified by Sekar Nagarajan (2026-08-27 11:30)
import type { LoginEntryType, SubCustomerAccount, UserProfile } from '@solverminds/auth';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Customer login form schema — parity with JSP jQuery Validate + sha256
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  userName: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be 50 characters or fewer'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(20, 'Password must be 20 characters or fewer'),
});

export type LoginForm = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Admin / Vendor login form schema — used by /cpanel, /eadmin, /admin
// ---------------------------------------------------------------------------
export const adminLoginSchema = z.object({
  userId: z
    .string()
    .min(1, 'User ID is required')
    .max(50, 'User ID must be 50 characters or fewer'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(20, 'Password must be 20 characters or fewer'),
});

export type AdminLoginForm = z.infer<typeof adminLoginSchema>;

// ---------------------------------------------------------------------------
// Forgot password form schema
// ---------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  captcha: z.string().min(1, 'Enter captcha code'),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

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
  code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'PASSWORD_EXPIRED' | 'UNKNOWN';
  message: string;
}

export type { LoginEntryType };
