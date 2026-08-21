import { theme } from 'antd';

import type { DataViewItem } from '../../data-view-item';
import type { KanbanBoardProps } from '../types';
import { KanbanColumnWrapper } from './kanban-column-wrapper';

/**
 * KanbanBoard - Main board layout component
 *
 * Pure layout component that renders the lanes and columns.
 * Uses Zustand store for data (selective subscriptions for performance).
 *
 * Performance optimization:
 * - Each column subscribes to its own lane data independently
 * - Columns only re-render when their specific lane data changes
 * - No parent re-renders propagate to unaffected columns
 *
 * @example
 * ```tsx
 * <KanbanBoard
 *   lanes={lanes}
 *   columnDefs={columns}
 *   idField="id"
 *   layoutConfig={config}
 * />
 * ```
 */
export function KanbanBoard<TData extends DataViewItem>({
  lanes,
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
}: KanbanBoardProps<TData>) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        display: 'flex',
        gap: token.margin,
        padding: token.padding,
        overflowX: 'auto',
        overflowY: 'hidden',
        flex: 1,
        minHeight: 0, // Critical for flex child to respect parent bounds
        height: '100%',
        background: token.colorBgLayout,
      }}
    >
      {lanes.map((lane) => (
        <KanbanColumnWrapper
          key={lane.id}
          laneId={lane.id}
          lane={lane}
          columnDefs={columnDefs}
          idField={idField}
          onLoadMore={onLoadMore}
          hasMore={hasMore?.[lane.id]}
          loadingMore={loadingMore?.[lane.id]}
          fetchMode={fetchMode}
          collapsible={collapsible}
          layoutConfig={layoutConfig}
          renderCard={renderCard}
          cardGap={cardGap}
          estimatedCardHeight={estimatedCardHeight}
          columnWidth={columnWidth}
        />
      ))}
    </div>
  );
}
