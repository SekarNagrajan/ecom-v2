import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { FormFieldWrapper } from '../common/form-field-wrapper';
import { InputField } from './input-field';
import type { FormInputProps } from './types';

export function FormInput<T extends FieldValues>({
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

  ...rest
}: FormInputProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormInput must be used within a FormProvider or passed a control prop.'
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
      tooltip={tooltip}
      required={required}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      itemProps={formItemProps}
    >
      <InputField
        {...rest}
        id={id}
        field={field}
        error={fieldState.error}
        required={required}
      />
    </FormFieldWrapper>
  );
}
