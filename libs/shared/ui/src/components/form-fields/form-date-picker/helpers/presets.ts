import { DateTime } from 'luxon';

import type { LuxonPreset } from '../../../../types/luxon';

export const COMMON_DATE_PICKER_PRESETS = {
  // 1. DATE Mode Presets
  date: (timezone: string): LuxonPreset<DateTime>[] => {
    const now = DateTime.now().setZone(timezone).startOf('day');
    return [
      { label: 'Today', value: now },
      { label: 'Yesterday', value: now.minus({ days: 1 }) },
      { label: 'Tomorrow', value: now.plus({ days: 1 }) },
      { label: 'Start of Month', value: now.startOf('month') },
      { label: 'End of Month', value: now.endOf('month') },
    ];
  },

  // 2. WEEK Mode Presets (Value must be a date within that week)
  week: (timezone: string): LuxonPreset<DateTime>[] => {
    const now = DateTime.now().setZone(timezone).startOf('day');
    return [
      { label: 'This Week', value: now.startOf('week') },
      { label: 'Last Week', value: now.minus({ weeks: 1 }).startOf('week') },
      { label: 'Next Week', value: now.plus({ weeks: 1 }).startOf('week') },
    ];
  },

  // 3. MONTH Mode Presets (Value must be a date within that month)
  month: (timezone: string): LuxonPreset<DateTime>[] => {
    const now = DateTime.now().setZone(timezone).startOf('day');
    return [
      { label: 'This Month', value: now.startOf('month') },
      { label: 'Last Month', value: now.minus({ months: 1 }).startOf('month') },
      { label: 'Next Month', value: now.plus({ months: 1 }).startOf('month') },
    ];
  },
};
