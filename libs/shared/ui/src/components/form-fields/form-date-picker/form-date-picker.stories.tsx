/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, theme } from 'antd';
import { DateTime } from 'luxon';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { FormDatePicker } from './form-date-picker';
import { COMMON_DATE_PICKER_PRESETS } from './helpers/presets';
import type { FormDatePickerProps } from './types';

// -----------------------------------------------------------------------------
// 1. Generic Wrapper for Stories
//    - Sets up RHF
//    - Handles Zod Schema
//    - Displays the output value in real-time
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 1. Generic Wrapper
// -----------------------------------------------------------------------------
const DatePickerStoryWrapper = ({
  schemaOverride,
  ...props
}: FormDatePickerProps<any> & { schemaOverride?: z.ZodType<any> }) => {
  // Default Schema
  const defaultSchema = z.object({
    testDate: z.string({ error: 'Invalid date' }).nullable(),
  });

  // FIX 1: Use <any> here to silence strict Zod vs FieldValues mismatch in Storybook
  const { control, handleSubmit, trigger } = useForm<any>({
    resolver: zodResolver(schemaOverride || (defaultSchema as any)),
    mode: 'onChange',
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
        <FormDatePicker control={control} {...props} />

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
          <div className="font-bold mb-1 opacity-50">RHF Form State (UTC):</div>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </div>
      </Form>
    </form>
  );
};

// -----------------------------------------------------------------------------
// 2. Metadata
// -----------------------------------------------------------------------------
const meta: Meta<typeof FormDatePicker> = {
  component: FormDatePicker,
  title: 'Components/FormDatePicker',
  // Use our smart wrapper for all stories
  render: (args) => <DatePickerStoryWrapper {...args} />,
  argTypes: {
    picker: {
      control: 'radio',
      options: ['date', 'week', 'month', 'year', 'quarter'],
      description: 'The type of picker to display',
    },
    showTime: {
      control: 'boolean',
      description: 'Enable time selection (only for date picker)',
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    multiple: { control: 'boolean' },
    formItemProps: {
      validateStatus: {
        control: 'select',
        options: [undefined, 'success', 'warning', 'error', 'validating'],
      },
    },
  },
  args: {
    label: 'Select Date',
    name: 'testDate',
    required: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof FormDatePicker>;

// -----------------------------------------------------------------------------
// 3. Stories
// -----------------------------------------------------------------------------

/**
 * Standard Date Picker.
 * Change the **Timezone** in the toolbar above to see values shift automatically.
 */
export const Default: Story = {
  args: {
    picker: 'date',
    placeholder: 'Select a date...',
    presets: COMMON_DATE_PICKER_PRESETS.date('UTC'),
  },
};

/**
 * Date + Time Picker.
 * 12h/24h format is determined by the Global Config (Toolbar).
 * Change `Locale` to see format changes.
 */
export const WithTime: Story = {
  args: {
    picker: 'date',
    showTime: true,
    label: 'Appointment Time',
    className: 'w-auto',
  },
};

/**
 * Different Granularity Modes (Week, Month, Year).
 * The format string updates automatically.
 */
export const MonthPicker: Story = {
  args: {
    picker: 'month',
    label: 'Select Month',
  },
};

export const YearPicker: Story = {
  args: {
    picker: 'year',
    label: 'Select Year',
  },
};

/**
 * Multiple Selection.
 * Allows picking multiple days. Returns an array of UTC strings.
 * Note: `showTime` is not supported in multiple mode due to UI limitations.
 */
export const MultipleDates: Story = {
  args: {
    multiple: true,
    picker: 'date',
    label: 'Select Vacation Days',
  },
};

/**
 * Date Restrictions (Past/Future).
 * - `disablePast`: Cannot select yesterday or before.
 * - `disableFuture`: Cannot select tomorrow or after.
 */
export const DisablePast: Story = {
  args: {
    disablePast: true,
    label: 'Future Date Only',
    formItemProps: {
      help: 'Try selecting a date in the past (it should be grayed out)',
    },
  },
};

/**
 * Min/Max Date Restrictions.
 * Restricts selection to a 2-week window starting today.
 */
export const MinMaxWindow: Story = {
  render: (args: any) => {
    // Dynamic dates relative to "Now"
    const min = DateTime.now();
    const max = DateTime.now().plus({ weeks: 2 });

    return (
      <DatePickerStoryWrapper
        {...args}
        minDate={min}
        maxDate={max}
        help={`Selection limited to: ${min.toFormat('dd MMM')} - ${max.toFormat(
          'dd MMM'
        )}`}
      />
    );
  },
  args: {
    label: 'Two Week Window',
  },
};

/**
 * Validation Error State.
 * This story forces a Schema Requirement.
 * Click "Submit" to see the error state.
 */
export const ValidationError: Story = {
  render: (args: any) => {
    // Schema that requires a date
    const requiredSchema = z.object({
      testDate: z.iso.datetime({ error: 'This field is absolutely required' }),
    });

    return <DatePickerStoryWrapper {...args} schemaOverride={requiredSchema} />;
  },
  args: {
    required: true,
    label: 'Required Field',
    // help: 'Click Submit to see validation error',
  },
};

/**
 * Custom Visual States.
 * Demonstrates overriding status manually (e.g. for Warnings).
 */
export const CustomWarning: Story = {
  args: {
    formItemProps: {
      validateStatus: 'warning',
      help: 'This date seems unusually far in the future.',
    },
    hasFeedback: true,
    label: 'Warning State',
  },
};

export const LoadingState: Story = {
  args: {
    formItemProps: {
      validateStatus: 'validating',
      help: 'Checking availability...',
    },
    hasFeedback: true,
    label: 'Async Validation',
  },
};
