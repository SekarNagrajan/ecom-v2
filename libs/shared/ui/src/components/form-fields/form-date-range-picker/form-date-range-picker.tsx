import { useMemo, useId, useCallback } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { type AntdLuxonDateRangePickerProps } from '../../../base/antd-luxon-date-range-picker';
import { useAppConfig } from '../../../hooks/use-app-config';
import { parseStoredDateTimeToZone, toUtcIsoString } from '../../../utils';
import { AppDateRangePicker } from '../../ui/date-range-picker';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import { getA11yProps } from '../common/helper';
import type {
  FormDateRangePickerProps,
  DateRangePickerValueType,
} from './types';

export function FormDateRangePicker<T extends FieldValues>({
  // Base
  name,
  control: propsControl,
  label,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  className,
  id: propsId,

  // Logic props (passed to AppDateRangePicker)
  disablePast,
  disableFuture,
  minimumGap,
  disabledDate,
  disabledTime,

  // AntD / Custom Logic Pass-through
  autoComplete,

  // Pass-through
  ...rest
}: FormDateRangePickerProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const { timezone } = useAppConfig();

  // Resolve RHF control
  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormDateRangePicker must be used within a FormProvider or passed a control prop.'
    );
  }

  const { field, fieldState } = useController({
    name,
    control,
  });

  const { value, onChange } = field;

  /**
   * Value conversion (ISO -> DateTime)
   */
  const pickerValue = useMemo<DateRangePickerValueType | null>(() => {
    if (!Array.isArray(value) || value.length !== 2) return null;

    return value.map((iso: unknown) => {
      if (typeof iso !== 'string') return null;

      const date = parseStoredDateTimeToZone(iso, timezone);

      return date.isValid ? date : null;
    });
  }, [value, timezone]);

  /**
   * Change handling (DateTime -> ISO)
   */
  const handleChange = useCallback<
    NonNullable<AntdLuxonDateRangePickerProps['onChange']>
  >(
    (dates) => {
      if (!dates) {
        onChange([null, null]);
        return;
      }

      const [start, end] = dates;

      onChange([
        // Convert the UI time back to UTC before storing
        toUtcIsoString(start),
        toUtcIsoString(end),
      ]);
    },
    [onChange]
  );

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      tooltip={tooltip}
      required={required}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      itemProps={formItemProps}
    >
      <AppDateRangePicker
        {...rest}
        {...getA11yProps({
          id,
          error: fieldState.error,
          required,
          autoComplete,
        })}
        id={id}
        value={pickerValue}
        onChange={handleChange}
        disablePast={disablePast}
        disableFuture={disableFuture}
        minimumGap={minimumGap}
        disabledDate={disabledDate}
        disabledTime={disabledTime}
        className={className}
      />
    </FormFieldWrapper>
  );
}
