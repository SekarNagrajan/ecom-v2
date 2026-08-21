import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { App, Button, Form, theme } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormTextarea } from './form-textarea';
import type { FormTextareaProps } from './types';

/* -------------------------------------------------------------------------- */
/* Zod Schema                                                                 */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  bio: z
    .string()
    .min(2, 'Min 2 chars needed')
    .max(500, 'Bio cannot exceed 500 characters'),
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

const FormWrapper = (props: FormTextareaProps<FormValues>) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    defaultValues: {
      bio: '',
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
            <FormTextarea {...props} control={control} />

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

const meta: Meta<typeof FormTextarea> = {
  title: 'Components/FormTextarea',
  component: FormTextarea,
  render: (args) => (
    <FormWrapper {...(args as FormTextareaProps<FormValues>)} />
  ),
  parameters: {
    layout: 'centered',
  },
  args: {
    name: 'bio',
    label: 'Biography',
    placeholder: 'Tell us about yourself...',
  },
};

export default meta;
type Story = StoryObj<typeof FormTextarea>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Basic textarea backed by React Hook Form + Zod.
 */
export const Basic: Story = {
  args: {
    name: 'bio',
    label: 'Biography',
    rows: 3,
    placeholder: 'Tell us about yourself...',
  },
};

/**
 * Textarea with character count and a maxLength cap.
 */
export const WithCount: Story = {
  args: {
    name: 'bio',
    label: 'Biography',
    allowClear: true,
    showCount: true,
    maxLength: 100,
    autoSize: {
      minRows: 3,
      maxRows: 5,
    },
    placeholder: 'Tell us about yourself...',
  },
};

/**
 * Opt-in audio dictation. The mic floats in the bottom-right corner of the
 * textarea. shared-ui is intentionally UX-agnostic — `onError` receives a
 * typed `AudioDictationError`, and the consuming app decides whether to toast,
 * inline-warn, or stay silent.
 *
 * This story stubs `transcribe` with a fixed string so the story runs in
 * Storybook without a real backend.
 */
export const AudioDictation: Story = {
  args: {
    name: 'bio',
    label: 'Biography',
    rows: 6,
    placeholder: 'Click the mic to dictate...',
    audioDictation: {
      transcribe: async () => {
        await new Promise((resolve) => setTimeout(resolve, 600)); // simulate latency
        return 'This is a stubbed transcript from the AudioDictation Storybook story.';
      },
      onError: (err) => {
        console.warn('[AudioDictation story]', err);
      },
    },
    dictationTooltip: 'Dictate',
  },
};
