import type { InputNumberProps, InputProps } from 'antd';
import type { ReactNode } from 'react';
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { BaseControlledFieldProps } from '../common/types';

type BaseInputNumberProps = Omit<
  InputNumberProps,
  'value' | 'defaultValue' | 'onChange'
>;

export type NumericMode =
  | 'standard'
  | 'integer'
  | 'positive'
  | 'positive-integer';

export type NumberValueType = 'number' | 'string';

type NumberFeatureProps = {
  /**
   * Shortcuts for common number constraints.
   * - 'standard': Default AntD behavior (allows anything, validates on blur).
   * - 'integer': Allows 0-9 and '-' (at start).
   * - 'positive': Allows 0-9 and '.'.
   * - 'positive-integer': Allows 0-9 only.
   *
   * @default 'standard'
   */
  numericMode?: NumericMode;

  /**
   * If true, formats the value as the user types using react-number-format.
   * This provides better visual formatting but doesn't support step/precision props.
   *
   * If false, uses Ant Design's native InputNumber which supports step/precision
   * but has limited formatting capabilities.
   *
   * @default false
   */
  enableFormatting?: boolean;

  /**
   * If true, formats the value using the Global Config currency.
   * e.g. "$ 1,000.00" or "1.000,00 €"
   *
   * ⚠️ Only works when enableFormatting is true
   */
  isCurrency?: boolean;

  /**
   * Use locale-aware percentage formatting (e.g. 12.5%)
   * Stored value is still the raw number (12.5)
   *
   * ⚠️ Only works when enableFormatting is false (uses InputNumber)
   */
  isPercentage?: boolean;

  /**
   * Controls the stored RHF value shape when formatting is enabled.
   * - 'number': stores numeric values (default)
   * - 'string': stores unformatted numeric strings for precision-sensitive flows
   *
   * ⚠️ Only affects behavior when enableFormatting is true
   */
  valueType?: NumberValueType;

  allowClear?: boolean;
  onBlur?: InputProps['onBlur'];
};

// Props specific to formatted input (NumericInput)
type FormattedInputProps = {
  enableFormatting: true;
  allowLeadingZeros?: boolean;
  isCurrency?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  status?: InputProps['status'];
  prefix?: ReactNode;
  suffix?: ReactNode;
};

// Props specific to non-formatted input (InputNumber)
type NonFormattedInputProps = BaseInputNumberProps & {
  enableFormatting?: false;
  isPercentage?: boolean;
};

export type FormInputNumberProps<T extends FieldValues> =
  BaseControlledFieldProps<T> &
    NumberFeatureProps &
    (FormattedInputProps | NonFormattedInputProps);

/**
 * InputNumberField - Internal component that handles conditional rendering
 */
export type InputNumberFieldProps<T extends FieldValues> = NumberFeatureProps &
  (FormattedInputProps | NonFormattedInputProps) & {
    field: ControllerRenderProps<T, Path<T>>;
    error?: FieldError;
    required?: boolean;
    id?: string;
    autoComplete?: string;
  };

export interface NumberFormatterProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  numericMode?: NumericMode;
  valueType?: NumberValueType;
  allowLeadingZeros?: boolean;
  isCurrency?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  status?: InputProps['status'];
  prefix?: ReactNode;
  suffix?: ReactNode;
  onBlur?: InputProps['onBlur'];
}
