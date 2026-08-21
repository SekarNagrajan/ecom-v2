import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

import { createKanbanStore, type KanbanStore } from '../stores/kanban-store';
import type { KanbanStoreState } from '../stores/kanban-store-types';

/**
 * Context for the Kanban store instance
 *
 * This allows each KanbanView to have its own isolated store,
 * enabling multiple kanban boards to coexist without sharing state.
 */
const KanbanStoreContext = createContext<KanbanStore | null>(null);

/**
 * Provider component that creates and provides a Kanban store instance
 */
export function KanbanStoreProvider({ children }: { children: ReactNode }) {
  // Use useState with lazy initialization to create store once
  // We only use the state value, never call setState
  const [store] = useState(() => createKanbanStore());

  return (
    <KanbanStoreContext.Provider value={store}>
      {children}
    </KanbanStoreContext.Provider>
  );
}

/**
 * Hook to access the Kanban store instance
 *
 * @example
 * ```tsx
 * const store = useKanbanStoreContext();
 * const lanes = useStore(store, (state) => state.lanes);
 * ```
 */
export function useKanbanStoreContext() {
  const store = useContext(KanbanStoreContext);
  if (!store) {
    throw new Error(
      'useKanbanStoreContext must be used within KanbanStoreProvider'
    );
  }
  return store;
}

/**
 * Hook to select data from the Kanban store
 *
 * @example
 * ```tsx
 * const laneData = useKanbanStoreData((state) => state.lanes.get('todo'));
 * ```
 */
export function useKanbanStoreData<T>(
  selector: (state: KanbanStoreState) => T
): T {
  const store = useKanbanStoreContext();
  return useStore(store, selector);
}
