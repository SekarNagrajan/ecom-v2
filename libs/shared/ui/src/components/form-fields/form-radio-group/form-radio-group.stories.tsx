import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, Typography } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormRadioGroup } from './form-radio-group';

const { Text } = Typography;

// Validation schemas for different use cases
const basicSchema = z.object({
  fruit: z.string().min(1, 'Please select a fruit'),
});

const multiFieldSchema = z.object({
  fruit: z.string().min(1, 'Please select a fruit'),
  city: z.string().min(1, 'Please select a city'),
  size: z.string().min(1, 'Please select a size'),
});

const conditionalSchema = z
  .object({
    plan: z.string().min(1, 'Please select a plan'),
    billing: z.string().min(1, 'Please select billing frequency'),
  })
  .refine(
    (data) => {
      // Business rule: annual plan requires annual billing
      if (data.plan === 'enterprise' && data.billing !== 'annual') {
        return false;
      }
      return true;
    },
    {
      message: 'Enterprise plan requires annual billing',
      path: ['billing'],
    }
  );

type BasicFormValues = z.infer<typeof basicSchema>;
type MultiFieldFormValues = z.infer<typeof multiFieldSchema>;
type ConditionalFormValues = z.infer<typeof conditionalSchema>;

function BasicValidationForm() {
  const form = useForm<BasicFormValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: { fruit: '' },
  });

  const onSubmit = (data: BasicFormValues) => {
    console.log('Basic form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormRadioGroup
          name="fruit"
          label="Favorite Fruit"
          options={[
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Orange', value: 'orange' },
          ]}
          required
        />

        <Button type="primary" htmlType="submit">
          Submit
        </Button>

        <div style={{ marginTop: '16px' }}>
          <Text>
            Try submitting without selecting anything to see validation error.
          </Text>
        </div>
      </Form>
    </FormProvider>
  );
}

function ButtonStyleValidationForm() {
  const form = useForm<MultiFieldFormValues>({
    resolver: zodResolver(multiFieldSchema),
    defaultValues: { fruit: '', city: '', size: '' },
  });

  const onSubmit = (data: MultiFieldFormValues) => {
    console.log('Button style form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormRadioGroup
          name="city"
          label="City"
          options={['Hangzhou', 'Shanghai', 'Beijing', 'Chengdu']}
          optionType="button"
          required
        />

        <FormRadioGroup
          name="size"
          label="Size"
          options={['Small', 'Medium', 'Large']}
          optionType="button"
          buttonStyle="solid"
          required
        />

        <Button type="primary" htmlType="submit">
          Submit
        </Button>

        <div style={{ marginTop: '16px' }}>
          <Text>Button-style radios with multiple required fields.</Text>
        </div>
      </Form>
    </FormProvider>
  );
}

function VerticalLayoutForm() {
  const form = useForm<BasicFormValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: { fruit: '' },
  });

  const onSubmit = (data: BasicFormValues) => {
    console.log('Vertical form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormRadioGroup
          name="fruit"
          label="Favorite Fruit"
          options={[
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Orange', value: 'orange' },
            { label: 'Grape', value: 'grape' },
            { label: 'Pineapple', value: 'pineapple' },
          ]}
          vertical
          required
        />

        <Button type="primary" htmlType="submit">
          Submit
        </Button>

        <div style={{ marginTop: '16px' }}>
          <Text>Vertical layout with more options.</Text>
        </div>
      </Form>
    </FormProvider>
  );
}

function ConditionalValidationForm() {
  const form = useForm<ConditionalFormValues>({
    resolver: zodResolver(conditionalSchema),
    defaultValues: { plan: '', billing: '' },
  });

  const selectedPlan = useWatch({ control: form.control, name: 'plan' });

  const onSubmit = (data: ConditionalFormValues) => {
    console.log('Conditional form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormRadioGroup
          name="plan"
          label="Subscription Plan"
          options={[
            { label: 'Basic ($9/month)', value: 'basic' },
            { label: 'Pro ($19/month)', value: 'pro' },
            { label: 'Enterprise ($49/month)', value: 'enterprise' },
          ]}
          required
        />

        <FormRadioGroup
          name="billing"
          label="Billing Frequency"
          options={[
            { label: 'Monthly', value: 'monthly' },
            { label: 'Annual (Save 20%)', value: 'annual' },
          ]}
          optionType="button"
          required
        />

        <Button type="primary" htmlType="submit">
          Subscribe
        </Button>

        <div style={{ marginTop: '16px' }}>
          <Text>
            Selected plan: <strong>{selectedPlan || 'None'}</strong>
          </Text>
          <br />
          <Text type="secondary">
            Try selecting "Enterprise" plan - it requires annual billing.
          </Text>
        </div>
      </Form>
    </FormProvider>
  );
}

function MultipleGroupsForm() {
  const form = useForm<MultiFieldFormValues>({
    resolver: zodResolver(multiFieldSchema),
    defaultValues: { fruit: '', city: '', size: '' },
  });

  const onSubmit = (data: MultiFieldFormValues) => {
    console.log('Multiple groups form submitted:', data);
  };

  return (
    <FormProvider {...form}>
      <Form onFinish={form.handleSubmit(onSubmit)} layout="vertical">
        <FormRadioGroup
          name="fruit"
          label="Favorite Fruit"
          options={[
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Orange', value: 'orange' },
          ]}
          required
        />

        <FormRadioGroup
          name="city"
          label="Preferred City"
          options={['New York', 'London', 'Tokyo', 'Paris']}
          optionType="button"
          vertical
          required
        />

        <FormRadioGroup
          name="size"
          label="T-Shirt Size"
          options={['XS', 'S', 'M', 'L', 'XL']}
          optionType="button"
          buttonStyle="solid"
          required
        />

        <Button type="primary" htmlType="submit">
          Complete Profile
        </Button>

        <div style={{ marginTop: '16px' }}>
          <Text>Multiple radio groups with different styles in one form.</Text>
        </div>
      </Form>
    </FormProvider>
  );
}

function DisabledForm() {
  const form = useForm<BasicFormValues>({
    defaultValues: { fruit: 'apple' },
  });

  return (
    <FormProvider {...form}>
      <Form layout="vertical">
        <FormRadioGroup
          name="fruit"
          label="Favorite Fruit"
          options={[
            { label: 'Apple', value: 'apple' },
            { label: 'Banana', value: 'banana' },
            { label: 'Orange', value: 'orange' },
          ]}
          disabled
        />

        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">This radio group is disabled.</Text>
        </div>
      </Form>
    </FormProvider>
  );
}

const meta: Meta = {
  title: 'Form Fields/FormRadioGroup',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => <BasicValidationForm />,
};

export const ButtonStyle: Story = {
  render: () => <ButtonStyleValidationForm />,
};

export const Vertical: Story = {
  render: () => <VerticalLayoutForm />,
};

export const ConditionalValidation: Story = {
  render: () => <ConditionalValidationForm />,
};

export const MultipleGroups: Story = {
  render: () => <MultipleGroupsForm />,
};

export const Disabled: Story = {
  render: () => <DisabledForm />,
};
