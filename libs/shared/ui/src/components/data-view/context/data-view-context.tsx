import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useStore } from 'zustand';

import {
  createDataViewStore,
  type DataViewStore,
  type DataViewStoreState,
  type DataViewCallbacks,
} from '../stores/data-view-store';

const DataViewStoreContext = createContext<DataViewStore | null>(null);
const EMPTY_INITIAL_STATE = {};
const EMPTY_CALLBACKS = {};

export interface DataViewProviderProps {
  children: ReactNode;
  initialState?: Partial<DataViewStoreState>;
  callbacks?: DataViewCallbacks;
}

export function DataViewProvider({
  children,
  initialState = EMPTY_INITIAL_STATE,
  callbacks = EMPTY_CALLBACKS,
}: DataViewProviderProps) {
  const [store] = useState(() => createDataViewStore(initialState, callbacks));

  useEffect(() => {
    store.setState({ _callbacks: callbacks });
  }, [store, callbacks]);

  useEffect(() => {
    const state = store.getState();
    if (
      state.filterConfig === initialState.filterConfig &&
      state.columnDefs === initialState.columnDefs &&
      state.searchableFields === initialState.searchableFields
    ) {
      return;
    }

    store.getState().syncConfig({
      filterConfig: initialState.filterConfig,
      columnDefs: initialState.columnDefs,
      searchableFields: initialState.searchableFields,
    });
  }, [
    store,
    initialState.filterConfig,
    initialState.columnDefs,
    initialState.searchableFields,
  ]);

  return <DataViewStoreContext value={store}>{children}</DataViewStoreContext>;
}

function useStoreContext(): DataViewStore {
  const store = useContext(DataViewStoreContext);
  if (!store) {
    throw new Error('DataView hooks must be used within DataViewProvider');
  }
  return store;
}

export function useDataViewStore<T>(
  selector: (state: DataViewStoreState) => T
): T {
  return useStore(useStoreContext(), selector);
}

export function useDataViewActions() {
  const store = useStoreContext();
  return store.getState();
}

/**
 * Non-throwing variant of {@link useDataViewActions}. Returns the underlying
 * Zustand store when the consumer is rendered inside a {@link DataViewProvider}
 * and `null` otherwise. Use it from shared toolbar widgets that should route
 * writes through the DataView store when embedded in a DataView, but still
 * work standalone (e.g. inside features that manage their own list state).
 *
 * Reach for `.getState()` on event handlers rather than subscribing — toolbar
 * widgets typically already re-render via their prop-driven inputs, and
 * subscribing here would tie unrelated tree branches to every store change.
 */
export function useDataViewStoreOptional(): DataViewStore | null {
  return useContext(DataViewStoreContext);
}

export const useViewMode = () => useDataViewStore((s) => s.viewMode);
export const useFilters = () => useDataViewStore((s) => s.filters);
export const useSorts = () => useDataViewStore((s) => s.sorts);
export const useSearchText = () => useDataViewStore((s) => s.searchText);
export const useSearchField = () => useDataViewStore((s) => s.searchField);
export const useFilterConfig = () => useDataViewStore((s) => s.filterConfig);
export const useColumnDefs = () => useDataViewStore((s) => s.columnDefs);
export const useSearchableFields = () =>
  useDataViewStore((s) => s.searchableFields);
export const useDraftFilters = () => useDataViewStore((s) => s.draftFilters);
export const useDraftFilterValue = (field: string) =>
  useDataViewStore((state) =>
    state.draftFilters.find((filter) => filter.field === field)
  );
export const useDraftSorts = () => useDataViewStore((s) => s.draftSorts);
export const useIsFilterDrawerOpen = () =>
  useDataViewStore((s) => s.isFilterDrawerOpen);
export const useAllowedViewModes = () =>
  useDataViewStore((s) => s.allowedViewModes);
export const useQueryVersion = () => useDataViewStore((s) => s.queryVersion);
