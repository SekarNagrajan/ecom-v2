import type {
  CellClassParams,
  ColDef,
  ColGroupDef,
  DefaultMenuItem,
  ExcelStyle,
  GetContextMenuItemsParams,
  GridOptions,
  GridReadyEvent,
  GridApi,
  GridState,
  IServerSideDatasource,
  MenuItemDef,
  RowSelectionOptions,
  SideBarDef,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';

import type { DataViewItem } from '../../data-view-item';
import { useAgGridRuntimeSizing, useAgGridTheme } from '../../theme-utils';
import { useListViewContext } from '../context';
import type { ColumnFilterType, ListViewProps } from '../types';
import { AgGridDateComponent } from './ag-grid-date-component';
import { AgGridLoadingOverlay } from './ag-grid-loading-overlay';
import { AgGridNumberFloatingFilter } from './ag-grid-number-floating-filter';
import { AgGridSetFloatingFilter } from './ag-grid-set-floating-filter';
import { AgGridTextFloatingFilter } from './ag-grid-text-floating-filter';

/**
 * Stable identifier for the "force as text" Excel style. Consumers tag a
 * column with `cellClass: PHONE_EXCEL_STYLE_ID` (or the `'phoneText'`
 * literal) to make Excel render it as a String — without this, values like
 * `+91 9876543210` are reinterpreted as numbers on file open and lose their
 * leading `+`, leading zeros, or get coerced to scientific notation.
 */
export const PHONE_EXCEL_STYLE_ID = 'phoneText';

const DEFAULT_EXCEL_STYLES: ExcelStyle[] = [
  { id: PHONE_EXCEL_STYLE_ID, dataType: 'String' },
];

/**
 * Renders nothing for AG Grid's per-row "stub row" loading cell (Server-Side
 * Row Model's built-in indicator for unloaded rows). We already show a
 * single centered spinner via `AgGridLoadingOverlay` for the whole grid, so
 * this suppresses the redundant native "Loading..." row that would
 * otherwise appear underneath/alongside it.
 */
function AgGridNoopLoadingCellRenderer() {
  return null;
}

type AgGridHostProps<TData extends DataViewItem> = {
  gridRef: RefObject<AgGridReact<TData> | null>;
  initialStateRef: RefObject<GridState | null>;
  setGridApi: (api: GridApi<TData> | null) => void;
  rowData: ListViewProps<TData>['rowData'];
  columnDefs: ListViewProps<TData>['columnDefs'];
  loading: boolean | undefined;
  quickFilterText: string | undefined;
  selectionMode: NonNullable<ListViewProps<TData>['selectionMode']>;
  showCheckboxes: boolean;
  editable: boolean;
  dataMode: NonNullable<ListViewProps<TData>['dataMode']>;
  gridOptions: ListViewProps<TData>['gridOptions'];
  pagination: boolean;
  paginationPageSize: number;
  sideBarProp: ListViewProps<TData>['sideBar'];
  cellSelection: boolean;
  userDefaultColDef: ListViewProps<TData>['defaultColDef'];
  userRowSelection: ListViewProps<TData>['rowSelection'];
  autoSizeColumns: boolean;
  onGridReady: ListViewProps<TData>['onGridReady'];
  onSelectionChanged: ListViewProps<TData>['onSelectionChanged'];
  onCellValueChanged: ListViewProps<TData>['onCellValueChanged'];
  activeProfileId: ListViewProps<TData>['activeProfileId'];
  profiles: NonNullable<ListViewProps<TData>['profiles']>;
  showAdvancedFilters: boolean;
  serverSideDatasource: IServerSideDatasource | undefined;
};

const FILTER_MAP: Record<ColumnFilterType, string> = {
  text: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agDateColumnFilter',
  boolean: 'agSetColumnFilter',
  select: 'agSetColumnFilter',
  multiselect: 'agSetColumnFilter',
  daterange: 'agDateColumnFilter',
};

const EDITOR_MAP: Record<ColumnFilterType, string> = {
  text: 'agTextCellEditor',
  number: 'agNumberCellEditor',
  date: 'agDateCellEditor',
  boolean: 'agCheckboxCellEditor',
  select: 'agSelectCellEditor',
  multiselect: 'agSelectCellEditor',
  daterange: 'agDateCellEditor',
};

/**
 * Standard CRM sidebar config: Columns + Filters tool panels visible as a
 * right-edge strip, NO panel expanded on mount. We deliberately omit
 * `defaultToolPanel` — setting it to an empty string causes AG Grid 35 to
 * try to resolve the empty id and end up auto-opening the first panel.
 */
const DEFAULT_SIDE_BAR: SideBarDef = {
  toolPanels: [
    {
      id: 'columns',
      toolPanel: 'agColumnsToolPanel',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
    },
    {
      id: 'filters',
      toolPanel: 'agFiltersToolPanel',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
    },
  ],
};

/**
 * Convert a static `cellClass: PHONE_EXCEL_STYLE_ID` (string or string[])
 * into a function that drops the `phoneText` token when the cell value is
 * empty / null. Works around an AG Grid Enterprise 35 xlsx bug: a column
 * with a String-typed Excel style writes empty cells as
 * `<c t="s"><v/></c>` — a malformed shared-string ref-zero. Excel tolerates
 * it and shows blank, but Numbers (and other strict OOXML readers) resolve
 * the missing index to position 0 of `sharedStrings.xml`, which is the
 * workbook's very first string — typically the leftmost column's header
 * (e.g. "Opportunity Name") — and renders it inside every empty Mobile
 * cell. Dropping the cellClass for empty values lets `shouldDisplayCell`
 * short-circuit and omit the cell from the row XML entirely. Other
 * cellClass tokens the consumer set are preserved on empty cells so
 * unrelated styling (e.g. zebra-stripe classes) still applies. Functional
 * `cellClass` set by the consumer is left untouched on the assumption they
 * already understand the trade-off.
 */
function wrapPhoneTextCellClass<TData extends DataViewItem>(
  cellClass: ColDef<TData>['cellClass']
): ColDef<TData>['cellClass'] {
  const isPhoneTextString = cellClass === PHONE_EXCEL_STYLE_ID;
  const isPhoneTextArray =
    Array.isArray(cellClass) && cellClass.includes(PHONE_EXCEL_STYLE_ID);
  if (!isPhoneTextString && !isPhoneTextArray) {
    return cellClass;
  }

  const remainingClasses = Array.isArray(cellClass)
    ? cellClass.filter((c) => c !== PHONE_EXCEL_STYLE_ID)
    : [];
  return (params: CellClassParams<TData>) => {
    const value = params.value;
    const hasValue = value != null && value !== '';
    if (hasValue) return cellClass;
    return remainingClasses.length > 0 ? remainingClasses : undefined;
  };
}

function buildColumnDefs<TData extends DataViewItem>(
  columnDefs: ListViewProps<TData>['columnDefs'],
  editable: boolean
) {
  return columnDefs.map((col) => {
    const { filterOptions, filterType, excludeFromExport } = col;
    const rest = { ...col };

    delete rest.fetchFilterOptions;
    delete rest.filterLabel;
    delete rest.filterOptions;
    delete rest.filterToggleLabel;
    delete rest.filterType;
    delete rest.isPrimary;
    delete rest.isSecondary;
    delete rest.render;
    delete rest.excludeFromExport;

    const isPhoneTextColumn =
      rest.cellClass === PHONE_EXCEL_STYLE_ID ||
      (Array.isArray(rest.cellClass) &&
        rest.cellClass.includes(PHONE_EXCEL_STYLE_ID));
    rest.cellClass = wrapPhoneTextCellClass<TData>(rest.cellClass);

    // Stash export-time hints on AG Grid's `context` slot (its blessed
    // "user data" pocket) so the export handlers can read them back from
    // `col.getColDef().context` without us having to track a parallel Set.
    // `phoneText` is set here because `wrapPhoneTextCellClass` converts the
    // declarative `cellClass: 'phoneText'` literal into a function, so
    // downstream code can no longer string-match against the cellClass.
    const mergedContext: Record<string, unknown> | undefined =
      excludeFromExport ||
      isPhoneTextColumn ||
      (rest.context && typeof rest.context === 'object')
        ? {
            ...(rest.context as Record<string, unknown> | undefined),
            ...(excludeFromExport ? { excludeFromExport: true } : {}),
            ...(isPhoneTextColumn ? { phoneText: true } : {}),
          }
        : rest.context;

    const isEditable = col.editable ?? editable;
    const usesDateFilter = filterType === 'date' || filterType === 'daterange';
    const supportsSetFilter =
      filterType === 'boolean' ||
      filterType === 'select' ||
      filterType === 'multiselect';
    const inferredSetFilterValues =
      filterType === 'boolean'
        ? [true, false]
        : supportsSetFilter && filterOptions && filterOptions.length > 0
        ? filterOptions.map((option) => option.value)
        : undefined;
    const existingFilterParams = rest.filterParams;
    const hasSetValuesInFilterParams =
      !!existingFilterParams &&
      typeof existingFilterParams === 'object' &&
      Array.isArray((existingFilterParams as { values?: unknown }).values);
    const resolvedFilter = filterType
      ? FILTER_MAP[filterType]
      : rest.filter ?? true;
    const shouldUseTextFloatingFilter =
      !rest.floatingFilterComponent &&
      (resolvedFilter === true || resolvedFilter === 'agTextColumnFilter');
    const shouldUseNumberFloatingFilter =
      !rest.floatingFilterComponent &&
      resolvedFilter === 'agNumberColumnFilter';
    const shouldUseSetFloatingFilter =
      !rest.floatingFilterComponent && resolvedFilter === 'agSetColumnFilter';
    return {
      ...rest,
      ...(mergedContext !== undefined ? { context: mergedContext } : {}),
      filter: resolvedFilter,
      filterParams:
        inferredSetFilterValues && !hasSetValuesInFilterParams
          ? {
              ...(existingFilterParams &&
              typeof existingFilterParams === 'object'
                ? existingFilterParams
                : {}),
              values: inferredSetFilterValues,
            }
          : rest.filterParams,
      dateComponent: usesDateFilter
        ? rest.dateComponent ?? AgGridDateComponent
        : rest.dateComponent,
      cellEditor:
        isEditable && filterType
          ? rest.cellEditor ?? EDITOR_MAP[filterType]
          : rest.cellEditor,
      floatingFilterComponent: shouldUseNumberFloatingFilter
        ? AgGridNumberFloatingFilter
        : shouldUseSetFloatingFilter
        ? AgGridSetFloatingFilter
        : shouldUseTextFloatingFilter
        ? AgGridTextFloatingFilter
        : rest.floatingFilterComponent,
      enableRowGroup: rest.enableRowGroup ?? true,
      enablePivot: rest.enablePivot ?? true,
      enableValue: rest.enableValue ?? true,
    } satisfies ColDef<TData> | ColGroupDef<TData>;
  });
}

function buildDefaultColDef<TData extends DataViewItem>(
  editable: boolean,
  showAdvancedFilters: boolean,
  userDefaultColDef: ListViewProps<TData>['defaultColDef'],
  // Modified by Sekar Nagarajan (2026-09-01 18:25) — skip flex when content auto-sizing
  autoSizeColumns: boolean
) {
  return {
    filter: true,
    sortable: true,
    resizable: true,
    ...(autoSizeColumns ? {} : { flex: 1 }),
    minWidth: 100,
    editable,
    floatingFilter: showAdvancedFilters,
    ...(userDefaultColDef || {}),
  } satisfies ColDef<TData>;
}

function buildRowSelection<TData extends DataViewItem>(
  userRowSelection: ListViewProps<TData>['rowSelection'],
  selectionMode: NonNullable<ListViewProps<TData>['selectionMode']>,
  showCheckboxes: boolean
) {
  if (userRowSelection !== undefined) {
    return userRowSelection;
  }

  if (selectionMode === 'none') {
    return undefined;
  }

  return {
    mode:
      selectionMode === 'multiple'
        ? ('multiRow' as const)
        : ('singleRow' as const),
    checkboxes: showCheckboxes,
    headerCheckbox: selectionMode === 'multiple' && showCheckboxes,
    enableClickSelection: true,
  } satisfies RowSelectionOptions<TData>;
}

function buildContextMenuItems<TData extends DataViewItem>(
  params: GetContextMenuItemsParams<TData>,
  userGetContextMenuItems: NonNullable<
    ListViewProps<TData>['gridOptions']
  >['getContextMenuItems'],
  onExportCsv: () => void,
  onExportExcel: () => void
) {
  if (userGetContextMenuItems) {
    return userGetContextMenuItems(params);
  }

  const defaultItems = params.defaultItems ?? [];
  const contextMenuItems: (DefaultMenuItem | MenuItemDef)[] = [];

  if (defaultItems.includes('copy')) {
    contextMenuItems.push('copy');
  }

  if (defaultItems.includes('copyWithHeaders')) {
    contextMenuItems.push('copyWithHeaders');
  }

  // Replace AG Grid's built-in `csvExport` / `excelExport` / `export` items
  // with custom MenuItemDefs that funnel through the ListView's toolbar
  // handlers — this is what enforces the `excludeFromExport` column filter,
  // the resolved `exportFileName`, and any consumer-supplied
  // `defaultCsvExportParams` / `defaultExcelExportParams`. The native items
  // bypass our handlers and would re-introduce the actions column.
  const hasCsv =
    defaultItems.includes('csvExport') || defaultItems.includes('export');
  const hasExcel =
    defaultItems.includes('excelExport') || defaultItems.includes('export');

  if (contextMenuItems.length > 0 && (hasCsv || hasExcel)) {
    contextMenuItems.push('separator');
  }

  if (hasCsv) {
    contextMenuItems.push({
      name: 'CSV Export',
      action: onExportCsv,
    });
  }

  if (hasExcel) {
    contextMenuItems.push({
      name: 'Excel Export',
      action: onExportExcel,
    });
  }

  return contextMenuItems.length > 0 ? contextMenuItems : defaultItems;
}

export const AgGridHost = <TData extends DataViewItem>({
  gridRef,
  initialStateRef,
  setGridApi,
  rowData,
  columnDefs,
  loading,
  quickFilterText,
  selectionMode,
  showCheckboxes,
  editable,
  dataMode,
  gridOptions,
  pagination,
  paginationPageSize,
  sideBarProp,
  cellSelection,
  userDefaultColDef,
  userRowSelection,
  autoSizeColumns,
  onGridReady,
  onSelectionChanged,
  onCellValueChanged,
  activeProfileId,
  profiles,
  showAdvancedFilters,
  serverSideDatasource,
}: AgGridHostProps<TData>) => {
  'use memo';

  const agGridTheme = useAgGridTheme();
  const { floatingFiltersHeight, headerHeight, rowHeight } =
    useAgGridRuntimeSizing();
  // Export handlers from the ListView orchestrator. We don't pass them as
  // direct AG Grid props (they're invoked imperatively from the context
  // menu items), so we tunnel through a ref to keep `getContextMenuItems`
  // referentially stable regardless of handler identity churn upstream.
  const { handleExportCsv, handleExportExcel } = useListViewContext();
  const exportHandlersRef = useRef({
    handleExportCsv,
    handleExportExcel,
  });
  useEffect(() => {
    exportHandlersRef.current = { handleExportCsv, handleExportExcel };
  }, [handleExportCsv, handleExportExcel]);

  const resolvedColumnDefs = useMemo(
    () => buildColumnDefs(columnDefs, editable),
    [columnDefs, editable]
  );
  const resolvedDefaultColDef = useMemo(
    () =>
      buildDefaultColDef(
        editable,
        showAdvancedFilters,
        userDefaultColDef,
        autoSizeColumns
      ),
    [editable, showAdvancedFilters, userDefaultColDef, autoSizeColumns]
  );
  // Modified by Sekar Nagarajan (2026-09-01 18:25) — AG Grid 35 content auto-size strategy
  const resolvedAutoSizeStrategy = useMemo(() => {
    if (gridOptions?.autoSizeStrategy !== undefined) {
      return gridOptions.autoSizeStrategy;
    }
    if (!autoSizeColumns) {
      return undefined;
    }
    return {
      type: 'fitCellContents' as const,
      scaleUpToFitGridWidth: true,
    };
  }, [autoSizeColumns, gridOptions?.autoSizeStrategy]);
  // Merge our shared "force as text" Excel style with whatever the consumer
  // passed via `gridOptions.excelStyles`. Defaults come first so consumer
  // ids of the same name win on conflict. Memoized to keep AG Grid prop
  // identity stable — `excelStyles` is read from grid options up front and
  // a churning array would otherwise trigger spurious `setGridOption`
  // calls on every render.
  const mergedGridOptions = useMemo<GridOptions<TData> | undefined>(() => {
    const consumerStyles = gridOptions?.excelStyles ?? [];
    const excelStyles: ExcelStyle[] = [
      ...DEFAULT_EXCEL_STYLES,
      ...consumerStyles,
    ];
    return {
      ...gridOptions,
      excelStyles,
      autoSizeStrategy: resolvedAutoSizeStrategy,
      // Single spinner centered over the whole grid body (AG Grid's default
      // overlay wrapper handles the centering) instead of any per-row /
      // per-column indicator. Driven by the `loading` prop below, which for
      // server-mode grids is derived internally from the very first
      // in-flight fetch — see `list-view-grid.tsx`.
      loadingOverlayComponent:
        gridOptions?.loadingOverlayComponent ?? AgGridLoadingOverlay,
      // Suppress AG Grid's own per-row "stub row" loading indicator so it
      // doesn't render alongside `loadingOverlayComponent` above — without
      // this, the Server-Side Row Model's default full-width spinner +
      // "Loading..." row shows underneath our centered overlay at the same
      // time, reading as two separate loading states.
      loadingCellRenderer:
        gridOptions?.loadingCellRenderer ?? AgGridNoopLoadingCellRenderer,
    };
  }, [gridOptions, resolvedAutoSizeStrategy]);
  /**
   * Normalize `sideBar: true` (AntD-style shorthand) and `sideBar: undefined`
   * (no consumer opinion) to our explicit `DEFAULT_SIDE_BAR` config — keeps
   * the sidebar shape consistent across the CRM and immune to AG Grid version
   * drift around what `sideBar={true}` resolves to internally. Consumers can
   * still pass a custom `SideBarDef` or `false` to fully disable.
   */
  const resolvedSideBar = useMemo(() => {
    if (sideBarProp === undefined || sideBarProp === true) {
      return DEFAULT_SIDE_BAR;
    }
    return sideBarProp;
  }, [sideBarProp]);
  const resolvedRowSelection = useMemo(
    () => buildRowSelection(userRowSelection, selectionMode, showCheckboxes),
    [userRowSelection, selectionMode, showCheckboxes]
  );

  useEffect(() => {
    const api = gridRef.current?.api;
    if (api && !api.isDestroyed()) {
      api.setGridOption('defaultColDef', resolvedDefaultColDef);
      api.refreshHeader();
    }
  }, [resolvedDefaultColDef, gridRef]);

  const handleInternalGridReady = useCallback(
    (params: GridReadyEvent<TData>) => {
      setGridApi(params.api);
      if (!initialStateRef.current) {
        initialStateRef.current = params.api.getState();
      }

      if (activeProfileId) {
        const activeProfile = profiles.find(
          (profile) => profile.id === activeProfileId
        );
        if (activeProfile?.state) {
          params.api.setState(activeProfile.state);
        }
      }

      onGridReady?.(params);
    },
    [activeProfileId, initialStateRef, onGridReady, profiles, setGridApi]
  );

  // Modified by Sekar Nagarajan (2026-09-01 18:25) — content auto-size (not sizeColumnsToFit)
  const handleAutoSizeColumns = useCallback(() => {
    if (!autoSizeColumns) return;
    // Keep saved profile column widths when a profile is active.
    if (activeProfileId) return;
    const api = gridRef.current?.api;
    if (api) {
      api.autoSizeAllColumns({ scaleUpToFitGridWidth: true });
    }
  }, [activeProfileId, autoSizeColumns, gridRef]);

  const handleToolPanelSizeChanged = useCallback(() => {
    handleAutoSizeColumns();
  }, [handleAutoSizeColumns]);

  const handleColumnVisible = useCallback(() => {
    handleAutoSizeColumns();
  }, [handleAutoSizeColumns]);

  const handleSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current?.api.getSelectedRows();
    if (selectedRows) {
      onSelectionChanged?.(selectedRows);
    }
  }, [gridRef, onSelectionChanged]);

  const memoizedQuickFilterText =
    dataMode === 'client' ? quickFilterText : undefined;
  const userGetContextMenuItems = gridOptions?.getContextMenuItems;

  // Stable `getContextMenuItems` — built once per `userGetContextMenuItems`
  // identity. The export handlers are read from a ref so this callback
  // doesn't churn when the parent re-renders (every churn re-registers
  // the option via the React wrapper's diff and would otherwise leak
  // closures held by AG Grid's internal menu builder).
  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams<TData>) =>
      buildContextMenuItems(
        params,
        userGetContextMenuItems,
        () => exportHandlersRef.current.handleExportCsv(),
        () => exportHandlersRef.current.handleExportExcel()
      ),
    [userGetContextMenuItems]
  );

  return (
    <AgGridReact
      ref={gridRef}
      theme={agGridTheme}
      rowData={dataMode === 'client' ? rowData : undefined}
      columnDefs={resolvedColumnDefs}
      defaultColDef={resolvedDefaultColDef}
      onGridReady={handleInternalGridReady}
      onToolPanelVisibleChanged={handleToolPanelSizeChanged}
      onColumnVisible={handleColumnVisible}
      rowModelType={dataMode === 'server' ? 'serverSide' : 'clientSide'}
      serverSideDatasource={serverSideDatasource}
      rowSelection={resolvedRowSelection}
      onSelectionChanged={handleSelectionChanged}
      onCellValueChanged={onCellValueChanged}
      cellSelection={cellSelection}
      sideBar={resolvedSideBar}
      enableFilterHandlers={true}
      loading={loading}
      quickFilterText={memoizedQuickFilterText}
      rowHeight={rowHeight}
      headerHeight={headerHeight}
      pagination={pagination}
      suppressPaginationPanel={true}
      paginationPageSize={paginationPageSize}
      floatingFiltersHeight={floatingFiltersHeight}
      {...mergedGridOptions}
      // Keep `getContextMenuItems` AFTER the `gridOptions` spread so our
      // hijack always runs. The wrapper delegates to the consumer's
      // `gridOptions.getContextMenuItems` when present, otherwise renders
      // the standard Copy / CSV Export / Excel Export items wired into the
      // ListView export handlers.
      getContextMenuItems={getContextMenuItems}
    />
  );
};
