import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { useCallback, useRef, useEffect } from 'react';

import type { DataViewItem } from '../../data-view-item';
import type { KanbanDragProviderProps } from '../types';
import { KanbanDragOverlay } from './kanban-drag-overlay';
import { KanbanDropIndicator, getDropPosition } from './kanban-drop-indicator';
import { useKanbanStoreContext } from './kanban-store-context';

/**
 * KanbanDragProvider - DND Context Provider with Zustand Store
 *
 * This component manages drag-and-drop operations using @dnd-kit
 * and syncs data with the Zustand store for optimal performance.
 *
 * Key optimizations:
 * - Drag state stored in ref (zero re-renders during drag)
 * - Data stored in Zustand (selective subscriptions)
 * - Overlay in separate component (isolated re-renders)
 * - Optimistic updates with rollback on error
 * - No loops during drag (uses direct store access)
 *
 * Performance characteristics:
 * - Zero parent re-renders during drag operations
 * - Only KanbanDragOverlay re-renders when drag state changes
 * - Board, lanes, and cards remain stable during drag
 * - O(1) lookups during drag operations
 *
 * @example
 * ```tsx
 * <KanbanDragProvider
 *   groupedData={groupedData}
 *   idField="id"
 *   groupByField="status"
 *   lanes={lanes}
 *   columnDefs={columns}
 *   onItemUpdate={handleUpdate}
 * >
 *   <KanbanBoard ... />
 * </KanbanDragProvider>
 * ```
 */
export function KanbanDragProvider<TData extends DataViewItem>({
  children,
  groupedData,
  idField,
  groupByField,
  lanes,
  columnDefs,
  onItemUpdate,
  renderCard,
  dragActivation = 'longPress',
  columnWidth,
}: KanbanDragProviderProps<TData>) {
  const store = useKanbanStoreContext();

  const dragStateRef = useRef<{
    activeId: string | null;
    activeItem: TData | null;
    sourceLaneId: string | null;
    sourceIndex: number;
  }>({
    activeId: null,
    activeItem: null,
    sourceLaneId: null,
    sourceIndex: 0,
  });

  useEffect(() => {
    const { setLaneItems } = store.getState();
    Object.entries(groupedData).forEach(([laneId, items]) => {
      setLaneItems(laneId, items, idField);
    });
  }, [groupedData, lanes, idField, store]);

  // Sensor configuration based on dragActivation mode
  // - 'immediate': No delay, drag starts on pointer down (5px tolerance to distinguish from clicks)
  // - 'longPress': 250ms delay before drag starts (better for touch devices)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint:
      dragActivation === 'immediate'
        ? { distance: 5 } // Start after 5px movement (allows clicks)
        : { delay: 250, tolerance: 5 }, // Start after 250ms hold
  });

  const sensors = useSensors(pointerSensor);

  /**
   * Handle drag start
   * Optimized: Direct store access, no loops
   */
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeIdVal = String(event.active.id);
      const item = event.active.data.current?.item as TData | undefined;

      if (!item) return;

      const sourceLaneId = String(item[groupByField]);

      // Get source lane items to find index (single findIndex, unavoidable)
      const sourceLane = store.getState().lanes.get(sourceLaneId);
      const sourceIndex = sourceLane
        ? (sourceLane.items as TData[]).findIndex(
            (i) => String(i[idField]) === activeIdVal
          )
        : 0;

      // Store in ref (no re-render)
      dragStateRef.current = {
        activeId: activeIdVal,
        activeItem: item,
        sourceLaneId,
        sourceIndex,
      };

      if (window.navigator.vibrate) {
        window.navigator.vibrate(10); // Haptic feedback
      }
    },
    [idField, groupByField, store]
  );

  /**
   * Handle drag end
   * Uses calculated drop position from KanbanDropIndicator for precise placement
   */
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active } = event;

      const dragState = dragStateRef.current;

      dragStateRef.current = {
        activeId: null,
        activeItem: null,
        sourceLaneId: null,
        sourceIndex: 0,
      };

      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }

      if (!dragState.activeItem || !dragState.sourceLaneId) return;

      const dropPos = getDropPosition();
      if (!dropPos) return;

      const activeIdVal = String(active.id);
      const fromLane = dragState.sourceLaneId;
      const toLane = dropPos.laneId;
      const newIndex = dropPos.index;
      const sourceIndex = dragState.sourceIndex;

      if (fromLane !== toLane) {
        const { moveCard, rollbackCardMove } = store.getState();

        moveCard(
          {
            cardId: activeIdVal,
            sourceLaneId: fromLane,
            targetLaneId: toLane,
            sourceIndex,
            targetIndex: newIndex,
          },
          idField,
          groupByField
        );

        try {
          await onItemUpdate?.({
            item: dragState.activeItem,
            field: groupByField,
            newValue: toLane,
            index: newIndex,
            sourceIndex,
          });
        } catch (error) {
          console.error('Failed to update item:', error);
          rollbackCardMove(
            {
              cardId: activeIdVal,
              sourceLaneId: fromLane,
              targetLaneId: toLane,
              sourceIndex,
              targetIndex: newIndex,
            },
            idField,
            groupByField
          );
        }
      }
    },
    [idField, groupByField, onItemUpdate, store]
  );

  /**
   * Handle drag cancel
   */
  const handleDragCancel = useCallback(() => {
    dragStateRef.current = {
      activeId: null,
      activeItem: null,
      sourceLaneId: null,
      sourceIndex: 0,
    };
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.WhileDragging,
        },
      }}
    >
      {children}

      <KanbanDragOverlay
        idField={idField}
        columnDefs={columnDefs}
        renderCard={renderCard}
        cardWidth={columnWidth ?? 300}
      />

      <KanbanDropIndicator />
    </DndContext>
  );
}
