/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App, theme, Avatar } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormCustomSelect } from './form-custom-select';
import type { FormCustomSelectProps } from './types';

/* -------------------------------------------------------------------------- */
/* 1. Mock Data & API Service                                                 */
/* -------------------------------------------------------------------------- */

const MOCK_DATA = [
  { label: 'Alice Johnson', value: '1', email: 'alice@example.com' },
  { label: 'Bob Smith', value: '2', email: 'bob@example.com' },
  { label: 'Charlie Brown', value: '3', email: 'charlie@example.com' },
  { label: 'David Wilson', value: '4', email: 'david@example.com' },
  { label: 'Eve Davis', value: '5', email: 'eve@example.com' },
  { label: 'Frank Miller', value: '6', email: 'frank@example.com' },
  { label: 'Grace Lee', value: '7', email: 'grace@example.com' },
  { label: 'Hannah White', value: '8', email: 'hannah@example.com' },
  { label: 'Ivan Petrov', value: '9', email: 'ivan@example.com' },
  { label: 'Jack Bauer', value: '10', email: 'jack@example.com' },
  { label: 'Karen Smith', value: '11', email: 'karen@example.com' },
  { label: 'Leo Messi', value: '12', email: 'leo@example.com' },
  { label: 'Mike Ross', value: '13', email: 'mike@example.com' },
  { label: 'Nina Dobrev', value: '14', email: 'nina@example.com' },
  { label: 'Oscar Wilde', value: '15', email: 'oscar@example.com' },
  { label: 'Paul Pogba', value: '16', email: 'paul@example.com' },
  { label: 'Quentin Tarantino', value: '17', email: 'quentin@example.com' },
  { label: 'Rachel Green', value: '18', email: 'rachel@example.com' },
  { label: 'Steve Jobs', value: '19', email: 'steve@example.com' },
  { label: 'Tony Stark', value: '20', email: 'tony@example.com' },
];

const fetchMockData = async (query: string) => {
  return new Promise<typeof MOCK_DATA>((resolve) => {
    setTimeout(() => {
      if (!query) {
        resolve([]);
        return;
      }
      const lower = query.toLowerCase();

      // Filter from static mock data
      const filtered = MOCK_DATA.filter(
        (u) =>
          u.label.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );

      // Generate additional dynamic results if query is at least 2 chars to test scroll/groups
      const dynamicResults = Array.from({ length: 5 }).map((_, i) => ({
        label: `${query} Extra ${i + 1}`,
        value: `dynamic-${query}-${i + 1}`,
        email: `extra-${i}@${query}.com`,
      }));

      resolve([...filtered, ...dynamicResults]);
    }, 800);
  });
};

/* -------------------------------------------------------------------------- */
/* 2. Zod Schema                                                              */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  userId: z.string({ error: 'User is required' }).optional(),
  teamMembers: z.array(z.string()).optional(),
  city: z.string().optional(),
  skills: z.array(z.string()).optional(),
  initialValues: z.array(z.string()).optional(),
  initialValuesSingle: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

/* -------------------------------------------------------------------------- */
/* 3. Helper Components (Wrappers)                                            */
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
        border: `1px solid ${token.colorBorder}`,
      }}
    >
      <strong>Form State (Real-time):</strong>
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
}

