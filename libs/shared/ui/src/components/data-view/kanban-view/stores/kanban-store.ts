import { createStore, type StoreApi } from 'zustand';

import type { DataViewItem } from '../../data-view-item';
import type { KanbanStoreState, KanbanLaneData } from './kanban-store-types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecordValue = (item: unknown, field: string): unknown =>
  isRecord(item) ? item[field] : undefined;

/**
 * Initial state for the Kanban store
 */
/**
 * Create a new Kanban store instance
 *
 * This factory function creates an isolated store for each KanbanView instance,
 * ensuring that multiple kanban boards can coexist without sharing state.
 *
 * @example
 * ```tsx
 * // In KanbanView component
 * const storeRef = useRef(createKanbanStore());
 * ```
 */
export function createKanbanStore<TData extends DataViewItem = DataViewItem>() {
  const initialState: Pick<KanbanStoreState<TData>, 'lanes' | 'dragState'> = {
    lanes: new Map<string, KanbanLaneData<TData>>(),
    dragState: null,
  };

  return createStore<KanbanStoreState<TData>>((set, get) => ({
    ...initialState,

    // -------------------------
    // Lane Management
    // -------------------------

    updateLane: (laneId, data) => {
      set((state) => {
        const newLanes = new Map(state.lanes);
        const existingLane = newLanes.get(laneId);

        if (existingLane) {
          newLanes.set(laneId, { ...existingLane, ...data });
        } else {
          newLanes.set(laneId, {
            id: laneId,
            items: [],
            pagination: {
              page: 0,
              pageSize: 20,
              hasMore: true,
              loading: false,
            },
            ...data,
          });
        }

        return { lanes: newLanes };
      });
    },

    setLaneItems: (laneId, items, idField = 'id') => {
      set((state) => {
        const existingLane = state.lanes.get(laneId);

        // Skip update if items reference is the same
        if (existingLane && existingLane.items === items) {
          return state;
        }

        // Skip update if lane content is identical (O(1) comparison)
        // This prevents unnecessary re-renders when regrouping creates new arrays
        // but the actual content hasn't changed (e.g., only another lane got new items)
        if (existingLane && existingLane.items.length === items.length) {
          const existingItems = existingLane.items;
          const len = items.length;

          if (len === 0) {
            // Both empty - no change
            return state;
          }

          // Compare first and last item IDs (O(1) - efficient for large lists)
          const existingFirst = getRecordValue(existingItems[0], idField);
          const newFirst = getRecordValue(items[0], idField);
          const existingLast = getRecordValue(existingItems[len - 1], idField);
          const newLast = getRecordValue(items[len - 1], idField);

          if (existingFirst === newFirst && existingLast === newLast) {
            // Same length, same first/last IDs - content is identical
            return state;
          }
        }

        const newLanes = new Map(state.lanes);

        if (existingLane) {
          newLanes.set(laneId, { ...existingLane, items });
        } else {
          newLanes.set(laneId, {
            id: laneId,
            items,
            pagination: {
              page: 0,
              pageSize: 20,
              hasMore: true,
              loading: false,
            },
          });
        }

        return { lanes: newLanes };
      });
    },

    appendLaneItems: (laneId, items) => {
      set((state) => {
        const newLanes = new Map(state.lanes);
        const existingLane = newLanes.get(laneId);

        if (existingLane) {
          newLanes.set(laneId, {
            ...existingLane,
            items: [...existingLane.items, ...items],
          });
        } else {
          newLanes.set(laneId, {
            id: laneId,
            items,
            pagination: {
              page: 0,
              pageSize: 20,
              hasMore: true,
              loading: false,
            },
          });
        }

        return { lanes: newLanes };
      });
    },

    updateLanePagination: (laneId, pagination) => {
      set((state) => {
        const newLanes = new Map(state.lanes);
        const existingLane = newLanes.get(laneId);

        if (existingLane) {
          newLanes.set(laneId, {
            ...existingLane,
            pagination: { ...existingLane.pagination, ...pagination },
          });
        }

        return { lanes: newLanes };
      });
    },

    // -------------------------
    // Drag State Management
    // -------------------------

    setDragState: (dragState) => {
      set({ dragState });
    },

    clearDragState: () => {
      set({ dragState: null });
    },

    // -------------------------
    // Card Operations
    // -------------------------

    moveCard: (params, idField = 'id', groupByField?: string) => {
      const { cardId, sourceLaneId, targetLaneId, targetIndex } = params;

      set((state) => {
        const newLanes = new Map(state.lanes);
        const sourceLane = newLanes.get(sourceLaneId);
        const targetLane = newLanes.get(targetLaneId);

        if (!sourceLane || !targetLane) {
          console.warn('moveCard: Source or target lane not found', {
            sourceLaneId,
            targetLaneId,
          });
          return state;
        }

        // Find the card in the source lane
        // Use loose equality to handle dnd-kit's string IDs with number IDs in data
        const cardIndex = sourceLane.items.findIndex(
          (item) => String(getRecordValue(item, idField)) === String(cardId)
        );
        if (cardIndex === -1) {
          console.warn('moveCard: Card not found in source lane', {
            cardId,
            sourceLaneId,
          });
          return state;
        }

        const card = sourceLane.items[cardIndex];
        if (!card) {
          console.warn('moveCard: Card not found in source lane', {
            cardId,
            sourceLaneId,
          });
          return state;
        }
        let updatedCard = card;

        // Update the card's groupByField to match the target lane
        // This ensures subsequent drags read the correct source lane
        if (groupByField && isRecord(updatedCard)) {
          updatedCard = { ...updatedCard, [groupByField]: targetLaneId };
        }

        // Remove from source lane (use actual cardIndex, not the passed-in
        // sourceIndex which may be stale if items shifted since drag-start)
        const newSourceItems = [...sourceLane.items];
        newSourceItems.splice(cardIndex, 1);

        // Add to target lane (with updated groupByField)
        const newTargetItems = [...targetLane.items];
        newTargetItems.splice(targetIndex, 0, updatedCard);

        // Update lanes
        newLanes.set(sourceLaneId, { ...sourceLane, items: newSourceItems });
        newLanes.set(targetLaneId, { ...targetLane, items: newTargetItems });

        return { lanes: newLanes };
      });
    },

    rollbackCardMove: (params, idField = 'id', groupByField?: string) => {
      // Rollback is the same as moving back
      const { cardId, sourceLaneId, targetLaneId, sourceIndex, targetIndex } =
        params;

      get().moveCard(
        {
          cardId,
          sourceLaneId: targetLaneId,
          targetLaneId: sourceLaneId,
          sourceIndex: targetIndex,
          targetIndex: sourceIndex,
        },
        idField,
        groupByField
      );
    },

    reset: () => {
      set(initialState);
    },
  }));
}

/**
 * Type for the Kanban store instance
 */
export type KanbanStore<TData extends DataViewItem = DataViewItem> = StoreApi<
  KanbanStoreState<TData>
>;
