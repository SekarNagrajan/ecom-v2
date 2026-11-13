// Modified by Sekar Nagarajan (2026-09-10 21:29)
import type { TFunction } from "i18next";
import { z } from "zod";

export function createRegistrationSchema(t: TFunction<"registration">) {
  return z
    .object({
      // Step 1: Company Info
      customerType: z.enum(["EXISTING", "NEW"]),
      customerCode: z.string().optional(),
      companyName: z.string().min(1, t("validation.companyNameRequired")),
      country: z.string().min(1, t("validation.countryRequired")),
      location: z.string().min(1, t("validation.locationRequired")),
      address1: z.string().min(1, t("validation.address1Required")),
      address2: z.string().optional(),
      city: z.string().min(1, t("validation.cityRequired")),
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
      email: z
        .string()
        .min(1, t("validation.emailRequired"))
        .email(t("validation.emailInvalid")),
      password: z.string().min(8, t("validation.passwordMin")),
      confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
      firstName: z.string().min(1, t("validation.firstNameRequired")),
      lastName: z.string().min(1, t("validation.lastNameRequired")),
      title: z.string().min(1, t("validation.titleRequired")),

      userPhoneCode: z.string().optional(),
      userPhoneNo: z.string().optional(),
      userMobileCode: z.string().optional(),
      userMobileNo: z.string().optional(),
      userFaxCode: z.string().optional(),
      userFaxNo: z.string().optional(),

      timezone: z.string().min(1, t("validation.timezoneRequired")),
      defaultView: z.string().optional(),
      preferredView: z.string().optional(),

      // Step 3: KYC Upload — File or Ant UploadFile-like object
      kycFile: z.unknown().optional(),

      // Step 4: Terms
      agreeToTerms: z.boolean().refine((val) => val === true, {
        message: t("validation.agreeToTerms"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.passwordsMismatch"),
      path: ["confirmPassword"],
    })
    .refine(
      (data) => {
        if (data.customerType !== "EXISTING") return true;
        return Boolean(data.customerCode?.trim());
      },
      {
        message: t("validation.customerCodeRequired"),
        path: ["customerCode"],
      },
    )
    .refine(
      (data) => {
        const hasPhone = data.companyPhoneCountryCode && data.companyPhoneNo;
        const hasMobile = data.companyMobileCode && data.companyMobileNo;
        return Boolean(hasPhone || hasMobile);
      },
      {
        message: t("validation.companyPhoneOrMobileRequired"),
        path: ["companyPhoneNo"],
      },
    );
}

export type RegistrationFormData = z.infer<
  ReturnType<typeof createRegistrationSchema>
>;

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
