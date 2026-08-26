// Modified by Sekar Nagarajan (2026-08-26 14:57)
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
  useCRODownloadMutation,
  useCROSummaryQuery,
} from "../api/cro.queries";
import type {
  CROListDTO,
  CROListFilters,
  CroSearchValues,
} from "../types/cro.types";
import {
  getCroPrintStatusColor,
  getCroPrintStatusLabel,
  getCroReleaseStatusColor,
} from "../utils/cro-status";
import { CroLoadingCenter } from "./cro-loading-center";
import { CroSearchPanel } from "./cro-search-panel";
import { CroViewDrawer } from "./view/CroViewDrawer";

const initialFilters: CROListFilters = {
  fromDate: DateTime.now().minus({ days: 60 }).toISODate() ?? undefined,
  toDate: DateTime.now().toISODate() ?? undefined,
};

export function CROListing() {
  const [filters, setFilters] = useState<CROListFilters>(initialFilters);
  const [selectedCroNo, setSelectedCroNo] = useState<string | null>(null);

  const {
    data: rows = [],
    isLoading,
    isFetching,
  } = useCROSummaryQuery(filters.fromDate, filters.toDate);
  const { mutate: downloadDoc } = useCRODownloadMutation();

  const handleSearch = (values: CroSearchValues) => {
    setFilters({ fromDate: values.fromDate, toDate: values.toDate });
  };

  const handleView = (croNo: string) => {
    setSelectedCroNo(croNo);
  };

  const handleRowDoubleClick = (
    event: RowDoubleClickedEvent<CROListDTO>,
  ) => {
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
                title="View Details"
                icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(row.croNo);
                }}
              />
              <ListActionButton
                title="Print Container Release Order"
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
    { field: "croNo", headerName: "Release No", width: 130, pinned: "left" },
    { field: "bookingNo", headerName: "Booking No", width: 130 },
    {
      field: "croDate",
      headerName: "CRO Date",
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    { field: "vessel", headerName: "Vessel", width: 140 },
    { field: "voyage", headerName: "Voyage", width: 100 },
    { field: "loadPort", headerName: "Load Port", width: 140 },
    { field: "dischargePort", headerName: "Discharge", width: 140 },
    { field: "eqpType", headerName: "Cont Type", width: 100 },
    { field: "qtyBooked", headerName: "Qty Booked", width: 110 },
    { field: "qtyReleased", headerName: "Qty Released", width: 120 },
    {
      field: "emptyReleaseDepot",
      headerName: "Empty Release Depot",
      width: 170,
    },
    {
      field: "validTo",
      headerName: "CRO Validity",
      width: 130,
      cellRenderer: (p: { value?: string }) =>
        p.value ? <FormattedDate value={p.value} /> : "-",
    },
    {
      headerName: "Status",
      field: "releaseStatus",
      width: 120,
      cellRenderer: (params: { data?: CROListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="cro-status-tag"
            color={getCroReleaseStatusColor(params.data.releaseStatus)}
          >
            {params.data.releaseStatus}
          </Tag>
        );
      },
    },
    {
      headerName: "Print",
      field: "printStatus",
      width: 110,
      cellRenderer: (params: { data?: CROListDTO }) => {
        if (!params.data) return null;
        return (
          <Tag
            className="cro-status-tag"
            color={getCroPrintStatusColor(params.data.printStatus)}
          >
            {getCroPrintStatusLabel(params.data.printStatus)}
          </Tag>
        );
      },
    },
  ];

  const showLoading = isLoading && rows.length === 0;

  return (
    <div className="cro-page-layout">
      <div className="cro-page-header">
        <ModuleScreenHeader
          icon={NavIcons.containerRelease}
          title={MODULE_TITLES.containerReleaseOrder}
          subtitle="Filter by date range, review load-to-discharge routing, and print container release orders."
          marginBottom={0}
        />
      </div>

      <CroSearchPanel isSearching={isFetching} onSearch={handleSearch} />

      {showLoading ? (
        <CroLoadingCenter fill />
      ) : (
        <div className="cro-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columns}
            loading={isFetching}
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="cro-data-view"
            listOptions={{
              showToolbar: false,
              gridOptions: {
                getRowId: (params: { data: CROListDTO }) => params.data.croNo,
                onRowDoubleClicked: handleRowDoubleClick,
                overlayNoRowsTemplate: "No container release orders found.",
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
