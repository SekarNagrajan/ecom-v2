// Modified by Sekar Nagarajan (2026-09-08 12:25)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Flex, Space, Tag, theme, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { DashboardShipment } from "../api/dashboard.api";
import { getDashboardBlStatusDisplay } from "../utils/dashboard-bl-status";
import { filterDashboardShipments } from "../utils/filter-dashboard-shipments";

const { Text } = Typography;

interface DashboardOngoingTableProps {
  shipments: DashboardShipment[];
  activeFilter: string;
  filterLabel: string;
  onViewBooking?: (shipment: DashboardShipment) => void;
  onViewBl?: (shipment: DashboardShipment) => void;
  onCreateSi?: (shipment: DashboardShipment) => void;
}

export function DashboardOngoingTable({
  shipments,
  activeFilter,
  filterLabel,
  onViewBooking,
  onViewBl,
  onCreateSi,
}: DashboardOngoingTableProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const filteredShipments = filterDashboardShipments(
    shipments,
    activeFilter,
    "",
  );

  const columnDefs: DataViewColumn<DashboardShipment>[] = [
    {
      headerName: t("ongoing.columns.actions"),
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
              <Tooltip title={t("ongoing.actions.viewBookingDetails")}>
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
                  onClick={() => onViewBooking?.(rec)}
                />
              </Tooltip>
            )}
            {rec.blNo ? (
              <Tooltip title={t("ongoing.actions.viewBillOfLading")}>
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
                  onClick={() => onViewBl?.(rec)}
                />
              </Tooltip>
            ) : (
              <Tooltip title={t("ongoing.actions.createShippingInstruction")}>
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
                  onClick={() => onCreateSi?.(rec)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      headerName: t("ongoing.columns.bookingNo"),
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
            onClick={() => onViewBooking?.(rec)}
          >
            {rec.bookNo}
          </AppButton>
        );
      },
    },
    {
      headerName: t("ongoing.columns.blNumber"),
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
            onClick={() => onViewBl?.(rec)}
          >
            {rec.blNo}
          </AppButton>
        );
      },
    },
    {
      headerName: t("ongoing.columns.onlineRefNo"),
      field: "onlineRefNo",
      sortable: true,
      width: 140,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: t("ongoing.columns.originPort"),
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
      headerName: t("ongoing.columns.deliveryPort"),
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
      headerName: t("ongoing.columns.departureDate"),
      field: "polAt",
      sortable: true,
      width: 130,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: t("ongoing.columns.blStatus"),
      field: "status",
      sortable: true,
      width: 120,
      cellRenderer: (params: { value?: string }) => {
        const val = params.value || "";
        const st = getDashboardBlStatusDisplay(val, t);
        return st ? (
          <Tag color={st.color}>{st.label}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      headerName: t("ongoing.columns.containerNo"),
      field: "containerNo",
      sortable: true,
      width: 140,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: t("ongoing.columns.teus"),
      field: "teus",
      sortable: true,
      width: 80,
      cellRenderer: (params: { value?: string }) =>
        params.value || <Text type="secondary">-</Text>,
    },
    {
      headerName: t("ongoing.columns.siStatus"),
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
            <Tooltip title={t("ongoing.actions.createSi")}>
              <AppButton
                type="text"
                size="small"
                icon={<AppIcon icon={Icons.filePlus} size={16} tone="create" />}
                onClick={() => onCreateSi?.(rec)}
              />
            </Tooltip>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      headerName: t("ongoing.columns.outstandingBalUsd"),
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
    <div
      id="dashboard-ongoing-transactions"
      className="dashboard-ongoing-panel custom-scroll"
    >
      <DataView
        className="dashboard-ongoing-grid"
        columnDefs={columnDefs}
        rowData={filteredShipments}
        emptyState={
          <ModuleEmptyState
            variant={activeFilter ? "filtered" : "blank"}
            title={t("ongoing.empty.title")}
            message={
              activeFilter
                ? t("ongoing.empty.filteredMessage")
                : t("ongoing.empty.blankMessage")
            }
          />
        }
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
                {t("ongoing.title")}
                {activeFilter !== "all" && filterLabel
                  ? ` — ${filterLabel}`
                  : ""}
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
