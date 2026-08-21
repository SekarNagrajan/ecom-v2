import { type EventContentArg, type CalendarOptions } from '@fullcalendar/core';
import type { DateTime } from 'luxon';
import type { CSSProperties, ReactNode } from 'react';

export type CalendarEventType = 'teams-meeting' | 'activity-task';
export type ActivityType = 'call' | 'activity' | 'meeting' | 'visit';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus =
  | 'open'
  | 'in-progress'
  | 'negotiation'
  | 'review'
  | 'closed';
export type RepeatOption = 'no-repeat' | 'daily' | 'weekly' | 'monthly';

export type CalendarEventVariant = 'activity' | 'meeting' | 'default';

export type CalendarEventPriority = 'high' | 'medium' | 'low' | string;

export type CalendarViewType =
  | 'dayGridMonth'
  | 'timeGridWeek'
  | 'timeGridDay'
  | 'listWeek';

export interface CalendarEvent {
  id: string;
  title?: string;
  subject?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  type?: CalendarEventType;
  variant?: CalendarEventVariant;
  priority?: CalendarEventPriority | TaskPriority | null;
  kind?: string | null;
  activityType?: ActivityType | string | null;
  description?: string | null;
  dueDate?: string;
  status?: TaskStatus | string | null;
  assignedTo?: string;
  customerId?: string;
  attendees?: string[];
  cc?: string[];
  agenda?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
}

export interface AssigneeOption {
  value: string;
  label: string;
  email?: string;
}

export interface CustomerOption {
  value: string;
  label: string;
}

export interface TeamsMeetingCreateData {
  title: string;
  start: string;
  end: string;
  repeat?: RepeatOption;
  cc?: string[];
  attendees?: string[];
  agenda?: string;
}

export interface TeamsMeetingUpdateData extends TeamsMeetingCreateData {
  id: string;
}

export interface ActivityTaskCreateData {
  activityType: ActivityType;
  subject: string;
  dueDate: string;
  repeat?: RepeatOption;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
  customerId?: string;
  description?: string;
}

export interface ActivityTaskUpdateData extends ActivityTaskCreateData {
  id: string;
}

export interface CalendarSelectionInfo {
  start: DateTime;
  end: DateTime | null;
  allDay: boolean;
  source: 'dateClick' | 'select';
  view: CalendarViewType;
}

export interface CalendarVisibleRange {
  start: DateTime;
  end: DateTime;
  view: CalendarViewType;
}

export interface CalendarFilterState {
  types: CalendarEventType[];
  priorities: TaskPriority[];
}

export interface FilterStats {
  total: number;
  visible: number;
}

export interface CalendarHeaderAction {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}

export interface BusinessHoursConfig {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export interface AppCalendarProps
  extends Omit<
    CalendarOptions,
    | 'events'
    | 'eventClick'
    | 'select'
    | 'dateClick'
    | 'eventContent'
    | 'headerToolbar'
    | 'initialView'
    | 'views'
  > {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (selection: CalendarSelectionInfo) => void;
  onRangeChange?: (range: CalendarVisibleRange) => void;
  renderEventContent?: (arg: EventContentArg) => ReactNode;
  initialView?: CalendarViewType;
  views?: CalendarViewType[];
  header?: boolean;
  weekends?: boolean;
  businessHours?: BusinessHoursConfig;
  height?: string | number;
  headerAction?: CalendarHeaderAction;
}

export interface CalendarHeaderProps {
  currentDate: DateTime;
  view: CalendarViewType;
  views: CalendarViewType[];
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onNavigateToday: () => void;
  onViewChange: (view: CalendarViewType) => void;
  action?: CalendarHeaderAction;
}

export interface CalendarEventProps {
  arg: EventContentArg;
}

export interface UseCalendarThemeReturn {
  calendarStyles: CSSProperties;
}
