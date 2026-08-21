import './calendar-overrides.css';

import type {
  DatesSetArg,
  DateSelectArg,
  EventClickArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import luxonPlugin from '@fullcalendar/luxon3';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Flex, theme } from 'antd';
import { DateTime } from 'luxon';
import React, { useEffect, useRef } from 'react';

import { useAppConfig } from '../../../hooks/use-app-config';
import type { AppCalendarProps, CalendarViewType } from './calendar-types';
import { CalendarEvent as CalendarEventComponent } from './components/calendar-event';
import { CalendarHeader } from './components/calendar-header';
import { useCalendarState } from './hooks/use-calendar-state';
import { useCalendarTheme } from './hooks/use-calendar-theme';

const DEFAULT_VIEWS: AppCalendarProps['views'] = [
  'dayGridMonth',
  'timeGridWeek',
  'timeGridDay',
];

export const AppCalendar: React.FC<AppCalendarProps> = ({
  events,
  onEventClick,
  onDateSelect,
  onRangeChange,
  renderEventContent,
  weekends,
  weekNumbers = true,
  initialView = 'dayGridMonth',
  views = DEFAULT_VIEWS,
  header = true,
  height = 'auto',
  headerAction,
  ...rest
}) => {
  const calendarRef = useRef<FullCalendar>(null);
  const { token } = theme.useToken();
  const { calendarStyles } = useCalendarTheme();
  const { timezone, timeFormat } = useAppConfig();
  const is12Hour = timeFormat.toLowerCase().includes('a');
  const timeFormatConfig = {
    hour: 'numeric' as const,
    minute: '2-digit' as const,
    meridiem: 'short' as const,
    hour12: is12Hour,
  };

  const {
    currentDate,
    view,
    setView,
    navigatePrevious,
    navigateNext,
    navigateToday,
  } = useCalendarState(initialView);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
      api.gotoDate(currentDate.toJSDate());
    }
  }, [currentDate, view]);

  // FullCalendar fires BOTH `dateClick` AND `select` for a single click on a
  // day (or time slot) when `selectable` is enabled — the click is treated as
  // a degenerate one-cell selection. Wiring both handlers to `onDateSelect`
  // double-dispatches every click and was the root cause of the duplicated
  // "Cannot schedule a meeting in the past" toast in CRM (ISS-12). We rely on
  // `select` exclusively because it carries both `start` and `end`; the
  // `dateClick` synthesised payload is strictly a subset.
  const handleDateSelect = (info: DateSelectArg) => {
    onDateSelect?.({
      allDay: info.allDay,
      end: DateTime.fromJSDate(info.end).setZone(timezone),
      source: 'select',
      start: DateTime.fromJSDate(info.start).setZone(timezone),
      view: info.view.type as CalendarViewType,
    });
    info.view.calendar.unselect();
  };

  const handleEventClick = (info: EventClickArg) => {
    const event = events.find((item) => item.id === info.event.id);
    if (event) {
      onEventClick?.(event);
    }
  };

  const handleDatesSet = (info: DatesSetArg) => {
    onRangeChange?.({
      end: DateTime.fromJSDate(info.end).setZone(timezone),
      start: DateTime.fromJSDate(info.start).setZone(timezone),
      view: info.view.type as CalendarViewType,
    });
  };

  const calendarEvents = events.map((event) => ({
    ...event,
    title: event.title ?? event.subject ?? '',
  }));

  return (
    <Flex
      vertical
      gap={token.paddingSM}
      style={{
        position: 'relative',
        height: '100%',
      }}
    >
      {header ? (
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          views={views}
          onNavigatePrevious={navigatePrevious}
          onNavigateNext={navigateNext}
          onNavigateToday={navigateToday}
          onViewChange={setView}
          action={headerAction}
        />
      ) : null}

      <Flex
        vertical
        flex={1}
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          minHeight: 0,
          ...calendarStyles,
        }}
      >
        <FullCalendar
          {...rest}
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
            luxonPlugin,
          ]}
          initialView={initialView}
          headerToolbar={false}
          height={height}
          timeZone={timezone}
          events={calendarEvents}
          weekends={weekends}
          weekNumbers={weekNumbers}
          eventContent={(arg) =>
            renderEventContent ? (
              renderEventContent(arg)
            ) : (
              <CalendarEventComponent arg={arg} />
            )
          }
          selectable={Boolean(onDateSelect)}
          selectMirror={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          dayMaxEvents={true}
          nowIndicator={true}
          eventTimeFormat={timeFormatConfig}
          slotLabelFormat={timeFormatConfig}
        />
      </Flex>
    </Flex>
  );
};
