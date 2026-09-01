import type {
  GridApi,
  GridState,
  IServerSideDatasource,
} from 'ag-grid-community';
import { type AgGridReact } from 'ag-grid-react';
import { useEffect, useRef, useState, type RefObject } from 'react';

import { TopLoadingBar } from '../../../common/top-loading-bar';
import type { DataViewItem } from '../../data-view-item';
import type { FetchDataParams, ListViewProps } from '../types';
import { AgGridHost } from './ag-grid-host';

type ListViewGridProps<TData extends DataViewItem> = {
  props: ListViewProps<TData>;
  gridRef: RefObject<AgGridReact<TData> | null>;
  initialStateRef: RefObject<GridState | null>;
  setGridApi: (api: GridApi<TData> | null) => void;
  setRowCount: (count: number) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  showAdvancedFilters: boolean;
};

export const ListViewGrid = <TData extends DataViewItem>({
  props,
  gridRef,
  initialStateRef,
  setGridApi,
  setRowCount,
  showAdvancedFilters,
}: ListViewGridProps<TData>) => {
  const {
    rowData,
    columnDefs = [],
    loading,
    quickFilterText,
    selectionMode = 'none',
    showCheckboxes = false,
    editable = false,
    dataMode = 'client',
    gridOptions,
    pagination = false,
    paginationPageSize = 20,
    sideBar: sideBarProp,
    cellSelection = true,
    defaultColDef: userDefaultColDef,
    rowSelection: userRowSelection,
    // Modified by Sekar Nagarajan (2026-09-01 18:25) — default content auto-size all columns
    autoSizeColumns = true,
    onGridReady,
    onTotalCountChange,
    onSelectionChanged,
    onCellValueChanged,
    onFetchData,
    refreshKey,
    activeProfileId,
    profiles = [],
  } = props;

  const callbacksRef = useRef({
    onFetchData,
    setRowCount,
    onTotalCountChange,
    quickFilterText,
  });

  useEffect(() => {
    callbacksRef.current = {
      onFetchData,
      setRowCount,
      onTotalCountChange,
      quickFilterText,
    };
  }, [onFetchData, setRowCount, onTotalCountChange, quickFilterText]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (dataMode !== 'server') return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const api = gridRef.current?.api;
    if (api && !api.isDestroyed()) {
      api.refreshServerSide({ purge: false });
    }
  }, [refreshKey, dataMode, gridRef]);

  // Tracks in-flight server `getRows` invocations so we can render a
  // non-blocking refetch indicator (`TopLoadingBar`). Initial mount fetches
  // are intentionally skipped via `hasFetchedOnceRef` so the bar only shows
  // on subsequent refreshes (filter change, sort, pagination, external
  // refresh) and never competes with the very first paint. Lives in
  // component state (not AG Grid options) so AG Grid prop identity stays
  // stable — the datasource closure is created once via `useState(() =>
  // …)`, and `setPendingFetchCount` is referentially stable.
  const [pendingFetchCount, setPendingFetchCount] = useState(0);
  const hasFetchedOnceRef = useRef(false);

  const [serverSideDatasource] = useState<IServerSideDatasource | undefined>(
    () =>
      dataMode === 'server'
        ? {
            getRows: async (params) => {
              const {
                onFetchData: currentOnFetchData,
                setRowCount: currentSetRowCount,
                onTotalCountChange: currentOnTotalCountChange,
                quickFilterText: currentQuickFilterText,
              } = callbacksRef.current;

              if (!currentOnFetchData) {
                params.fail();
                return;
              }

              setPendingFetchCount((count) => count + 1);

              try {
                const fetchParams: FetchDataParams = {
                  startRow: params.request.startRow,
                  endRow: params.request.endRow,
                  sortModel: params.request.sortModel,
                  filterModel: params.request.filterModel,
                  quickFilterText: currentQuickFilterText,
                  groupKeys: params.request.groupKeys,
                };

                const result = await currentOnFetchData(fetchParams);
                params.success({
                  rowData: result.data,
                  rowCount: result.totalCount,
                });

                if (result.totalCount !== undefined) {
                  currentSetRowCount(result.totalCount);
                  currentOnTotalCountChange?.(result.totalCount);
                }
              } catch (error) {
                console.error('DataView Server Error:', error);
                params.fail();
              } finally {
                hasFetchedOnceRef.current = true;
                setPendingFetchCount((count) => Math.max(0, count - 1));
              }
            },
          }
        : undefined
  );

  const showRefetchIndicator =
    dataMode === 'server' && pendingFetchCount > 0 && hasFetchedOnceRef.current;

  // Mirror image of `showRefetchIndicator`: covers ONLY the very first
  // fetch (before `hasFetchedOnceRef` flips), driving AG Grid's native
  // centered `loading` overlay (see `AgGridLoadingOverlay`) for that one
  // window. Most server-mode consumers hardcode `loading={false}` and rely
  // on this internal signal instead, since they have no other concept of
  // "grid's own initial fetch is pending".
  const isInitialServerLoad =
    dataMode === 'server' && pendingFetchCount > 0 && !hasFetchedOnceRef.current;
  const effectiveLoading =
    dataMode === 'server' ? loading || isInitialServerLoad : loading;

  useEffect(() => {
    if (dataMode === 'client') {
      setRowCount(rowData?.length || 0);
    }
  }, [dataMode, rowData, setRowCount]);

  const isAutoHeight = gridOptions?.domLayout === 'autoHeight';

  return (
    <div
      style={
        isAutoHeight
          ? { width: '100%', position: 'relative' }
          : { flex: 1, minHeight: 0, width: '100%', position: 'relative' }
      }
    >
      <TopLoadingBar active={showRefetchIndicator} />
      <AgGridHost
        gridRef={gridRef}
        initialStateRef={initialStateRef}
        setGridApi={setGridApi}
        rowData={rowData}
        columnDefs={columnDefs}
        loading={effectiveLoading}
        quickFilterText={quickFilterText}
        selectionMode={selectionMode}
        showCheckboxes={showCheckboxes}
        editable={editable}
        dataMode={dataMode}
        gridOptions={gridOptions}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        sideBarProp={sideBarProp}
        cellSelection={cellSelection}
        userDefaultColDef={userDefaultColDef}
        userRowSelection={userRowSelection}
        autoSizeColumns={autoSizeColumns}
        onGridReady={onGridReady}
        onSelectionChanged={onSelectionChanged}
        onCellValueChanged={onCellValueChanged}
        activeProfileId={activeProfileId}
        profiles={profiles}
        showAdvancedFilters={showAdvancedFilters}
        serverSideDatasource={serverSideDatasource}
      />
    </div>
  );
};
