import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App } from 'antd';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormCheckboxGroup } from './form-checkbox-group';

const FormSchema = z.object({
  fruits: z.array(z.string()).min(1, 'Select at least one fruit'),
  vegetables: z
    .array(z.string())
    .min(1, 'Select at least one')
    .max(2, 'Select at most 2 vegetables'),
});

type FormValues = z.infer<typeof FormSchema>;

function FormCheckboxGroupStory({
  onSubmit,
}: {
  onSubmit: (data: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fruits: ['apple'],
      vegetables: [],
    },
  });

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormCheckboxGroup
          name="fruits"
          label="Favorite Fruits"
          options={[
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Orange', value: 'orange' },
          ]}
          showSelectAll
          required
        />

        <FormCheckboxGroup
          name="vegetables"
          label="Favorite Vegetables"
          options={[
            { label: 'Carrot', value: 'carrot' },
            { label: 'Broccoli', value: 'broccoli' },
            { label: 'Spinach', value: 'spinach' },
            { label: 'Tomato', value: 'tomato' },
          ]}
          direction="horizontal"
          // maxSelection={2}
          showSelectAll
        />

        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </FormProvider>
  );
}

const meta: Meta<typeof FormCheckboxGroupStory> = {
  title: 'Form Fields/FormCheckboxGroup',
  component: FormCheckboxGroupStory,
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
      <FormCheckboxGroupStory {...args} />
    </App>
  ),
};
