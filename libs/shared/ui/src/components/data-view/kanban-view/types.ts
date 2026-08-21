import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';
import type { CSSProperties, ReactNode } from 'react';

import type { DataViewItem } from '../data-view-item';
import type { DataViewColumn } from '../types';

/**
 * Definition for a Kanban Lane (Column)
 */
export interface KanbanLaneDef {
  /** Unique identifier for the lane/status */
  id: string;
  /** Display title for the lane */
  title: string;
  /** Optional item limit for the lane (shows warning if exceeded) */
  limit?: number;
  /** Optional border/accent color for the lane */
  color?: string;
  /** Whether the lane can be collapsed */
  collapsible?: boolean;
}

/**
 * Layout configuration for cards to avoid expensive lookups during render
 */
export interface CardLayoutConfig {
  primaryField?: string;
  secondaryField?: string;
  additionalFields: string[];
}

/**
 * Parameters passed to custom card renderer
 */
export interface RenderCardParams<TData extends DataViewItem> {
  item: TData;
  isDragging: boolean;
  isOverlay: boolean;
  /** Props to spread onto the element that should act as the drag handle */
  dragHandleProps?: DraggableAttributes &
    Partial<NonNullable<DraggableSyntheticListeners>>;
}

/**
 * Parameters for the item update callback
 */
export interface KanbanUpdateParams<TData extends DataViewItem> {
  /** The original item being updated */
  item: TData;
  /** The field that changed (usually the groupByField) */
  field: keyof TData;
  /** The new status/value for the field */
  newValue: string;
  /** The new index within the target lane */
  index?: number;
  /** The original index within the source lane (useful for reversion) */
  sourceIndex?: number;
  /** The ID of the item that will be after this item in the target lane */
  afterId?: string;
  /** The ID of the item that will be before this item in the target lane */
  beforeId?: string;
}

/**
 * Options/Configuration for the Kanban View
 */
export interface KanbanViewOptions<TData extends DataViewItem = DataViewItem> {
  /**
   * Data array or pre-grouped dictionary for Kanban view.
   * When provided, this takes precedence over DataView's rowData.
   * Use this for server-mode where you manage data fetching externally (e.g., useInfiniteQuery per lane).
   */
  data?: TData[] | Record<string, TData[]>;
  /** Field name in TData to group by (e.g., 'status') */
  groupByField: keyof TData & string;
  /** Lane definitions (order and configuration of columns) */
  lanes: KanbanLaneDef[];
  /** Async callback when an item is moved or reordered */
  onItemUpdate?: (params: KanbanUpdateParams<TData>) => Promise<void> | void;
  /** Primary identifier field */
  idField: keyof TData & string;
  /** Optional custom card renderer */
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  /** Optional container class name */
  className?: string;
  /** Optional container style */
  style?: CSSProperties;
  /** Loading state for the kanban view */
  loading?: boolean;
  /** Total number of items across all lanes after server-side filtering */
  totalCount?: number;

  // Pagination & Interaction Props
  /** Triggered when a lane is scrolled to the bottom */
  onLoadMore?: (laneId: string) => void;
  /** Map of laneId -> boolean indicating if more items can be loaded */
  hasMore?: Record<string, boolean>;
  /** Map of laneId -> boolean indicating if a fetch is in progress */
  loadingMore?: Record<string, boolean>;
  /** How to trigger loading more items. Defaults to 'auto' */
  fetchMode?: 'auto' | 'manual';
  /** Global setting for collapsible lanes. Individual lane settings override this. */
  collapsible?: boolean;
  /** Gap between cards in pixels. Can be negative for overlapping effect. Defaults to token.marginXS */
  cardGap?: number;
  /** Estimated card height in pixels for virtualization. Defaults to 90. Adjust if using custom renderCard with different heights. */
  estimatedCardHeight?: number;
  /** Lane column width in pixels when expanded. Defaults to 300. */
  columnWidth?: number;
  /**
   * Drag activation mode:
   * - 'immediate': Drag starts immediately on pointer down
   * - 'longPress': Drag starts after 250ms hold (better for mobile/touch)
   * Defaults to 'longPress'
   */
  dragActivation?: 'immediate' | 'longPress';
}

/**
 * Props for the main KanbanView component
 */
export interface KanbanViewProps<TData extends DataViewItem>
  extends KanbanViewOptions<TData> {
  /** Raw data array or pre-grouped data - will be grouped internally if it's an array */
  data: TData[] | Record<string, TData[]>;
  /** Column definitions for card content */
  columnDefs: DataViewColumn<TData>[];
  /** Loading state */
  loading?: boolean;
}

/**
 * Props for internal Kanban components
 */

export interface KanbanBoardProps<TData extends DataViewItem> {
  lanes: KanbanLaneDef[];
  columnDefs: DataViewColumn<TData>[];
  idField: keyof TData & string;
  onLoadMore?: (laneId: string) => void;
  hasMore?: Record<string, boolean>;
  loadingMore?: Record<string, boolean>;
  fetchMode?: 'auto' | 'manual';
  collapsible?: boolean;
  layoutConfig: CardLayoutConfig;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  cardGap?: number;
  estimatedCardHeight?: number;
  columnWidth?: number;
}

export interface KanbanColumnProps<TData extends DataViewItem> {
  id: string;
  title: string;
  items: TData[];
  columnDefs: DataViewColumn<TData>[];
  idField: keyof TData & string;
  color?: string;
  limit?: number;
  onLoadMore?: (laneId: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  fetchMode?: 'auto' | 'manual';
  collapsible?: boolean;
  layoutConfig: CardLayoutConfig;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  cardGap?: number;
  estimatedCardHeight?: number;
  columnWidth?: number;
}

export interface KanbanCardProps<TData extends DataViewItem> {
  id: string;
  item: TData;
  columnDefs: DataViewColumn<TData>[];
  layoutConfig: CardLayoutConfig;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  isOverlay?: boolean;
  /** Width of the overlay card wrapper in pixels. Defaults to 300. */
  overlayWidth?: number;
}

export interface KanbanDragProviderProps<TData extends DataViewItem> {
  children: ReactNode;
  groupedData: Record<string, TData[]>;
  idField: keyof TData & string;
  groupByField: keyof TData & string;
  lanes: KanbanLaneDef[];
  columnDefs: DataViewColumn<TData>[];
  onItemUpdate?: (params: KanbanUpdateParams<TData>) => Promise<void> | void;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  /** Drag activation mode: 'immediate' or 'longPress'. Defaults to 'longPress' */
  dragActivation?: 'immediate' | 'longPress';
  /** Must match KanbanView columnWidth so drag preview matches lane cards. */
  columnWidth?: number;
}

/**
 * Context for static configuration (stable)
 */
export interface KanbanConfigContextValue<
  TData extends DataViewItem = DataViewItem
> {
  columnDefs: DataViewColumn<TData>[];
  idField: keyof TData & string;
  groupByField: keyof TData & string;
  layoutConfig: CardLayoutConfig;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
}

/**
 * Context for the data stream (updates only on drop/API finish)
 */
export interface KanbanDataContextValue<
  TData extends DataViewItem = DataViewItem
> {
  /**
   * Data grouped by lane ID
   */
  groupedData: Record<string, TData[]>;
}
