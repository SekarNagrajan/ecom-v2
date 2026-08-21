import type {
  FilterValue,
  FilterFieldConfig,
  FilterOption,
} from '../../stores/data-view-types';

/**
 * Common props for all filter control components
 */
export interface FilterControlBaseProps {
  /** Field configuration */
  config: FilterFieldConfig;
  /** Current filter value */
  value: FilterValue | undefined;
  /** Callback when filter value changes */
  onChange: (value: FilterValue | undefined) => void;
  /** Optional size */
  size?: 'small' | 'middle' | 'large';
  /** Whether the control is disabled */
  disabled?: boolean;
}

/**
 * Props for select filter with options
 */
export interface SelectFilterControlProps extends FilterControlBaseProps {
  config: FilterFieldConfig & { type: 'select' | 'multiselect' };
  /** Resolved options (after async fetch) */
  options: FilterOption[];
  /** Loading state for async options */
  loading?: boolean;
}

/**
 * Props for text filter
 */
export interface TextFilterControlProps extends FilterControlBaseProps {
  config: FilterFieldConfig & { type: 'text' };
}

/**
 * Props for number filter
 */
export interface NumberFilterControlProps extends FilterControlBaseProps {
  config: FilterFieldConfig & { type: 'number' };
}

/**
 * Props for date filter
 */
export interface DateFilterControlProps extends FilterControlBaseProps {
  config: FilterFieldConfig & { type: 'date' };
}

/**
 * Props for date range filter
 */
export interface DateRangeFilterControlProps extends FilterControlBaseProps {
  config: FilterFieldConfig & { type: 'daterange' };
}

/**
 * Props for boolean filter
 */
export interface BooleanFilterControlProps extends FilterControlBaseProps {
  config: FilterFieldConfig & { type: 'boolean' };
}
