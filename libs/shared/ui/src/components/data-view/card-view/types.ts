import type { CSSProperties, ReactNode } from 'react';

import type { DataViewItem } from '../data-view-item';
import type { DataViewColumn } from '../types';

/**
 * Definition for a Card Action (e.g., Swipe action or Footer button)
 */
export interface CardAction<TData> {
  id: string;
  label: string;
  icon?: ReactNode;
  color?: string;
  onClick: (item: TData) => void;
  /** If true, this action will be hidden in the "More" menu instead of visible */
  isSecondary?: boolean;
}

/**
 * Selection state for Card View
 */
export interface CardSelection<TData> {
  selectedKeys: string[];
  onSelectionChange: (keys: string[]) => void;
  /** Primary identifier field, defaults to 'id' */
  idField?: keyof TData & string;
}

/**
 * Pagination mode for Card View
 * - 'infinite': Auto-load more when scrolling to bottom (default)
 * - 'pagination': Traditional page-based navigation with page controls
 */
export type CardPaginationMode = 'infinite' | 'pagination';

/**
 * Options specifically for the Card View
 */
export interface CardViewOptions<TData extends DataViewItem = DataViewItem> {
  /**
   * Data array for Card view.
   * When provided, this takes precedence over DataView's rowData.
   * Use this for server-mode where you manage data fetching externally.
   */
  data?: TData[];
  /** Primary identifier field, defaults to `id` */
  idField?: keyof TData & string;
  /** Loading state for the card view */
  loading?: boolean;
  /** Bottom loading state for infinite scroll mode */
  loadingMore?: boolean;
  /**
   * Pagination mode for loading data:
   * - 'infinite': Auto-load more on scroll (default)
   * - 'pagination': Traditional page navigation
   */
  paginationMode?: CardPaginationMode;
  /** Current page (1-indexed) for pagination mode */
  page?: number;
  /** Page size for pagination */
  pageSize?: number;
  /** Page size options shown in pagination size changer */
  pageSizeOptions?: number[];
  /** Total count of records (for pagination) */
  totalCount?: number;
  /** Empty state description override */
  emptyDescription?: ReactNode;
  /** Callback when page or page size changes */
  onPaginationChange?: (page: number, pageSize: number) => void;
  /** Triggered when bottom is reached (infinite scroll mode) */
  onLoadMore?: () => void;
  /** Whether more data is available (infinite scroll mode) */
  hasMore?: boolean;
  /** Gutter between cards [horizontal, vertical] */
  gutter?: [number, number];
  /** Minimum width for each card in fluid layout (Desktop) */
  minCardWidth?: number;
  /** Upper bound for responsive column count when fluid layout is enabled */
  maxColumns?: number;
  /** Swipe actions configuration */
  swipeActions?: {
    left?: CardAction<TData>[];
    right?: CardAction<TData>[];
  };
  /** Visible footer actions */
  footerActions?: CardAction<TData>[];
  /** Optional custom card renderer for extreme flexibility */
  renderCard?: (
    item: TData,
    state: { isSelected: boolean; isSwiped: boolean; selectionMode: boolean }
  ) => ReactNode;
  /** Whether long press triggers selection mode (default: false) */
  enableLongPressSelection?: boolean;
  /** Whether pull-to-refresh is enabled */
  enablePullToRefresh?: boolean;
  /** Callback for pull-to-refresh */
  onRefresh?: () => Promise<void>;
  /** Selection configuration */
  selection?: CardSelection<TData>;
  /** Whether the view is currently in selection mode */
  isSelectionMode?: boolean;
  /** Virtualization overscan count */
  overscan?: number;
  /**
   * Background color of the scrollable card surface (the area "between"
   * the cards, including gutters). Defaults to `token.colorBgLayout` so the
   * cards visually float above a neutral page surface. Override (for example
   * with `token.colorBgContainer`) when the card surface is hosted inside a
   * white container and you want the gutters to match it.
   */
  surfaceBackground?: string;
  /**
   * Inset (in pixels) applied to the inside edges of the scrollable card
   * surface — controls both the horizontal padding around each row and the
   * top margin above the first row. Defaults to `token.padding` so cards
   * float inside the container. Pass `0` (or a smaller value) when the
   * CardView is already nested inside a padded host container.
   */
  surfacePadding?: number;
  /**
   * Optional content rendered as the first child of the internal scroll
   * container, above the virtualized card grid. Use this to host header
   * content that should scroll with the cards (e.g. mobile filter bars)
   * or that should stick to the top of the scroll viewport via
   * `position: sticky` inside this slot. The slot itself does not apply
   * any sticky positioning — the consumer is responsible for wrapping
   * any sub-elements they want pinned.
   */
  scrollAreaHeader?: ReactNode;
}

/**
 * Props for the individual Card item component
 */
export interface CardItemProps<TData extends DataViewItem> {
  item: TData;
  id: string;
  columnDefs: DataViewColumn<TData>[];
  isSelected: boolean;
  selectionMode: boolean;
  isSwiped: boolean;
  footerActions: CardAction<TData>[];
  onLongPress: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
  onCardClick: (id: string) => void;
  renderCard?: (
    item: TData,
    state: { isSelected: boolean; isSwiped: boolean; selectionMode: boolean }
  ) => ReactNode;
}

/**
 * Props for the CardView component
 */
export interface CardViewProps<TData extends DataViewItem>
  extends CardViewOptions<TData> {
  /** Array of data items to display */
  data: TData[];
  /** Primary identifier field, defaults to `id` */
  idField?: keyof TData & string;
  /** Column definitions for card content */
  columnDefs: DataViewColumn<TData>[];
  /** Loading state */
  loading?: boolean;
  /** Bottom loading state for infinite scroll mode */
  loadingMore?: boolean;
  /** Current page (1-indexed) for server-side pagination */
  page?: number;
  /** Page size */
  pageSize?: number;
  /** Page size options shown in pagination size changer */
  pageSizeOptions?: number[];
  /** Total records available on server */
  totalCount?: number;
  /** Empty state description override */
  emptyDescription?: ReactNode;
  /** Callback when page or page size changes */
  onPaginationChange?: (page: number, pageSize: number) => void;
  /** Triggered when the bottom of the list is reached */
  onLoadMore?: () => void;
  /** Whether more data is available */
  hasMore?: boolean;
  /** Optional container class name */
  className?: string;
  /** Optional container style */
  style?: CSSProperties;
}
