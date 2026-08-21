import { Flex } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';

import { COUNTRY_METADATA } from '../form-country-select';
import { CountryFlag } from '../form-country-select/country-flag';

const FLAG_WIDTH = 20;

const COUNTRY_OPTIONS_BASE = COUNTRY_METADATA.map(
  ({ country, countryName, dialCode }) => ({
    country,
    countryName,
    dialCode,
    searchLabel: `${countryName} +${dialCode}`,
    triggerLabel: `${country} +${dialCode}`,
  })
);

export function buildCountrySelectOptions(
  tertiaryTextColor: string
): DefaultOptionType[] {
  return COUNTRY_OPTIONS_BASE.map(
    ({ country, countryName, dialCode, searchLabel, triggerLabel }) => ({
      value: country,
      label: (
        <Flex align="center" justify="space-between">
          <Flex gap={8}>
            <CountryFlag countryCode={country} width={FLAG_WIDTH} />
            <span>{countryName}</span>
          </Flex>
          <span style={{ color: tertiaryTextColor }}>+{dialCode}</span>
        </Flex>
      ),
      searchLabel,
      triggerLabel,
      dialCode,
    })
  );
}
