import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { AppCheckboxGroup } from './app-checkbox-group';

const meta: Meta<typeof AppCheckboxGroup> = {
  title: 'UI/Checkbox Group/AppCheckboxGroup',
  component: AppCheckboxGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showSelectAll: {
      control: 'boolean',
    },
    direction: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    maxSelection: {
      control: 'number',
    },
    minSelection: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Pear', value: 'pear' },
  { label: 'Orange', value: 'orange' },
  { label: 'Banana', value: 'banana' },
];

function BasicCheckboxGroup() {
  const [value, setValue] = useState<(string | number)[]>(['apple']);

  return (
    <AppCheckboxGroup
      options={sampleOptions}
      value={value}
      onChange={setValue}
    />
  );
}

function WithSelectAllCheckboxGroup() {
  const [value, setValue] = useState<(string | number)[]>([]);

  return (
    <AppCheckboxGroup
      options={sampleOptions}
      value={value}
      onChange={setValue}
      showSelectAll
      selectAllLabel="Select All Fruits"
    />
  );
}

function HorizontalCheckboxGroup() {
  const [value, setValue] = useState<(string | number)[]>([]);

  return (
    <AppCheckboxGroup
      options={sampleOptions}
      value={value}
      onChange={setValue}
      direction="horizontal"
      showSelectAll
    />
  );
}

function WithLimitsCheckboxGroup() {
  const [value, setValue] = useState<(string | number)[]>([]);

  return (
    <AppCheckboxGroup
      options={sampleOptions}
      value={value}
      onChange={setValue}
      showSelectAll
      maxSelection={2}
      minSelection={1}
      onValidationError={(error) => console.log('Validation error:', error)}
    />
  );
}

export const Basic: Story = {
  render: () => <BasicCheckboxGroup />,
};

export const WithSelectAll: Story = {
  render: () => <WithSelectAllCheckboxGroup />,
};

export const Horizontal: Story = {
  render: () => <HorizontalCheckboxGroup />,
};

export const WithLimits: Story = {
  render: () => <WithLimitsCheckboxGroup />,
};
