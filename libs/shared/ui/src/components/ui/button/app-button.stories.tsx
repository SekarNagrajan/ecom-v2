import {
  SearchOutlined,
  DownloadOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/react';
import { Space, message } from 'antd';

import { AppButton } from './app-button';

const meta: Meta<typeof AppButton> = {
  title: 'Components/AppButton',
  component: AppButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    appVariant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'link', 'danger', 'success'],
    },
    size: {
      control: 'radio',
      options: ['small', 'middle', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppButton>;

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

export const AllVariants: Story = {
  render: () => (
    <Space wrap>
      <AppButton appVariant="primary">Primary</AppButton>
      <AppButton appVariant="secondary">Secondary</AppButton>
      <AppButton appVariant="success">Success</AppButton>
      <AppButton appVariant="danger">Danger</AppButton>
      <AppButton appVariant="ghost">Ghost</AppButton>
      <AppButton appVariant="link">Link</AppButton>
    </Space>
  ),
};

/* -------------------------------------------------------------------------- */
/* Rate Limiting Demo                                                         */
/* -------------------------------------------------------------------------- */

export const RateLimited: Story = {
  args: {
    appVariant: 'primary',
    children: 'Send Email',
    enableRateLimit: true,
    rateLimitDuration: 5000, // 5 seconds
    onClick: () => message.info('Email Sent! Button disabled for 5s.'),
  },
};

/* -------------------------------------------------------------------------- */
/* Icons & Shapes                                                             */
/* -------------------------------------------------------------------------- */

export const WithIcons: Story = {
  render: () => (
    <Space wrap>
      <AppButton icon={<SearchOutlined />}>Search</AppButton>
      <AppButton appVariant="success" icon={<DownloadOutlined />}>
        Download
      </AppButton>
      <AppButton
        appVariant="danger"
        shape="circle"
        icon={<PoweroffOutlined />}
        title="Log out"
      />
    </Space>
  ),
};

/* -------------------------------------------------------------------------- */
/* States                                                                     */
/* -------------------------------------------------------------------------- */

export const States: Story = {
  render: () => (
    <Space wrap>
      <AppButton loading>Loading</AppButton>
      <AppButton disabled>Disabled</AppButton>
      <AppButton appVariant="success" loading>
        Saving...
      </AppButton>
    </Space>
  ),
};

/* -------------------------------------------------------------------------- */
/* Block (Full Width)                                                         */
/* -------------------------------------------------------------------------- */

export const BlockButton: Story = {
  args: {
    block: true,
    appVariant: 'primary',
    children: 'Full Width Button',
  },
  decorators: [
    (Story) => (
      <div className="w-96 p-4 border border-dashed border-gray-300">
        <Story />
      </div>
    ),
  ],
};
