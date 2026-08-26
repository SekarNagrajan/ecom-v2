// Modified by Sekar Nagarajan (2026-08-25 16:15)
import { z } from "zod";

export const RegistrationSchema = z
  .object({
    // Step 1: Company Info
    customerType: z.enum(["EXISTING", "NEW"]),
    customerCode: z.string().optional(),
    companyName: z.string().min(1, "Company Name is required"),
    country: z.string().min(1, "Country is required"),
    location: z.string().min(1, "Location is required"),
    address1: z.string().min(1, "Address Line 1 is required"),
    address2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().optional(),

    // Phone numbers
    companyPhoneCountryCode: z.string().optional(),
    companyPhoneNo: z.string().optional(),
    companyMobileCode: z.string().optional(),
    companyMobileNo: z.string().optional(),

    taxId: z.string().optional(),
    recentBL: z.string().optional(),
    companyDomain: z.string().optional(),

    // Step 2: User Info
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    title: z.string().min(1, "Title is required"),

    userPhoneCode: z.string().optional(),
    userPhoneNo: z.string().optional(),
    userMobileCode: z.string().optional(),
    userMobileNo: z.string().optional(),
    userFaxCode: z.string().optional(),
    userFaxNo: z.string().optional(),

    timezone: z.string().min(1, "Timezone is required"),
    defaultView: z.string().optional(),
    preferredView: z.string().optional(),

    // Step 3: KYC Upload — File or Ant UploadFile-like object
    kycFile: z.unknown().optional(),

    // Step 4: Terms
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      const hasPhone = data.companyPhoneCountryCode && data.companyPhoneNo;
      const hasMobile = data.companyMobileCode && data.companyMobileNo;
      return Boolean(hasPhone || hasMobile);
    },
    {
      message: "Either Company Phone or Company Mobile is required",
      path: ["companyPhoneNo"],
    }
  );

export type RegistrationFormData = z.infer<typeof RegistrationSchema>;

export interface AddressLookupResult {
  companyName: string;
  city: string;
  country: string;
  address1: string;
}

export interface CustomerCodeCheckResult {
  valid: boolean;
  companyName?: string;
  country?: string;
  address1?: string;
  city?: string;
}

export interface EmailCheckResult {
  available: boolean;
}

export interface RegistrationSubmitResult {
  success: boolean;
  message: string;
}
