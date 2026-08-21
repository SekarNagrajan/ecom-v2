import { zodResolver } from '@hookform/resolvers/zod';
import { Form, type FormProps } from 'antd';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { FormPhoneInput } from '../form-phone-input';
import { phoneE164Schema } from '../form-phone-input/schema';

export interface InlinePhoneEditProps {
  /** Field name for the form */
  name: string;
  /** Initial value */
  value: string;
  /** ID for the form element, used to trigger submit from outside */
  formId: string;
  /** Async submit handler */
  onSubmit: (value: string) => Promise<void>;
  /** Optional Zod schema for validation. Defaults to phoneE164Schema */
  schema?: z.ZodType<string>;
  /** Optional props for the Form item */
  formProps?: Omit<FormProps, 'form' | 'onFinish'>;
}

export function InlinePhoneEdit({
  name,
  value,
  formId,
  onSubmit,
  schema = phoneE164Schema,
  formProps,
}: InlinePhoneEditProps) {
  // Dynamic schema based on the field name
  const formSchema = z.object({
    [name]: schema,
  });

  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { [name]: value },
    mode: 'onSubmit',
  });

  const { handleSubmit } = methods;

  const onValid: SubmitHandler<Record<string, string>> = async (data) => {
    await onSubmit(data[name] ?? '');
  };

  return (
    <FormProvider {...methods}>
      <Form
        id={formId}
        layout="vertical"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFinish={handleSubmit(onValid) as any}
        style={{ width: '100%' }}
        {...formProps}
      >
        <FormPhoneInput
          name={name}
          autoFocus
          formItemProps={{ style: { marginBottom: 0 } }}
        />
      </Form>
    </FormProvider>
  );
}
