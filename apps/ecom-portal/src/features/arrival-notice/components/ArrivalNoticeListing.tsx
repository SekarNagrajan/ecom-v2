// Modified by Sekar Nagarajan (2026-09-29 12:35)
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
import {
  useArrivalNoticeDownloadMutation,
  useArrivalNoticeListQuery,
} from "../api/arrival-notice.queries";
import type {
  ArnSearchValues,
  ArrivalNoticeListDTO,
  ArrivalNoticeListFilters,
} from "../types/arrival-notice.types";
import {
  formatArnAmount,
  getArnPrintStatusColor,
  getArnPrintStatusLabel,
} from "../utils/arn-status";
import { ArnLoadingCenter } from "./arn-loading-center";
import { ArnSearchPanel } from "./arn-search-panel";
import { AnViewDrawer } from "./view/AnViewDrawer";

const initialFilters: ArrivalNoticeListFilters = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? undefined,
  toDate: DateTime.now().toISODate() ?? undefined,
};

export function ArrivalNoticeListing() {
  const { t } = useTranslation(["arrival-notice", "common"]);
  const MODULE_TITLES = useModuleTitles();
  const { profileHandlers } = useLocalGridProfiles("arrival-notice");
  const [filters, setFilters] =
    useState<ArrivalNoticeListFilters>(initialFilters);
  const [selectedAnNo, setSelectedAnNo] = useState<string | null>(null);

  const {
    data: rows = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useArrivalNoticeListQuery(filters.fromDate, filters.toDate);
  const { mutate: downloadDoc } = useArrivalNoticeDownloadMutation();

  const handleSearch = (values: ArnSearchValues) => {
    setFilters({ fromDate: values.fromDate, toDate: values.toDate });
  };

  const handleClearFilters = () => setFilters(initialFilters);

  const handleView = (anNo: string) => {
    setSelectedAnNo(anNo);
  };

  const handleRowDoubleClick = (
    event: RowDoubleClickedEvent<ArrivalNoticeListDTO>,
  ) => {
    const anNo = event.data?.anNo;
    if (anNo) handleView(anNo);
  };

  const columns: DataViewColumn<ArrivalNoticeListDTO>[] = [
    {
      ...buildActionsColumn<ArrivalNoticeListDTO>({
        field: "anNo",
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
                  handleView(row.anNo);
                }}
              />
              <ListActionButton
                title={t("actions.printArrivalNotice")}
                icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadDoc(row.anNo);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    { field: "anNo", headerName: t("columns.anNo"), width: 130, pinned: "left" },
    { field: "blNumber", headerName: t("columns.blNumber"), width: 140 },
    { field: "vessel", headerName: t("columns.vessel"), width: 140 },
    { field: "voyage", headerName: t("columns.voyage"), width: 100 },
    { field: "dischargePort", headerName: t("columns.discharge"), width: 160 },
    { field: "terminal", headerName: t("columns.terminal"), width: 120 },
    {
      field: "etaDate",
      headerName: t("columns.eta"),
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "arrivalDate",
      headerName: t("columns.arrival"),
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "lastFreeDay",
      headerName: t("columns.lastFreeDay"),
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "chargesDue",
      headerName: t("columns.chargesDue"),
      width: 140,
      cellRenderer: (params: { data?: ArrivalNoticeListDTO }) => {
        if (!params.data) return null;
        if (params.data.chargesDue <= 0) return "—";
        return formatArnAmount(params.data.chargesDue, params.data.currency);
      },
    },
    {
      headerName: t("common:actions.print"),
      field: "printStatus",
      width: 120,
      cellRenderer: (params: { data?: ArrivalNoticeListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="arn-status-tag"
            color={getArnPrintStatusColor(params.data.printStatus)}
          >
            {getArnPrintStatusLabel(params.data.printStatus, t)}
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
    <div className="arn-page-layout">
      <div className="arn-page-header">
        <ModuleScreenHeader
          icon={NavIcons.arrivalNotice}
          title={MODULE_TITLES.arrivalNotice}
          subtitle={t("subtitle")}
          marginBottom={0}
        />
      </div>

      <ArnSearchPanel isSearching={isFetching} onSearch={handleSearch} />

      {showLoading ? (
        <ArnLoadingCenter fill />
      ) : isError && rows.length === 0 ? (
        emptyState
      ) : (
        <div className="arn-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columns}
            loading={isFetching}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="arn-data-view"
            listOptions={{
              ...profileHandlers,
              showToolbar: { showTotalCount: true, fullScreen: true },
              sideBar: true,
              pagination: true,
              paginationPageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
              defaultColDef: { filter: true },
              gridOptions: {
                getRowId: (params: { data: ArrivalNoticeListDTO }) =>
                  params.data.anNo,
                onRowDoubleClicked: handleRowDoubleClick,
              },
            }}
          />
        </div>
      )}

      {selectedAnNo ? (
        <AnViewDrawer
          anNo={selectedAnNo}
          onClose={() => setSelectedAnNo(null)}
        />
      ) : null}
    </div>
  );
}
