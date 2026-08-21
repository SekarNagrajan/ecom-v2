import type { ReactNode } from 'react';

import type { DataViewItem } from './data-view-item';
import type { ListColumn } from './list-view';
import type { FilterType, FilterOption } from './stores/data-view-types';

// =============================================================================
// Column Definitions (Shared)
// =============================================================================

/** Extended Column Definition with visual hints for Card/Kanban views */
export interface DataViewColumn<TData extends DataViewItem = DataViewItem>
  extends ListColumn<TData> {
  isPrimary?: boolean;
  isSecondary?: boolean;
  /**
   * Safe, framework-agnostic renderer for Kanban and Card views.
   * Use this instead of 'cellRenderer' (which is reserved for AG Grid)
   * when you need custom formatting in Kanban or Card views.
   *
   * @example
   * render: ({ value }) => <Tag>{value as string}</Tag>
   */
  render?: (args: { value: unknown; data: TData }) => ReactNode;

  /**
   * Custom filter configuration to be defined directly in column
   */
  filterType?: FilterType;
  filterLabel?: string;
  filterToggleLabel?: string;
  filterOptions?: FilterOption[];
  fetchFilterOptions?: () => Promise<FilterOption[]>;

  /**
   * Exclude this column from CSV/Excel export (toolbar + context menu).
   * Useful for action columns whose underlying `field` (e.g. row uuid) would
   * otherwise leak into spreadsheets. Internally translated to
   * `colDef.context.excludeFromExport = true`, which the ListView export
   * handlers read at export time to build a `columnKeys` whitelist.
   */
  excludeFromExport?: boolean;
}
