import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App } from 'antd';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCheckbox } from './form-checkbox';

const FormSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  newsletter: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  agreeToMarketing: z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

function FormCheckboxStory({
  onSubmit,
}: {
  onSubmit: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      acceptTerms: false,
      newsletter: true,
      agreeToMarketing: false,
    },
  });

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormCheckbox
          name="acceptTerms"
          label="Terms and Conditions"
          description="By checking this box, you agree to our terms and conditions."
        />

        <FormCheckbox
          name="newsletter"
          // label="Subscribe to Newsletter"
          description="Receive weekly updates about our products and services."
          labelPosition="left"
        >
          Subscribe to newsletter
        </FormCheckbox>

        <FormCheckbox
          name="agreeToMarketing"
          // label="Agree to Marketing Communications"
          labelPosition="top"
        >
          Agree to marketing
        </FormCheckbox>

        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </FormProvider>
  );
}

const meta: Meta<typeof FormCheckboxStory> = {
  title: 'Form Fields/FormCheckbox',
  component: FormCheckboxStory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    onSubmit: (data) => console.log('Form submitted:', data),
  },
};

export const WithValidation: Story = {
  args: {
    onSubmit: (data) => console.log('Form submitted:', data),
  },
  render: (args) => (
    <App>
      <FormCheckboxStory {...args} />
    </App>
  ),
};
