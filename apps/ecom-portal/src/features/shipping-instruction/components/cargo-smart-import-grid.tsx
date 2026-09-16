// Modified by Sekar Nagarajan (2026-09-16 15:52)
import type { DataViewColumn } from "@solverminds/shared-ui/data-view";
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import type {
  CellValueChangedEvent,
  GetContextMenuItemsParams,
  GetRowIdParams,
  GridOptions,
  MenuItemDef,
  ValueGetterParams,
} from "ag-grid-community";
import { useCallback, useMemo, useRef } from "react";

import { BOOKING_LOOKUPS } from "../../booking/mocks/booking-lookups.mock";
import { ImportSelectCellEditor } from "../../import-workbench/components/import-select-cell-editor";
import {
  applySmartImportCellChange,
  clearSmartImportLineFields,
  deleteSmartImportRows,
  deleteWouldDropContainer,
  duplicateSmartImportRow,
  insertSmartImportRow,
} from "../smart-import/map-smart-import-rows";
import type { SmartImportRow } from "../smart-import/smart-import.types";

const PACKAGE_TYPE_OPTIONS = BOOKING_LOOKUPS.packageTypes.map((option) => ({
  label: option.label,
  value: option.value,
}));

interface CargoSmartImportGridProps {
  rows: SmartImportRow[];
  onRowsChange: (rows: SmartImportRow[]) => void;
  onDeleteWouldDropContainer?: () => void;
}

function getSmartImportRowId(params: GetRowIdParams<SmartImportRow>) {
  return params.data.rowId;
}

function getRowNumber(params: ValueGetterParams<SmartImportRow>) {
  return (params.node?.rowIndex ?? 0) + 1;
}

