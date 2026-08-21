import { InputNumber, type InputNumberProps } from 'antd';
import { useMemo } from 'react';
import type { FieldValues } from 'react-hook-form';

import { cn } from '../../../utils/cn';
import { getA11yProps } from '../common/helper';
import { NumberFormatter } from './number-formatter';
import type { InputNumberFieldProps } from './types';

export const InputNumberField = <T extends FieldValues>({
  field,
  className,
  numericMode = 'standard',
  enableFormatting = false,
  valueType = 'number',
  isPercentage,
  id,
  error,
  required,
  autoComplete,
  prefix,
  onBlur,
  ...rest
}: InputNumberFieldProps<T>) => {
  const a11yProps = getA11yProps({ id, error, required, autoComplete });

  // Apply numeric mode constraints
  const inputProps = useMemo(() => {
    const props: Partial<InputNumberProps> = {};

    switch (numericMode) {
      case 'integer':
        props.precision = 0;
        break;
      case 'positive':
        props.min = 0;
        break;
      case 'positive-integer':
        props.min = 0;
        props.precision = 0;
        break;
      // 'standard' - no constraints
    }

    if (isPercentage) {
      props.min = 0;
      props.max = 100;
    }

    return props;
  }, [isPercentage, numericMode]);

  // Determine suffix for percentage
  const suffix = useMemo(() => {
    if (rest.suffix !== undefined) return rest.suffix;
    if (isPercentage) return '%';
    return undefined;
  }, [isPercentage, rest.suffix]);

  // Default InputNumber not working well with dynamic local change for formatting
  if (enableFormatting) {
    return (
      <NumberFormatter
        {...rest}
        {...a11yProps}
        className={className}
        field={field}
        numericMode={numericMode}
        valueType={valueType}
        prefix={prefix}
      />
    );
  }

  const handleBlur: InputNumberProps['onBlur'] = (event) => {
    field.onBlur();
    onBlur?.(event);
  };

  return (
    <InputNumber
      style={{ width: '100%' }}
      {...rest}
      {...inputProps}
      {...field}
      {...a11yProps}
      className={cn('w-full', className)}
      prefix={prefix}
      suffix={suffix}
      onBlur={handleBlur}
    />
  );
};
