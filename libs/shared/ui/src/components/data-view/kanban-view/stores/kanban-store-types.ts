import type { DataViewItem } from '../../data-view-item';

/**
 * Type definitions for the Kanban store
 *
 * This file contains all TypeScript types and interfaces used by the Kanban Zustand store.
 */

// =============================================================================
// Pagination Types
// =============================================================================

/**
 * Pagination state for a lane
 */
export interface LanePaginationState {
  /** Current page number (0-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether more items are available */
  hasMore: boolean;
  /** Whether a fetch is in progress */
  loading: boolean;
}

// =============================================================================
// Lane Types
// =============================================================================

/**
 * Data for a single kanban lane
 */
export interface KanbanLaneData<TData extends DataViewItem = DataViewItem> {
  /** Lane identifier */
  id: string;
  /** Items in this lane */
  items: TData[];
  /** Pagination state */
  pagination: LanePaginationState;
}

// =============================================================================
// Drag State Types
// =============================================================================

/**
 * Drag state stored in ref during active drag operation
 * This is NOT stored in React state to avoid re-renders
 */
export interface DragStateRef {
  /** ID of the card being dragged */
  cardId: string;
  /** Source lane ID */
  sourceLaneId: string;
  /** Source index within the lane */
  sourceIndex: number;
  /** Current target lane ID (updates during drag) */
  currentTargetLaneId: string;
  /** Current target index (updates during drag) */
  currentTargetIndex: number;
  /** Timestamp when drag started */
  startTime: number;
}

/**
 * Parameters for moving a card between lanes
 */
export interface MoveCardParams {
  /** Card identifier */
  cardId: string;
  /** Source lane ID */
  sourceLaneId: string;
  /** Target lane ID */
  targetLaneId: string;
  /** Source index within the lane */
  sourceIndex: number;
  /** Target index within the lane */
  targetIndex: number;
}

// =============================================================================
// Store State Interface
// =============================================================================

/**
 * Complete state interface for the Kanban Zustand store
 *
 * @template TData - The type of data items stored in lanes
 */
export interface KanbanStoreState<TData extends DataViewItem = DataViewItem> {
  lanes: Map<string, KanbanLaneData<TData>>;
  dragState: DragStateRef | null;

  // -------------------------
  // Lane Actions
  // -------------------------

  /**
   * Update a lane's data
   */
  updateLane: (laneId: string, data: Partial<KanbanLaneData<TData>>) => void;

  /**
   * Set items for a specific lane
   * @param idField - Field used for item comparison (default: 'id')
   */
  setLaneItems: (laneId: string, items: TData[], idField?: string) => void;

  /**
   * Append items to a lane (for pagination)
   */
  appendLaneItems: (laneId: string, items: TData[]) => void;

  /**
   * Update lane pagination state
   */
  updateLanePagination: (
    laneId: string,
    pagination: Partial<LanePaginationState>
  ) => void;

  // -------------------------
  // Drag Actions
  // -------------------------

  /**
   * Set drag state (used during active drag)
   */
  setDragState: (dragState: DragStateRef | null) => void;

  /**
   * Clear drag state (called on drag end/cancel)
   */
  clearDragState: () => void;

  // -------------------------
  // Card Actions
  // -------------------------

  /**
   * Move a card between lanes (optimistic update)
   * @param groupByField - Field to update with target lane ID (ensures correct source lane on subsequent drags)
   */
  moveCard: (
    params: MoveCardParams,
    idField?: string,
    groupByField?: string
  ) => void;

  /**
   * Rollback a card move (for error handling)
   */
  rollbackCardMove: (
    params: MoveCardParams,
    idField?: string,
    groupByField?: string
  ) => void;

  reset: () => void;
}
