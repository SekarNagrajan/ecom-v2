import { createStore, type StoreApi } from 'zustand';

import type {
  DataViewColumnMeta,
  SearchableField,
  DataViewMode,
} from '../types';
import type {
  FilterFieldConfig,
  FilterValue,
  SortConfig,
} from './data-view-types';

export interface DataViewCallbacks {
  onViewModeChange?: (mode: DataViewMode) => void;
  onFiltersChange?: (filters: FilterValue[]) => void;
  onSortsChange?: (sorts: SortConfig[]) => void;
  onSearchChange?: (text: string, field?: string) => void;
}

export interface DataViewStoreState {
  viewMode: DataViewMode;
  allowedViewModes: DataViewMode[];
  filters: FilterValue[];
  sorts: SortConfig[];
  searchText: string;
  searchField: string;

  filterConfig: FilterFieldConfig[];
  columnDefs: DataViewColumnMeta[];
  searchableFields: SearchableField[];

  draftFilters: FilterValue[];
  draftSorts: SortConfig[];
  isFilterDrawerOpen: boolean;

  queryVersion: number;

  _callbacks: DataViewCallbacks;

  setViewMode: (mode: DataViewMode) => void;
  setFilters: (filters: FilterValue[]) => void;
  updateFilter: (filter: FilterValue) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  setSorts: (sorts: SortConfig[]) => void;
  updateSort: (sort: SortConfig) => void;
  toggleSort: (field: string) => void;
  removeSort: (field: string) => void;
  clearSorts: () => void;
  setSearchText: (text: string) => void;
  setSearchField: (field: string) => void;
  openFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  setDraftFilters: (filters: FilterValue[]) => void;
  setDraftFilter: (field: string, value: FilterValue | undefined) => void;
  setDraftSorts: (sorts: SortConfig[]) => void;
  addDraftSort: (field: string) => void;
  updateDraftSort: (field: string, direction: SortConfig['direction']) => void;
  removeDraftSort: (field: string) => void;
  applyDrafts: () => void;
  clearAllAndApply: () => void;
  syncConfig: (config: {
    filterConfig?: FilterFieldConfig[];
    columnDefs?: DataViewColumnMeta[];
    searchableFields?: SearchableField[];
  }) => void;
  reset: (initialState?: Partial<DataViewStoreState>) => void;
  incrementQueryVersion: () => void;
}

const INITIAL_STATE: Omit<
  DataViewStoreState,
  | '_callbacks'
  | 'setViewMode'
  | 'setFilters'
  | 'updateFilter'
  | 'removeFilter'
  | 'clearFilters'
  | 'setSorts'
  | 'updateSort'
  | 'toggleSort'
  | 'removeSort'
  | 'clearSorts'
  | 'setSearchText'
  | 'setSearchField'
  | 'openFilterDrawer'
  | 'closeFilterDrawer'
  | 'setDraftFilters'
  | 'setDraftFilter'
  | 'setDraftSorts'
  | 'addDraftSort'
  | 'updateDraftSort'
  | 'removeDraftSort'
  | 'applyDrafts'
  | 'clearAllAndApply'
  | 'syncConfig'
  | 'reset'
  | 'incrementQueryVersion'
> = {
  viewMode: 'list',
  allowedViewModes: ['list', 'kanban', 'card'],
  filters: [],
  sorts: [],
  searchText: '',
  searchField: '',
  filterConfig: [],
  columnDefs: [],
  searchableFields: [],
  draftFilters: [],
  draftSorts: [],
  isFilterDrawerOpen: false,
  queryVersion: 0,
};

