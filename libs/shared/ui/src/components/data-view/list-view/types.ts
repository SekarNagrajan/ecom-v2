import type {
    AdvancedFilterModel,
    CellValueChangedEvent,
    ColDef,
    CsvExportParams,
    ExcelExportParams,
    FilterModel,
    GridOptions,
    GridReadyEvent,
    GridState,
    RowSelectionOptions,
    SideBarDef,
} from "ag-grid-community";
import type { CSSProperties } from "react";

import type { DataViewColumn } from "../column-types";
import type { DataViewItem } from "../data-view-item";
import type { FilterValue, SortConfig } from "../stores/data-view-types";

export type ColumnFilterType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multiselect"
  | "daterange";

/** Base column definition for AG Grid usage */
export interface ListColumn<TData extends DataViewItem> extends ColDef<TData> {
  filterType?: ColumnFilterType;
}

// =============================================================================
// 1. Data Contract Types
// =============================================================================

export interface GridProfile {
  id: string;
  name: string;
  description?: string;
  state?: GridState;
  /** True when this profile is the user's auto-load-on-mount default */
  isDefault?: boolean;
  /**
   * Built-in client-side baseline (no filters/sort/columns applied). Never
   * persisted server-side. Cannot be renamed, deleted, or marked as default
   * via the per-chip menu; consumed only as the always-present "Default View"
   * starting point.
   */
  isSystem?: boolean;
}

/** Payload emitted when the user creates a new profile via the Save-As modal */
export interface ProfileSaveAsInput {
  name: string;
  description?: string;
  state: GridState;
}

/** Payload emitted when the user renames / edits metadata of an existing profile */
export interface ProfileRenameInput {
  id: string;
  name: string;
  description?: string;
}

export interface FetchDataParams {
  startRow?: number;
  endRow?: number;
  sortModel: { colId: string; sort: "asc" | "desc" }[];
  filterModel: FilterModel | AdvancedFilterModel | null;
  quickFilterText?: string;
  groupKeys: string[];
  /** Raw DataView context filters for direct API conversion (bypasses AG Grid filterModel round-trip) */
  contextFilters?: FilterValue[];
  /** Raw DataView context sorts for direct API conversion */
  contextSorts?: SortConfig[];
  /** Raw search text from DataView context */
  contextSearchText?: string;
  /** Raw search field from DataView context */
  contextSearchField?: string;
}

export interface FetchDataResult<TData> {
  data: TData[];
  totalCount?: number;
}

/** Shared data loading contract for all views */
export type ListViewDataSourceProps<TData extends DataViewItem> =
  | { dataMode?: "client"; rowData: TData[]; onFetchData?: never }
  | {
      dataMode: "server";
      onFetchData: (params: FetchDataParams) => Promise<FetchDataResult<TData>>;
      rowData?: never;
    };

// =============================================================================
// 3. Component Options
// =============================================================================

export interface ToolbarOptions {
  showTotalCount?: boolean;
  showSettings?: boolean;
  exportExcel?: boolean;
  exportCsv?: boolean;
  advancedFilters?: boolean;
  fullScreen?: boolean;
}

export type ProfileOptions =
  | {
      enableProfiles: true;
      /** Create a new profile from the current grid state */
      onProfileSaveAs: (input: ProfileSaveAsInput) => Promise<void> | void;
      /** Clear filters/sort/columns back to the grid's baseline */
      onProfileReset: () => void;
      profiles?: GridProfile[];
      activeProfileId?: string;
      /** When true, the profile chip bar renders a skeleton */
      isLoadingProfiles?: boolean;
      /** Persist the current grid state onto the active profile */
      onProfileSave?: (profile: GridProfile) => Promise<void> | void;
      onProfileSelect?: (id: string) => void;
      /** Update a profile's name/description */
      onProfileRename?: (input: ProfileRenameInput) => Promise<void> | void;
      /** Mark a profile as the user's default for this grid */
      onProfileSetDefault?: (id: string) => Promise<void> | void;
      onProfileDelete?: (id: string) => Promise<void> | void;
    }
  | {
      enableProfiles?: false;
      onProfileSaveAs?: never;
      onProfileReset?: never;
      profiles?: never;
      activeProfileId?: never;
      isLoadingProfiles?: never;
      onProfileSave?: never;
      onProfileSelect?: never;
      onProfileRename?: never;
      onProfileSetDefault?: never;
      onProfileDelete?: never;
    };

/**
 * Resolve the export filename. A string is used verbatim (extension is
 * appended if missing); a function is called per export with the target
 * format so consumers can vary by date, filter context, etc.
 */
export type ExportFileNameResolver =
  | string
  | ((mode: "csv" | "excel") => string);

/** Configuration options specifically for ListView (AG Grid) */
export type ListViewOptions<TData extends DataViewItem> = ProfileOptions & {
  editable?: boolean;
  selectionMode?: "single" | "multiple" | "none";
  showCheckboxes?: boolean;
  onGridReady?: (params: GridReadyEvent<TData>) => void;
  onSelectionChanged?: (selectedRows: TData[]) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;
  pagination?: boolean;
  paginationPageSize?: number;
  pageSizeOptions?: number[];
  sideBar?: SideBarDef | string | string[] | boolean | null;
  cellSelection?: boolean;
  defaultColDef?: ColDef<TData>;
  rowSelection?: RowSelectionOptions<TData>;
  gridOptions?: GridOptions<TData>;
  showToolbar?: boolean | ToolbarOptions;
  autoSizeColumns?: boolean;
  defaultShowAdvancedFilters?: boolean;
  /**
   * Base filename for the toolbar / context-menu CSV + Excel exports.
   * The correct extension (`.csv` or `.xlsx`) is appended automatically.
   * Falls back to `export_<timestamp>` when omitted.
   */
  exportFileName?: ExportFileNameResolver;
  /**
   * Escape hatch for CSV export. Merged into `exportDataAsCsv` params
   * after our resolved `fileName` + `columnKeys` — anything the consumer
   * sets explicitly (e.g. `processCellCallback`, custom `fileName`,
   * `processHeaderCallback`) wins.
   */
  defaultCsvExportParams?: CsvExportParams;
  /** Same idea as `defaultCsvExportParams`, for Excel export. */
  defaultExcelExportParams?: ExcelExportParams;
};

/** Full props for the ListView component */
export type ListViewProps<TData extends DataViewItem> =
  ListViewDataSourceProps<TData> &
    ListViewOptions<TData> & {
      columnDefs: DataViewColumn<TData>[];
      loading?: boolean;
      quickFilterText?: string;
      onTotalCountChange?: (count: number) => void;
      /** Opaque key that triggers a server-side data refresh when changed */
      refreshKey?: string | number;
      style?: CSSProperties;
      className?: string;
    };
