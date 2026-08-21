import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { AppRadioGroup } from './app-radio-group';

const meta: Meta<typeof AppRadioGroup> = {
  title: 'UI/Radio Group/AppRadioGroup',
  component: AppRadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    vertical: {
      control: 'boolean',
    },
    optionType: {
      control: { type: 'select' },
      options: ['default', 'button'],
    },
    buttonStyle: {
      control: { type: 'select' },
      options: ['outline', 'solid'],
    },
    size: {
      control: { type: 'select' },
      options: ['large', 'middle', 'small'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Pear', value: 'pear' },
  { label: 'Orange', value: 'orange' },
];

const buttonOptions = ['Hangzhou', 'Shanghai', 'Beijing', 'Chengdu'];

function BasicRadioGroup() {
  const [value, setValue] = useState<string>('apple');

  return (
    <AppRadioGroup
      options={basicOptions}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

function VerticalRadioGroup() {
  const [value, setValue] = useState<string>('apple');

  return (
    <AppRadioGroup
      options={basicOptions}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      vertical
    />
  );
}

function ButtonStyleRadioGroup() {
  const [value, setValue] = useState<string>('Hangzhou');

  return (
    <AppRadioGroup
      options={buttonOptions}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      optionType="button"
    />
  );
}

function ButtonStyleSolidRadioGroup() {
  const [value, setValue] = useState<string>('Hangzhou');

  return (
    <AppRadioGroup
      options={buttonOptions}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      optionType="button"
      buttonStyle="solid"
    />
  );
}

export const Basic: Story = {
  render: () => <BasicRadioGroup />,
};

export const Vertical: Story = {
  render: () => <VerticalRadioGroup />,
};

export const ButtonStyle: Story = {
  render: () => <ButtonStyleRadioGroup />,
};

export const ButtonStyleSolid: Story = {
  render: () => <ButtonStyleSolidRadioGroup />,
};

function ButtonSizesRadioGroup() {
  const [largeValue, setLargeValue] = useState<string>('Hangzhou');
  const [middleValue, setMiddleValue] = useState<string>('Shanghai');
  const [smallValue, setSmallValue] = useState<string>('Beijing');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h4>Large</h4>
        <AppRadioGroup
          options={buttonOptions}
          value={largeValue}
          onChange={(e) => setLargeValue(e.target.value)}
          optionType="button"
          size="large"
        />
      </div>
      <div>
        <h4>Middle (default)</h4>
        <AppRadioGroup
          options={buttonOptions}
          value={middleValue}
          onChange={(e) => setMiddleValue(e.target.value)}
          optionType="button"
          size="middle"
        />
      </div>
      <div>
        <h4>Small</h4>
        <AppRadioGroup
          options={buttonOptions}
          value={smallValue}
          onChange={(e) => setSmallValue(e.target.value)}
          optionType="button"
          size="small"
        />
      </div>
    </div>
  );
}

export const ButtonSizes: Story = {
  render: () => <ButtonSizesRadioGroup />,
};

function WithNameRadioGroup() {
  const [value, setValue] = useState<string>('apple');

  return (
    <form>
      <AppRadioGroup
        options={basicOptions}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        name="fruit"
      />
    </form>
  );
}

export const WithName: Story = {
  render: () => <WithNameRadioGroup />,
};

export const Disabled: Story = {
  args: {
    options: basicOptions,
    value: 'apple',
    disabled: true,
  },
};
