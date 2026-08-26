// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton } from "@solverminds/shared-ui";
import { Space, Tag, Tooltip } from "antd";
// @ts-ignore
import { DataView } from "@solverminds/shared-ui/data-view";
import type { ColDef } from "ag-grid-community";

import { AppIcon, Icons } from "../../../components/icons";
import type { ScheduleItem } from "../types/schedules.types";

interface ScheduleListProps {
  schedules: ScheduleItem[];
  isLoading: boolean;
  onViewDetails: (schedule: ScheduleItem) => void;
}

export function ScheduleList({
  schedules,
  isLoading,
  onViewDetails,
}: ScheduleListProps) {
  const columnDefs: ColDef<ScheduleItem>[] = [
    {
      headerName: "Actions",
      field: "id",
      sortable: false,
      width: 100,
      pinned: "left",
      cellRenderer: (params: { data?: ScheduleItem }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Tooltip title="View Voyage Details & Carbon Footprint">
            <AppButton
              type="text"
              size="small"
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
              onClick={() => onViewDetails(record)}
            />
          </Tooltip>
        );
      },
    },
    {
      headerName: "Vessel / Voyage",
      field: "vesselName",
      cellRenderer: (params: { data?: ScheduleItem }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <div>
            <div className="schedule-list-cell__title">{record.vesselName}</div>
            <div className="schedule-list-cell__sub">
              Voyage: {record.voyage} · Service:{" "}
              <Tag color="blue">{record.serviceCode}</Tag>
            </div>
          </div>
        );
      },
    },
    {
      headerName: "Route",
      field: "polPortId",
      cellRenderer: (params: { data?: ScheduleItem }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <div>
            <div className="schedule-list-cell__title">
              {record.polPortId} → {record.podPortId}
            </div>
            <div className="schedule-list-cell__sub">
              Terminal: {record.polTerminal}
            </div>
          </div>
        );
      },
    },
    { headerName: "ETD", field: "etd" },
    { headerName: "ETA", field: "eta" },
    {
      headerName: "Transit",
      field: "transitTimeDays",
      valueFormatter: (params: { value?: number }) =>
        params.value ? `${params.value} days` : "",
    },
  ];

  return (
    <DataView
      columnDefs={columnDefs}
      rowData={schedules || []}
      loading={isLoading}
    />
  );
}
