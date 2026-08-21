import { DateTime } from 'luxon';
import { useState, useCallback } from 'react';

import type { CalendarViewType } from '../calendar-types';

export const useCalendarState = (
  initialView: CalendarViewType = 'dayGridMonth',
  initialDate?: DateTime
) => {
  const [currentDate, setCurrentDate] = useState<DateTime>(
    initialDate || DateTime.now()
  );

  const [view, setView] = useState<CalendarViewType>(initialView);

  const navigatePrevious = useCallback(() => {
    setCurrentDate((prev) => {
      switch (view) {
        case 'dayGridMonth':
          return prev.minus({ months: 1 });
        case 'timeGridWeek':
          return prev.minus({ weeks: 1 });
        case 'timeGridDay':
          return prev.minus({ days: 1 });
        case 'listWeek':
          return prev.minus({ weeks: 1 });
        default:
          return prev.minus({ months: 1 });
      }
    });
  }, [view]);

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      switch (view) {
        case 'dayGridMonth':
          return prev.plus({ months: 1 });
        case 'timeGridWeek':
          return prev.plus({ weeks: 1 });
        case 'timeGridDay':
          return prev.plus({ days: 1 });
        case 'listWeek':
          return prev.plus({ weeks: 1 });
        default:
          return prev.plus({ months: 1 });
      }
    });
  }, [view]);

  const navigateToday = useCallback(() => {
    setCurrentDate(DateTime.now());
  }, []);

  return {
    currentDate,
    view,
    setCurrentDate,
    setView,
    navigatePrevious,
    navigateNext,
    navigateToday,
  };
};
