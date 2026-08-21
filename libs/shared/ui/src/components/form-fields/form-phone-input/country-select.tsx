import { Flex, theme } from 'antd';
import { type CountryCode, getCountryCallingCode } from 'libphonenumber-js/min';

import { AppCombobox, type ComboboxTriggerProps } from '../../ui/combobox';
import { CountryFlag } from '../form-country-select/country-flag';
import { buildCountrySelectOptions } from './country-select-options';

interface CountrySelectProps {
  value: CountryCode;
  onChange: (value: CountryCode) => void;
  disabled?: boolean;
}

const SELECTED_FLAG_WIDTH = 16;
export function CountrySelect({
  value,
  onChange,
  disabled,
}: CountrySelectProps) {
  const { token } = theme.useToken();
  const allCountries = buildCountrySelectOptions(token.colorTextTertiary);

  const handleChange = (val: string | number | null) => {
    if (val) onChange(val as CountryCode);
  };

  const renderTrigger = (props: ComboboxTriggerProps) => (
    <button
      ref={props.ref}
      type="button"
      disabled={props.disabled}
      style={{
        all: 'unset',
        boxSizing: 'border-box',
        height: '100%',
        minHeight: '100%',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        minWidth: 0,
        color: disabled ? token.colorTextDisabled : token.colorText,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <Flex align="center" gap={token.paddingXXS}>
        <CountryFlag countryCode={value} width={SELECTED_FLAG_WIDTH} />
        <span>+{getCountryCallingCode(value)}</span>
      </Flex>
    </button>
  );

  return (
    <AppCombobox
      value={value}
      onChange={handleChange}
      options={allCountries}
      placeholder="Search Country"
      renderTrigger={renderTrigger}
      selectProps={{
        showSearch: {
          optionFilterProp: 'searchLabel',
        },
      }}
      popoverProps={{
        styles: {
          container: {
            padding: 0,
            minWidth: 320,
          },
        },
      }}
      disabled={disabled}
    />
  );
}
