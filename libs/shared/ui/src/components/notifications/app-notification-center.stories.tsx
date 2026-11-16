// Modified by Sekar Nagarajan (2026-11-16 14:30) — popover 2b story
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppNotificationCenter } from './app-notification-center';
import type { AppNotificationItem } from './types';

const items: AppNotificationItem[] = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Booking BKG2611-00482 is confirmed for CNSHA → USLAX.',
    timestamp: '17m ago',
    timestampIso: new Date(Date.now() - 17 * 60_000).toISOString(),
    read: true,
    category: 'BOOKING',
    categoryShortLabel: 'Booking',
    severity: 'success',
    reference: 'BKG2611-00482',
    action: { label: 'View booking', href: '/booking/BKG2611-00482' },
  },
  {
    id: '2',
    title: 'Payment Failed',
    message: 'Card payment for invoice INV-88213 was declined by the gateway.',
    timestamp: '1h ago',
    timestampIso: new Date(Date.now() - 60 * 60_000).toISOString(),
    read: false,
    category: 'PAYMENT',
    categoryShortLabel: 'Payment',
    severity: 'error',
    reference: 'INV-88213',
    action: { label: 'Retry payment', href: '/payments' },
  },
  {
    id: '3',
    title: 'SI Submitted',
    message: 'Shipping instruction for SVMDMU2694105 was submitted.',
    timestamp: 'Yesterday, 17:32',
    timestampIso: new Date(Date.now() - 26 * 60 * 60_000).toISOString(),
    read: true,
    category: 'SI',
    categoryShortLabel: 'SI',
    severity: 'info',
    reference: 'SVMDMU2694105',
    action: { label: 'Open SI', href: '/shipping-instruction/SVMDMU2694105' },
  },
  {
    id: '4',
    title: 'ETA Updated',
    message: 'Vessel ETA at USLAX moved to 22 Nov 06:00.',
    timestamp: '14 Nov, 16:40',
    timestampIso: '2026-11-14T16:40:00.000Z',
    read: true,
    category: 'SCHEDULE',
    categoryShortLabel: 'Schedule',
    severity: 'warning',
    reference: 'VSL-4412',
    action: { label: 'View schedule', href: '/schedules' },
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

export const Popover: Story = {
  args: {
    variant: 'popover',
    categoryFilter: true,
    categories: [
      { key: 'BOOKING', label: 'Booking' },
      { key: 'SI', label: 'SI' },
      { key: 'BL', label: 'B/L' },
      { key: 'SCHEDULE', label: 'Schedule' },
      { key: 'PAYMENT', label: 'Payment' },
    ],
    onAction: () => {},
    footer: <button type="button">Manage alert preferences</button>,
    maxHeight: undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 380, border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};
