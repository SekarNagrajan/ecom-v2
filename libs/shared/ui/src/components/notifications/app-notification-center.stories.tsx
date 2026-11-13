// Created by Sekar Nagarajan (2026-11-13 03:20)
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppNotificationCenter } from './app-notification-center';
import type { AppNotificationItem } from './types';

const items: AppNotificationItem[] = [
  {
    id: '1',
    title: 'Bill of Lading released',
    message: 'EPIRINDMUM69602 is available for download.',
    timestamp: '13 Nov 2026 09:12',
    read: false,
    category: 'BL',
    categoryLabel: 'Bill of Lading',
    severity: 'success',
    reference: 'EPIRINDMUM69602',
  },
  {
    id: '2',
    title: 'SI cut-off in 6 hours',
    message: 'Submit shipping instructions for SVMDMU2694105.',
    timestamp: '13 Nov 2026 08:00',
    read: false,
    category: 'SI',
    categoryLabel: 'Shipping Instruction',
    severity: 'warning',
    reference: 'SVMDMU2694105',
  },
  {
    id: '3',
    title: 'Booking confirmed',
    timestamp: '12 Nov 2026 17:40',
    read: true,
    category: 'BOOKING',
    categoryLabel: 'Booking',
    severity: 'info',
    reference: 'BKON7313',
  },
];

const meta: Meta<typeof AppNotificationCenter> = {
  title: 'Notifications/AppNotificationCenter',
  component: AppNotificationCenter,
  args: {
    items,
    onMarkRead: () => {},
    onMarkAllRead: () => {},
    onItemClick: () => {},
    maxHeight: 360,
  },
};
export default meta;
type Story = StoryObj<typeof AppNotificationCenter>;

export const Default: Story = {};
export const AllRead: Story = { args: { items: items.map((i) => ({ ...i, read: true })) } };
export const Loading: Story = { args: { items: [], loading: true } };
export const Empty: Story = { args: { items: [] } };
