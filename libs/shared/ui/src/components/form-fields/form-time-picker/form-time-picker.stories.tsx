/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, theme } from 'antd';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormTimePicker } from './form-time-picker';
import { COMMON_TIME_PICKER_PRESETS } from './helpers/presets';
import type { FormTimePickerProps } from './types';

// -----------------------------------------------------------------------------
// 1. Generic Wrapper for Stories
// -----------------------------------------------------------------------------
const TimePickerStoryWrapper = ({
  schemaOverride,
  ...props
}: FormTimePickerProps<any> & { schemaOverride?: z.ZodType<any> }) => {
  // Default Schema
  const defaultSchema = z.object({
    testTime: z.iso.datetime({ error: 'Invalid UTC datestring' }),
  });

  const { control, handleSubmit, trigger } = useForm<any>({
    resolver: zodResolver(schemaOverride || (defaultSchema as any)),
    mode: 'onChange',
    defaultValues: {
      testTime: '',
    },
  });

  const { token } = theme.useToken();

  const values = useWatch({ control });

  return (
    <form
      onSubmit={handleSubmit((data) => console.log('SUBMITTED:', data))}
      className="flex flex-col gap-6 w-full max-w-lg"
      noValidate
    >
      <Form layout="vertical" component={false}>
        <FormTimePicker control={control} {...props} />

        <div className="flex gap-2">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button onClick={() => trigger()}>Trigger Validation</Button>
        </div>

        <div
          style={{
            backgroundColor: token.colorFillQuaternary,
            color: token.colorText,
            borderColor: token.colorBorder,
          }}
          className="p-3 rounded text-xs font-mono border"
        >
          <div className="font-bold mb-1 opacity-50">
            RHF Form State (String):
          </div>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </div>
      </Form>
    </form>
  );
};

// -----------------------------------------------------------------------------
// 2. Metadata
// -----------------------------------------------------------------------------
const meta: Meta<typeof FormTimePicker> = {
  component: FormTimePicker,
  title: 'Components/FormTimePicker',
  render: (args) => <TimePickerStoryWrapper {...args} />,
  argTypes: {
    format: {
      control: 'text',
      description: 'Time format string (e.g., HH:mm)',
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    disablePast: { control: 'boolean' },
    disableFuture: { control: 'boolean' },
    minuteStep: { control: { type: 'number', min: 1, max: 60 } },
    formItemProps: {
      validateStatus: {
        control: 'select',
        options: [undefined, 'success', 'warning', 'error', 'validating'],
      },
    },
  },
  args: {
    label: 'Select Time',
    name: 'testTime',
    required: false,
    disabled: false,
    disablePast: false,
    disableFuture: false,
  },
};

export default meta;
type Story = StoryObj<typeof FormTimePicker>;

// -----------------------------------------------------------------------------
// 3. Stories
// -----------------------------------------------------------------------------

/**
 * Standard Time Picker.
 */
export const Default: Story = {
  args: {
    placeholder: 'Select time...',
    showSecond: false,
  },
};

/**
 * With Presets.
 * Allows quick selection of common times.
 * Presets are passed as string values ("HH:mm:ss").
 */
export const WithPresets: Story = {
  args: {
    label: 'Meeting Start',
    presets: COMMON_TIME_PICKER_PRESETS.time(),
  },
};

/**
 * Past/Future Restrictions.
 * Uses current time (Luxon DateTime.now()) as the anchor.
 */
export const DisablePastTime: Story = {
  args: {
    disablePast: true,
    label: 'Future Time Only',
    formItemProps: {
      help: 'You cannot select a time earlier than now.',
    },
  },
};

/**
 * Granularity (Steps).
 * Restrict minutes to 15-minute intervals.
 */
export const FifteenMinuteIntervals: Story = {
  args: {
    label: 'Appointment Slot',
    minuteStep: 15,
    format: 'HH:mm', // Hide seconds for cleaner UI
  },
};

/**
 * Custom Time Restrictions (Business Hours).
 * Uses the `disabledTime` prop to block out non-business hours (e.g., before 9 AM, after 5 PM).
 */
export const BusinessHoursOnly: Story = {
  args: {
    label: 'Business Hours (9am - 5pm)',
    format: 'HH:mm',
    disabledTime: () => {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < 24; i++) {
            // Disable 0-8 and 18-23
            if (i < 9 || i > 17) hours.push(i);
          }
          return hours;
        },
      };
    },
  },
};

/**
 * Validation Error State.
 * Forces a Zod schema requirement.
 */
export const ValidationError: Story = {
  render: (args: any) => {
    // Schema that requires a string with at least 1 character
    const requiredSchema = z.object({
      testTime: z.string().min(1, 'Time is required'),
    });

    return <TimePickerStoryWrapper {...args} schemaOverride={requiredSchema} />;
  },
  args: {
    required: true,
    label: 'Required Time',
    formItemProps: {
      help: 'Click Submit to see validation error',
    },
  },
};

/**
 * Custom Visual States.
 * Warning state for specific edge cases.
 */
export const CustomWarning: Story = {
  args: {
    formItemProps: {
      validateStatus: 'warning',
      help: 'This time slot is high traffic.',
    },
    hasFeedback: true,
    label: 'Warning State',
  },
};
