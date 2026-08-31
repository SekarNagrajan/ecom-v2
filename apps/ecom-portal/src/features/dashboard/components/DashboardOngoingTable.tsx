// Modified by Sekar Nagarajan (2026-08-25 18:25)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Flex, Space, Tag, theme, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { DashboardShipment } from "../api/dashboard.api";
import { filterDashboardShipments } from "../utils/filter-dashboard-shipments";

const { Text } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  C: { label: "Confirmed", color: "success" },
  D: { label: "Draft", color: "blue" },
  V: { label: "Cancelled", color: "error" },
  I: { label: "Issued", color: "warning" },
};

interface DashboardOngoingTableProps {
  shipments: DashboardShipment[];
  activeFilter: string;
  filterLabel: string;
  onViewBooking?: (bookNo: string, refNo: string) => void;
  onViewBl?: (blNo: string, bookNo: string) => void;
  onCreateSi?: (bookNo: string) => void;
}

export function DashboardOngoingTable({
  shipments,
  activeFilter,
  filterLabel,
  onViewBooking,
  onViewBl,
  onCreateSi,
}: DashboardOngoingTableProps) {
  const filteredShipments = filterDashboardShipments(
    shipments,
    activeFilter,
    "",
  );

  const columnDefs: DataViewColumn<DashboardShipment>[] = [
    {
      headerName: "Actions",
      field: "bookNo",
      sortable: false,
      width: 140,
      pinned: "left",
      cellRenderer: (params: { data?: DashboardShipment }) => {
        const rec = params.data;
        if (!rec) return null;
        return (
          <Space size={6}>
            {rec.bookNo && (
              <Tooltip title="View Booking Details">
                <AppButton
                  type="text"
                  size="small"
                  icon={
                    <AppIcon
                      icon={Icons.eye}
                      size={16}
                      gridAction
                      tone="view"
                    />
                  }
                  onClick={() => onViewBooking?.(rec.bookNo, rec.onlineRefNo)}
                />
              </Tooltip>
            )}
            {rec.blNo ? (
              <Tooltip title="View Bill of Lading">
                <AppButton
                  type="text"
                  size="small"
                  icon={
                    <AppIcon
                      icon={Icons.fileText}
                      size={16}
                      gridAction
                      tone="view"
                    />
                  }
                  onClick={() => onViewBl?.(rec.blNo, rec.bookNo)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Create Shipping Instruction (SI)">
                <AppButton
                  type="text"
                  size="small"
                  icon={
                    <AppIcon
                      icon={Icons.filePlus}
                      size={16}
                      gridAction
                      tone="create"
                    />
                  }
                  onClick={() => onCreateSi?.(rec.bookNo)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      headerName: "Booking No",
      field: "bookNo",
      sortable: true,
      width: 140,
      cellRenderer: (params: { data?: DashboardShipment }) => {
        const rec = params.data;
        if (!rec?.bookNo) return <Text type="secondary">-</Text>;
        return (
          <AppButton
            type="text"
            size="small"
            className="dashboard-link-btn"
            onClick={() => onViewBooking?.(rec.bookNo, rec.onlineRefNo)}
          >
            {rec.bookNo}
          </AppButton>
        );
      },
    },
    {
      headerName: "BL Number",
      field: "blNo",
      sortable: true,
      width: 140,
      cellRenderer: (params: { data?: DashboardShipment }) => {
        const rec = params.data;
        if (!rec?.blNo) return <Text type="secondary">-</Text>;
        return (
          <AppButton
            type="text"
            size="small"
            className="dashboard-link-btn"
            style={{ color: theme.useToken().token.colorText }}
            onClick={() => onViewBl?.(rec.blNo, rec.bookNo)}
          >
            {rec.blNo}
          </AppButton>
        );
      },
    },
    {
      headerName: "Online Ref No",
      field: "onlineRefNo",
      sortable: true,
      width: 140,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: "Origin Port",
      field: "originPortDesc",
      sortable: true,
      width: 180,
      cellRenderer: (params: { data?: DashboardShipment }) => {
        const rec = params.data;
        if (!rec) return "-";
        const label =
          rec.originPortId && rec.originPortDesc
            ? `${rec.originPortId} - ${rec.originPortDesc}`
            : rec.originPortId || "-";
        return (
          <Tooltip title={label}>
            <Text className="dashboard-ellipsis-cell">{label}</Text>
          </Tooltip>
        );
      },
    },
    {
      headerName: "Delivery Port",
      field: "finalPortDesc",
      sortable: true,
      width: 180,
      cellRenderer: (params: { data?: DashboardShipment }) => {
        const rec = params.data;
        if (!rec) return "-";
        const label =
          rec.finalPortId && rec.finalPortDesc
            ? `${rec.finalPortId} - ${rec.finalPortDesc}`
            : rec.finalPortId || "-";
        return (
          <Tooltip title={label}>
            <Text className="dashboard-ellipsis-cell">{label}</Text>
          </Tooltip>
        );
      },
    },
    {
      headerName: "Departure Date",
      field: "polAt",
      sortable: true,
      width: 130,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: "BL Status",
      field: "status",
      sortable: true,
      width: 120,
      cellRenderer: (params: { value?: string }) => {
        const val = params.value || "";
        const st = STATUS_MAP[val];
        return st ? (
          <Tag color={st.color}>{st.label}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      headerName: "Container No",
      field: "containerNo",
      sortable: true,
      width: 140,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: "TEUs",
      field: "teus",
      sortable: true,
      width: 80,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: "SI Status",
      field: "siNo",
      sortable: false,
      width: 120,
      cellRenderer: (params: { data?: DashboardShipment }) => {
        const rec = params.data;
        if (!rec) return <Text type="secondary">-</Text>;
        if (rec.siNo) {
          return (
            <Space size={4}>
              <Text type="secondary">{rec.siNo}</Text>
            </Space>
          );
        }
        if (!rec.blNo && rec.bookNo) {
          return (
            <Tooltip title="Create SI">
              <AppButton
                type="text"
                size="small"
                icon={<AppIcon icon={Icons.filePlus} size={16} tone="create" />}
                onClick={() => onCreateSi?.(rec.bookNo)}
              />
            </Tooltip>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      headerName: "Outstanding Bal (USD)",
      field: "amtBal",
      sortable: true,
      width: 160,
      cellRenderer: (params: { value?: number }) => {
        const val = params.value || 0;
        return val > 0 ? (
          <Text className="text-amount-error dashboard-amount-strong">
            ${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </Text>
        ) : (
          <Text type="secondary">$0.00</Text>
        );
      },
    },
  ];

  return (
    <div className="dashboard-ongoing-panel custom-scroll">
      <DataView
        className="dashboard-ongoing-grid"
        columnDefs={columnDefs}
        rowData={filteredShipments}
        allowedViewModes={["list"]}
        renderToolbar={() => (
          <Flex
            align="center"
            justify="space-between"
            wrap
            gap="small"
            className="dashboard-ongoing-toolbar"
          >
            <Space align="center">
              <Text strong>
                Ongoing Transactions
                {filterLabel !== "Total Shipments" ? ` — ${filterLabel}` : ""}
                {` (${filteredShipments.length})`}
              </Text>
            </Space>
          </Flex>
        )}
        listOptions={{
          gridOptions: {
            domLayout: "autoHeight",
            animateRows: true,
            pagination: true,
            paginationPageSize: 10,
          },
        }}
      />
    </div>
  );
}
