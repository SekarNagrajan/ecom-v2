import type { DataViewItem } from '../../data-view-item';
import type { KanbanCardProps } from '../types';
import { CardContent } from './card-content';
import { SortableCard } from './sortable-card';

/**
 * KanbanCard - Main card component
 *
 * Renders either a sortable draggable card or an overlay card depending on context.
 * Delegates to specialized components for each use case.
 *
 * Performance characteristics:
 * - Memoized to prevent unnecessary re-renders
 * - Minimal logic (just routing to appropriate component)
 * - Overlay cards are fixed width for consistent drag preview
 *
 * @example
 * ```tsx
 * // Regular draggable card
 * <KanbanCard
 *   id="card-1"
 *   item={data}
 *   columnDefs={columns}
 *   layoutConfig={config}
 * />
 *
 * // Overlay card (drag preview)
 * <KanbanCard
 *   id="card-1"
 *   item={data}
 *   columnDefs={columns}
 *   layoutConfig={config}
 *   isOverlay
 * />
 * ```
 */
export function KanbanCard<TData extends DataViewItem>({
  id,
  item,
  columnDefs,
  layoutConfig,
  renderCard,
  isOverlay = false,
  overlayWidth = 300,
}: KanbanCardProps<TData>) {
  // Overlay card (drag preview)
  if (isOverlay) {
    return renderCard ? (
      <div style={{ width: overlayWidth }}>
        {renderCard({
          item,
          isDragging: true,
          isOverlay: true,
        })}
      </div>
    ) : (
      <div style={{ width: overlayWidth }}>
        <CardContent
          item={item}
          columnDefs={columnDefs}
          layoutConfig={layoutConfig}
          isOverlay
        />
      </div>
    );
  }

  // Regular sortable card
  return (
    <SortableCard
      id={id}
      item={item}
      columnDefs={columnDefs}
      layoutConfig={layoutConfig}
      renderCard={renderCard}
    />
  );
}
