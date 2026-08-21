// Modified by sekar nagarajan (2026-08-21)
import { z } from 'zod';

/**
 * Contact-Us form schema — mirrors the legacy jQuery `.validate()` rules
 * from ContactUs.jsp.
 *
 * Guest mode: all fields required.
 * Authenticated mode: only subject + message required (profile fields pre-filled).
 */
export const contactUsSchema = z.object({
  /** Contact name (guest: required, max 100) */
  name: z.string().max(100, 'Name must be 100 characters or less'),
  /** Company name (guest: required, max 50) */
  companyName: z.string().max(50, 'Company name must be 50 characters or less'),
  /** Country code e.g. "SG" */
  country: z.string(),
  /** State (optional, hidden via feature flag in some carriers) */
  state: z.string().optional(),
  /** City (required for guest) */
  city: z.string().max(150, 'City must be 150 characters or less'),
  /** Phone number (conditionally required via carrier config) */
  phone: z.string().max(15, 'Phone must be 15 characters or less').optional(),
  /** Mobile number (conditionally required via carrier config) */
  mobile: z.string().max(11, 'Mobile must be 11 characters or less').optional(),
  /** Email (required for guest, must be valid) */
  email: z.string().email('Invalid email address').max(300, 'Email must be 300 characters or less'),
  /** Subject line — always required */
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject must be 100 characters or less'),
  /** Message body — always required */
  message: z.string().min(1, 'Message is required').max(5000, 'Message must be 5000 characters or less'),
});

export type ContactUsFormData = z.infer<typeof contactUsSchema>;

/**
 * Guest-mode schema — all fields mandatory (mirrors legacy jQuery rules
 * when `hiddenusername == null`).
 */
export const contactUsGuestSchema = contactUsSchema.extend({
  name: z.string().min(1, 'Name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(50),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required').max(150),
  email: z.string().min(1, 'Email is required').email('Invalid email address').max(300),
});
