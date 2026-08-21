import {
  AsYouType,
  getCountryCallingCode,
  type CountryCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js/min';

export const MAX_E164_PHONE_DIGITS = 15;
export const MAX_PHONE_INPUT_DIGITS = 15;
export const DEFAULT_PHONE_INPUT_COUNTRY: CountryCode = 'US';

export const getCountryFromValue = (val: string): CountryCode | undefined => {
  if (!val) return undefined;
  const phoneNumber = parsePhoneNumberFromString(val);
  return phoneNumber?.country;
};

export const formatToNational = (val: string, country: CountryCode): string => {
  if (!val) return '';

  const phoneNumber = parsePhoneNumberFromString(val);
  if (!phoneNumber || phoneNumber.country !== country) return '';

  // 👇 this is the important change
  return phoneNumber.formatNational();
};

export const parseFromDigits = (digits: string, country: CountryCode) => {
  const asYouType = new AsYouType(country);
  asYouType.input(digits);
  const number = asYouType.getNumber();
  const e164Candidate =
    asYouType.getNumberValue() ?? `+${getCountryCallingCode(country)}${digits}`;

  return {
    e164: digits ? e164Candidate : '',
    isValid: number?.isValid() ?? false,
    isPossible: number?.isPossible() ?? false,
  };
};

export const formatDigits = (digits: string, country: CountryCode) => {
  const asYouType = new AsYouType(country);
  return asYouType.input(digits);
};

export function toPhoneInputState(
  value: string | null | undefined,
  options?: {
    emptyValueCountry?: CountryCode;
    fallbackCountry?: CountryCode;
  }
) {
  const normalizedValue = value?.trim() ?? '';
  const resolvedCountry =
    options?.emptyValueCountry ??
    options?.fallbackCountry ??
    DEFAULT_PHONE_INPUT_COUNTRY;

  if (!normalizedValue) {
    return {
      country: resolvedCountry,
      digits: '',
    };
  }

  const parsed = parsePhoneNumberFromString(normalizedValue);

  if (parsed) {
    return {
      country: parsed.country ?? resolvedCountry,
      digits: parsed.nationalNumber,
    };
  }

  const normalizedDigits = normalizedValue.replace(/\D/g, '');
  const countryCallingCode = getCountryCallingCode(resolvedCountry);
  const digits =
    normalizedValue.startsWith('+') &&
    normalizedDigits.startsWith(countryCallingCode)
      ? normalizedDigits.slice(countryCallingCode.length)
      : normalizedDigits;

  return {
    country: resolvedCountry,
    digits,
  };
}
