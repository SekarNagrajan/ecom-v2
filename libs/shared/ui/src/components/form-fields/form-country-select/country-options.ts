import type { SelectProps } from 'antd';
import {
  type CountryCode,
  getCountries,
  getCountryCallingCode,
} from 'libphonenumber-js/min';

export interface CountryMetadata {
  country: CountryCode;
  countryName: string;
  dialCode: string;
}

const REGION_NAMES = createRegionNames();

export const COUNTRY_METADATA: CountryMetadata[] = getCountries().map(
  (country) => {
    const dialCode = getCountryCallingCode(country);

    let countryName: string = country;
    if (REGION_NAMES) {
      try {
        countryName = REGION_NAMES.of(country) ?? country;
      } catch {
        countryName = country;
      }
    }

    return {
      country,
      countryName,
      dialCode,
    };
  }
);

export const COUNTRY_SELECT_OPTIONS: NonNullable<SelectProps['options']> =
  COUNTRY_METADATA.map(({ country, countryName, dialCode }) => ({
    label: countryName,
    value: countryName,
    searchLabel: `${countryName} ${country} +${dialCode}`,
  }));

export function resolveCountryCode(
  input: string | null | undefined
): CountryCode | undefined {
  const normalizedInput = input?.trim();

  if (!normalizedInput) {
    return undefined;
  }

  const upperInput = normalizedInput.toUpperCase();
  const byCode = COUNTRY_METADATA.find(({ country }) => country === upperInput);

  if (byCode) {
    return byCode.country;
  }

  const lowerInput = normalizedInput.toLowerCase();
  const byName = COUNTRY_METADATA.find(
    ({ countryName }) => countryName.toLowerCase() === lowerInput
  );

  return byName?.country;
}

export function normalizeCountryName(input: string | null | undefined): string {
  const countryCode = resolveCountryCode(input);

  if (!countryCode) {
    return input?.trim() ?? '';
  }

  return (
    COUNTRY_METADATA.find(({ country }) => country === countryCode)
      ?.countryName ??
    input?.trim() ??
    ''
  );
}

function createRegionNames() {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    return undefined;
  }
}
