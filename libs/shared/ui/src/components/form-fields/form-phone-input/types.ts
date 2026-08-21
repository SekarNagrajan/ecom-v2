// types.ts
import type { InputProps } from 'antd';
import type { CountryCode } from 'libphonenumber-js/min';
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { BaseControlledFieldProps } from '../common/types';

/**
 * 1. Base Props
 * We extend Ant Design's native InputProps because our component renders an <Input>.
 */
type BasePhoneInputProps = Omit<
  InputProps,
  // RHF handles these
  | 'value'
  | 'onChange'
  | 'onBlur'
  // We handle the Country Select internally using 'prefix', so we block these to prevent conflicts
  | 'prefix'
  | 'addonBefore' // User requested to avoid this (deprecated/legacy pattern)
  | 'addonAfter'
>;

type PhoneInputCountryProps = {
  emptyValueCountry?: CountryCode;
};

/**
 * 3. Public Form Component Props
 * Used by <FormPhoneInput />
 */
export type FormPhoneInputProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & BasePhoneInputProps & PhoneInputCountryProps;

/**
 * 4. Internal Field Component Props
 * Used by <PhoneInputField />
 */
export type PhoneInputFieldProps<T extends FieldValues> = BasePhoneInputProps &
  PhoneInputCountryProps & {
    field: ControllerRenderProps<T, Path<T>>;
    error?: FieldError;
    required?: boolean;
  };
