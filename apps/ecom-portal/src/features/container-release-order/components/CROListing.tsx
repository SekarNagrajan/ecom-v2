// Modified by Sekar Nagarajan (2026-08-26 14:57)
import { FormattedDate } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Tag } from "antd";
import { DateTime } from "luxon";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavIcons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  ModuleEmptyState,
  buildClearFiltersAction,
  buildRetryAction,
} from "../../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { useModuleTitles } from "../../../i18n/use-module-titles";
import { useCRODownloadMutation, useCROSummaryQuery } from "../api/cro.queries";
import type {
  CROListDTO,
  CROListFilters,
  CroSearchValues,
} from "../types/cro.types";
import {
  getCroPrintStatusColor,
  getCroPrintStatusLabel,
  getCroReleaseStatusColor,
  getCroReleaseStatusLabel,
} from "../utils/cro-status";
import { CroLoadingCenter } from "./cro-loading-center";
import { CroSearchPanel } from "./cro-search-panel";
import { CroViewDrawer } from "./view/CroViewDrawer";

const initialFilters: CROListFilters = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? undefined,
  toDate: DateTime.now().toISODate() ?? undefined,
};

export function CROListing() {
  const { t } = useTranslation([
    "container-release-order",
    "common",
    "modules",
  ]);
  const MODULE_TITLES = useModuleTitles();
  const { profileHandlers } = useLocalGridProfiles("container-release-order");
  const [filters, setFilters] = useState<CROListFilters>(initialFilters);
  const [selectedCroNo, setSelectedCroNo] = useState<string | null>(null);

  const {
    data: rows = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useCROSummaryQuery(filters.fromDate, filters.toDate);
  const { mutate: downloadDoc } = useCRODownloadMutation();

  const handleSearch = (values: CroSearchValues) => {
    setFilters({ fromDate: values.fromDate, toDate: values.toDate });
  };

  const handleClearFilters = () => setFilters(initialFilters);

  const handleView = (croNo: string) => {
    setSelectedCroNo(croNo);
  };

  const handleRowDoubleClick = (event: RowDoubleClickedEvent<CROListDTO>) => {
    const croNo = event.data?.croNo;
    if (croNo) handleView(croNo);
  };

  const columns: DataViewColumn<CROListDTO>[] = [
    {
      ...buildActionsColumn<CROListDTO>({
        field: "croNo",
        width: 110,
        cellRenderer: (params) => {
          if (!params.data) return null;
          const row = params.data;
          return (
            <ListActionsRow>
              <ListActionButton
                title={t("actions.viewDetails")}
                icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(row.croNo);
                }}
              />
              <ListActionButton
                title={t("actions.printContainerReleaseOrder")}
                icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadDoc(row.croNo);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      field: "croNo",
      headerName: t("columns.releaseNo"),
      width: 130,
      pinned: "left",
    },
    { field: "bookingNo", headerName: t("columns.bookingNo"), width: 130 },
    {
      field: "croDate",
      headerName: t("columns.croDate"),
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    { field: "vessel", headerName: t("columns.vessel"), width: 140 },
    { field: "voyage", headerName: t("columns.voyage"), width: 100 },
    { field: "loadPort", headerName: t("columns.loadPort"), width: 140 },
    {
      field: "dischargePort",
      headerName: t("columns.discharge"),
      width: 140,
    },
    { field: "eqpType", headerName: t("columns.contType"), width: 100 },
    { field: "qtyBooked", headerName: t("columns.qtyBooked"), width: 110 },
    {
      field: "qtyReleased",
      headerName: t("columns.qtyReleased"),
      width: 120,
    },
    {
      field: "emptyReleaseDepot",
      headerName: t("columns.emptyReleaseDepot"),
      width: 170,
    },
    {
      field: "validTo",
      headerName: t("columns.croValidity"),
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      headerName: t("columns.status"),
      field: "releaseStatus",
      width: 120,
      cellRenderer: (params: { data?: CROListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="cro-status-tag"
            color={getCroReleaseStatusColor(params.data.releaseStatus)}
          >
            {getCroReleaseStatusLabel(params.data.releaseStatus, t)}
          </Tag>
        );
      },
    },
    {
      headerName: t("common:actions.print"),
      field: "printStatus",
      width: 110,
      cellRenderer: (params: { data?: CROListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="cro-status-tag"
            color={getCroPrintStatusColor(params.data.printStatus)}
          >
            {getCroPrintStatusLabel(params.data.printStatus, t)}
          </Tag>
        );
      },
    },
  ];

  const showLoading = isLoading && rows.length === 0;
  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title={t("empty.loadErrorTitle")}
      message={t("empty.loadErrorMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="filtered"
      title={t("empty.noResultsTitle")}
      message={t("empty.noResultsMessage")}
      actions={[buildClearFiltersAction(handleClearFilters)]}
    />
  );

  return (
    <div className="cro-page-layout">
      <div className="cro-page-header">
        <ModuleScreenHeader
          icon={NavIcons.containerRelease}
          title={MODULE_TITLES.containerReleaseOrder}
          subtitle={t("subtitle")}
          marginBottom={0}
        />
      </div>

      <CroSearchPanel isSearching={isFetching} onSearch={handleSearch} />

      {showLoading ? (
        <CroLoadingCenter fill />
      ) : isError && rows.length === 0 ? (
        emptyState
      ) : (
        <div className="cro-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columns}
            loading={isFetching}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="cro-data-view"
            listOptions={{
              ...profileHandlers,
              showToolbar: { showTotalCount: true, fullScreen: true },
              sideBar: true,
              pagination: true,
              paginationPageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
              defaultColDef: { filter: true },
              gridOptions: {
                getRowId: (params: { data: CROListDTO }) => params.data.croNo,
                onRowDoubleClicked: handleRowDoubleClick,
              },
            }}
          />
        </div>
      )}

      {selectedCroNo ? (
        <CroViewDrawer
          croNo={selectedCroNo}
          onClose={() => setSelectedCroNo(null)}
        />
      ) : null}
    </div>
  );
}
