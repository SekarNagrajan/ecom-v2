import {
  type GridApi,
  type GridState,
  type ProcessCellForExportParams,
} from 'ag-grid-community';
import { type AgGridReact } from 'ag-grid-react';
import { useEffect, useRef, useState } from 'react';

import { useAntdBreakpoint } from '../../../../hooks';
import type { DataViewItem } from '../../data-view-item';
import type {
  ExportFileNameResolver,
  GridProfile,
  ListViewProps,
} from '../types';

const CSV_EXTENSION = 'csv';
const EXCEL_EXTENSION = 'xlsx';

function resolveExportFileName(
  resolver: ExportFileNameResolver | undefined,
  mode: 'csv' | 'excel'
): string {
  const extension = mode === 'csv' ? CSV_EXTENSION : EXCEL_EXTENSION;
  const base =
    typeof resolver === 'function' ? resolver(mode) : resolver?.trim();

  if (!base) {
    return `export_${Date.now()}.${extension}`;
  }

  // If the consumer already includes a matching extension, respect it
  // verbatim. Otherwise append ours so callers don't have to think about
  // which mode they're targeting.
  return base.toLowerCase().endsWith(`.${extension}`)
    ? base
    : `${base}.${extension}`;
}

/**
 * CSV `processCellCallback`. AG Grid passes the RAW value (from valueGetter)
 * here and skips the column's `valueFormatter` automatically when this
 * callback is set — the callback owns formatting end-to-end. We do two
 * things:
 *
 * 1. Apply the column's `valueFormatter` via `params.formatValue` so columns
 *    that map a code to a friendly label (e.g. `stageCode → "Initial
 *    Contact"`) export the readable text instead of the raw enum. Columns
 *    without a formatter get the raw value back, unchanged.
 * 2. For columns flagged via `colDef.context.phoneText` (set by
 *    `AgGridHost.buildColumnDefs` when the consumer used the `'phoneText'`
 *    cellClass), wrap the value in Excel's `="..."` formula syntax so
 *    Windows Excel doesn't coerce 10-digit phones to scientific notation
 *    when opening the `.csv` directly. The companion `.xlsx` path doesn't
 *    need this — `excelStyles` already pins those cells to
 *    `dataType: 'String'`. Empty values stay empty so non-Excel CSV
 *    consumers see blank cells rather than `=""`.
 */
function csvProcessCellCallback(params: ProcessCellForExportParams): string {
  const formatted = params.formatValue(params.value);
  const stringValue = formatted == null ? '' : String(formatted).trim();
  if (!stringValue) return '';

  const context = params.column.getColDef().context as
    | { phoneText?: boolean }
    | undefined;
  if (!context?.phoneText) return stringValue;

  return `="${stringValue.replace(/"/g, '""')}"`;
}

/**
 * Build the `columnKeys` whitelist for an export call by walking the grid's
 * displayed columns and dropping any tagged with
 * `colDef.context.excludeFromExport`. Returns `undefined` when no columns
 * are excluded so we let AG Grid's default behavior (export all displayed
 * columns) flow through unchanged.
 */
function buildExportColumnKeys<TData extends DataViewItem>(
  api: GridApi<TData>
): string[] | undefined {
  const displayed = api.getAllDisplayedColumns();
  if (!displayed || displayed.length === 0) {
    return undefined;
  }

  const filtered = displayed.filter((column) => {
    const context = column.getColDef().context as
      | { excludeFromExport?: boolean }
      | undefined;
    return context?.excludeFromExport !== true;
  });

  if (filtered.length === displayed.length) {
    return undefined;
  }

  return filtered.map((column) => column.getColId());
}

