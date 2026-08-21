/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App, theme, Avatar } from 'antd';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormSelect } from './form-select';
import type { FormSelectProps } from './types';

/* -------------------------------------------------------------------------- */
/* Zod Schema                                                                 */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  color: z.string({ error: 'Please select a color' }),
  tags: z.array(z.string()).min(1, 'Select at least one tag'),
  users: z.array(z.number()).optional(),
  country: z.string().optional(),
  dynamicTags: z.array(z.string()).optional(),
  remoteSearch: z.string().optional(),
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
      <strong>Form State:</strong>
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wrapper Component                                                          */
/* -------------------------------------------------------------------------- */

const FormWrapper = (props: FormSelectProps<FormValues>) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    defaultValues: {
      tags: [],
      users: [],
      dynamicTags: [],
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
            <FormSelect {...props} control={control} />

            <div className="mt-4 flex gap-2">
              <Button type="primary" htmlType="submit">
                Submit
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
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof FormSelect> = {
  title: 'Components/FormSelect',
  component: FormSelect,
  render: (args) => <FormWrapper {...(args as FormSelectProps<FormValues>)} />,
  parameters: { layout: 'centered' },
  args: {
    name: 'color',
    label: 'Select Option',
    placeholder: 'Choose...',
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
      { label: 'Green', value: 'green' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof FormSelect>;

/* -------------------------------------------------------------------------- */
/* Data Constants                                                             */
/* -------------------------------------------------------------------------- */

const USERS_DATA = [
  { id: 101, name: 'Alice Johnson', role: 'Admin' },
  { id: 102, name: 'Bob Smith', role: 'Editor' },
  { id: 103, name: 'Charlie Brown', role: 'Viewer' },
  { id: 104, name: 'David Wilson', role: 'Admin' },
  { id: 105, name: 'Eve Davis', role: 'Editor' },
];

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Basic Single Select.
 */
export const SingleSelect: Story = {
  args: {
    name: 'color',
    label: 'Favorite Color',
    required: true,
    className: 'w-md',
    allowClear: true,
  },
};

/**
 * Multi-Select with "Select All" functionality.
 * This stores an array of values in the form.
 */
export const MultiSelectAll: Story = {
  args: {
    name: 'tags',
    label: 'Pick Tags (Select All Enabled)',
    mode: 'multiple',
    allowSelectAll: true, // ✨ Enables the custom header
    maxTagCount: 'responsive',
    // popupMatchSelectWidth: false,
    getPopupContainer: (node) => {
      if (node) {
        return node.parentNode;
      }

      return document.body;
    },
    // className: 'w-[500px]',
    options: [
      { label: 'React', value: 'react' },
      { label: 'Angular', value: 'angular' },
      { label: 'Vue', value: 'vue' },
      { label: 'Svelte', value: 'svelte' },
      { label: 'Next.js', value: 'next' },
    ],
  },
};

/**
 * Custom Data Structure using `fieldNames`.
 * Maps 'name' -> label and 'id' -> value.
 */
export const CustomDataStructure: Story = {
  args: {
    name: 'users',
    label: 'Assign Users',
    mode: 'multiple',
    fieldNames: { label: 'name', value: 'id' },
    options: USERS_DATA,
    allowClear: true,
  },
};

/**
 * Grouped Options.
 * Uses standard AntD grouping structure.
 */
export const GroupedOptions: Story = {
  args: {
    name: 'country',
    label: 'Select City',
    options: [
      {
        label: 'North America',
        options: [
          { label: 'New York', value: 'ny' },
          { label: 'Toronto', value: 'to' },
        ],
      },
      {
        label: 'Europe',
        options: [
          { label: 'London', value: 'ldn' },
          { label: 'Berlin', value: 'ber' },
        ],
      },
    ],
  },
};

/**
 * Dynamic Tags Creation.
 * Allows user to type and create new options on the fly.
 */
export const TagsMode: Story = {
  args: {
    name: 'dynamicTags',
    label: 'Add Skills (Type and Enter)',
    mode: 'tags',
    placeholder: 'Type a skill e.g. "Rust"',
    options: [{ label: 'Javascript', value: 'js' }],
  },
};

/**
 * Custom Option Rendering.
 * Customize how each item looks in the dropdown.
 */
export const CustomOptionRender: Story = {
  args: {
    name: 'users',
    label: 'Select User (Custom Render)',
    mode: 'multiple',
    fieldNames: { label: 'name', value: 'id' },
    options: USERS_DATA,
    optionRender: (option) => (
      <div className="flex items-center gap-2">
        <Avatar style={{ backgroundColor: '#87d068' }} size="small">
          {option.data.name[0]}
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span>{option.data.name}</span>
          <span className="text-xs text-gray-400">{option.data.role}</span>
        </div>
      </div>
    ),
  },
};

/**
 * Loading State.
 */
export const Loading: Story = {
  args: {
    name: 'color',
    label: 'Loading Data...',
    loading: true,
    disabled: true,
  },
};

/**
 * Simulated Remote Search with Debounce.
 * This Component wraps the usage to manage state logic.
 */
const RemoteSearchWrapper = (props: any) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ label: string; value: string }[]>([]);

  const handleSearch = (value: string) => {
    if (!value) {
      setData([]);
      return;
    }

    setLoading(true);
    console.log('[Remote] Fetching for:', value);

    // Simulate API Call delay
    setTimeout(() => {
      const results = [
        { label: `${value} - Result 1`, value: `${value}_1` },
        { label: `${value} - Result 2`, value: `${value}_2` },
        { label: `${value} - Result 3`, value: `${value}_3` },
      ];
      setData(results);
      setLoading(false);
    }, 800);
  };

  return (
    <FormWrapper
      {...props}
      showSearch={{
        filterOption: false,
        // onSearch: handleSearch,
      }}
      loading={loading}
      // debounceTimeout={500}
      // filterOption={false} // Important: Disable local filter for remote search
      customSearch={handleSearch} // This will be debounced by the component
      options={data}
      notFoundContent={loading ? 'Searching...' : 'Type to search'}
    />
  );
};

export const RemoteDebouncedSearch: Story = {
  render: (args) => <RemoteSearchWrapper {...args} />,
  args: {
    name: 'remoteSearch',
    label: 'Remote Search (Debounced 500ms)',
    placeholder: 'Type "apple"...',
    debounceTimeout: 500,
  },
};

const LARGE_DATA = Array.from({ length: 10000 }, (_, i) => ({
  label: `Item ${i + 1} - Performance Test`,
  value: `item-${i + 1}`,
}));

export const VirtualScroll10k: Story = {
  args: {
    name: 'tags',
    label: '10,000 Items (Virtual Scroll)',
    mode: 'multiple',
    maxTagCount: 'responsive', // ⚠️ Crucial for large selections
    placeholder: 'Scroll to see virtual list...',
    options: LARGE_DATA,
    allowClear: true,
  },
};
