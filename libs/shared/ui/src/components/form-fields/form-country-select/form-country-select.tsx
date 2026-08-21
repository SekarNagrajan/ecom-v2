import { GlobalOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { type FieldValues, useFormContext, useWatch } from 'react-hook-form';

import { FormSelect } from '../form-select';
import type { FormSelectProps } from '../form-select/types';
import { CountryFlag } from './country-flag';
import { COUNTRY_METADATA, resolveCountryCode } from './country-options';

export type FormCountrySelectProps<T extends FieldValues> = Omit<
  FormSelectProps<T>,
  'options'
>;

export function FormCountrySelect<T extends FieldValues>({
  control: propsControl,
  name,
  placeholder = 'Select country',
  ...props
}: FormCountrySelectProps<T>) {
  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;
  const value = useWatch({
    control,
    name,
  });
  const countryCode =
    typeof value === 'string' ? resolveCountryCode(value) : undefined;

  const selectedPrefix = countryCode ? (
    <Flex align="center">
      <CountryFlag countryCode={countryCode} width={16} />
    </Flex>
  ) : (
    <GlobalOutlined />
  );

  return (
    <FormSelect<T>
      {...props}
      control={propsControl}
      name={name}
      options={COUNTRY_METADATA.map(({ country, countryName, dialCode }) => ({
        label: countryName,
        value: countryName,
        country,
        countryName,
        dialCode,
        searchLabel: `${countryName} ${country} +${dialCode}`,
      }))}
      optionRender={(option) => {
        const countryCode = String(option.data.country ?? '');
        const countryName = String(option.data.countryName ?? option.label);

        return (
          <Flex align="center" gap={8}>
            <CountryFlag countryCode={countryCode} />
            <span>{countryName}</span>
          </Flex>
        );
      }}
      placeholder={placeholder}
      prefix={selectedPrefix}
      showSearch={{ optionFilterProp: 'searchLabel' }}
    />
  );
}
