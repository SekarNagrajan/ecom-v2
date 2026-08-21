import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormRadio } from './form-radio';

const FormSchema = z.object({
  plan: z.string().min(1, 'Please select a plan'),
  size: z.string().min(1, 'Please select a size'),
});

type FormValues = z.infer<typeof FormSchema>;

function FormRadioStory({
  onSubmit,
}: {
  onSubmit: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      plan: '',
      size: '',
    },
  });

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormRadio name="plan" label="Subscription Plan" value="basic">
          Basic Plan - $9/month
        </FormRadio>
        <FormRadio name="plan" value="pro">
          Pro Plan - $19/month
        </FormRadio>
        <FormRadio name="plan" value="enterprise">
          Enterprise Plan - $49/month
        </FormRadio>

        <FormRadio name="size" label="Size" labelPosition="left" value="small">
          Small
        </FormRadio>
        <FormRadio name="size" labelPosition="left" value="medium">
          Medium
        </FormRadio>
        <FormRadio name="size" labelPosition="left" value="large">
          Large
        </FormRadio>

        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </FormProvider>
  );
}

const meta: Meta<typeof FormRadioStory> = {
  title: 'Form Fields/FormRadio',
  component: FormRadioStory,
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
      <FormRadioStory {...args} />
    </App>
  ),
};

function MultipleRadiosComponent() {
  const form = useForm<{ selected: string }>({
    defaultValues: { selected: '' },
  });

  const selectedValue = useWatch({ control: form.control, name: 'selected' });

  return (
    <FormProvider {...form}>
      <Form layout="vertical">
        <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
          Choose an option
        </div>
        <FormRadio name="selected" value="option1">
          Option 1 - Basic
        </FormRadio>
        <FormRadio name="selected" value="option2">
          Option 2 - Advanced
        </FormRadio>
        <FormRadio name="selected" value="option3">
          Option 3 - Premium
        </FormRadio>

        <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Selected: {selectedValue || 'None'}
        </div>
      </Form>
    </FormProvider>
  );
}

export const MultipleRadios: Story = {
  render: () => <MultipleRadiosComponent />,
};
