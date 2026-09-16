// Modified by Sekar Nagarajan (2026-09-15 13:15)
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { useMemo } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { NavVesselIcon } from "../../../components/icons/nav-svg-icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import type { ScheduleItem } from "../types/schedules.types";
import {
  formatCutoffValue,
  ScheduleListRoutingCell,
  ScheduleListTransCell,
} from "./list/schedule-list-cells";

interface ScheduleListProps {
  schedules: ScheduleItem[];
  isLoading: boolean;
  onBookNow: (schedule: ScheduleItem) => void;
  onViewVessel: (vesselCode: string) => void;
  onViewRates: (schedule: ScheduleItem) => void;
  onOpenCarbonModal: (schedule: ScheduleItem) => void;
}

export function ScheduleList({
  schedules,
  isLoading,
  onBookNow,
  onViewVessel,
  onViewRates,
  onOpenCarbonModal,
}: ScheduleListProps) {
  const { profileHandlers } = useLocalGridProfiles("schedules");
  const columnDefs = useMemo<DataViewColumn<ScheduleItem>[]>(
    () => [
      buildActionsColumn<ScheduleItem>({
        field: "id",
        width: 180,
        cellRenderer: (params: { data?: ScheduleItem }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <ListActionsRow>
              <ListActionButton
                title="Book Now"
                icon={<AppIcon icon={Icons.plus} size={16} tone="create" />}
                tone="create"
                disabled={!record.bookingAllowed}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow(record);
                }}
              />
              <ListActionButton
                title="Get a Quote"
                icon={
                  <AppIcon icon={Icons.fileText} size={16} tone="navigate" />
                }
                tone="navigate"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewRates(record);
                }}
              />
              <ListActionButton
                title="CO₂ Estimate"
                icon={
                  <AppIcon icon={Icons.calculator} size={16} tone="track" />
                }
                tone="track"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCarbonModal(record);
                }}
              />
              <ListActionButton
                title="Vessel Details"
                icon={<AppIcon icon={NavVesselIcon} size={16} tone="view" />}
                tone="view"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewVessel(record.vesselCode);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      {
        headerName: "Vessel",
        field: "vesselName",
        flex: 1.1,
        minWidth: 150,
        isPrimary: true,
      },
      {
        headerName: "Voyage",
        field: "voyage",
        width: 110,
        minWidth: 100,
        valueGetter: (params: { data?: ScheduleItem }) => {
          const record = params.data;
          if (!record) return "";
          return record.bound
            ? `${record.voyage} ${record.bound}`
            : record.voyage;
        },
      },
      {
        headerName: "Service",
        field: "serviceCode",
        flex: 1,
        minWidth: 130,
        cellRenderer: (params: { data?: ScheduleItem }) => {
          const record = params.data;
          if (!record) return null;
          return (
            <div>
              {/* <Tag className="module-status-tag" color="blue"> */}
              {record.serviceCode}
              {/* </Tag> */}
              <div className="schedule-list-cell__sub">
                {record.serviceName}
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Origin",
        field: "polPortName",
        flex: 1.1,
        minWidth: 140,
        isSecondary: true,
      },
      {
        headerName: "POL",
        field: "polPortId",
        width: 100,
        minWidth: 90,
      },
      {
        headerName: "Trans 1",
        colId: "trans1",
        width: 130,
        minWidth: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: ScheduleItem }) => {
          const record = params.data;
          if (!record) return null;
          return <ScheduleListTransCell record={record} index={0} />;
        },
      },
      {
        headerName: "Trans 2",
        colId: "trans2",
        width: 130,
        minWidth: 120,
        sortable: false,
        filter: false,
        cellRenderer: (params: { data?: ScheduleItem }) => {
          const record = params.data;
          if (!record) return null;
          return <ScheduleListTransCell record={record} index={1} />;
        },
      },
      {
        headerName: "POD",
        field: "podPortId",
        width: 100,
        minWidth: 90,
      },
      {
        headerName: "Delivery",
        field: "podPortName",
        flex: 1.1,
        minWidth: 140,
      },
      {
        // Geo path is Origin / POL / Trans / POD / Delivery; this column is flags only.
        headerName: "Type",
        field: "isDirect",
        width: 180,
        minWidth: 130,
        cellRenderer: (params: { data?: ScheduleItem }) => {
          const record = params.data;
          if (!record) return null;
          return <ScheduleListRoutingCell record={record} />;
        },
      },
      {
        headerName: "ETD",
        field: "etd",
        width: 140,
        minWidth: 130,
      },
      {
        headerName: "ETA",
        field: "eta",
        width: 140,
        minWidth: 130,
      },
      {
        headerName: "Transit",
        field: "transitTimeDays",
        width: 100,
        minWidth: 90,
        valueFormatter: (params: { value?: number }) =>
          params.value != null ? `${params.value} days` : "",
      },
      {
        headerName: "Gate-in",
        colId: "gateIn",
        width: 140,
        minWidth: 130,
        valueGetter: (params: { data?: ScheduleItem }) =>
          formatCutoffValue(params.data?.deadlines?.containerGateIn),
      },
      {
        headerName: "SI",
        colId: "siCutoff",
        width: 140,
        minWidth: 130,
        valueGetter: (params: { data?: ScheduleItem }) =>
          formatCutoffValue(params.data?.deadlines?.siDocClosing),
      },
      {
        headerName: "Distance",
        field: "distanceKm",
        width: 110,
        minWidth: 100,
        valueFormatter: (params: { value?: number }) =>
          params.value != null
            ? `${params.value.toLocaleString("en-US")} km`
            : "",
      },
    ],
    [onBookNow, onViewVessel, onViewRates, onOpenCarbonModal],
  );

  const emptyState = (
    <ModuleEmptyState
      variant="filtered"
      title="No sailing schedules found"
      message="Try different ports or dates to find an available sailing."
      artSize="md"
    />
  );

  const hasRecommendedRoute = schedules.some((item) => item.isDefaultRoute);

  return (
    <div className="schedule-grid-wrap schedule-grid-wrap--no-toolbar">
      <div className="schedule-list-grid responsive-table-wrap custom-scroll ag-theme-alpine">
        <DataView
          key="list"
          columnDefs={columnDefs}
          rowData={schedules}
          loading={isLoading}
          emptyState={emptyState}
          defaultViewMode="list"
          allowedViewModes={["list"]}
          renderToolbar={() => null}
          className="schedule-data-view"
          listOptions={{
            ...profileHandlers,
            showToolbar: { showTotalCount: false, fullScreen: false },
            sideBar: false,
            pagination: true,
            paginationPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
            defaultColDef: { filter: true },
            gridOptions: {
              getRowId: (params) => params.data.id,
              getRowClass: (params) =>
                params.data?.isDefaultRoute
                  ? "schedule-list-row--recommended"
                  : undefined,
              onRowDoubleClicked: (
                event: RowDoubleClickedEvent<ScheduleItem>,
              ) => {
                if (event.data?.bookingAllowed) {
                  onBookNow(event.data);
                }
              },
            },
          }}
        />
      </div>
      {hasRecommendedRoute ? (
        <div
          className="schedule-list-legend"
          role="note"
          aria-label="Recommended route legend"
        >
          <span className="schedule-list-legend__swatch" aria-hidden />
          <span className="schedule-list-legend__text">Recommended route</span>
        </div>
      ) : null}
    </div>
  );
}
