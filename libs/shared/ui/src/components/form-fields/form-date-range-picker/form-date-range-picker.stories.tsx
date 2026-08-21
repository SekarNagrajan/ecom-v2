/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, theme } from 'antd';
import { DateTime } from 'luxon';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormDateRangePicker } from './form-date-range-picker';
import { type FormDateRangePickerProps } from './types';

/* -------------------------------------------------------------------------- */
/* Zod schema                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Stored as [start, end]
 * where each value is an ISO UTC String (e.g. "2023-10-05T14:00:00.000Z") or null
 */
const DateRangeSchema = z
  .tuple([z.string().nullable().optional(), z.string().nullable().optional()])
  .superRefine(([start, end], ctx) => {
    const fail = (message: string) => {
      ctx.addIssue({
        code: 'custom',
        message,
        path: [],
      });
    };

    if (!start || !end) {
      fail('Invalid range');
      return;
    }

    // Parse UTC strings to compare
    const s = DateTime.fromISO(start, { zone: 'utc' });
    const e = DateTime.fromISO(end, { zone: 'utc' });

    if (!s.isValid || !e.isValid) {
      fail('Invalid date format');
      return;
    }

    if (e <= s) {
      fail('End date must be after start date');
    }
  });

const FormSchema = z.object({
  range: DateRangeSchema,
});

type FormValues = z.infer<typeof FormSchema>;

/* -------------------------------------------------------------------------- */
/* Debug value viewer                                                          */
/* -------------------------------------------------------------------------- */

function DebugValue({ name }: { name: keyof FormValues }) {
  const value = useWatch({ name });
  const { token } = theme.useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorFillQuaternary,
        color: token.colorText,
        borderColor: token.colorBorder,
      }}
      className="mt-3 rounded border p-3 text-xs font-mono"
    >
      <div className="mb-1 font-bold opacity-60">RHF Form State (UTC ISO)</div>
      <pre className="whitespace-pre-wrap break-all">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form wrapper (used by all stories)                                          */
/* -------------------------------------------------------------------------- */

function FormWrapper(props: FormDateRangePickerProps<any>) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      range: [null, null],
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, control } = methods;

  return (
    <FormProvider {...methods}>
      <form
        className="flex max-w-md flex-col gap-4"
        onSubmit={handleSubmit((data) => {
          console.log('SUBMITTED:', data);
        })}
        noValidate
      >
        <Form layout="vertical" component={false}>
          <FormDateRangePicker {...props} name="range" control={control} />

          <div className="flex gap-2">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button onClick={() => trigger()}>Trigger Validation</Button>
          </div>

          <DebugValue name="range" />
        </Form>
      </form>
    </FormProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Story meta                                                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof FormDateRangePicker> = {
  title: 'Components/FormDateRangePicker',
  component: FormDateRangePicker,
  render: (args) => <FormWrapper {...args} />,
  args: {
    name: 'range',
    label: 'Select Date Range',
    required: false,
  },
  argTypes: {
    disablePast: { control: 'boolean' },
    disableFuture: { control: 'boolean' },
    minimumGap: {
      control: { type: 'number' },
      description: 'Minimum gap in MINUTES',
    },
    showTime: { control: 'boolean' },
    picker: {
      control: 'radio',
      options: ['date', 'week', 'month', 'year', 'quarter'],
      description: 'The type of picker to display',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormDateRangePicker>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                     */
/* -------------------------------------------------------------------------- */

export const BasicDateOnly: Story = {
  args: {
    formItemProps: {
      help: 'Standard date range picker (no time)',
    },
  },
};

export const WithTime: Story = {
  args: {
    label: 'Event Duration',
    showTime: true,
    formItemProps: {
      help: 'Allows selecting specific times',
    },
  },
};

export const MinimumGap2Days: Story = {
  args: {
    label: 'Trip Duration (Min 2 Days)',
    formItemProps: {
      help: 'Gap is 2880 minutes (2 days). Try selecting a start date.',
    },
    // 2 days * 24 hours * 60 minutes
    minimumGap: 2 * 24 * 60,
  },
};

export const MinimumGap30Minutes: Story = {
  args: {
    label: 'Short Session',
    showTime: true,
    formItemProps: {
      help: 'Requires 30 min gap between start and end time',
    },
    minimumGap: 30,
  },
};

export const DisablePastDates: Story = {
  args: {
    label: 'Future Booking',
    formItemProps: {
      help: 'Cannot select past dates',
    },
    disablePast: true,
  },
};

export const DisableFutureDates: Story = {
  args: {
    label: 'Historical Records',
    formItemProps: {
      help: 'Cannot select future dates',
    },
    disableFuture: true,
  },
};

export const WithPresets: Story = {
  args: {
    label: 'Quick Select',

    presets: [
      {
        label: 'Last 7 Days',
        value: [
          DateTime.now().minus({ days: 7 }).startOf('day'),
          DateTime.now().endOf('day'),
        ],
      },
      {
        label: 'Next Month',
        value: [
          DateTime.now().plus({ months: 1 }).startOf('month'),
          DateTime.now().plus({ months: 1 }).endOf('month'),
        ],
      },
      {
        label: 'Today & Tomorrow',
        value: [
          DateTime.now().startOf('day'),
          DateTime.now().plus({ day: 1 }).startOf('day'),
        ],
      },
    ],
  },
};

export const WithPresetsBottom: Story = {
  args: {
    label: 'Narrow Layout Presets',
    formItemProps: {
      help: 'Presets appear at the bottom, saving width.',
    },
    // showTime: true,
    placement: 'bottomRight',

    presetsPlacement: 'bottom',
    presets: [
      {
        label: 'Last 7 Days',
        value: [
          DateTime.now().minus({ days: 7 }).startOf('day'),
          DateTime.now().endOf('day'),
        ],
      },
      {
        label: 'Next Month',
        value: [
          DateTime.now().plus({ months: 1 }).startOf('month'),
          DateTime.now().plus({ months: 1 }).endOf('month'),
        ],
      },
    ],
  },
};
