import type { Meta, StoryObj } from '@storybook/react';
import { DateTime } from 'luxon';

import { AppCalendar } from './app-calendar';
import type { CalendarEvent } from './calendar-types';

const meta: Meta<typeof AppCalendar> = {
  title: 'UI/Calendar/AppCalendar',
  component: AppCalendar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          height: '800px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Quarterly Review',
    start: DateTime.now().set({ hour: 9, minute: 0 }).toISO(),
    end: DateTime.now().set({ hour: 10, minute: 0 }).toISO(),
    kind: 'meeting',
    variant: 'meeting',
  },
  {
    id: '2',
    title: 'Call With Client',
    start: DateTime.now().set({ hour: 11, minute: 0 }).toISO(),
    end: DateTime.now().set({ hour: 11, minute: 30 }).toISO(),
    kind: 'call',
    variant: 'activity',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Follow-up Task',
    start: DateTime.now()
      .plus({ days: 1 })
      .set({ hour: 14, minute: 0 })
      .toISO(),
    end: DateTime.now().plus({ days: 1 }).set({ hour: 14, minute: 30 }).toISO(),
    kind: 'task',
    variant: 'activity',
    priority: 'high',
  },
];

export const Default: Story = {
  args: {
    events: sampleEvents,
    header: true,
    weekends: true,
    height: 'auto',
    initialView: 'dayGridMonth',
    views: ['dayGridMonth', 'timeGridWeek', 'timeGridDay'],
    onEventClick: (event) => console.log('Event clicked:', event),
    onDateSelect: (selection) => console.log('Date selected:', selection),
  },
};
