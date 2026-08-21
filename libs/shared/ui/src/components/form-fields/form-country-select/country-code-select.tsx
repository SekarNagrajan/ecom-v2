import { GlobalOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import type { CSSProperties } from 'react';

import { AppSelect } from '../../ui/select';
import { CountryFlag } from './country-flag';
import { COUNTRY_METADATA, resolveCountryCode } from './country-options';

interface CountryCodeSelectProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  value?: string;
}

export function CountryCodeSelect({
  disabled = false,
  onChange,
  placeholder = 'Select country',
  style,
  value,
}: CountryCodeSelectProps) {
  const selectedCountryCode = resolveCountryCode(value);
  const selectedPrefix = selectedCountryCode ? (
    <Flex align="center">
      <CountryFlag countryCode={selectedCountryCode} width={16} />
    </Flex>
  ) : (
    <GlobalOutlined />
  );

  const handleChange = (nextValue: unknown) => {
    if (typeof nextValue === 'string') {
      onChange(nextValue);
    }
  };

  return (
    <AppSelect
      value={selectedCountryCode}
      options={COUNTRY_METADATA.map(({ country, countryName, dialCode }) => ({
        label: countryName,
        value: country,
        country,
        countryName,
        dialCode,
        searchLabel: `${countryName} ${country} +${dialCode}`,
      }))}
      optionRender={(option) => {
        const countryCode = String(option.data.country ?? '');
        const countryName = String(option.data.countryName ?? option.label);
        const dialCode = String(option.data.dialCode ?? '');

        return (
          <Flex align="center" justify="space-between" gap={8}>
            <Flex align="center" gap={8}>
              <CountryFlag countryCode={countryCode} />
              <span>{countryName}</span>
            </Flex>
            <span style={{ opacity: 0.72 }}>{`+${dialCode}`}</span>
          </Flex>
        );
      }}
      placeholder={placeholder}
      prefix={selectedPrefix}
      showSearch={{ optionFilterProp: 'searchLabel' }}
      onChange={handleChange}
      disabled={disabled}
      style={style}
    />
  );
}
