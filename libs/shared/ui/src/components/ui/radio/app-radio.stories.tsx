import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { AppRadio } from './app-radio';

const meta: Meta<typeof AppRadio> = {
  title: 'UI/Radio/AppRadio',
  component: AppRadio,
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: 'Accept terms',
    value: 'terms',
  },
};

export const WithDescription: Story = {
  args: {
    children: 'Subscribe to newsletter',
    description: 'Receive weekly updates about our products and services.',
    value: 'newsletter',
  },
};

export const LabelPositions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AppRadio labelPosition="left" value="left1">
        Left label 1
      </AppRadio>
      <AppRadio labelPosition="right" value="right1">
        Right label 1
      </AppRadio>
      <AppRadio labelPosition="top" value="top1">
        Top label 1
      </AppRadio>
      <AppRadio labelPosition="bottom" value="bottom1">
        Bottom label 1
      </AppRadio>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AppRadio value="unchecked">Unchecked</AppRadio>
      <AppRadio value="checked" checked>
        Checked
      </AppRadio>
      <AppRadio value="disabled" disabled>
        Disabled
      </AppRadio>
      <AppRadio value="loading" isLoading>
        Loading
      </AppRadio>
    </div>
  ),
};

const RadioComponentDemo = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AppRadio
        value="option1"
        checked={selectedValue === 'option1'}
        onChange={(e) => setSelectedValue(e.target.value)}
      >
        Option 1
      </AppRadio>
      <AppRadio
        value="option2"
        checked={selectedValue === 'option2'}
        onChange={(e) => setSelectedValue(e.target.value)}
      >
        Option 2
      </AppRadio>
      <AppRadio
        value="option3"
        checked={selectedValue === 'option3'}
        onChange={(e) => setSelectedValue(e.target.value)}
      >
        Option 3
      </AppRadio>
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Selected: {selectedValue || 'None'}
      </div>
    </div>
  );
};

export const MultipleRadios: Story = {
  render: () => <RadioComponentDemo />,
};
