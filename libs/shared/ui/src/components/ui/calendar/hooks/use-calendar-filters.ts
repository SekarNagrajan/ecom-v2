import { useState, useMemo, useCallback } from 'react';

import type {
  CalendarEvent,
  CalendarFilterState,
  FilterStats,
} from '../calendar-types';

const INITIAL_FILTERS: CalendarFilterState = {
  types: [],
  priorities: [],
};

export const useCalendarFilters = (events: CalendarEvent[]) => {
  const [filters, setFilters] = useState<CalendarFilterState>(INITIAL_FILTERS);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // 1. Type Filter (If empty, ignore. If set, must match)
      if (
        filters.types.length > 0 &&
        (!event.type || !filters.types.includes(event.type))
      ) {
        return false;
      }

      // 2. Priority Filter (Only applies to tasks, and only if filter is set)
      if (
        event.type === 'activity-task' &&
        filters.priorities.length > 0 &&
        typeof event.priority === 'string' &&
        !filters.priorities.includes(
          event.priority as (typeof filters.priorities)[number]
        )
      ) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  const stats = useMemo(
    (): FilterStats => ({
      total: events.length,
      visible: filteredEvents.length,
    }),
    [events.length, filteredEvents.length]
  );

  const activeFilterCount = useMemo(() => {
    return (
      filters.types.length +
      (filters.types.includes('activity-task') ? filters.priorities.length : 0)
    );
  }, [filters]);

  const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  return {
    filters,
    setFilters,
    filteredEvents,
    stats,
    activeFilterCount,
    resetFilters,
  };
};
