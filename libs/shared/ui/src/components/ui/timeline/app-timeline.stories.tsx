// Created by Sekar Nagarajan (2026-11-13 02:00)
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppTimeline } from './app-timeline';
import type { AppTimelineItem } from './types';

const journey: AppTimelineItem[] = [
  {
    id: '1',
    title: 'Booking confirmed',
    subtitle: 'Chennai, IN',
    timestamp: '02 Nov 2026 09:14',
    status: 'done',
  },
  {
    id: '2',
    title: 'Gate in',
    subtitle: 'INMAA Terminal 2',
    timestamp: '05 Nov 2026 16:40',
    status: 'done',
  },
  {
    id: '3',
    title: 'Loaded on vessel',
    subtitle: 'MV NORDIC STAR 0426W',
    timestamp: '06 Nov 2026 22:10',
    status: 'current',
  },
  { id: '4', title: 'Transhipment', subtitle: 'Colombo, LK', status: 'upcoming' },
  { id: '5', title: 'Discharged', subtitle: 'Jebel Ali, AE', status: 'upcoming' },
  { id: '6', title: 'Delivered', subtitle: 'Dubai, AE', status: 'upcoming' },
];

const feed: AppTimelineItem[] = [
  {
    id: 'a',
    title: 'Amendment submitted',
    subtitle: 'Priya N. · 12 Nov 2026 10:02',
    meta: 'Container count 2 → 3',
    status: 'neutral',
  },
  {
    id: 'b',
    title: 'Booking approved',
    subtitle: 'Agency desk · 11 Nov 2026 15:48',
    status: 'neutral',
  },
  {
    id: 'c',
    title: 'Booking submitted',
    subtitle: 'Priya N. · 11 Nov 2026 14:30',
    status: 'neutral',
  },
];

const meta: Meta<typeof AppTimeline> = {
  title: 'UI/AppTimeline',
  component: AppTimeline,
  args: { items: journey, orientation: 'horizontal', ariaLabel: 'Cargo journey' },
};
export default meta;

type Story = StoryObj<typeof AppTimeline>;

export const HorizontalJourney: Story = {};
export const VerticalJourney: Story = { args: { orientation: 'vertical', maxHeight: 360 } };
export const ActivityFeed: Story = {
  args: { items: feed, orientation: 'vertical', size: 'sm', showStatusBadge: false },
};
export const WithError: Story = {
  args: {
    items: journey.map((i) => (i.id === '3' ? { ...i, status: 'error', badge: 'Rolled over' } : i)),
  },
};
export const Loading: Story = { args: { items: [], loading: true, orientation: 'vertical' } };
export const Empty: Story = {
  args: { items: [], orientation: 'vertical', emptyText: 'No movement events recorded.' },
};
