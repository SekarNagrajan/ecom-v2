/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App, theme, Avatar } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormAutocomplete } from './form-autocomplete';
import type { FormAutocompleteProps } from './types';

/* -------------------------------------------------------------------------- */
/* 1. Mock Data & API Service                                                 */
/* -------------------------------------------------------------------------- */

const MOCK_USERS = [
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
  console.log('Fetching:', query);
  return new Promise<typeof MOCK_USERS>((resolve) => {
    setTimeout(() => {
      if (!query) {
        resolve([]);
        return;
      }
      const lower = query.toLowerCase();
      const filtered = MOCK_USERS.filter((u) =>
        u.label.toLowerCase().includes(lower)
      );
      resolve(filtered);
    }, 800);
  });
};

const fetchMockDataWithError = async (query: string) => {
  return new Promise<typeof MOCK_USERS>((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Network Error'));
    }, 800);
  });
};

/* -------------------------------------------------------------------------- */
/* 2. Zod Schema                                                              */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  userId: z.string({ error: 'User is required' }),
  teamMembers: z.array(z.string()).min(1, 'Select at least one member'),
  city: z.string().optional(),
  skills: z.array(z.string()).optional(),
  asyncUser: z.string().optional(),
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
}: FormAutocompleteProps<FormValues> & {
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
            <FormAutocomplete {...props} control={control} />

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

const meta: Meta<typeof FormAutocomplete> = {
  title: 'Components/FormAutocomplete',
  component: FormAutocomplete,
  parameters: { layout: 'centered' },
  args: {
    name: 'userId',
    label: 'Search User',
    placeholder: 'Type "ali" or "bob"...',
    fetchOptions: fetchMockData,
  },
};

export default meta;
type Story = StoryObj<typeof FormAutocomplete>;

/* -------------------------------------------------------------------------- */
/* 5. Stories                                                                 */
/* -------------------------------------------------------------------------- */

export const RemoteSingleSelect: Story = {
  name: 'Strict Single Select (Default)',
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
  ),
  args: {
    name: 'userId',
    label: 'Assign User',
    minChars: 2,
    highlightMatch: true,
    formItemProps: {
      extra: 'You must select a user from the list.',
    },
  },
};

export const RemoteMultiSelect: Story = {
  name: 'Strict Multi Select',
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
  ),
  args: {
    name: 'teamMembers',
    label: 'Add Team Members',
    mode: 'multiple',
    minChars: 1,
    placeholder: 'Search team...',
    highlightMatch: true,
    formItemProps: {
      extra: 'You can pick multiple users, but only from the list.',
    },
  },
};

export const FreeTextSingle: Story = {
  name: 'Free Text Single (Combobox)',
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
  ),
  args: {
    name: 'city',
    label: 'City',
    allowFreeText: true,
    minChars: 2,
    placeholder: 'Type "London" or search "Alice"...',
    formItemProps: {
      extra: 'Type anything and press enter, or pick from the mock list.',
    },
  },
};

export const FreeTextMulti: Story = {
  name: 'Free Text Multi (Tags)',
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
  ),
  args: {
    name: 'skills',
    label: 'Skills',
    mode: 'multiple',
    allowFreeText: true,
    minChars: 1,
    maxTagCount: 'responsive',
    placeholder: 'Type "React", "Vue" or pick...',
    formItemProps: {
      extra: 'Create new tags by typing and pressing enter.',
    },
  },
};

export const CustomOptionRender: Story = {
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
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

export const WithInitialValue: Story = {
  render: (args) => (
    <FormWrapper
      {...(args as FormAutocompleteProps<FormValues>)}
      defaultValues={{ userId: '5' }}
      fetchOptions={async (val) => {
        return fetchMockData(val);
      }}
    />
  ),
  args: {
    name: 'userId',
    label: 'Editing User (Pre-filled ID)',
    formItemProps: {
      extra: 'Note: Shows ID initially if options are not loaded.',
    },
  },
};

export const MinimumCharacters: Story = {
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
  ),
  args: {
    name: 'userId',
    label: 'Search (Min 3 Chars)',
    minChars: 3,
    placeholder: 'Type 3 chars to start search...',
    notFoundContent: 'Waiting for input...',
  },
};

export const ErrorHandling: Story = {
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
  ),
  args: {
    name: 'userId',
    label: 'API Error Simulation',
    fetchOptions: async (val) => {
      try {
        return await fetchMockDataWithError(val);
      } catch (e) {
        console.error('Handled in parent:', e);
        return [];
      }
    },
    formItemProps: {
      help: 'Open console to see the error caught by parent.',
    },
  },
};

export const MaxTagCountLimit: Story = {
  name: 'Max Tag Count Limit (Start with 2 fake items)',
  render: (args) => (
    <FormWrapper
      {...(args as FormAutocompleteProps<FormValues>)}
      defaultValues={{ teamMembers: ['98', '99'] }}
    />
  ),
  args: {
    name: 'teamMembers',
    label: 'Team Members (Max 2)',
    mode: 'multiple',
    maxTagCount: 2,
    minChars: 1,
    placeholder: 'Try searching when 2 are selected...',
    formItemProps: {
      extra:
        'Initial items "98", "99" are placeholders. Remove one to search & add "Alice".',
    },
  },
};

export const WithSelectAll: Story = {
  name: 'Multi Select with "Select All"',
  render: (args) => (
    <FormWrapper {...(args as FormAutocompleteProps<FormValues>)} />
  ),
  args: {
    name: 'teamMembers',
    label: 'Select Team',
    mode: 'multiple',
    minChars: 1,
    allowSelectAll: true,
    placeholder: 'Search "a" to see many options...',
    maxTagCount: 'responsive',
    maxCount: 5,
    formItemProps: {
      extra: 'Search for "a" and try the "Select All" checkbox.',
    },
  },
};
