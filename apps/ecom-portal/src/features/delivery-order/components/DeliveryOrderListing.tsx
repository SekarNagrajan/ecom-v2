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

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
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
  const [filters, setFilters] = useState<DOListFilters>(initialFilters);
  const [selectedRecord, setSelectedRecord] = useState<DOSummaryRow | null>(
    null,
  );

  const { data: rows = [], isLoading, isFetching } = useDOSummaryQuery(filters);
  const { mutate: downloadDoc } = useDODownloadMutation();

  const handleSearch = (values: DOSearchValues) => {
    setFilters({ fromDate: values.fromDate, toDate: values.toDate });
  };

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
                title="View Details"
                icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(row);
                }}
              />
              <ListActionButton
                title="Print Delivery Order"
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
    { field: "delordno", headerName: "DO No", width: 140, pinned: "left" },
    {
      field: "delorddate",
      headerName: "DO Date",
      width: 140,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    { field: "blnumber", headerName: "B/L Number", width: 150 },
    { field: "vessel", headerName: "Vessel", width: 150 },
    { field: "voyage", headerName: "Voyage", width: 100 },
    { field: "loadport", headerName: "POL", width: 160 },
    { field: "dischargeport", headerName: "POD", width: 160 },
    { field: "terminal", headerName: "Terminal", width: 130 },
    {
      field: "arrdate",
      headerName: "Arrival",
      width: 140,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      field: "dovaliditydate",
      headerName: "Valid Till",
      width: 140,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      headerName: "Status",
      field: "printstatus",
      width: 130,
      cellRenderer: (params: { data?: DOSummaryRow }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="do-status-tag"
            color={getDoPrintStatusColor(params.data.printstatus)}
          >
            {getDoPrintStatusLabel(params.data.printstatus)}
          </Tag>
        );
      },
    },
  ];

  const showLoading = isLoading && rows.length === 0;

  return (
    <div className="do-page-layout">
      <div className="do-page-header">
        <ModuleScreenHeader
          icon={NavContainerReleaseIcon}
          title={MODULE_TITLES.deliveryOrder}
          subtitle="Filter by date range, review POL to POD routing, and print delivery order documents."
          marginBottom={0}
        />
      </div>

      <DoSearchPanel isSearching={isFetching} onSearch={handleSearch} />

      {showLoading ? (
        <DoLoadingCenter fill />
      ) : (
        <div className="do-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columns}
            loading={isFetching}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="do-data-view"
            listOptions={{
              showToolbar: false,
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
