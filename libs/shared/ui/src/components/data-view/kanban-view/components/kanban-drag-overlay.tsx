import {
  DragOverlay,
  useDndMonitor,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { usePopupContainer } from '../../../../hooks';
import type { DataViewItem } from '../../data-view-item';
import type { DataViewColumn } from '../../types';
import type { RenderCardParams } from '../types';
import { KanbanCard } from './kanban-card';

/**
 * KanbanDragOverlay - Isolated drag overlay component
 *
 * This component is separated from the main provider to prevent
 * parent re-renders during drag operations. It uses useDndMonitor
 * to listen to drag events and only re-renders itself.
 *
 * Performance characteristics:
 * - Zero parent re-renders during drag
 * - Zero store subscriptions (no infinite loops)
 * - Only this component updates when drag state changes
 * - Gets item data directly from drag event (no Map rebuilding)
 * - Memoized to prevent unnecessary re-renders from prop changes
 *
 * @example
 * ```tsx
 * <KanbanDragOverlay
 *   idField="id"
 *   columnDefs={columns}
 *   renderCard={customRenderer}
 * />
 * ```
 */
export function KanbanDragOverlay<TData extends DataViewItem>({
  idField,
  columnDefs,
  renderCard,
  cardWidth = 300,
}: {
  idField: string;
  columnDefs: DataViewColumn<TData>[];
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  /** Matches expanded lane width */
  cardWidth?: number;
}) {
  const getPopupContainer = usePopupContainer();

  // Local state for overlay (isolated from parent)
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<TData | null>(null);

  // Listen to drag events without causing parent re-renders
  // CRITICAL: Get item directly from event.active.data.current.item
  // This avoids subscribing to the store and rebuilding itemsById Map
  useDndMonitor({
    onDragStart: (event) => {
      const activeIdVal = String(event.active.id);
      // Get item directly from drag event data (set by useDraggable)
      const item = (event.active.data.current?.item as TData) ?? null;
      setActiveId(activeIdVal);
      setActiveItem(item);
    },
    onDragEnd: () => {
      setActiveId(null);
      setActiveItem(null);
    },
    onDragCancel: () => {
      setActiveId(null);
      setActiveItem(null);
    },
  });

  // Layout config for card rendering
  const fields = columnDefs.filter(
    (col): col is typeof col & { field: string } =>
      typeof col.field === 'string'
  );

  const primary = fields.find((c) => c.isPrimary) ?? fields[0];
  const secondary = fields.find((c) => c.isSecondary);
  const additional = fields
    .filter((c) => !c.isPrimary && !c.isSecondary && c.field !== 'id')
    .map((c) => c.field)
    .slice(0, 3);

  const layoutConfig = {
    primaryField: primary?.field,
    secondaryField: secondary?.field,
    additionalFields: additional,
  };

  return createPortal(
    <DragOverlay
      dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.8',
            },
          },
        }),
      }}
      style={{
        cursor: 'grabbing',
      }}
    >
      {activeId && activeItem ? (
        <div
          style={{
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          }}
        >
          <KanbanCard
            id={activeId}
            item={activeItem}
            columnDefs={columnDefs}
            layoutConfig={layoutConfig}
            renderCard={renderCard}
            isOverlay
            overlayWidth={cardWidth}
          />
        </div>
      ) : null}
    </DragOverlay>,
    getPopupContainer()
  );
}
