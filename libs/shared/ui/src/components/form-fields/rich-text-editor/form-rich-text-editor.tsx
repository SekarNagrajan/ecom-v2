import {
  useController,
  useFormContext,
  type FieldValues,
} from 'react-hook-form';

import { RichTextEditor } from '../../ui/rich-text-editor';
import { FormFieldWrapper } from '../common/form-field-wrapper';
import type { FormRichTextEditorProps } from './types';

export function FormRichTextEditor<T extends FieldValues>({
  name,
  control: propsControl,
  label,
  tooltip,
  required,
  hasFeedback,
  wrapperClassName,
  formItemProps,
  id,
  ...rest
}: FormRichTextEditorProps<T>) {
  const formContext = useFormContext<T>();
  const control = propsControl || formContext?.control;

  if (!control) {
    throw new Error(
      'FormRichTextEditor must be used within a FormProvider or passed a control prop.'
    );
  }

  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <FormFieldWrapper
      id={id || name}
      label={label}
      tooltip={tooltip}
      required={required}
      error={fieldState.error}
      isValidating={fieldState.isValidating}
      hasFeedback={hasFeedback}
      className={wrapperClassName}
      itemProps={formItemProps}
    >
      <RichTextEditor
        {...rest}
        value={field.value}
        onChange={field.onChange}
        autoComplete="off"
      />
    </FormFieldWrapper>
  );
}
