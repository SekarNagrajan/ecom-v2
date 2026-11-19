// Modified by Sekar Nagarajan (2026-08-26 14:26)
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

import { AppIcon, Icons } from "../../../components/icons";
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
  useDODownloadMutation,
  useDOSummaryQuery,
} from "../api/delivery-order.queries";
import type {
  DOListFilters,
  DOSearchValues,
  DOSummaryRow,
} from "../types/delivery-order.types";
import {
  getDoPrintStatusColor,
  getDoPrintStatusLabel,
} from "../utils/do-status";
import { DoLoadingCenter } from "./do-loading-center";
import { DoSearchPanel } from "./do-search-panel";
import { DoViewDrawer } from "./view/DoViewDrawer";
// Modified by Sekar Nagarajan (2026-09-02 15:01)
import { NavContainerReleaseIcon } from "../../../components/icons/nav-svg-icons";

const initialFilters: DOListFilters = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? undefined,
  toDate: DateTime.now().toISODate() ?? undefined,
};

export function DeliveryOrderListing() {
  const { t } = useTranslation(["delivery-order", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const { profileHandlers } = useLocalGridProfiles("delivery-order");
  const [filters, setFilters] = useState<DOListFilters>(initialFilters);
  const [selectedRecord, setSelectedRecord] = useState<DOSummaryRow | null>(
    null,
  );

  const {
    data: rows = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useDOSummaryQuery(filters);
  const { mutate: downloadDoc } = useDODownloadMutation();

  const handleSearch = (values: DOSearchValues) => {
    setFilters({ fromDate: values.fromDate, toDate: values.toDate });
  };

  const handleClearFilters = () => setFilters(initialFilters);

  const handleView = (record: DOSummaryRow) => {
    setSelectedRecord(record);
  };

  const handleRowDoubleClick = (event: RowDoubleClickedEvent<DOSummaryRow>) => {
    const record = event.data;
    if (!record) return;
    handleView(record);
  };

  const columns: DataViewColumn<DOSummaryRow>[] = [
    {
      ...buildActionsColumn<DOSummaryRow>({
        field: "delordno",
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
                  handleView(row);
                }}
              />
              <ListActionButton
                title={t("actions.printDeliveryOrder")}
                icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadDoc(row.delordno);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      field: "delordno",
      headerName: t("columns.doNo"),
      width: 140,
      pinned: "left",
    },
    {
      field: "delorddate",
      headerName: t("columns.doDate"),
      width: 140,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    { field: "blnumber", headerName: t("columns.blNumber"), width: 150 },
    { field: "vessel", headerName: t("columns.vessel"), width: 150 },
    { field: "voyage", headerName: t("columns.voyage"), width: 100 },
    { field: "loadport", headerName: t("columns.pol"), width: 160 },
    { field: "dischargeport", headerName: t("columns.pod"), width: 160 },
    { field: "terminal", headerName: t("columns.terminal"), width: 130 },
    {
      field: "arrdate",
      headerName: t("columns.arrival"),
      width: 140,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "dovaliditydate",
      headerName: t("columns.validTill"),
      width: 140,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      headerName: t("columns.status"),
      field: "printstatus",
      width: 130,
      cellRenderer: (params: { data?: DOSummaryRow }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="do-status-tag"
            color={getDoPrintStatusColor(params.data.printstatus)}
          >
            {getDoPrintStatusLabel(params.data.printstatus, t)}
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
    <div className="do-page-layout">
      <div className="do-page-header">
        <ModuleScreenHeader
          icon={NavContainerReleaseIcon}
          title={MODULE_TITLES.deliveryOrder}
          subtitle={t("subtitle")}
          marginBottom={0}
        />
      </div>

      <DoSearchPanel isSearching={isFetching} onSearch={handleSearch} />

      {showLoading ? (
        <DoLoadingCenter fill />
      ) : isError && rows.length === 0 ? (
        emptyState
      ) : (
        <div className="do-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columns}
            loading={isFetching}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="do-data-view"
            listOptions={{
              ...profileHandlers,
              showToolbar: { showTotalCount: true, fullScreen: true },
              sideBar: true,
              pagination: true,
              paginationPageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
              defaultColDef: { filter: true },
              gridOptions: {
                getRowId: (params) => params.data.delordno,
                onRowDoubleClicked: handleRowDoubleClick,
              },
            }}
          />
        </div>
      )}

      {selectedRecord ? (
        <DoViewDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      ) : null}
    </div>
  );
}
