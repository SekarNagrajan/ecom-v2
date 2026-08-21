import type { ReactNode } from 'react';

export interface TimezoneSelectOption {
  label: string;
  searchLabel: string;
  selectedLabel: string;
  value: string;
}

export const TIMEZONE_OPTIONS: TimezoneSelectOption[] = [
  { value: 'UTC', label: 'UTC (GMT+00:00)', selectedLabel: 'UTC', searchLabel: 'UTC (GMT+00:00)' },
  { value: 'America/New_York', label: 'New York (GMT-05:00)', selectedLabel: 'New York', searchLabel: 'New York (GMT-05:00)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-08:00)', selectedLabel: 'Los Angeles', searchLabel: 'Los Angeles (GMT-08:00)' },
  { value: 'Europe/London', label: 'London (GMT+00:00)', selectedLabel: 'London', searchLabel: 'London (GMT+00:00)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+01:00)', selectedLabel: 'Paris', searchLabel: 'Paris (GMT+01:00)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+04:00)', selectedLabel: 'Dubai', searchLabel: 'Asia/Dubai' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+08:00)', selectedLabel: 'Singapore', searchLabel: 'Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+09:00)', selectedLabel: 'Tokyo', searchLabel: 'Asia/Tokyo' },
  { value: 'Asia/Kolkata', label: 'Kolkata (GMT+05:30)', selectedLabel: 'Kolkata', searchLabel: 'Asia/Kolkata' },
];
