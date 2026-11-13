import type { Meta, StoryObj } from '@storybook/react';
import { Space } from 'antd';

import { AppEmptyState } from './app-empty-state';

const meta: Meta<typeof AppEmptyState> = {
  title: 'Components/AppEmptyState',
  component: AppEmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filtered', 'blank', 'error'],
    },
    artSize: {
      control: 'radio',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppEmptyState>;

export const Filtered: Story = {
  args: {
    variant: 'filtered',
    title: 'No bookings match your search',
    message:
      'Nothing came back for this date range and filter set. Widen the dates or clear the filters to see more results.',
    actions: [
      {
        key: 'clear',
        label: 'Clear filters',
        type: 'default',
        onClick: () => undefined,
      },
      {
        key: 'new',
        label: 'New booking',
        type: 'primary',
        onClick: () => undefined,
      },
    ],
  },
};

export const Blank: Story = {
  args: {
    variant: 'blank',
    artSize: 'sm',
    title: 'No bookings yet',
    message: 'Your bookings will appear here once you create one.',
    actions: [
      {
        key: 'schedules',
        label: 'Search schedules',
        type: 'default',
        onClick: () => undefined,
      },
      {
        key: 'new',
        label: 'New booking',
        type: 'primary',
        onClick: () => undefined,
      },
    ],
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    artSize: 'sm',
    title: "Couldn't load bill of lading data",
    message: "The request didn't complete. Check your connection and try again.",
    actions: [
      {
        key: 'retry',
        label: 'Try again',
        type: 'primary',
        onClick: () => undefined,
      },
    ],
  },
};

export const CompactNoActions: Story = {
  args: {
    variant: 'filtered',
    artSize: 'sm',
    title: 'No containers on this notice',
    message: 'Containers will show here when they are linked to this document.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <AppEmptyState
        variant="filtered"
        title="No records match your search"
        message="Widen the dates or clear the filters to see more results."
        actions={[
          {
            key: 'clear',
            label: 'Clear filters',
            onClick: () => undefined,
          },
        ]}
      />
      <AppEmptyState
        variant="blank"
        artSize="sm"
        title="No records yet"
        message="Items will appear here once they are created."
      />
      <AppEmptyState
        variant="error"
        artSize="sm"
        title="Couldn't load data"
        message="Check your connection and try again."
        actions={[
          {
            key: 'retry',
            label: 'Try again',
            type: 'primary',
            onClick: () => undefined,
          },
        ]}
      />
    </Space>
  ),
};
