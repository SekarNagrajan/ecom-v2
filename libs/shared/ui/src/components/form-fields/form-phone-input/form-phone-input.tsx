import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { FormFieldWrapper } from '../common/form-field-wrapper';
import { PhoneInputField } from './phone-input-field';
import type { FormPhoneInputProps } from './types';

export function FormPhoneInput<T extends FieldValues>({
  name,
  control: propsControl,
  label,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  id: propsId,
  ...rest
}: FormPhoneInputProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormPhoneInput must be used within a FormProvider or passed a control prop.'
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
      tooltip={tooltip}
      required={required}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      itemProps={formItemProps}
    >
      <PhoneInputField
        {...rest}
        id={id}
        field={field}
        error={fieldState.error}
        required={required}
      />
    </FormFieldWrapper>
  );
}
