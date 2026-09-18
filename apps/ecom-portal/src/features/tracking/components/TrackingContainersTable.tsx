// Modified by Sekar Nagarajan (2026-09-16 11:25)
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Flex, Tag, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import type { ContainerEquipment } from "../types/tracking.types";

const { Text } = Typography;

interface TrackingContainersTableProps {
  containers: ContainerEquipment[];
  onViewMovements: (container: ContainerEquipment) => void;
  onViewLiveMap: (container: ContainerEquipment) => void;
}

export function TrackingContainersTable({
  containers,
  onViewMovements,
  onViewLiveMap,
}: TrackingContainersTableProps) {
  const { profileHandlers } = useLocalGridProfiles("tracking");
  const columnDefs: DataViewColumn<ContainerEquipment>[] = [
    buildActionsColumn<ContainerEquipment>({
      field: "containerNo",
      width: 140,
      cellRenderer: (params: { data?: ContainerEquipment }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <ListActionsRow>
            <ListActionButton
              title="View Container Movements"
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
              onClick={() => onViewMovements(record)}
            />
            <ListActionButton
              title="Container Live Map"
              icon={
                <AppIcon
                  icon={Icons.mapPin}
                  size={16}
                  gridAction
                  tone="reject"
                />
              }
              onClick={() => onViewLiveMap(record)}
            />
          </ListActionsRow>
        );
      },
    }),
    {
      headerName: "Container No ",
      field: "containerNo",
      sortable: true,
      width: 250,
      cellRenderer: (params: { data?: ContainerEquipment }) => {
        const record = params.data;
        if (!record) return <Text type="secondary">-</Text>;
        return (
          <div className="tracking-cell-stack">
            <Text className="tracking-cell-title">{record.containerNo}</Text>
          </div>
        );
      },
    },
    {
      headerName: "Latest Activity",
      field: "latestActivity",
      sortable: true,
      width: 240,
      cellRenderer: (params: { value?: string }) => (
        <Text className="tracking-cell-title">{params.value || "-"}</Text>
      ),
    },
    {
      headerName: "Location & Facility",
      field: "activityLocation",
      sortable: true,
      width: 240,
      cellRenderer: (params: { value?: string }) => (
        <Text className="tracking-cell-sub">{params.value || "-"}</Text>
      ),
    },
    {
      headerName: "Activity Timestamp",
      field: "activityDate",
      sortable: true,
      width: 170,
      cellRenderer: (params: { value?: string }) =>
        params.value ? (
          <Tag color="blue">{params.value}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      headerName: "Status",
      field: "status",
      sortable: true,
      width: 140,
      cellRenderer: (params: { value?: string }) => {
        const val = params.value || "";
        if (!val) return <Text type="secondary">-</Text>;
        const isTransit = val === "IN_TRANSIT";
        return (
          <Tag color={isTransit ? "cyan" : "green"}>
            {val.replace("_", " ")}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="tracking-results-panel responsive-table-wrap custom-scroll">
      <DataView
        className="tracking-grid"
        columnDefs={columnDefs}
        rowData={containers}
        emptyState={
          <ModuleEmptyState
            variant="blank"
            title="No containers to track"
            message="Container tracking details will appear here when equipment is assigned to this shipment."
          />
        }
        allowedViewModes={["list"]}
        renderToolbar={() => (
          <Flex
            align="center"
            justify="space-between"
            className="tracking-results-toolbar"
          >
            <Text className="tracking-results-title">
              Transport Equipment & Containers{" "}
              {/* <span className="tracking-results-count">
                {containers.length}
              </span> */}
            </Text>
          </Flex>
        )}
        listOptions={{
          ...profileHandlers,
          showToolbar: { showTotalCount: true, fullScreen: true },
          sideBar: true,
          pagination: true,
          paginationPageSize: 20,
          pageSizeOptions: [10, 20, 50, 100],
          defaultColDef: { filter: true },
          gridOptions: {
            animateRows: true,
          },
        }}
      />
    </div>
  );
}
