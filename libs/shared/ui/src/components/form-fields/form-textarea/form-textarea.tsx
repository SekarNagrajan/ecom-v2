import { useId } from 'react';
import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { FormFieldWrapper } from '../common/form-field-wrapper';
import { TextareaField } from './textarea-field';
import type { FormTextareaProps } from './types';

/**
 * React Hook Form wrapper around `AppTextarea`. Mirrors the prop surface of
 * `FormInput` (label / tooltip / required / formItemProps) and forwards
 * everything else — including the optional `audioDictation` opt-in — to the
 * underlying textarea.
 */
export function FormTextarea<T extends FieldValues>({
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
}: FormTextareaProps<T>) {
  const generatedId = useId();
  const id = propsId || generatedId;

  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormTextarea must be used within a FormProvider or passed a control prop.'
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
      <TextareaField
        {...rest}
        id={id}
        field={field}
        error={fieldState.error}
        required={required}
      />
    </FormFieldWrapper>
  );
}
