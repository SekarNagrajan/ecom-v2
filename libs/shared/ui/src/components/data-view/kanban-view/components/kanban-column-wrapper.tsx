import type { DataViewItem } from '../../data-view-item';
import type { KanbanColumnWrapperProps } from './kanban-board-types';
import { KanbanColumn } from './kanban-column';
import { useKanbanStoreData } from './kanban-store-context';

// Stable empty array reference to avoid creating new arrays
const EMPTY_ARRAY: never[] = [];

/**
 * KanbanColumnWrapper - Isolated column with its own store subscription
 *
 * This wrapper ensures each column only subscribes to its own lane data,
 * preventing unnecessary re-renders when other lanes update.
 *
 * Performance characteristics:
 * - Subscribes only to specific lane data (not entire store)
 * - Memoized to prevent re-renders from parent prop changes
 * - Only re-renders when its lane's data actually changes
 */
export function KanbanColumnWrapper<TData extends DataViewItem>({
  laneId,
  lane,
  columnDefs,
  idField,
  onLoadMore,
  hasMore,
  loadingMore,
  fetchMode,
  collapsible,
  layoutConfig,
  renderCard,
  cardGap,
  estimatedCardHeight,
  columnWidth,
}: KanbanColumnWrapperProps<TData>) {
  // Subscribe only to this specific lane's data
  // CRITICAL: Return stable reference (laneData.items or EMPTY_ARRAY)
  // Never create new array with || [] as it causes infinite loops
  const items = useKanbanStoreData((state) => {
    const laneData = state.lanes.get(laneId);
    return laneData ? (laneData.items as TData[]) : EMPTY_ARRAY;
  });

  return (
    <KanbanColumn
      id={lane.id}
      title={lane.title}
      items={items}
      columnDefs={columnDefs}
      idField={idField}
      color={lane.color}
      limit={lane.limit}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
      fetchMode={fetchMode}
      collapsible={lane.collapsible ?? collapsible}
      layoutConfig={layoutConfig}
      renderCard={renderCard}
      cardGap={cardGap}
      estimatedCardHeight={estimatedCardHeight}
      columnWidth={columnWidth}
    />
  );
}
