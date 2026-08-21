import { DateTime } from 'luxon';

import type { LuxonPreset } from '../../../../types/luxon';

export const COMMON_TIME_PICKER_PRESETS = {
  // 4. TIME Mode Presets (Value is Today + Specific Time)
  time: (): LuxonPreset<DateTime>[] => {
    const now = DateTime.now().startOf('day');
    return [
      { label: 'Start of Day', value: now.set({ hour: 0, minute: 0 }) },
      { label: 'Morning (9 AM)', value: now.set({ hour: 9, minute: 0 }) },
      { label: 'Noon (12 PM)', value: now.set({ hour: 12, minute: 0 }) },
      { label: 'Afternoon (1 PM)', value: now.set({ hour: 13, minute: 0 }) },
      { label: 'Evening (5 PM)', value: now.set({ hour: 17, minute: 0 }) },
      { label: 'End of Day', value: now.endOf('day') },
    ];
  },
};