export function useListViewLogic<TData extends DataViewItem>(
  props: ListViewProps<TData>
) {
  const {
    profiles = [],
    activeProfileId,
    onProfileSave,
    onProfileSaveAs,
    onProfileReset,
    paginationPageSize = 20,
    defaultShowAdvancedFilters = false,
    exportFileName,
    defaultCsvExportParams,
    defaultExcelExportParams,
  } = props;

  const { isMobile } = useAntdBreakpoint();
  const gridRef = useRef<AgGridReact<TData>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialStateRef = useRef<GridState | null>(null);
  const prevActiveProfileIdRef = useRef<string | undefined>(undefined);
  /**
   * Set to a profile id when the user selects a chip whose `state` hasn't been
   * hydrated yet. The effect re-runs when `profiles` changes (e.g. parent
   * finishes fetching the GridState) and, if the pending id matches, applies
   * the now-available state exactly once. This is the only path that allows
   * the effect to react to `profiles` content; all other refetches no-op so
   * we don't stomp the user's in-progress grid edits.
   */
  const pendingHydrationIdRef = useRef<string | undefined>(undefined);

  const [gridApi, setGridApi] = useState<GridApi<TData> | null>(null);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<GridProfile | null>(
    null
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(
    defaultShowAdvancedFilters
  );
  const [rowCount, setRowCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(paginationPageSize);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  /**
   * Apply a profile's saved GridState on TWO triggers only:
   *   1. The active profile id transitions (user clicks a chip, reset, etc.)
   *   2. The state for a previously-selected-but-unhydrated profile lands
   *      from a refetch (lazy hydration completes for the pending id).
   *
   * All other `profiles` array reference changes (e.g. refetch after save
   * mutation, sibling profile metadata edits) are intentional no-ops — they
   * would otherwise stomp the user's in-progress filter/column edits.
   */
  useEffect(() => {
    if (!gridApi) return;

    const prevId = prevActiveProfileIdRef.current;
    const idChanged = prevId !== activeProfileId;

    if (idChanged) {
      prevActiveProfileIdRef.current = activeProfileId;

      if (!activeProfileId) {
        pendingHydrationIdRef.current = undefined;
        if (initialStateRef.current) {
          gridApi.setState(initialStateRef.current);
        }
        return;
      }

      const profile = profiles.find((p) => p.id === activeProfileId);

      // System "Default View" → reset to baseline; no server payload to hydrate.
      if (profile?.isSystem) {
        pendingHydrationIdRef.current = undefined;
        gridApi.setFilterModel(null);
        gridApi.resetColumnState();
        gridApi.setGridOption('quickFilterText', undefined);
        if (initialStateRef.current) {
          gridApi.setState(initialStateRef.current);
        }
        return;
      }

      if (profile?.state) {
        pendingHydrationIdRef.current = undefined;
        gridApi.setState(profile.state);
        return;
      }

      // Selected chip but its state isn't hydrated yet — apply baseline now
      // and remember to re-apply once hydration arrives.
      pendingHydrationIdRef.current = activeProfileId;
      if (initialStateRef.current) {
        gridApi.setState(initialStateRef.current);
      }
      return;
    }

    // Same id, profiles array changed (refetch). Only the pending-hydration
    // path is allowed to touch the grid here.
    if (
      pendingHydrationIdRef.current &&
      pendingHydrationIdRef.current === activeProfileId
    ) {
      const profile = profiles.find((p) => p.id === activeProfileId);
      if (profile?.state) {
        gridApi.setState(profile.state);
        pendingHydrationIdRef.current = undefined;
      }
    }
  }, [gridApi, activeProfileId, profiles]);

  // Resolved fileName lives on the base object so consumer-supplied
  // `defaultCsvExportParams.fileName` / `defaultExcelExportParams.fileName`
  // (spread last) can still override per-export — same with `columnKeys`
  // and `processCellCallback`. If the consumer hasn't opted out by setting
  // their own `columnKeys`, we compute the `excludeFromExport`-aware
  // whitelist for them. The default `processCellCallback` applies the
  // column's `valueFormatter` (AG Grid skips that automatically once
  // `processCellCallback` is set) and wraps phone-tagged columns in
  // Excel's `="..."` formula syntax to defeat scientific-notation coercion.
  const handleExportCsv = () => {
    if (!gridApi) return;
    const baseParams = {
      fileName: resolveExportFileName(exportFileName, 'csv'),
      columnKeys: buildExportColumnKeys(gridApi),
      processCellCallback: csvProcessCellCallback,
    };
    gridApi.exportDataAsCsv({ ...baseParams, ...defaultCsvExportParams });
  };

  const handleExportExcel = () => {
    if (!gridApi) return;
    const baseParams = {
      fileName: resolveExportFileName(exportFileName, 'excel'),
      columnKeys: buildExportColumnKeys(gridApi),
    };
    gridApi.exportDataAsExcel({ ...baseParams, ...defaultExcelExportParams });
  };

  const handleFullScreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      void containerRef.current.requestFullscreen();
    }
  };

  const handleSaveProfile = async () => {
    if (!gridApi) return;
    const state = gridApi.getState();
    const activeProfile = profiles.find((p) => p.id === activeProfileId);
    if (activeProfile && onProfileSave) {
      await onProfileSave({ ...activeProfile, state });
    }
  };

  const handleConfirmSaveAs = async (input: {
    name: string;
    description?: string;
  }) => {
    if (!gridApi) return;
    const state = gridApi.getState();
    await onProfileSaveAs?.({ ...input, state });
    setIsSaveAsModalOpen(false);
  };

  /**
   * Clear grid filters/sort/columns to baseline AND fire the parent callback
   * so the consumer can clear `activeProfileId` + any URL state it owns.
   * No API call is made on reset — saved profiles on the server are untouched.
   */
  const handleResetProfile = () => {
    if (gridApi) {
      gridApi.setFilterModel(null);
      gridApi.resetColumnState();
      gridApi.setGridOption('quickFilterText', undefined);
      if (initialStateRef.current) {
        gridApi.setState(initialStateRef.current);
      }
    }
    onProfileReset?.();
  };

  const openRenameModal = (profile: GridProfile) => {
    setEditingProfile(profile);
  };

  const closeRenameModal = () => {
    setEditingProfile(null);
  };

  const state = {
    gridApi,
    setGridApi,
    rowCount,
    setRowCount,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    showAdvancedFilters,
    setShowAdvancedFilters,
    isSettingsDrawerOpen,
    setIsSettingsDrawerOpen,
    isSaveAsModalOpen,
    setIsSaveAsModalOpen,
    editingProfile,
    isMobile,
  };

  const refs = {
    gridRef,
    containerRef,
    initialStateRef,
  };

  const handlers = {
    handleExportCsv,
    handleExportExcel,
    handleFullScreen,
    handleSaveProfile,
    handleConfirmSaveAs,
    handleResetProfile,
    openRenameModal,
    closeRenameModal,
  };

  return { state, refs, handlers };
}
