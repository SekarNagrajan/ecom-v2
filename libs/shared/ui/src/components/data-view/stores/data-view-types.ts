/**
 * Type definitions for the data-view store and filter/sort configuration
 *
 * This file contains all TypeScript types and interfaces for:
 * - Filter configuration (available filters)
 * - Active filter state
 * - Sort configuration
 * - Store state
 */

// =============================================================================
// Filter Operators
// =============================================================================

export type TextOperator =
  | 'equals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'notEquals'
  | 'blank'
  | 'notBlank';
export type NumberOperator =
  | 'equals'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'notEquals'
  | 'blank'
  | 'notBlank';
export type DateOperator =
  | 'equals'
  | 'notEquals'
  | 'before'
  | 'after'
  | 'between'
  | 'blank'
  | 'notBlank';
export type SelectOperator = 'equals' | 'notEquals' | 'blank' | 'notBlank';
export type MultiselectOperator = 'in' | 'notIn' | 'blank' | 'notBlank';

export type FilterOperator =
  | TextOperator
  | NumberOperator
  | DateOperator
  | SelectOperator
  | MultiselectOperator;

// Descriptive aliases for app-level imports
export type DataViewTextOperator = TextOperator;
export type DataViewNumberOperator = NumberOperator;
export type DataViewDateOperator = DateOperator;

// =============================================================================
// Filter Field Types
// =============================================================================

export type FilterType =
  | 'text'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'daterange'
  | 'number'
  | 'boolean';

/** Option for select/multiselect filters */
export interface FilterOption {
  label: string;
  value: string | number;
}

/** Base configuration for a filter field */
interface FilterFieldBase {
  /** Field name (must match column field) */
  field: string;
  /** Display label */
  label: string;
  /** Placeholder text */
  placeholder?: string;
}

/** Text filter field configuration */
export interface TextFilterField extends FilterFieldBase {
  type: 'text';
  operators?: TextOperator[];
  defaultOperator?: TextOperator;
}

/** Select filter field configuration */
export interface SelectFilterField extends FilterFieldBase {
  type: 'select';
  options?: FilterOption[];
  /** Async function to fetch options */
  fetchOptions?: () => Promise<FilterOption[]>;
}

/** Multiselect filter field configuration */
export interface MultiselectFilterField extends FilterFieldBase {
  type: 'multiselect';
  options?: FilterOption[];
  /** Async function to fetch options */
  fetchOptions?: () => Promise<FilterOption[]>;
  /** Max number of selections */
  maxSelections?: number;
}

/** Number filter field configuration */
export interface NumberFilterField extends FilterFieldBase {
  type: 'number';
  operators?: NumberOperator[];
  defaultOperator?: NumberOperator;
  /** Optional display formatting for chips */
  displayFormat?: 'number' | 'currency';
  min?: number;
  max?: number;
  step?: number;
}

/** Date filter field configuration */
export interface DateFilterField extends FilterFieldBase {
  type: 'date';
  operators?: DateOperator[];
  defaultOperator?: DateOperator;
}

/** Date range filter field configuration */
export interface DateRangeFilterField extends FilterFieldBase {
  type: 'daterange';
}

/** Boolean filter field configuration */
export interface BooleanFilterField extends FilterFieldBase {
  type: 'boolean';
  toggleLabel?: string;
}

/** Union of all filter field configurations */
export type FilterFieldConfig =
  | TextFilterField
  | SelectFilterField
  | MultiselectFilterField
  | NumberFilterField
  | DateFilterField
  | DateRangeFilterField
  | BooleanFilterField;

// =============================================================================
// Active Filter State (runtime value)
// =============================================================================

/**
 * Active filter value for a single field
 * This represents the current filter state, not the configuration
 */
export interface FilterValue {
  /** Field name */
  field: string;
  /** Filter type (for proper value handling) */
  type: FilterType;
  /** Current filter value */
  value: unknown;
  /** Operator for the filter */
  operator?: FilterOperator;
}

// =============================================================================
// Sort Types
// =============================================================================

export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration for a single field
 */
export interface SortConfig {
  /** Field name to sort by */
  field: string;
  /** Sort direction */
  direction: SortDirection;
}

// Legacy alias for backward compatibility
export type FilterConfig = FilterValue;

// =============================================================================
// Store State Interface
// =============================================================================

/**
 * Complete state interface for the data-view Zustand store
 *
 * This store is used by the DataView orchestrator component only.
 * Individual views (Kanban, Card, List) remain prop-based and reusable.
 *
 * @template TData - The type of data items stored in cards
 */
export interface DataViewState<TData = unknown> {
  // -------------------------
  // Data State
  // -------------------------

  /** Card view data */
  cardData: TData[];

  /** Selected card IDs (Set for O(1) lookups) */
  selectedCardIds: Set<string>;

  // -------------------------
  // Filter/Sort/Search State
  // -------------------------

  /** Active filters */
  filters: FilterConfig[];

  /** Active sort configuration */
  sorts: SortConfig[];

  /** Search text */
  searchText: string;

  // -------------------------
  // Cache Management
  // -------------------------

  /** Cache version for invalidation */
  cacheVersion: number;

  // -------------------------
  // Actions
  // -------------------------

  /**
   * Set filter configuration
   */
  setFilters: (filters: FilterConfig[]) => void;

  /**
   * Add or update a single filter
   */
  updateFilter: (filter: FilterConfig) => void;

  /**
   * Remove a filter by field name
   */
  removeFilter: (field: string) => void;

  /**
   * Clear all filters
   */
  clearFilters: () => void;

  /**
   * Set sort configuration
   */
  setSorts: (sorts: SortConfig[]) => void;

  /**
   * Add or update a single sort
   */
  updateSort: (sort: SortConfig) => void;

  /**
   * Remove a sort by field name
   */
  removeSort: (field: string) => void;

  /**
   * Clear all sorts
   */
  clearSorts: () => void;

  /**
   * Set search text
   */
  setSearchText: (text: string) => void;

  /**
   * Set card view data
   */
  setCardData: <T = TData>(data: T[]) => void;

  /**
   * Toggle card selection
   */
  toggleCardSelection: (cardId: string) => void;

  /**
   * Select multiple cards
   */
  selectCards: (cardIds: string[]) => void;

  /**
   * Deselect multiple cards
   */
  deselectCards: (cardIds: string[]) => void;

  /**
   * Clear all selections
   */
  clearSelection: () => void;

  /**
   * Invalidate cache (increment version)
   */
  invalidateCache: () => void;

  /**
   * Reset store to initial state
   */
  reset: () => void;
}