export function CargoSmartImportGrid({
  rows,
  onRowsChange,
  onDeleteWouldDropContainer,
}: CargoSmartImportGridProps) {
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const onRowsChangeRef = useRef(onRowsChange);
  onRowsChangeRef.current = onRowsChange;
  const onDeleteWarnRef = useRef(onDeleteWouldDropContainer);
  onDeleteWarnRef.current = onDeleteWouldDropContainer;

  const columnDefs = useMemo<DataViewColumn<SmartImportRow>[]>(
    () => [
      {
        colId: "rowNo",
        headerName: "Row No",
        width: 120,
        minWidth: 100,
        maxWidth: 130,
        editable: false,
        sortable: false,
        filter: false,
        pinned: "left",
        suppressSizeToFit: true,
        valueGetter: getRowNumber,
        cellClass:
          "cargo-smart-import-cell--readonly cargo-smart-import-cell--row-no",
        headerClass: "cargo-smart-import-col--readonly",
      },
      {
        field: "oldContainerNo",
        headerName: "Container No",
        width: 140,
        minWidth: 120,
        editable: false,
        pinned: "left",
        suppressSizeToFit: true,
        cellClass: "cargo-smart-import-cell--readonly",
        headerClass: "cargo-smart-import-col--readonly",
      },
      {
        field: "eqpSize",
        headerName: "Type",
        width: 88,
        editable: false,
        pinned: "left",
        suppressSizeToFit: true,
        cellClass: "cargo-smart-import-cell--readonly",
        headerClass: "cargo-smart-import-col--readonly",
      },
      {
        field: "isSoc",
        headerName: "SOC",
        width: 80,
        editable: true,
        filterType: "boolean",
        cellRenderer: "agCheckboxCellRenderer",
        cellEditor: "agCheckboxCellEditor",
        cellClass:
          "cargo-smart-import-cell--editable cargo-smart-import-cell--soc",
      },
      {
        field: "actualContainerNo",
        headerName: "Actual Container No",
        width: 160,
        minWidth: 140,
        editable: true,
        pinned: "left",
        suppressSizeToFit: true,
        cellClass: "cargo-smart-import-cell--editable",
      },
      {
        field: "carrierSeal",
        headerName: "Carrier Seal",
        width: 130,
        editable: true,
        cellClass: "cargo-smart-import-cell--editable",
      },
      {
        field: "shipperSeal",
        headerName: "Shipper Seal",
        width: 130,
        editable: true,
        cellClass: "cargo-smart-import-cell--editable",
      },
      {
        field: "commodityCode",
        headerName: "Commodity",
        width: 140,
        editable: false,
        cellClass: "cargo-smart-import-cell--readonly",
        headerClass: "cargo-smart-import-col--readonly",
      },
      {
        field: "hsCode",
        headerName: "HS Code",
        width: 120,
        editable: true,
        cellClass: "cargo-smart-import-cell--editable",
      },
      {
        field: "packageType",
        headerName: "Package Type",
        width: 160,
        editable: true,
        cellEditor: ImportSelectCellEditor,
        cellEditorParams: { options: PACKAGE_TYPE_OPTIONS },
        cellEditorPopup: true,
        cellEditorPopupPosition: "under",
        cellClass: "cargo-smart-import-cell--editable",
        valueFormatter: (params) => {
          const value = String(params.value ?? "");
          const match = PACKAGE_TYPE_OPTIONS.find((o) => o.value === value);
          return match?.label ?? value;
        },
      },
      {
        field: "packageCount",
        headerName: "Qty",
        width: 90,
        editable: true,
        filterType: "number",
        cellClass:
          "cargo-smart-import-cell--editable cargo-smart-import-cell--numeric",
      },
      {
        field: "grossWeight",
        headerName: "Weight (kg)",
        width: 120,
        editable: true,
        filterType: "number",
        cellClass:
          "cargo-smart-import-cell--editable cargo-smart-import-cell--numeric",
      },
      {
        field: "volume",
        headerName: "Volume (CBM)",
        width: 120,
        editable: true,
        filterType: "number",
        cellClass:
          "cargo-smart-import-cell--editable cargo-smart-import-cell--numeric",
      },
      {
        field: "marksAndNumbers",
        headerName: "Marks No",
        width: 140,
        editable: true,
        cellClass: "cargo-smart-import-cell--editable",
      },
      {
        field: "description",
        headerName: "Commodity Description",
        width: 260,
        minWidth: 200,
        editable: true,
        cellClass: "cargo-smart-import-cell--editable",
      },
    ],
    [],
  );

  const getContextMenuItems = useCallback(
    (params: GetContextMenuItemsParams<SmartImportRow>) => {
      const node = params.node;
      if (!node?.data) {
        return [];
      }

      const sourceIndex = rowsRef.current.findIndex(
        (row) => row.rowId === node.data?.rowId,
      );
      if (sourceIndex < 0) {
        return [];
      }

      const sourceRow = node.data;
      const selectedRows = params.api.getSelectedRows() as SmartImportRow[];
      const targetIds =
        selectedRows.length > 0
          ? selectedRows.map((row) => row.rowId)
          : [sourceRow.rowId];

      const insertBefore: MenuItemDef = {
        name: "Insert a new row before",
        action: () => {
          onRowsChangeRef.current(
            insertSmartImportRow(rowsRef.current, sourceIndex, "before"),
          );
        },
      };
      const insertAfter: MenuItemDef = {
        name: "Insert a new row after",
        action: () => {
          onRowsChangeRef.current(
            insertSmartImportRow(rowsRef.current, sourceIndex, "after"),
          );
        },
      };
      const duplicateRow: MenuItemDef = {
        name: "Duplicate this row",
        action: () => {
          onRowsChangeRef.current(
            duplicateSmartImportRow(rowsRef.current, sourceIndex),
          );
        },
      };
      const clearLineFields: MenuItemDef = {
        name:
          targetIds.length > 1
            ? "Clear line fields (selected)"
            : "Clear line fields",
        action: () => {
          onRowsChangeRef.current(
            clearSmartImportLineFields(rowsRef.current, targetIds),
          );
        },
      };
      const selectContainerLines: MenuItemDef = {
        name: "Select all lines for this container",
        action: () => {
          params.api.deselectAll();
          params.api.forEachNode((rowNode) => {
            if (rowNode.data?.containerId === sourceRow.containerId) {
              rowNode.setSelected(true);
            }
          });
        },
      };
      const deleteSelected: MenuItemDef = {
        name: "Delete selected rows",
        action: () => {
          if (targetIds.length === 0) {
            return;
          }
          if (deleteWouldDropContainer(rowsRef.current, targetIds)) {
            onDeleteWarnRef.current?.();
          }
          onRowsChangeRef.current(
            deleteSmartImportRows(rowsRef.current, targetIds),
          );
        },
      };

      return [
        insertBefore,
        insertAfter,
        duplicateRow,
        "separator",
        clearLineFields,
        selectContainerLines,
        "separator",
        deleteSelected,
        "separator",
        "copy",
        "copyWithHeaders",
      ];
    },
    [],
  );

  // autoHeight: size to row content so the modal does not need a flex height
  // chain (ListView + AppModal otherwise often leave the viewport at 0px).
  const gridOptions = useMemo<GridOptions<SmartImportRow>>(
    () => ({
      getRowId: getSmartImportRowId,
      domLayout: "autoHeight",
      singleClickEdit: true,
      undoRedoCellEditing: true,
      undoRedoCellEditingLimit: 100,
      getContextMenuItems,
      suppressContextMenu: false,
      stopEditingWhenCellsLoseFocus: true,
    }),
    [getContextMenuItems],
  );

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<SmartImportRow>) => {
      const rowId = event.data?.rowId;
      if (!rowId) {
        return;
      }
      const field = event.colDef.field as keyof SmartImportRow | undefined;
      if (!field || field === "rowId" || field === "containerId") {
        return;
      }
      onRowsChangeRef.current(
        applySmartImportCellChange(
          rowsRef.current,
          rowId,
          field,
          event.newValue,
        ),
      );
    },
    [],
  );

  return (
    <div className="cargo-smart-import-grid custom-scroll">
      <ListView<SmartImportRow>
        dataMode="client"
        rowData={rows}
        columnDefs={columnDefs}
        className="cargo-smart-import-list"
        showToolbar={false}
        sideBar={false}
        pagination={false}
        editable
        selectionMode="multiple"
        showCheckboxes={false}
        cellSelection
        autoSizeColumns={false}
        onCellValueChanged={handleCellValueChanged}
        gridOptions={gridOptions}
      />
    </div>
  );
}
