/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, theme } from 'antd';
import { DateTime } from 'luxon';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormTimeRangePicker } from './form-time-range-picker';
import type { FormTimeRangePickerProps } from './types';

/* -------------------------------------------------------------------------- */
/* Zod schema                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Stored as [start, end]
 * where each value is "HH:mm:ss" | null
 */
const TimeRangeSchema = z
  .tuple([
    z.iso.datetime().nullable().optional(),
    z.iso.datetime().nullable().optional(),
  ])
  .superRefine(([start, end], ctx) => {
    const fail = (message: string) => {
      ctx.addIssue({
        code: 'custom',
        message,
        path: [],
      });
    };

    if (!start || !end) {
      fail('Invalid time');
      return;
    }

    const s = DateTime.fromISO(start);
    const e = DateTime.fromISO(end);

    if (!s.isValid || !e.isValid) {
      fail('Invalid time');
      return;
    }

    if (e <= s) {
      fail('End time must be after start time');
    }
  });

const FormSchema = z.object({
  slot: TimeRangeSchema,
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
      <div className="mb-1 font-bold opacity-60">RHF Form State (String)</div>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form wrapper (used by all stories)                                          */
/* -------------------------------------------------------------------------- */

function FormWrapper(props: FormTimeRangePickerProps<any>) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      slot: [undefined, undefined],
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, control } = methods;

  return (
    <FormProvider {...methods}>
      <form
        className="flex max-w-sm flex-col gap-4"
        onSubmit={handleSubmit((data) => {
          console.log('SUBMITTED:', data);
        })}
        noValidate
      >
        <Form layout="vertical" component={false}>
          <FormTimeRangePicker {...props} name="slot" control={control} />

          <div className="flex gap-2">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button onClick={() => trigger()}>Trigger Validation</Button>
          </div>

          <DebugValue name="slot" />
        </Form>
      </form>
    </FormProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Story meta                                                                  */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof FormTimeRangePicker> = {
  title: 'Components/FormTimeRangePicker',
  component: FormTimeRangePicker,
  render: (args) => <FormWrapper {...args} />,
  args: {
    name: 'slot',
    label: 'Select Time Range',
    required: false,
    disabled: false,
  },
  argTypes: {
    disablePast: { control: 'boolean' },
    disableFuture: { control: 'boolean' },
    minimumGap: {
      control: { type: 'number', min: 0, step: 5 },
      description: 'Minimum gap in minutes between start and end',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormTimeRangePicker>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                     */
/* -------------------------------------------------------------------------- */

export const Basic: Story = {
  args: {
    showSecond: false,
    // help: 'Pick any start and end time',
  },
};

export const MinimumGap30Min: Story = {
  args: {
    label: 'Meeting Slot',
    formItemProps: {
      help: 'Minimum gap of 30 minutes enforced',
    },
    minimumGap: 30,
  },
};

export const MinimumGap90Min: Story = {
  args: {
    label: 'Long Session',
    formItemProps: {
      help: 'Minimum gap of 90 minutes',
    },
    minimumGap: 90,
  },
};

export const DisablePastWithGap: Story = {
  args: {
    label: 'Future Slot Only',
    formItemProps: {
      help: 'Past times disabled + 30 min gap',
    },
    disablePast: true,
    minimumGap: 30,
  },
};

export const DisableFutureWithGap: Story = {
  args: {
    label: 'Past Slot Only',
    formItemProps: {
      help: 'Future times disabled + 15 min gap',
    },
    disableFuture: true,
    minimumGap: 15,
  },
};

export const LunchBlockedWithGap: Story = {
  args: {
    label: 'No Lunch Meetings',
    formItemProps: {
      help: '13:00-14:00 blocked, 30 min gap',
    },
    minimumGap: 30,
    disabledTime: () => ({
      disabledHours: () => [13],
    }),
  },
};

export const WithPresets: Story = {
  args: {
    label: 'Quick Slots',
    minimumGap: 30,
    presets: [
      {
        label: 'Morning',
        value: [
          DateTime.now().set({ hour: 9, minute: 0 }),
          DateTime.now().set({ hour: 10, minute: 0 }),
        ],
      },
      {
        label: 'Afternoon',
        value: [
          DateTime.now().set({ hour: 14, minute: 0 }),
          DateTime.now().set({ hour: 15, minute: 0 }),
        ],
      },
    ],
  },
};
