import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { AppSegmented } from '../../ui/segmented';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import type { FormSegmentedProps } from './types';

export function FormSegmented<T extends FieldValues>({
  // Base Props
  name,
  control: propsControl,
  label,
  labelIcon,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  id: propsId,

  // Segmented Props
  size: propsSize,
  options,
  ...rest
}: FormSegmentedProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormSegmented must be used within a FormProvider or passed a control prop.'
    );
  }

  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      labelIcon={labelIcon}
      required={required}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      itemProps={formItemProps}
      tooltip={tooltip}
    >
      <AppSegmented
        {...rest}
        id={id}
        value={field.value}
        onChange={field.onChange}
        options={options}
      />
    </FormFieldWrapper>
  );
}
