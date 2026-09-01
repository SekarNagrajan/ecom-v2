// Modified by Sekar Nagarajan (2026-09-01 14:38)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Badge, Flex, Space, Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
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
  const columnDefs: DataViewColumn<ContainerEquipment>[] = [
    {
      headerName: "Actions",
      field: "containerNo",
      sortable: false,
      width: 140,
      pinned: "left",
      cellRenderer: (params: { data?: ContainerEquipment }) => {
        const record = params.data;
        if (!record) return null;
        return (
          <Space size={6}>
            <Tooltip title="View Container Event Log & Movements">
              <AppButton
                type="text"
                size="small"
                icon={
                  <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
                }
                onClick={() => onViewMovements(record)}
              />
            </Tooltip>
            <Tooltip title="Container Live Map">
              <AppButton
                type="text"
                size="small"
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
            </Tooltip>
          </Space>
        );
      },
    },
    {
      headerName: "Container No & Seal",
      field: "containerNo",
      sortable: true,
      width: 250,
      cellRenderer: (params: { data?: ContainerEquipment }) => {
        const record = params.data;
        if (!record) return <Text type="secondary">-</Text>;
        return (
          <div className="tracking-cell-stack">
            <Text className="tracking-cell-title">{record.containerNo}</Text>
            <Text className="tracking-cell-sub">
              Seal: {record.sealNo} | {record.containerType}
            </Text>
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
        allowedViewModes={["list"]}
        renderToolbar={() => (
          <Flex
            align="center"
            justify="space-between"
            className="tracking-results-toolbar"
          >
            <Space align="center" size={8}>
              <Text className="tracking-results-title">
                Transport Equipment & Containers
              </Text>
              <Badge
                count={containers.length}
                className="tracking-results-count"
              />
            </Space>
          </Flex>
        )}
        listOptions={{
          gridOptions: {
            domLayout: "autoHeight",
            animateRows: true,
            pagination: false,
          },
        }}
      />
    </div>
  );
}
