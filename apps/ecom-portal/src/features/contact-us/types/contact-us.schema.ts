// Modified by Sekar Nagarajan (2026-08-25 16:25)
import type { TFunction } from "i18next";
import { z } from "zod";

/**
 * Contact-Us form schema — mirrors the legacy jQuery `.validate()` rules
 * from ContactUs.jsp.
 *
 * Guest mode: all fields required.
 * Authenticated mode: only subject + message required (profile fields pre-filled).
 */
export function createContactUsSchema(t: TFunction) {
  return z.object({
    /** Contact name (guest: required, max 100) */
    name: z.string().max(100, t("validation.nameMax")),
    /** Company name (guest: required, max 50) */
    companyName: z.string().max(50, t("validation.companyNameMax")),
    /** Country code e.g. "SG" */
    country: z.string(),
    /** State (optional, hidden via feature flag in some carriers) */
    state: z.string().optional(),
    /** City (required for guest) */
    city: z.string().max(150, t("validation.cityMax")),
    /** Phone number (conditionally required via carrier config) */
    phone: z
      .string()
      .max(15, t("validation.phoneMax"))
      .optional(),
    /** Mobile number (conditionally required via carrier config) */
    mobile: z
      .string()
      .max(11, t("validation.mobileMax"))
      .optional(),
    /** Email (required for guest, must be valid) */
    email: z
      .string()
      .email(t("validation.emailInvalid"))
      .max(300, t("validation.emailMax")),
    /** Subject line — always required */
    subject: z
      .string()
      .min(1, t("validation.subjectRequired"))
      .max(100, t("validation.subjectMax")),
    /** Message body — always required */
    message: z
      .string()
      .min(1, t("validation.messageRequired"))
      .max(5000, t("validation.messageMax")),
  });
}

export function createContactUsGuestSchema(t: TFunction) {
  return createContactUsSchema(t).extend({
    name: z
      .string()
      .min(1, t("validation.nameRequired"))
      .max(100, t("validation.nameMax")),
    companyName: z
      .string()
      .min(1, t("validation.companyNameRequired"))
      .max(50, t("validation.companyNameMax")),
    country: z.string().min(1, t("validation.countryRequired")),
    city: z
      .string()
      .min(1, t("validation.cityRequired"))
      .max(150, t("validation.cityMax")),
    email: z
      .string()
      .min(1, t("validation.emailRequired"))
      .email(t("validation.emailInvalid"))
      .max(300, t("validation.emailMax")),
  });
}

/** English-message schemas for non-UI callers (same rules as factories). */
const enValidationT = ((key: string) => {
  const messages: Record<string, string> = {
    "validation.nameRequired": "Name is required",
    "validation.nameMax": "Name must be 100 characters or less",
    "validation.companyNameRequired": "Company name is required",
    "validation.companyNameMax": "Company name must be 50 characters or less",
    "validation.countryRequired": "Country is required",
    "validation.cityRequired": "City is required",
    "validation.cityMax": "City must be 150 characters or less",
    "validation.phoneMax": "Phone must be 15 characters or less",
    "validation.mobileMax": "Mobile must be 11 characters or less",
    "validation.emailRequired": "Email is required",
    "validation.emailInvalid": "Invalid email address",
    "validation.emailMax": "Email must be 300 characters or less",
    "validation.subjectRequired": "Subject is required",
    "validation.subjectMax": "Subject must be 100 characters or less",
    "validation.messageRequired": "Message is required",
    "validation.messageMax": "Message must be 5000 characters or less",
  };
  return messages[key] ?? key;
}) as TFunction;

export const contactUsSchema = createContactUsSchema(enValidationT);
export const contactUsGuestSchema = createContactUsGuestSchema(enValidationT);

export type ContactUsFormData = z.infer<typeof contactUsSchema>;
