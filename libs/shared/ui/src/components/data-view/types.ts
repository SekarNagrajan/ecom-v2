import type { CSSProperties, ReactNode } from 'react';

import type { CardViewOptions } from './card-view/types';
import type { DataViewColumn } from './column-types';
import type { DataViewItem } from './data-view-item';
import type { KanbanViewOptions } from './kanban-view/types';
import type {
  ListViewDataSourceProps,
  ListViewOptions,
} from './list-view/types';
import type {
  FilterFieldConfig,
  FilterValue,
  SortConfig,
} from './stores/data-view-types';

// =============================================================================
// 1. Basic Enums & Layout Types
// =============================================================================

export type DataViewMode = 'list' | 'kanban' | 'card';

// =============================================================================
// 2. Column Meta (Context-safe)
// =============================================================================

export interface DataViewColumnMeta {
  field?: string;
  headerName?: string;
  sortable?: boolean;
  isPrimary?: boolean;
  isSecondary?: boolean;
}

// =============================================================================
// 3. Filter & Sort Props
// =============================================================================

/** Props for configuring filters in DataView */
export interface DataViewFilterProps {
  /** Available filter fields configuration */
  filterConfig?: FilterFieldConfig[];

  /** Default filters on mount */
  defaultFilters?: FilterValue[];
  /** Callback when filters change (for URL sync or side effects) */
  onFiltersChange?: (filters: FilterValue[]) => void;
}

/** Props for configuring sorting in DataView */
export interface DataViewSortProps {
  /** Default sorts on mount */
  defaultSorts?: SortConfig[];
  /** Callback when sorts change (for URL sync or side effects) */
  onSortsChange?: (sorts: SortConfig[]) => void;
}

/** Defines a field available for server-side search */
export interface SearchableField {
  /** Field name matching the API filter field (e.g. 'companyName', 'ownerName') */
  field: string;
  /** Display label shown in the dropdown (e.g. 'Company', 'Owner') */
  label: string;
}

/** Props for search functionality */
export interface DataViewSearchProps {
  /** Default search text on mount */
  defaultSearchText?: string;
  /** Default selected search field on mount */
  defaultSearchField?: string;
  /** Callback when search text or field changes (for URL sync or side effects) */
  onSearchChange?: (text: string, field?: string) => void;
  /**
   * Fields available for server-side search. When provided, a dropdown appears
   * next to the search input allowing users to pick which field to search.
   * The first field is selected by default.
   */
  searchableFields?: SearchableField[];
}

// =============================================================================
// 4. Toolbar Slots
// =============================================================================

/**
 * Primitives passed to `DataViewProps.renderToolbar` so parents can fully
 * compose the toolbar layout (and switch layouts per breakpoint) while still
 * reusing the built-in pieces wired into the DataView context.
 *
 * Slots are `ReactNode` values — already-rendered elements with stable
 * component types — so they reconcile cleanly when the consumer drops them
 * into different layouts. Defining slot components inline on each render
 * would change the component type identity and force unmount/remount of
 * uncontrolled inputs, `useId` consumers, and other subtree state.
 */
export interface DataViewToolbarSlots {
  /** Active breakpoint flag from `useAntdBreakpoint`. */
  isMobile: boolean;
  /** Resolved total count for the active view (list/card/kanban). */
  totalCount: number;
  /** Field-level search input + field selector dropdown. */
  search: ReactNode;
  /** List / Kanban / Card segmented control (filtered to allowed modes). */
  viewModeTabs: ReactNode;
  /** "Filters & Sort" badge button + drawer (no-op when no filter config). */
  filterToggle: ReactNode;
  /** Active filter / sort chips row (no-op when nothing is applied). */
  filterChips: ReactNode;
}

// =============================================================================
// 5. Orchestrator Props
// =============================================================================

/** Full props for DataView, strictly typed via shared DataSourceProps */
export type DataViewProps<TData extends DataViewItem> = DataViewFilterProps &
  DataViewSortProps &
  DataViewSearchProps &
  ListViewDataSourceProps<TData> & {
    columnDefs: DataViewColumn<TData>[];

    /** Default view mode on mount */
    defaultViewMode?: DataViewMode;
    /** Restrict which view modes are shown in the switcher (defaults to all) */
    allowedViewModes?: DataViewMode[];
    /** Callback when view mode changes */
    onViewModeChange?: (mode: DataViewMode) => void;
    /** Triggers a server-list refresh when changed from outside DataView */
    externalRefreshKey?: string | number;

    loading?: boolean;
    onTotalCountChange?: (count: number) => void;
    headerActions?: ReactNode;
    /**
     * Render-prop that lets the parent fully compose the toolbar layout. When
     * provided, it replaces the default header layout entirely (including the
     * built-in `headerActions` slot). The parent receives ready-made primitives
     * wired into the DataView context plus breakpoint info so it can swap
     * layouts for mobile vs desktop.
     */
    renderToolbar?: (slots: DataViewToolbarSlots) => ReactNode;

    // View-Specific Configurations
    listOptions?: ListViewOptions<TData>;
    kanbanOptions?: KanbanViewOptions<TData>;
    cardOptions?: CardViewOptions<TData>;

    className?: string;
    style?: CSSProperties;
  };

// =============================================================================
// 6. Re-exports for convenience
// =============================================================================

export type {
  FilterFieldConfig,
  FilterValue,
  SortConfig,
  FilterType,
  FilterOperator,
  FilterOption,
} from './stores/data-view-types';

export type { DataViewColumn } from './column-types';
export type { DataViewItem } from './data-view-item';
