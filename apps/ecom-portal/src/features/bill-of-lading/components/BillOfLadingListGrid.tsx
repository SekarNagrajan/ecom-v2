// Modified by Sekar Nagarajan (2026-09-15 11:55)
import { FormattedDate } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Tag } from "antd";
import { useCallback, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import { useModuleCardPagination } from "../../../components/shared/hooks/use-module-card-pagination";
import type { ModuleListViewMode } from "../../../components/shared/hooks/use-module-view-mode";
import { ModuleCardViewPanel } from "../../../components/shared/module-card-view-panel";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import type { BLListDTO, BLPrintType } from "../types/bl.types";
import { getBLListStatusColor, getBLStatusLabel } from "../utils/bl-status";
import { BillOfLadingRowActions } from "./BillOfLadingRowActions";
import { BlListCard } from "./list/bl-list-card";

export interface BillOfLadingListGridProps {
  rows: BLListDTO[];
  loading: boolean;
  viewMode: ModuleListViewMode;
  onViewModeChange: (mode: ModuleListViewMode) => void;
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
  emptyState?: ReactNode;
}

export function BillOfLadingListGrid({
  rows,
  loading,
  viewMode,
  onViewModeChange,
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
  emptyState,
}: BillOfLadingListGridProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const { profileHandlers } = useLocalGridProfiles("bill-of-lading");
  const {
    page: cardPage,
    pageSize: cardPageSize,
    onPaginationChange: onCardPaginationChange,
  } = useModuleCardPagination();

  const columns: DataViewColumn<BLListDTO>[] = useMemo(() => {
    const cols: DataViewColumn<BLListDTO>[] = [
      {
        ...buildActionsColumn<BLListDTO>({
          field: "blNo",
          width: 160,
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
        headerName: t("columns.status"),
        width: 160,
        cellRenderer: (params: { data?: BLListDTO }) => {
          if (!params.data) return null;
          const row = params.data;
          return (
            <Tag
              className="bl-status-tag module-status-tag"
              color={getBLListStatusColor(row)}
            >
              {row.isLocked
                ? t("status.locked")
                : getBLStatusLabel(row.status, t)}
            </Tag>
          );
        },
      },
      {
        field: "blNo",
        headerName: t("columns.blNumber"),
        width: 150,
        pinned: "left",
        colId: "blNo",
        isPrimary: true,
      },
      { field: "mcnNo", headerName: t("columns.mcnNo"), width: 170 },
      { field: "bookingNo", headerName: t("columns.bookingNo"), width: 140 },
    ];

    if (!hideAgencyRefColumn) {
      cols.push({
        field: "agencyRefNo",
        headerName: t("columns.agencyRef"),
        width: 120,
      });
    }

    cols.push(
      {
        field: "origin",
        headerName: t("columns.origin"),
        width: 180,
        isSecondary: true,
      },
      { field: "loadPort", headerName: t("columns.load"), width: 180 },
      {
        field: "dischargePort",
        headerName: t("columns.discharge"),
        width: 180,
      },
      { field: "delivery", headerName: t("columns.delivery"), width: 180 },
      {
        field: "confirmedDate",
        headerName: t("columns.confirmedDate"),
        width: 140,
        cellRenderer: (p: { value?: string | null }) =>
          p.value ? <FormattedDate value={p.value} /> : "-",
      },
      {
        field: "createdDate",
        headerName: t("columns.createdDate"),
        width: 140,
        cellRenderer: (p: { value?: string | null }) =>
          p.value ? <FormattedDate value={p.value} /> : "-",
      },
    );

    return cols;
  }, [
    t,
    enableTermsOnConfirmedEdit,
    hideAgencyRefColumn,
    onCancel,
    onCharges,
    onEdit,
    onManifest,
    onPrint,
    onVerify,
    onView,
    showChargeSummary,
    showNnPrint,
    showReadyToConfirm,
  ]);

  const renderCard = useCallback(
    (item: BLListDTO, state: { isSelected: boolean }) => (
      <BlListCard
        row={item}
        isSelected={state.isSelected}
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
        hideAgencyRef={hideAgencyRefColumn}
      />
    ),
    [
      enableTermsOnConfirmedEdit,
      hideAgencyRefColumn,
      onCancel,
      onCharges,
      onEdit,
      onManifest,
      onPrint,
      onVerify,
      onView,
      showChargeSummary,
      showNnPrint,
      showReadyToConfirm,
    ],
  );

  return (
    <div className="bl-grid-wrap bl-grid-wrap--no-toolbar responsive-table-wrap custom-scroll">
      <ModuleCardViewPanel active={viewMode === "card"}>
        <DataView
          key={viewMode}
          rowData={rows}
          loading={loading}
          emptyState={emptyState}
          columnDefs={columns}
          defaultViewMode={viewMode}
          allowedViewModes={["list", "card"]}
          onViewModeChange={onViewModeChange}
          renderToolbar={() => null}
          className="bl-data-view"
          listOptions={{
            ...profileHandlers,
            showToolbar: { showTotalCount: true, fullScreen: true },
            sideBar: true,
            pagination: true,
            paginationPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            defaultColDef: { filter: true },
            gridOptions: {
              getRowId: (params) => params.data.blNo,
              onRowDoubleClicked: onRowDoubleClicked,
            },
          }}
          cardOptions={{
            idField: "blNo",
            renderCard,
            minCardWidth: 360,
            paginationMode: "pagination",
            page: cardPage,
            pageSize: cardPageSize,
            totalCount: rows.length,
            onPaginationChange: onCardPaginationChange,
            enableLongPressSelection: false,
            surfacePadding: 16,
            gutter: [16, 16],
            surfaceBackground: "transparent",
          }}
        />
      </ModuleCardViewPanel>
    </div>
  );
}
