import type {
  FormatDateOptions,
  UseDateFormatReturn,
} from '../components/formatted-date/types';
import { parseStoredDateTimeToZone } from '../utils';
import { useAppConfig } from './use-app-config';

/**
 * Hook for formatting dates according to app configuration
 * Uses timezone, dateFormat, and timeFormat from AppConfigProvider
 */
export const useDateFormat = (): UseDateFormatReturn => {
  const { timezone, dateFormat, timeFormat } = useAppConfig();

  /**
   * Format as date only
   */
  const formatDate = (
    value: string | null | undefined,
    options?: FormatDateOptions
  ): string => {
    if (!value) return '-';

    try {
      const dt = parseStoredDateTimeToZone(value, timezone);

      if (!dt.isValid) return '-';

      if (options?.relative) {
        return dt.toRelative() ?? '-';
      }

      return dt.toFormat(dateFormat);
    } catch {
      return '-';
    }
  };

  /**
   * Format as time only
   */
  const formatTime = (value: string | null | undefined): string => {
    if (!value) return '-';

    try {
      const dt = parseStoredDateTimeToZone(value, timezone);

      if (!dt.isValid) return '-';

      return dt.toFormat(timeFormat);
    } catch {
      return '-';
    }
  };

  /**
   * Format as date and time
   */
  const formatDateTime = (
    value: string | null | undefined,
    options?: FormatDateOptions
  ): string => {
    if (!value) return '-';

    try {
      const dt = parseStoredDateTimeToZone(value, timezone);

      if (!dt.isValid) return '-';

      if (options?.relative) {
        return dt.toRelative() ?? '-';
      }

      return dt.toFormat(`${dateFormat} ${timeFormat}`);
    } catch {
      return '-';
    }
  };

  /**
   * Format as relative time (e.g., "2 days ago", "in 5 minutes")
   */
  const formatRelative = (value: string | null | undefined): string => {
    if (!value) return '-';

    try {
      const dt = parseStoredDateTimeToZone(value, timezone);

      if (!dt.isValid) return '-';

      return dt.toRelative() ?? '-';
    } catch {
      return '-';
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
  };
};