export function createDataViewStore(
  initialState: Partial<DataViewStoreState> = {},
  callbacks: DataViewCallbacks = {}
): StoreApi<DataViewStoreState> {
  return createStore<DataViewStoreState>((set, get) => ({
    ...INITIAL_STATE,
    ...initialState,
    _callbacks: callbacks,

    incrementQueryVersion: () => {
      set((state) => ({ queryVersion: state.queryVersion + 1 }));
    },

    setViewMode: (mode) => {
      set({ viewMode: mode });
      get()._callbacks.onViewModeChange?.(mode);
    },

    setFilters: (filters) => {
      set((state) => ({ filters, queryVersion: state.queryVersion + 1 }));
      get()._callbacks.onFiltersChange?.(filters);
    },

    updateFilter: (filter) => {
      set((state) => {
        const existingIndex = state.filters.findIndex(
          (f) => f.field === filter.field
        );
        const newFilters = [...state.filters];
        if (existingIndex >= 0) {
          newFilters[existingIndex] = filter;
        } else {
          newFilters.push(filter);
        }
        return { filters: newFilters, queryVersion: state.queryVersion + 1 };
      });
      get()._callbacks.onFiltersChange?.(get().filters);
    },

    removeFilter: (field) => {
      set((state) => ({
        filters: state.filters.filter((f) => f.field !== field),
        queryVersion: state.queryVersion + 1,
      }));
      get()._callbacks.onFiltersChange?.(get().filters);
    },

    clearFilters: () => {
      set((state) => ({ filters: [], queryVersion: state.queryVersion + 1 }));
      get()._callbacks.onFiltersChange?.([]);
    },

    setSorts: (sorts) => {
      set((state) => ({ sorts, queryVersion: state.queryVersion + 1 }));
      get()._callbacks.onSortsChange?.(sorts);
    },

    updateSort: (sort) => {
      set((state) => {
        const existingIndex = state.sorts.findIndex(
          (s) => s.field === sort.field
        );
        const newSorts = [...state.sorts];
        if (existingIndex >= 0) {
          newSorts[existingIndex] = sort;
        } else {
          newSorts.push(sort);
        }
        return { sorts: newSorts, queryVersion: state.queryVersion + 1 };
      });
      get()._callbacks.onSortsChange?.(get().sorts);
    },

    toggleSort: (field) => {
      set((state) => {
        const existing = state.sorts.find((s) => s.field === field);
        let newSorts: SortConfig[];
        if (!existing) {
          newSorts = [...state.sorts, { field, direction: 'asc' }];
        } else if (existing.direction === 'asc') {
          newSorts = state.sorts.map((s) =>
            s.field === field ? { ...s, direction: 'desc' as const } : s
          );
        } else {
          newSorts = state.sorts.map((s) =>
            s.field === field ? { ...s, direction: 'asc' as const } : s
          );
        }
        return { sorts: newSorts, queryVersion: state.queryVersion + 1 };
      });
      get()._callbacks.onSortsChange?.(get().sorts);
    },

    removeSort: (field) => {
      set((state) => ({
        sorts: state.sorts.filter((s) => s.field !== field),
        queryVersion: state.queryVersion + 1,
      }));
      get()._callbacks.onSortsChange?.(get().sorts);
    },

    clearSorts: () => {
      set((state) => ({ sorts: [], queryVersion: state.queryVersion + 1 }));
      get()._callbacks.onSortsChange?.([]);
    },

    setSearchText: (text) => {
      const state = get();
      set((s) => ({ searchText: text, queryVersion: s.queryVersion + 1 }));
      state._callbacks.onSearchChange?.(text, state.searchField);
    },

    setSearchField: (field) => {
      const state = get();
      set((s) => ({ searchField: field, queryVersion: s.queryVersion + 1 }));
      state._callbacks.onSearchChange?.(state.searchText, field);
    },

    openFilterDrawer: () => {
      set((state) => ({
        isFilterDrawerOpen: true,
        draftFilters: [...state.filters],
        draftSorts: [...state.sorts],
      }));
    },

    closeFilterDrawer: () => {
      set({ isFilterDrawerOpen: false });
    },

    setDraftFilters: (filters) => {
      set({ draftFilters: filters });
    },

    setDraftFilter: (field, value) => {
      set((state) => {
        const existingIndex = state.draftFilters.findIndex(
          (filter) => filter.field === field
        );

        if (value === undefined) {
          if (existingIndex === -1) {
            return state;
          }

          return {
            draftFilters: state.draftFilters.filter(
              (filter) => filter.field !== field
            ),
          };
        }

        if (existingIndex === -1) {
          return {
            draftFilters: [...state.draftFilters, value],
          };
        }

        const existing = state.draftFilters[existingIndex];
        if (existing === value) {
          return state;
        }

        const nextDraftFilters = [...state.draftFilters];
        nextDraftFilters[existingIndex] = value;

        return {
          draftFilters: nextDraftFilters,
        };
      });
    },

    setDraftSorts: (sorts) => {
      set({ draftSorts: sorts });
    },

    addDraftSort: (field) => {
      set((state) => {
        if (state.draftSorts.some((sort) => sort.field === field)) {
          return state;
        }

        return {
          draftSorts: [...state.draftSorts, { field, direction: 'asc' }],
        };
      });
    },

    updateDraftSort: (field, direction) => {
      set((state) => {
        const existingIndex = state.draftSorts.findIndex(
          (sort) => sort.field === field
        );

        if (existingIndex === -1) {
          return state;
        }

        const existing = state.draftSorts[existingIndex];
        if (!existing || existing.direction === direction) {
          return state;
        }

        const nextDraftSorts = [...state.draftSorts];
        nextDraftSorts[existingIndex] = { field, direction };

        return {
          draftSorts: nextDraftSorts,
        };
      });
    },

    removeDraftSort: (field) => {
      set((state) => {
        if (!state.draftSorts.some((sort) => sort.field === field)) {
          return state;
        }

        return {
          draftSorts: state.draftSorts.filter((sort) => sort.field !== field),
        };
      });
    },

    applyDrafts: () => {
      const state = get();
      set((s) => ({
        filters: state.draftFilters,
        sorts: state.draftSorts,
        isFilterDrawerOpen: false,
        queryVersion: s.queryVersion + 1,
      }));
      state._callbacks.onFiltersChange?.(state.draftFilters);
      state._callbacks.onSortsChange?.(state.draftSorts);
    },

    clearAllAndApply: () => {
      set((s) => ({
        filters: [],
        sorts: [],
        draftFilters: [],
        draftSorts: [],
        isFilterDrawerOpen: false,
        queryVersion: s.queryVersion + 1,
      }));
      get()._callbacks.onFiltersChange?.([]);
      get()._callbacks.onSortsChange?.([]);
    },

    syncConfig: (config) => {
      set((state) => ({
        filterConfig: config.filterConfig ?? state.filterConfig,
        columnDefs: config.columnDefs ?? state.columnDefs,
        searchableFields: config.searchableFields ?? state.searchableFields,
      }));
    },

    reset: (initialState) => {
      set({ ...INITIAL_STATE, ...initialState });
    },
  }));
}

export type DataViewStore = StoreApi<DataViewStoreState>;
