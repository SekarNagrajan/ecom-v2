import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App, theme } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormPhoneInput } from './form-phone-input';
import { phoneE164Schema, phoneE164SchemaOptional } from './schema';
import type { FormPhoneInputProps } from './types';

/* -------------------------------------------------------------------------- */
/* Zod Schema                                                                 */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  // Required Phone: Expects a string with at least 10 chars (simple validation)
  phoneDefault: phoneE164Schema,

  // Optional Phone: Allows empty string or valid phone
  phoneOptional: phoneE164SchemaOptional,

  // Prefilled Phone: For testing initial render
  phonePrefilled: phoneE164Schema,

  // Disabled Phone: For visual check
  phoneDisabled: phoneE164SchemaOptional,
});

type FormValues = z.infer<typeof FormSchema>;

/* -------------------------------------------------------------------------- */
/* Debug Viewer                                                               */
/* -------------------------------------------------------------------------- */

function DebugValue() {
  const values = useWatch();
  const { token } = theme.useToken();

  return (
    <div
      style={{
        marginTop: 24,
        padding: 12,
        backgroundColor: token.colorFillQuaternary,
        borderRadius: token.borderRadius,
        fontFamily: 'monospace',
        fontSize: 12,
      }}
    >
      <strong>Form State (Watch):</strong>
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wrapper Component                                                          */
/* -------------------------------------------------------------------------- */

const FormWrapper = (props: FormPhoneInputProps<FormValues>) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      phoneDefault: '',
      phoneOptional: '',
      phonePrefilled: '+12025550143', // US Number example
      phoneDisabled: '+447911123456', // UK Number example
    },
  });

  const { handleSubmit, control } = methods;

  return (
    <App>
      <div className="max-w-md p-4">
        <FormProvider {...methods}>
          <Form
            layout="vertical"
            onFinish={handleSubmit((data) => console.log('Success:', data))}
          >
            {/* The Component Under Test */}
            <FormPhoneInput {...props} control={control} />

            <div className="mt-4 flex gap-2">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={() => methods.trigger()}>
                Trigger Validation
              </Button>
              <Button onClick={() => methods.reset()}>Reset</Button>
            </div>

            <DebugValue />
          </Form>
        </FormProvider>
      </div>
    </App>
  );
};

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof FormPhoneInput> = {
  title: 'Components/FormPhoneInput',
  component: FormPhoneInput,
  render: (args) => (
    <FormWrapper {...(args as FormPhoneInputProps<FormValues>)} />
  ),
  parameters: {
    layout: 'centered',
  },
  args: {
    name: 'phoneDefault',
    label: 'Phone Number',
  },
};

export default meta;
type Story = StoryObj<typeof FormPhoneInput>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Basic usage with required validation.
 * Try submitting empty to see the error state (red border + message).
 */
export const Basic: Story = {
  args: {
    name: 'phoneDefault',
    label: 'Contact Number',
    required: true,
    // tooltip: { zIndex: 1000, title: 'Test', placement: 'bottom' },
    tooltip: "We'll use this to contact you.",
    // allowClear: true
  },
};

/**
 * An optional field.
 * Submitting empty won't trigger validation errors.
 */
export const Optional: Story = {
  args: {
    name: 'phoneOptional',
    label: 'Secondary Phone (Optional)',
    required: false,
  },
};

/**
 * Demonstrates how the component handles existing values.
 * The Country Flag should automatically switch to US (+1) based on the value.
 */
export const PrefilledValue: Story = {
  args: {
    name: 'phonePrefilled',
    label: 'Edit Phone Number',
    required: true,
    hasFeedback: true, // Shows AntD feedback icon on valid state
  },
};

/**
 * Disabled state.
 * Both the input and the country trigger should appear disabled.
 */
export const Disabled: Story = {
  args: {
    name: 'phoneDisabled',
    label: 'Disabled Field',
    disabled: true,
  },
};

/**
 * Integration with AntD Form.Item props.
 * Demonstrates custom error messages and extra help text.
 */
export const WithHelpText: Story = {
  args: {
    name: 'phoneOptional',
    label: 'Support Line',
    formItemProps: {
      extra: 'We are available 24/7.',
    },
    tooltip: 'This tooltip comes from formItemProps',
  },
};

/**
 * Simulates a server-side validation error manually.
 * This tests the Red Border logic without relying on Zod typing.
 */
export const ManualErrorState: Story = {
  args: {
    name: 'phoneDefault',
    label: 'Manual Error',
    formItemProps: {
      validateStatus: 'error',
      help: 'This number is already registered (Simulated backend error)',
    },
  },
};
