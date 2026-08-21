import { useMemo, useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { useAppConfig } from '../../../hooks/use-app-config';
import {
  parseStoredCalendarDate,
  parseStoredDateTimeToZone,
  toCalendarDateString,
  toUtcIsoString,
} from '../../../utils';
import { cn } from '../../../utils/cn';
import { AppDatePicker } from '../../ui/date-picker';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import { getA11yProps } from '../common/helper';
import type { FormDatePickerProps } from './types';

export function FormDatePicker<T extends FieldValues>({
  // Base Props
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

  // Logic Props
  disablePast,
  disableFuture,
  disabledDate,
  valueFormat = 'utc-date-time',

  // Feature Props
  presets,

  // Pass-through
  autoComplete,
  ...rest
}: FormDatePickerProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const { timezone } = useAppConfig();

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormDatePicker must be used within a FormProvider or passed a control prop.'
    );
  }

  const { field, fieldState } = useController({
    name,
    control,
  });

  const serializeValue =
    valueFormat === 'calendar-date' ? toCalendarDateString : toUtcIsoString;

  const fieldValue = useMemo(() => {
    if (!field.value) return null;
    if (Array.isArray(field.value)) {
      return field.value.map((v: string) =>
        valueFormat === 'calendar-date'
          ? parseStoredCalendarDate(v, timezone)
          : parseStoredDateTimeToZone(v, timezone)
      );
    }
    return valueFormat === 'calendar-date'
      ? parseStoredCalendarDate(field.value, timezone)
      : parseStoredDateTimeToZone(field.value, timezone);
  }, [field.value, timezone, valueFormat]);

  const finalPresets = useMemo(() => {
    if (presets) {
      return typeof presets === 'function' ? presets(timezone) : presets;
    }
    return undefined;
  }, [presets, timezone]);

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
      <AppDatePicker
        {...rest}
        {...getA11yProps({
          id,
          error: fieldState.error,
          required,
          autoComplete,
        })}
        value={fieldValue}
        onChange={(date) => {
          if (!date) {
            field.onChange(null);
            return;
          }

          if (Array.isArray(date)) {
            field.onChange(date.map((d) => serializeValue(d)));
          } else {
            field.onChange(serializeValue(date));
          }
        }}
        onOk={(date) => {
          if (!date) return;
          if (Array.isArray(date)) {
            field.onChange(date.map((d) => serializeValue(d)));
          } else {
            field.onChange(serializeValue(date));
          }
        }}
        onBlur={field.onBlur}
        disabled={field.disabled}
        status={fieldState.error ? 'error' : undefined}
        presets={finalPresets}
        disablePast={disablePast}
        disableFuture={disableFuture}
        disabledDate={disabledDate}
        className={cn('w-full', className)}
      />
    </FormFieldWrapper>
  );
}
