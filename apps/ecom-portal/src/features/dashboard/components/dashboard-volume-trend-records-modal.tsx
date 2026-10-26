// Modified by Sekar Nagarajan (2026-10-26 15:35)
/**
 * Volume Trend drill-down — popup DataView of TEU shipment records for a
 * clicked week / month / quarter point.
 */
import { AppModal } from "@solverminds/shared-ui";
import {
  DataView,
  DataViewColumn,
  type DataViewToolbarSlots,
} from "@solverminds/shared-ui/data-view";
import { Flex, Spin, Typography } from "antd";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type {
  VolumeTrendPoint,
  VolumeTrendRecord,
} from "../api/dashboard.api";

const { Text } = Typography;

export interface VolumeTrendDrilldownState {
  point: VolumeTrendPoint;
  loading: boolean;
  records: VolumeTrendRecord[];
}

interface DashboardVolumeTrendRecordsModalProps {
  state: VolumeTrendDrilldownState | null;
  onClose: () => void;
}

function renderToolbar({
  isMobile,
  search,
  filterToggle,
  filterChips,
}: DataViewToolbarSlots): ReactNode {
  return (
    <Flex vertical gap="small">
      <Flex justify="flex-end" align="center" wrap gap="small">
        {!isMobile ? search : null}
        {filterToggle}
      </Flex>
      {isMobile ? search : null}
      {filterChips}
    </Flex>
  );
}

export function DashboardVolumeTrendRecordsModal({
  state,
  onClose,
}: DashboardVolumeTrendRecordsModalProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const open = state !== null;
  const point = state?.point;
  const loading = state?.loading ?? false;
  const records = state?.records ?? [];

  const columns: DataViewColumn<VolumeTrendRecord>[] = useMemo(
    () => [
      {
        headerName: t("volume.drilldown.columns.bookingNo"),
        field: "bookingNo",
        minWidth: 140,
        flex: 1,
        sortable: true,
      },
      {
        headerName: t("volume.drilldown.columns.blNo"),
        field: "blNo",
        width: 130,
        sortable: true,
        valueFormatter: (params) =>
          params.value ? String(params.value) : "—",
      },
      {
        headerName: t("volume.drilldown.columns.origin"),
        field: "origin",
        minWidth: 160,
        flex: 1,
        sortable: true,
      },
      {
        headerName: t("volume.drilldown.columns.destination"),
        field: "destination",
        minWidth: 160,
        flex: 1,
        sortable: true,
      },
      {
        headerName: t("volume.drilldown.columns.teus"),
        field: "teus",
        width: 100,
        sortable: true,
        type: "numericColumn",
        valueFormatter: (params) =>
          typeof params.value === "number"
            ? params.value.toLocaleString()
            : "",
      },
      {
        headerName: t("volume.drilldown.columns.volumeDate"),
        field: "volumeDate",
        width: 140,
        sortable: true,
      },
      {
        headerName: t("volume.drilldown.columns.status"),
        field: "status",
        width: 120,
        sortable: true,
      },
      {
        headerName: t("volume.drilldown.columns.consignee"),
        field: "consignee",
        minWidth: 160,
        flex: 1,
        sortable: true,
      },
    ],
    [t],
  );

  const title = point
    ? t("volume.drilldown.title", {
        label: point.month,
        teus: point.feus.toLocaleString(),
      })
    : t("volume.trendTitle");

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      title={title}
      dialogSize="xl"
      footer={null}
      destroyOnHidden
      className="dashboard-volume-trend-records-modal"
    >
      <div className="dashboard-analytics-view-all">
        {loading ? (
          <div className="dashboard-volume-trend-records-modal__loading">
            <Spin />
            <Text type="secondary">{t("volume.drilldown.loading")}</Text>
          </div>
        ) : (
          <DataView
            className="dashboard-analytics-view-all__grid"
            style={{ height: "auto" }}
            columnDefs={columns}
            rowData={records}
            emptyState={
              <ModuleEmptyState
                variant="blank"
                title={t("volume.drilldown.emptyTitle")}
                message={t("volume.drilldown.emptyMessage")}
                artSize="sm"
              />
            }
            allowedViewModes={["list"]}
            renderToolbar={renderToolbar}
            listOptions={{
              pagination: true,
              paginationPageSize: 10,
              pageSizeOptions: [10, 20, 50, 100],
              gridOptions: {
                domLayout: "autoHeight",
                animateRows: true,
                getRowId: (params: { data: VolumeTrendRecord }) =>
                  params.data.id,
              },
            }}
          />
        )}
      </div>
    </AppModal>
  );
}
