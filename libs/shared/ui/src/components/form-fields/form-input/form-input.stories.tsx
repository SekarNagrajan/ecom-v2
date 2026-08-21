import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App, theme } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormInput } from './form-input';
import type { FormInputProps } from './types';

/* -------------------------------------------------------------------------- */
/* Zod Schema                                                                 */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Invalid email address'),
  website: z.url('Must be a valid URL'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  apiKey: z.string(),
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

// We wrap in <App> because FormInput uses App.useApp() for the copy message
const FormWrapper = (props: FormInputProps<FormValues>) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    defaultValues: {
      username: '',
      email: '',
      website: '',
      password: '',
      apiKey: 'sk_live_1234567890_readonly_key', // Default for copy demo
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
            <FormInput {...props} control={control} />

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

const meta: Meta<typeof FormInput> = {
  title: 'Components/FormInput',
  component: FormInput,
  render: (args) => <FormWrapper {...(args as FormInputProps<FormValues>)} />,
  parameters: {
    layout: 'centered',
  },
  args: {
    name: 'username',
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export default meta;
type Story = StoryObj<typeof FormInput>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Standard text input with trim enabled by default.
 * Try typing "  hello  " and clicking outside; it will become "hello".
 */
export const BasicText: Story = {
  args: {
    name: 'username',
    label: 'Username',
    required: true,
    trimOnBlur: true,
    type: 'text',
  },
};

/**
 * Standard text input with trim enabled by default.
 * Try typing "  hello  " and clicking outside; it will become "hello".
 */
export const BasicTextWithCount: Story = {
  args: {
    name: 'username',
    label: 'Username',
    required: true,
    trimOnBlur: true,
    showCount: true,
    maxLength: 20,
    type: 'text',
  },
};

/**
 * Uses <Input.Password />.
 * Includes native visibility toggle.
 */
export const PasswordField: Story = {
  args: {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    formItemProps: {
      // help: 'Must be at least 6 characters.',
    },
    prefix: <LockOutlined className="text-gray-400" />,
  },
};

/**
 * Uses type="email" and shows Zod validation error styles.
 */
export const EmailWithValidation: Story = {
  args: {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'user@example.com',
    prefix: <UserOutlined className="text-gray-400" />,
    hasFeedback: true, // Shows checkmark/x icon on right
    // formItemProps: {
    // },
  },
};

/**
 * Readonly field with a "Copy to Clipboard" button in the suffix.
 */
export const ReadonlyWithCopy: Story = {
  args: {
    name: 'apiKey',
    label: 'API Key (Read Only)',
    readOnly: true,
    allowCopy: true, // ✨ Enables the copy button
    tooltip: 'This key is auto-generated and cannot be changed.',
    suffix: <UserOutlined className="text-gray-400" />,
    // itemProps: {
    // },
  },
};

/**
 * Simulates a loading/validating state.
 * The spinner appears automatically when validateStatus is 'validating'.
 */
export const LoadingState: Story = {
  args: {
    name: 'username',
    label: 'Checking Availability...',
    hasFeedback: true, // Required to show the spinner icon in suffix
    formItemProps: {
      help: 'Validating username with server...',
      validateStatus: 'validating',
    },
  },
};

/**
 * Demonstrates disabled state.
 */
export const Disabled: Story = {
  args: {
    name: 'username',
    label: 'Disabled Field',
    disabled: true,
  },
};

/**
 * Advanced Layout using `itemProps`.
 * Shows how to pass props directly to Form.Item that aren't shortcuts.
 */
export const AdvancedLayout: Story = {
  args: {
    name: 'username',
    label: 'Label with Extra Info',
    placeholder: 'Input...',
    formItemProps: {
      extra: 'This is the "extra" prop passed via formItemProps.',
      labelCol: { span: 24 }, // Force label to own line (if not using vertical layout)
      className: 'bg-blue-50 p-4 rounded', // Apply classes to the Wrapper, not input
    },
  },
};
