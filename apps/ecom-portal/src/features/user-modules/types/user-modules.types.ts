// Modified by Antigravity (2026-08-21)
import { z } from 'zod';

// ==========================================
// 1. Profile Types
// ==========================================
export const customerProfileSchema = z.object({
  loginName: z.string(),
  customerCode: z.string(),
  companyName: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phoneCode: z.string().default('+1'),
  phoneNo: z.string().min(5, 'Phone number is required'),
  mobileCode: z.string().default('+1'),
  mobileNo: z.string().optional(),
  taxId: z.string().optional(),
  country: z.string(),
  city: z.string().optional(),
  address: z.string().optional(),
  defLanguage: z.string().default('en'),
  prefTimeZone: z.string().default('UTC-5 (EST)'),
});

export type CustomerProfile = z.infer<typeof customerProfileSchema>;

// ==========================================
// 2. Change Password Schema
// ==========================================
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;

// ==========================================
// 3. Quote / Rate Request Types
// ==========================================
export interface QuoteItem {
  id: string;
  quoteNo: string;
  polCode: string;
  polName: string;
  podCode: string;
  podName: string;
  equipmentType: string;
  commodity: string;
  validFrom: string;
  validTo: string;
  oceanFreightUSD: number;
  thcUSD: number;
  totalAmountUSD: number;
  status: 'QUOTED' | 'PENDING_REVIEW' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
}

export const createQuoteRequestSchema = z.object({
  polPort: z.string().min(1, 'Origin port is required'),
  podPort: z.string().min(1, 'Destination port is required'),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  commodity: z.string().min(1, 'Commodity is required'),
  targetDate: z.string().min(1, 'Target departure date is required'),
  remarks: z.string().optional(),
});

export type CreateQuoteRequestPayload = z.infer<typeof createQuoteRequestSchema>;

// ==========================================
// 4. Alert Preferences Types
// ==========================================
export interface AlertPreference {
  bookingUpdates: boolean;
  siConfirmation: boolean;
  blRelease: boolean;
  scheduleDelays: boolean;
  paymentInvoices: boolean;
  channelEmail: boolean;
  channelSms: boolean;
  channelPortal: boolean;
}

export interface AlertHistoryLog {
  id: string;
  category: 'BOOKING' | 'SI' | 'BL' | 'SCHEDULE' | 'PAYMENT';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  referenceNo: string;
}

// ==========================================
// 5. Payment History Types
// ==========================================
export interface PaymentHistoryRecord {
  id: string;
  paymentRefNo: string;
  invoiceNo: string;
  blNumber: string;
  gateway: 'STRIPE' | 'NGENIUS' | 'BANK_TRANSFER';
  amount: number;
  currency: string;
  paymentDate: string;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REFUNDED';
  payerName: string;
  receiptUrl?: string;
}
