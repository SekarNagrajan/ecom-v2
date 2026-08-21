import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties } from 'react';

import type { DataViewItem } from '../../data-view-item';
import type { RenderCardParams } from '../types';
import { CardContent } from './card-content';
import type { SortableCardProps } from './kanban-card-types';

/**
 * SortableCard - Draggable card wrapper (using useDraggable)
 *
 * Wraps a card with @dnd-kit draggable functionality for drag-and-drop.
 * Uses useDraggable instead of useSortable for better performance with virtualization.
 *
 * Performance characteristics:
 * - Zero re-renders of other cards when dragging (no SortableContext)
 * - Only the dragged card updates during drag
 * - DragOverlay handles visual feedback (no transform on original)
 * - Perfect for virtualized lists with 100+ items
 *
 * Why useDraggable instead of useSortable:
 * - useSortable notifies ALL items in SortableContext when drag starts
 * - With virtualization, this causes mass re-renders and lag
 * - useDraggable is isolated - only this card knows about drag state
 * - Drop position is calculated manually in drag provider
 *
 * @example
 * ```tsx
 * <SortableCard
 *   id="card-1"
 *   item={data}
 *   columnDefs={columns}
 *   layoutConfig={config}
 * />
 * ```
 */
export function SortableCard<TData extends DataViewItem>({
  id,
  item,
  columnDefs,
  layoutConfig,
  renderCard,
}: SortableCardProps<TData>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: {
      type: 'card',
      item,
    },
  });

  const style: CSSProperties = {
    cursor: renderCard ? undefined : isDragging ? 'grabbing' : 'grab',
    touchAction: 'none',
    opacity: isDragging ? 0.5 : undefined,
  };

  // Don't memoize dragHandleProps - listeners and attributes are new objects on every render
  // from useDraggable, so memoization doesn't help and actually causes more re-renders
  const dragHandleProps = {
    ...listeners,
    ...attributes,
  } as RenderCardParams<TData>['dragHandleProps'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(renderCard ? {} : dragHandleProps)}
    >
      {renderCard ? (
        renderCard({
          item,
          isDragging,
          isOverlay: false,
          dragHandleProps,
        })
      ) : (
        <CardContent
          item={item}
          columnDefs={columnDefs}
          layoutConfig={layoutConfig}
          isDragging={isDragging}
        />
      )}
    </div>
  );
}
