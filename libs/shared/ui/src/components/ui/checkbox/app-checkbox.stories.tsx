import type { Meta, StoryObj } from '@storybook/react';
import { Space } from 'antd';

import { AppCheckbox } from './app-checkbox';

const meta: Meta<typeof AppCheckbox> = {
  title: 'UI/Checkbox/AppCheckbox',
  component: AppCheckbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    labelPosition: {
      control: { type: 'select' },
      options: ['left', 'right', 'top', 'bottom'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    indeterminate: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: 'Accept terms and conditions',
  },
};

export const WithDescription: Story = {
  args: {
    children: 'Subscribe to newsletter',
    description: 'Receive weekly updates about our products and services.',
  },
};

export const LabelPositions: Story = {
  render: () => (
    <Space orientation="vertical" size="middle">
      <AppCheckbox>Default</AppCheckbox>
      <AppCheckbox labelPosition="left" isLoading>
        Left label
      </AppCheckbox>
      <AppCheckbox labelPosition="right" isLoading>
        Right label
      </AppCheckbox>
      <AppCheckbox labelPosition="top" isLoading>
        Top label
      </AppCheckbox>
      <AppCheckbox labelPosition="bottom" isLoading>
        Bottom label
      </AppCheckbox>
    </Space>
  ),
};

export const States: Story = {
  render: () => (
    <Space orientation="vertical" size="middle">
      <AppCheckbox>Unchecked</AppCheckbox>
      <AppCheckbox defaultChecked>Checked</AppCheckbox>
      <AppCheckbox indeterminate>Indeterminate</AppCheckbox>
      <AppCheckbox disabled>Disabled</AppCheckbox>
      <AppCheckbox isLoading>Loading</AppCheckbox>
    </Space>
  ),
};
