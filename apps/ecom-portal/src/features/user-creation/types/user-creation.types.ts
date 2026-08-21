// Modified by sekar nagarajan (2026-08-21)
import { z } from 'zod';

export const subUserSchema = z.object({
  id: z.string(),
  loginName: z.string().min(3, 'Login name must be at least 3 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  companyName: z.string(),
  custCountryCode: z.string().default('+1'),
  custPhoneCode: z.string().default('212'),
  custPhoneNo: z.string(),
  mobileCode: z.string().default('+1'),
  mobileNo: z.string().optional(),
  defLanguage: z.string().default('en'),
  prefLanguage: z.string().default('en'),
  isActive: z.boolean().default(true),
  createdDate: z.string(),
  allowedModules: z.array(z.string()).default([]),
});

export type SubUser = z.infer<typeof subUserSchema>;

export const createSubUserSchema = z.object({
  loginName: z.string().min(3, 'Login name must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  companyName: z.string().min(1, 'Company name is required'),
  custCountryCode: z.string().default('+1'),
  custPhoneCode: z.string().default('212'),
  custPhoneNo: z.string().min(5, 'Phone number is required'),
  mobileCode: z.string().default('+1'),
  mobileNo: z.string().optional(),
  defLanguage: z.string().default('en'),
  prefLanguage: z.string().default('en'),
  allowedModules: z.array(z.string()).default(['SCH', 'TRK', 'BKG', 'SI']),
});

export type CreateSubUserPayload = z.infer<typeof createSubUserSchema>;

export interface UserLimitResponse {
  allowedUserLimit: number;
  currentlyAllocated: number;
  remainingSlots: number;
  limitReached: boolean;
}
