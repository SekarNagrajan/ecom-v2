// Modified by sekar nagarajan (2026-08-21)
import type { UserProfile } from '@solverminds/auth';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Login form schema — parity with JSP jQuery Validate + sha256 encryption
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
// Forgot password form schema
// ---------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
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

export interface AuthErrorResponse {
  code: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'PASSWORD_EXPIRED' | 'UNKNOWN';
  message: string;
}
