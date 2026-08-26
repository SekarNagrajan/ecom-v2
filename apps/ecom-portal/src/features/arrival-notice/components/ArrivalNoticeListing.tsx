// Modified by Sekar Nagarajan (2026-08-26 14:50)
import { FormattedDate } from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Tag } from "antd";
import { DateTime } from "luxon";
import { useState } from "react";

import { AppIcon, Icons, NavIcons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import {
  useArrivalNoticeDownloadMutation,
  useArrivalNoticeListQuery,
} from "../api/arrival-notice.queries";
import type {
  ArrivalNoticeListDTO,
  ArrivalNoticeListFilters,
  ArnSearchValues,
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
  const [filters, setFilters] =
    useState<ArrivalNoticeListFilters>(initialFilters);
  const [selectedAnNo, setSelectedAnNo] = useState<string | null>(null);

  const {
    data: rows = [],
    isLoading,
    isFetching,
  } = useArrivalNoticeListQuery(filters.fromDate, filters.toDate);
  const { mutate: downloadDoc } = useArrivalNoticeDownloadMutation();

  const handleSearch = (values: ArnSearchValues) => {
    setFilters({ fromDate: values.fromDate, toDate: values.toDate });
  };

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
                title="View Details"
                icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(row.anNo);
                }}
              />
              <ListActionButton
                title="Print Arrival Notice"
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
    { field: "anNo", headerName: "AN No", width: 130, pinned: "left" },
    { field: "blNumber", headerName: "B/L Number", width: 140 },
    { field: "vessel", headerName: "Vessel", width: 140 },
    { field: "voyage", headerName: "Voyage", width: 100 },
    { field: "dischargePort", headerName: "Discharge", width: 160 },
    { field: "terminal", headerName: "Terminal", width: 120 },
    {
      field: "etaDate",
      headerName: "ETA",
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "arrivalDate",
      headerName: "Arrival",
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "lastFreeDay",
      headerName: "Last Free Day",
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "chargesDue",
      headerName: "Charges Due",
      width: 140,
      cellRenderer: (params: { data?: ArrivalNoticeListDTO }) => {
        if (!params.data) return null;
        if (params.data.chargesDue <= 0) return "—";
        return formatArnAmount(params.data.chargesDue, params.data.currency);
      },
    },
    {
      headerName: "Print",
      field: "printStatus",
      width: 120,
      cellRenderer: (params: { data?: ArrivalNoticeListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="arn-status-tag"
            color={getArnPrintStatusColor(params.data.printStatus)}
          >
            {getArnPrintStatusLabel(params.data.printStatus)}
          </Tag>
        );
      },
    },
  ];

  const showLoading = isLoading && rows.length === 0;

  return (
    <div className="arn-page-layout">
      <div className="arn-page-header">
        <ModuleScreenHeader
          icon={NavIcons.arrivalNotice}
          title={MODULE_TITLES.arrivalNotice}
          subtitle="Filter by date range, review vessel and charges, and print arrival notices."
          marginBottom={0}
        />
      </div>

      <ArnSearchPanel isSearching={isFetching} onSearch={handleSearch} />

      {showLoading ? (
        <ArnLoadingCenter fill />
      ) : (
        <div className="arn-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columns}
            loading={isFetching}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="arn-data-view"
            listOptions={{
              showToolbar: false,
              gridOptions: {
                getRowId: (params: { data: ArrivalNoticeListDTO }) =>
                  params.data.anNo,
                onRowDoubleClicked: handleRowDoubleClick,
                overlayNoRowsTemplate: "No arrival notices found.",
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
