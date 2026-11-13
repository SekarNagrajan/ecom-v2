import type { TFunction } from "i18next";
import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

export const PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE =
  "phone_missing_country_code";
export const PHONE_INVALID_ISSUE_CODE = "phone_invalid";

type PhoneTranslateFn = TFunction<"import-workbench"> | ((key: string) => string);

export function normalizePhoneImportCandidate(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  return trimmedValue.startsWith("00")
    ? `+${trimmedValue.slice(2)}`
    : trimmedValue;
}

export function normalizeImportedPhoneValue(value: unknown) {
  const normalizedValue = normalizePhoneImportCandidate(String(value ?? ""));

  if (!normalizedValue) {
    return "";
  }

  const phone = parsePhoneNumberFromString(normalizedValue);

  if (!phone?.isPossible() || !phone.isValid()) {
    return normalizedValue;
  }

  return phone.number;
}

export function applyPhoneCountryCode(
  value: string,
  countryCode: CountryCode,
): string | null {
  const normalizedValue = normalizePhoneImportCandidate(value);

  if (!normalizedValue || normalizedValue.startsWith("+")) {
    return null;
  }

  const phone = parsePhoneNumberFromString(normalizedValue, countryCode);

  if (!phone?.isPossible() || !phone.isValid()) {
    return null;
  }

  return phone.number;
}

export function getPhoneImportValidationIssue(
  value: string,
  options: {
    required: boolean;
    t: PhoneTranslateFn;
  },
) {
  const { t } = options;
  const normalizedValue = normalizePhoneImportCandidate(value);

  if (!normalizedValue) {
    return options.required
      ? {
          message: t("phone.required"),
        }
      : null;
  }

  if (!normalizedValue.startsWith("+")) {
    if (normalizedValue.replace(/\D/g, "").length === 0) {
      return {
        code: PHONE_INVALID_ISSUE_CODE,
        message: t("phone.invalid"),
      };
    }

    return {
      code: PHONE_MISSING_COUNTRY_CODE_ISSUE_CODE,
      message: t("phone.countryCodeRequired"),
    };
  }

  const phone = parsePhoneNumberFromString(normalizedValue);

  if (!phone?.isPossible() || !phone.isValid()) {
    return {
      code: PHONE_INVALID_ISSUE_CODE,
      message: t("phone.invalid"),
    };
  }

  return null;
}
