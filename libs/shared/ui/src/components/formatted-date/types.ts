import type { CSSProperties, ReactNode } from 'react';

/**
 * Props for FormattedDate component
 */
export interface FormattedDateProps {
  /** ISO date string or null */
  value: string | null | undefined;
  /** Show time alongside date */
  showTime?: boolean;
  /** Show relative time (e.g., "2 days ago") instead of absolute */
  relative?: boolean;
  /** Fallback text when value is null/undefined */
  fallback?: ReactNode;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: CSSProperties;
}

/**
 * Options for date formatting functions
 */
export interface FormatDateOptions {
  /** Show relative time instead of absolute */
  relative?: boolean;
}

/**
 * Return type for useDateFormat hook
 */
export interface UseDateFormatReturn {
  /** Format as date only (e.g., "05/02/2026") */
  formatDate: (
    value: string | null | undefined,
    options?: FormatDateOptions
  ) => string;
  /** Format as time only (e.g., "14:30") */
  formatTime: (value: string | null | undefined) => string;
  /** Format as date and time (e.g., "05/02/2026 14:30") */
  formatDateTime: (
    value: string | null | undefined,
    options?: FormatDateOptions
  ) => string;
  /** Format as relative time (e.g., "2 days ago") */
  formatRelative: (value: string | null | undefined) => string;
}