const FormWrapper = ({
  defaultValues,
  ...props
}: FormCustomSelectProps<FormValues> & {
  defaultValues?: Partial<FormValues>;
}) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    defaultValues: defaultValues || {
      userId: undefined,
      teamMembers: [],
      city: '',
      skills: [],
      initialValues: ['1', '2'],
      initialValuesSingle: '1',
    },
  });

  const { handleSubmit, control, reset } = methods;

  return (
    <App>
      <div className="max-w-md w-96 p-4">
        <FormProvider {...methods}>
          <Form
            layout="vertical"
            onFinish={handleSubmit((data) => console.log('Success:', data))}
          >
            <FormCustomSelect {...(props as any)} control={control} />

            <div className="mt-4 flex gap-2">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={() => reset()}>Reset</Button>
            </div>

            <DebugValue />
          </Form>
        </FormProvider>
      </div>
    </App>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. Meta Configuration                                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof FormCustomSelect> = {
  title: 'Components/FormCustomSelect',
  component: FormCustomSelect,
  parameters: { layout: 'centered' },
  args: {
    name: 'userId',
    label: 'Custom Select',
    placeholder: 'Type to search...',
    fetchOptions: fetchMockData,
  },
};

export default meta;
type Story = StoryObj<typeof FormCustomSelect>;

/* -------------------------------------------------------------------------- */
/* 5. Stories                                                                 */
/* -------------------------------------------------------------------------- */

export const RemoteSingleSelect: Story = {
  name: 'Single Select',
  render: (args) => (
    <FormWrapper {...(args as FormCustomSelectProps<FormValues>)} />
  ),
  args: {
    name: 'userId',
    label: 'Assign User',
    minChars: 2,
    placeholder: 'Type "ali" or "bob"...',
  },
};

export const RemoteMultiSelect: Story = {
  name: 'Multi Select with Select All',
  render: (args) => (
    <FormWrapper {...(args as FormCustomSelectProps<FormValues>)} />
  ),
  args: {
    name: 'teamMembers',
    label: 'Add Team Members',
    mode: 'multiple',
    minChars: 1,
    allowSelectAll: true,
    maxTagCount: 'responsive',
    placeholder: 'Search team...',
  },
};

export const MultiSelectWithMaxCount: Story = {
  name: 'Multi Select with Max Count (3)',
  render: (args) => (
    <FormWrapper {...(args as FormCustomSelectProps<FormValues>)} />
  ),
  args: {
    name: 'teamMembers',
    label: 'Team Members (Max 3)',
    mode: 'multiple',
    minChars: 1,
    maxCount: 3,
    allowSelectAll: true,
    maxTagCount: 'responsive',
    placeholder: 'Select up to 3 items...',
  },
};

export const FreeTextSingle: Story = {
  name: 'Free Text Single (Combobox)',
  render: (args) => (
    <FormWrapper {...(args as FormCustomSelectProps<FormValues>)} />
  ),
  args: {
    name: 'city',
    label: 'City',
    mode: 'single',
    allowFreeText: true,
    allowClear: true,
    minChars: 2,
    placeholder: 'Type "London" or search "Alice"...',
  },
};

export const FreeTextMulti: Story = {
  name: 'Free Text Multi (Tags) with Groups',
  render: (args) => (
    <FormWrapper {...(args as FormCustomSelectProps<FormValues>)} />
  ),
  args: {
    name: 'skills',
    label: 'Skills',
    mode: 'multiple',
    allowFreeText: true,
    allowSelectAll: true,
    minChars: 1,
    placeholder: 'Type anything or pick from results...',
  },
};

export const CustomOptionRender: Story = {
  name: 'Custom Option Rendering',
  render: (args) => (
    <FormWrapper {...(args as FormCustomSelectProps<FormValues>)} />
  ),
  args: {
    name: 'userId',
    label: 'User with Avatar',
    optionRender: (option: any) => (
      <div className="flex items-center gap-3 py-1">
        <Avatar
          style={{ backgroundColor: '#1677ff' }}
          icon={<UserOutlined />}
          size="small"
        />
        <div className="flex flex-col">
          <span className="font-medium leading-none">{option.data.label}</span>
          <span className="text-xs text-gray-400">{option.data.email}</span>
        </div>
      </div>
    ),
  },
};

export const InitialSelectedValue: Story = {
  name: 'With Initial Selected Items',
  render: (args) => (
    <FormWrapper
      {...(args as FormCustomSelectProps<FormValues>)}
      initialOptionLabels={{
        '1': { label: 'One', value: '1' },
        '2': { label: 'Two', value: '2' },
      }}
    />
  ),
  args: {
    name: 'initialValues',
    label: 'Initial Members',
    mode: 'multiple',
    placeholder: 'Open to see selected items...',
  },
};

export const InitialSelectedValueSingle: Story = {
  name: 'With Initial Selected Value',
  render: (args) => (
    <FormWrapper
      {...(args as FormCustomSelectProps<FormValues>)}
      initialOptionLabels={{
        '1': { label: 'One', value: '1' },
        // '2': { label: 'Two', value: '2' },
      }}
    />
  ),
  args: {
    name: 'initialValuesSingle',
    label: 'Initial Value',
    // mode: 'single',
    placeholder: 'Open to see selected items...',
  },
};

export const MultiSelectNativeMaxCount: Story = {
  name: 'Select native multi select max count validation',
  render: (args) => (
    <FormWrapper {...(args as FormCustomSelectProps<FormValues>)} />
  ),
  args: {
    name: 'userId',
    label: 'Assign User',
    minChars: 1,
    maxTagCount: 2,
    maxCount: 4,
    mode: 'multiple',
    placeholder: 'Type "ali" or "bob"...',
    fieldNames: { value: 'email' },
  },
};
