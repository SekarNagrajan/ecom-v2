import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Form, App, theme, Divider, Alert } from 'antd';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useAppConfig } from '../../../hooks';
import { FormInputNumber } from './form-input-number';
import type { FormInputNumberProps } from './types';

/* -------------------------------------------------------------------------- */
/* Zod Schema                                                                 */
/* -------------------------------------------------------------------------- */

const FormSchema = z.object({
  age: z
    .number({ error: 'Age is required' })
    .min(18, 'Must be at least 18')
    .max(100, 'Must be under 100'),
  price: z
    .string({ error: 'Price is required' })
    .min(0, 'Price cannot be negative'),
  weight: z
    .number({ error: 'Weight is required' })
    .min(0, 'Weight cannot be negative'),
  quantity: z
    .number({ error: 'Quantity required' })
    .int('Must be an integer')
    .min(1, 'At least 1 item')
    .max(9, 'Max 9 Items'),
  percentage: z
    .number({ error: 'Invalid percentage' })
    .min(0)
    .max(100, 'Max 100%'),
  precision: z.string({ error: 'Invalid precision' }).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

/* -------------------------------------------------------------------------- */
/* Debug Viewer & Config Info                                                 */
/* -------------------------------------------------------------------------- */

function DebugPanel() {
  const values = useWatch();
  const { token } = theme.useToken();
  const { formattingRegion, currency, currencyDisplay } = useAppConfig();

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* Config State */}
      <Alert
        type="info"
        showIcon
        title="Current Global Context"
        description={
          <ul className="list-disc pl-4 text-xs mt-1">
            <li>
              <strong>Region (Intl):</strong> {formattingRegion}
            </li>
            <li>
              <strong>Currency:</strong> {currency} ({currencyDisplay})
            </li>
            <li>
              <strong>Separators:</strong>{' '}
              {formattingRegion === 'de-DE'
                ? '1.000,00 (EU)'
                : '1,000.00 (US/UK)'}
            </li>
          </ul>
        }
      />

      {/* Form State */}
      <div
        style={{
          padding: 12,
          backgroundColor: token.colorFillQuaternary,
          borderRadius: token.borderRadius,
          fontFamily: 'monospace',
          fontSize: 12,
        }}
      >
        <strong>React Hook Form State (Raw Values):</strong>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wrapper Component                                                          */
/* -------------------------------------------------------------------------- */

const FormWrapper = (props: FormInputNumberProps<FormValues>) => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    mode: 'onSubmit',
    defaultValues: {
      age: 25,
      price: '1250.5',
      weight: 5000.75,
      quantity: 1,
      percentage: 50,
      precision: '10.555',
    },
  });

  const { handleSubmit, control } = methods;

  return (
    <App>
      <div className="max-w-md p-4 w-full">
        <FormProvider {...methods}>
          <Form
            layout="vertical"
            onFinish={handleSubmit((data) => console.log('Success:', data))}
          >
            <FormInputNumber {...props} control={control} />

            <div className="mt-4 flex gap-2">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button onClick={() => methods.trigger()}>Validate</Button>
              <Button onClick={() => methods.reset()}>Reset</Button>
            </div>

            <Divider />
            <DebugPanel />
          </Form>
        </FormProvider>
      </div>
    </App>
  );
};

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof FormInputNumber> = {
  title: 'Components/FormInputNumber',
  component: FormInputNumber,
  render: (args) => (
    <FormWrapper {...(args as FormInputNumberProps<FormValues>)} />
  ),
  parameters: { layout: 'centered' },
  args: {
    name: 'age',
    label: 'Age',
    placeholder: 'Enter value',
  },
};

export default meta;
type Story = StoryObj<typeof FormInputNumber>;

/* -------------------------------------------------------------------------- */
/* Stories                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Basic usage.
 * Standard numeric input.
 * Uses the Global Locale for decimal separators automatically.
 */
export const Basic: Story = {
  args: {
    name: 'age',
    label: 'Age',
    required: true,
    numericMode: 'positive-integer',
  },
};

/**
 * Global Currency Formatting.
 *
 * 1. Open the Storybook Toolbar (top).
 * 2. Change "Currency" to EUR or JPY.
 * 3. Change "Format Region" to Germany (de-DE).
 *
 * Result: The input automatically formats separators (1.000,00) and adds the correct symbol (€).
 * Note: No `formatter` prop is passed here! It's all context.
 */
export const GlobalCurrency: Story = {
  args: {
    name: 'price',
    label: 'Price (Context Aware)',
    isCurrency: true, // <--- This enables the global formatting magic
    wrapperClassName: 'w-full',
    numericMode: 'positive',
    enableFormatting: true,
    valueType: 'string',
    allowClear: true,
  },
};

/**
 * Non-Currency Formatting (Measurements).
 *
 * Demonstrates how "Format Region" affects standard numbers.
 * - US: 5,000.75
 * - DE: 5.000,75
 */
export const CargoWeight: Story = {
  args: {
    name: 'weight',
    label: 'Cargo Weight (kg)',
    numericMode: 'positive', // Allows decimals, blocks text
    min: 0,
    suffix: 'kg',
  },
};

/**
 * Positive Integer (0-9).
 *
 * Useful for quantities.
 * - Blocks decimal points (even if you type comma in Germany).
 * - Blocks negative signs.
 */
export const QuantityInteger: Story = {
  args: {
    name: 'quantity',
    label: 'Quantity (Integer Only)',
    numericMode: 'positive-integer', // Strict parsing
    min: 1,
    max: 9,
    formItemProps: {
      extra: 'Try typing decimals or negative numbers.',
    },
  },
};

/**
 * Percentage with Suffix.
 * Standard formatting.
 */
export const Percentage: Story = {
  args: {
    name: 'percentage',
    label: 'Discount',
    isPercentage: true,
    suffix: '%',
  },
};

/**
 * High Precision String Mode.
 *
 * Uses `stringMode` to avoid JavaScript floating point errors (e.g. 0.1 + 0.2).
 * Useful for Crypto or Scientific measurements.
 */
export const HighPrecision: Story = {
  args: {
    name: 'precision',
    label: 'Scientific Measure',
    step: 0.001,
    precision: 3, // Forces 3 decimal places
    stringMode: true,
  },
};

/**
 * Mobile Native Input.
 *
 * Setting `useNativeKeyboard` forces `type="number"`.
 * WARNING: This disables advanced formatting (Currency symbols, separators)
 * because browser native inputs don't support custom display values.
 */
export const MobileNative: Story = {
  args: {
    name: 'age',
    label: 'Mobile Age Input',
    min: 18,
    // useNativeKeyboard: true,
    placeholder: 'Opens numeric keypad on phone',
    formItemProps: {
      extra: 'Formatting is disabled in native mode.',
    },
  },
};

export const Disabled: Story = {
  args: {
    name: 'age',
    label: 'Disabled Input',
    disabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    name: 'price',
    label: 'Read Only (Calculated)',
    isCurrency: true,
    readOnly: true,
  },
};
