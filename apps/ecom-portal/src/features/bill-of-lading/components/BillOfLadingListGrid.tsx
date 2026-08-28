// Modified by Sekar Nagarajan (2026-08-28 11:55)
import { FormattedDate } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import type {
  RowDoubleClickedEvent,
  SelectionChangedEvent,
} from "ag-grid-community";
import { Tag } from "antd";
import { useMemo } from "react";

import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import type { BLListDTO, BLPrintType } from "../types/bl.types";
import { getBLStatusColor } from "../utils/bl-status";
import { BillOfLadingRowActions } from "./BillOfLadingRowActions";

export interface BillOfLadingListGridProps {
  rows: BLListDTO[];
  loading: boolean;
  onView: (blNo: string) => void;
  onEdit: (blNo: string) => void;
  onPrint: (blNo: string, type: BLPrintType) => void;
  onVerify: (blNo: string) => void;
  onCancel: (blNo: string) => void;
  onCharges: (blNo: string) => void;
  onManifest: (blNo: string, mcnNo: string | null) => void;
  onRowDoubleClicked?: (event: RowDoubleClickedEvent<BLListDTO>) => void;
  hideAgencyRefColumn?: boolean;
  showChargeSummary?: boolean;
  showNnPrint?: boolean;
  showReadyToConfirm?: boolean;
  enableTermsOnConfirmedEdit?: boolean;
  rowSelection?: "multiple" | "single";
  onSelectionChanged?: (event: SelectionChangedEvent<BLListDTO>) => void;
}

export function BillOfLadingListGrid({
  rows,
  loading,
  onView,
  onEdit,
  onPrint,
  onVerify,
  onCancel,
  onCharges,
  onManifest,
  onRowDoubleClicked,
  hideAgencyRefColumn = false,
  showChargeSummary = true,
  showNnPrint = true,
  showReadyToConfirm = false,
  enableTermsOnConfirmedEdit = true,
  rowSelection,
  onSelectionChanged,
}: BillOfLadingListGridProps) {
  const columns: DataViewColumn<BLListDTO>[] = useMemo(() => {
    const cols: DataViewColumn<BLListDTO>[] = [
      {
        ...buildActionsColumn<BLListDTO>({
          field: "blNo",
          width: 240,
          cellRenderer: (params) => {
            if (!params.data) return null;
            return (
              <BillOfLadingRowActions
                row={params.data}
                onView={onView}
                onEdit={onEdit}
                onPrint={onPrint}
                onVerify={onVerify}
                onCancel={onCancel}
                onCharges={onCharges}
                onManifest={onManifest}
                showChargeSummary={showChargeSummary}
                showNnPrint={showNnPrint}
                showReadyToConfirm={showReadyToConfirm}
                enableTermsOnConfirmedEdit={enableTermsOnConfirmedEdit}
              />
            );
          },
        }),
        colId: "actions",
      },
      {
        field: "statusLabel",
        headerName: "Status",
        width: 150,
        cellRenderer: (params: { data?: BLListDTO }) => {
          if (!params.data) return null;
          return (
            <Tag
              className="bl-status-tag"
              color={getBLStatusColor(params.data.status)}
            >
              {params.data.isLocked ? "Locked" : params.data.statusLabel}
            </Tag>
          );
        },
      },
      {
        field: "blNo",
        headerName: "B/L Number",
        width: 150,
        pinned: "left",
        colId: "blNo",
        checkboxSelection: rowSelection === "multiple",
        headerCheckboxSelection: rowSelection === "multiple",
      },
      { field: "mcnNo", headerName: "MCN No", width: 130 },
      { field: "bookingNo", headerName: "Booking No", width: 140 },
    ];

    if (!hideAgencyRefColumn) {
      cols.push({
        field: "agencyRefNo",
        headerName: "Agency Ref",
        width: 120,
      });
    }

    cols.push(
      { field: "origin", headerName: "Origin", width: 180 },
      { field: "loadPort", headerName: "Load", width: 180 },
      { field: "dischargePort", headerName: "Discharge", width: 180 },
      { field: "delivery", headerName: "Delivery", width: 180 },
      {
        field: "confirmedDate",
        headerName: "Confirmed Date",
        width: 140,
        cellRenderer: (p: { value?: string | null }) =>
          p.value ? <FormattedDate value={p.value} /> : "-",
      },
      {
        field: "createdDate",
        headerName: "Created Date",
        width: 140,
        cellRenderer: (p: { value?: string | null }) =>
          p.value ? <FormattedDate value={p.value} /> : "-",
      },
    );

    return cols;
  }, [
    enableTermsOnConfirmedEdit,
    hideAgencyRefColumn,
    onCancel,
    onCharges,
    onEdit,
    onManifest,
    onPrint,
    onVerify,
    onView,
    rowSelection,
    showChargeSummary,
    showNnPrint,
    showReadyToConfirm,
  ]);

  return (
    <div className="bl-grid-wrap responsive-table-wrap custom-scroll">
      <DataView
        rowData={rows}
        loading={loading}
        columnDefs={columns}
        allowedViewModes={["list"]}
        defaultViewMode="list"
        renderToolbar={() => null}
        className="bl-data-view"
        listOptions={{
          showToolbar: false,
          gridOptions: {
            getRowId: (params) => params.data.blNo,
            onRowDoubleClicked: onRowDoubleClicked,
            rowSelection: rowSelection
              ? { mode: rowSelection === "multiple" ? "multiRow" : "singleRow" }
              : undefined,
            onSelectionChanged,
          },
        }}
      />
    </div>
  );
}
