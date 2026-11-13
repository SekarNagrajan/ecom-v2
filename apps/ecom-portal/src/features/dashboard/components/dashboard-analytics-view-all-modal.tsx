// Modified by Sekar Nagarajan (2026-10-26 15:15)
/**
 * View All popup for dashboard analytics panels — DataView grid of the
 * full lane / opportunity / intelligence / consignee datasets.
 */
import { AppModal } from "@solverminds/shared-ui";
import {
  DataView,
  DataViewColumn,
  type DataViewToolbarSlots,
} from "@solverminds/shared-ui/data-view";
import { Flex, Segmented, Typography } from "antd";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type {
  ContractedLane,
  IntelligenceBreakdown,
  IntelligenceBreakdowns,
  IntelligenceDimension,
  LastUsedLane,
  OpportunityLane,
  TopConsignee,
  TopLane,
} from "../api/dashboard.api";

const { Text } = Typography;

export type DashboardAnalyticsViewAllKind =
  | "top-lanes"
  | "last-used"
  | "opportunities"
  | "intelligence"
  | "consignees";

export interface DashboardAnalyticsViewAllState {
  kind: DashboardAnalyticsViewAllKind;
}

interface OpportunityRow {
  id: string;
  pol: string;
  pod: string;
  category: "quiet" | "suggested";
  status: string;
}

interface IntelligenceRow extends IntelligenceBreakdown {
  id: string;
}

interface ConsigneeRow extends TopConsignee {
  id: string;
  rank: number;
}

interface LastUsedRow extends LastUsedLane {
  id: string;
}

interface TopLaneRow extends TopLane {
  id: string;
  lane: string;
}

interface DashboardAnalyticsViewAllModalProps {
  state: DashboardAnalyticsViewAllState | null;
  onClose: () => void;
  topLanes: TopLane[];
  lastUsed: LastUsedLane[];
  contracted: ContractedLane[];
  opportunities: OpportunityLane[];
  consignees: TopConsignee[];
  breakdowns: IntelligenceBreakdowns;
}

function getSuggestionLabel(
  suggestion: OpportunityLane["suggestion"],
  t: (key: string) => string,
): string {
  switch (suggestion) {
    case "High Potential":
      return t("lanes.suggestions.highPotential");
    case "Medium Potential":
      return t("lanes.suggestions.mediumPotential");
    default: {
      const _exhaustive: never = suggestion;
      return _exhaustive;
    }
  }
}

function formatNumber(value: unknown): string {
  return typeof value === "number" ? value.toLocaleString() : "";
}

function formatPercent(value: unknown): string {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "";
}

/** Search + filters only — hide the list/kanban/card view-mode icon. */
function renderViewAllToolbar({
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

export function DashboardAnalyticsViewAllModal({
  state,
  onClose,
  topLanes,
  lastUsed,
  contracted,
  opportunities,
  consignees,
  breakdowns,
}: DashboardAnalyticsViewAllModalProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const open = state !== null;
  const kind = state?.kind;
  const [intelligenceDimension, setIntelligenceDimension] =
    useState<IntelligenceDimension>("origin");

  const title = useMemo(() => {
    switch (kind) {
      case "top-lanes":
        return t("viewAllModal.titles.topLanes");
      case "last-used":
        return t("viewAllModal.titles.lastUsed");
      case "opportunities":
        return t("viewAllModal.titles.opportunities");
      case "intelligence":
        return t("viewAllModal.titles.intelligence");
      case "consignees":
        return t("viewAllModal.titles.consignees");
      default:
        return t("actions.viewAll");
    }
  }, [kind, t]);

  const topLaneRows: TopLaneRow[] = useMemo(
    () =>
      topLanes.map((lane) => ({
        ...lane,
        id: `lane-${lane.rank}-${lane.pol}-${lane.pod}`,
        lane: `${lane.pol} → ${lane.pod}`,
      })),
    [topLanes],
  );

  const lastUsedRows: LastUsedRow[] = useMemo(
    () =>
      lastUsed.map((lane) => ({
        ...lane,
        id: `${lane.pol}-${lane.pod}-${lane.date}`,
      })),
    [lastUsed],
  );

  const opportunityRows: OpportunityRow[] = useMemo(
    () => [
      ...contracted.map((lane) => ({
        id: `quiet-${lane.pol}-${lane.pod}`,
        pol: lane.pol,
        pod: lane.pod,
        category: "quiet" as const,
        status: t("lanes.noActivity"),
      })),
      ...opportunities.map((lane) => ({
        id: `suggested-${lane.pol}-${lane.pod}-${lane.suggestion}`,
        pol: lane.pol,
        pod: lane.pod,
        category: "suggested" as const,
        status: getSuggestionLabel(lane.suggestion, t),
      })),
    ],
    [contracted, opportunities, t],
  );

  const intelligenceRows: IntelligenceRow[] = useMemo(
    () =>
      (breakdowns[intelligenceDimension] ?? []).map((row) => ({
        ...row,
        id: `${intelligenceDimension}-${row.name}`,
      })),
    [breakdowns, intelligenceDimension],
  );

  const consigneeRows: ConsigneeRow[] = useMemo(
    () =>
      consignees.map((row, index) => ({
        ...row,
        id: row.name,
        rank: index + 1,
      })),
    [consignees],
  );

  const topLaneColumns: DataViewColumn<TopLaneRow>[] = useMemo(
    () => [
      {
        headerName: t("viewAllModal.columns.rank"),
        field: "rank",
        width: 80,
        sortable: true,
      },
      {
        headerName: t("lanes.lanePolPod"),
        field: "lane",
        flex: 1,
        minWidth: 180,
        sortable: true,
      },
      {
        headerName: t("lanes.feus"),
        field: "feus",
        width: 110,
        sortable: true,
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value),
      },
      {
        headerName: t("lanes.share"),
        field: "pctOfTotal",
        width: 110,
        sortable: true,
        type: "numericColumn",
        valueFormatter: (params) => formatPercent(params.value),
      },
    ],
    [t],
  );

  const lastUsedColumns: DataViewColumn<LastUsedRow>[] = useMemo(
    () => [
      {
        headerName: t("lanes.lanePolPod"),
        field: "pol",
        flex: 1,
        minWidth: 180,
        sortable: true,
        valueGetter: (params) =>
          params.data ? `${params.data.pol} → ${params.data.pod}` : "",
      },
      {
        headerName: t("viewAllModal.columns.lastUsedDate"),
        field: "date",
        width: 160,
        sortable: true,
      },
    ],
    [t],
  );

  const opportunityColumns: DataViewColumn<OpportunityRow>[] = useMemo(
    () => [
      {
        headerName: t("lanes.lanePolPod"),
        field: "pol",
        flex: 1,
        minWidth: 180,
        sortable: true,
        valueGetter: (params) =>
          params.data ? `${params.data.pol} → ${params.data.pod}` : "",
      },
      {
        headerName: t("viewAllModal.columns.category"),
        field: "category",
        width: 180,
        sortable: true,
        valueFormatter: (params) => {
          if (params.value === "quiet") return t("lanes.quietContracted");
          if (params.value === "suggested") return t("lanes.suggestedNew");
          return String(params.value ?? "");
        },
      },
      {
        headerName: t("viewAllModal.columns.status"),
        field: "status",
        width: 160,
        sortable: true,
      },
    ],
    [t],
  );

  const intelligenceColumns: DataViewColumn<IntelligenceRow>[] = useMemo(
    () => [
      {
        headerName: t(
          `intelligence.dimensionColumns.${intelligenceDimension}`,
        ),
        field: "name",
        flex: 1,
        minWidth: 200,
        sortable: true,
      },
      {
        headerName: t("intelligence.columns.teus"),
        field: "feus",
        width: 110,
        sortable: true,
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value),
      },
      {
        headerName: t("intelligence.columns.share"),
        field: "pctOfTotal",
        width: 110,
        sortable: true,
        type: "numericColumn",
        valueFormatter: (params) => formatPercent(params.value),
      },
    ],
    [intelligenceDimension, t],
  );

  const consigneeColumns: DataViewColumn<ConsigneeRow>[] = useMemo(
    () => [
      {
        headerName: t("intelligence.columns.rank"),
        field: "rank",
        width: 80,
        sortable: true,
      },
      {
        headerName: t("intelligence.columns.company"),
        field: "name",
        flex: 1,
        minWidth: 220,
        sortable: true,
      },
      {
        headerName: t("intelligence.columns.teus"),
        field: "feus",
        width: 110,
        sortable: true,
        type: "numericColumn",
        valueFormatter: (params) => formatNumber(params.value),
      },
      {
        headerName: t("intelligence.columns.share"),
        field: "pctOfTotal",
        width: 110,
        sortable: true,
        type: "numericColumn",
        valueFormatter: (params) => formatPercent(params.value),
      },
    ],
    [t],
  );

  const dimensionOptions = useMemo(
    () =>
      (
        [
          "origin",
          "pol",
          "pod",
          "pickup",
          "consignee",
          "destination",
        ] as const
      ).map((key) => ({
        value: key,
        label: t(`intelligence.dimensions.${key}`),
      })),
    [t],
  );

  const emptyState = (
    <ModuleEmptyState
      variant="blank"
      title={t("viewAllModal.emptyTitle")}
      message={t("viewAllModal.emptyMessage")}
      artSize="sm"
    />
  );

  function createListOptions<T extends { id: string }>() {
    return {
      pagination: true as const,
      paginationPageSize: 10,
      pageSizeOptions: [10, 20, 50, 100],
      // autoHeight — modal body has no fixed height chain for AG Grid "normal"
      gridOptions: {
        domLayout: "autoHeight" as const,
        animateRows: true,
        getRowId: (params: { data: T }) => params.data.id,
      },
    };
  }

  return (
    <AppModal
      open={open}
      onCancel={onClose}
      title={title}
      dialogSize="xl"
      footer={null}
      destroyOnHidden
      className="dashboard-analytics-view-all-modal"
      afterOpenChange={(isOpen) => {
        if (isOpen) setIntelligenceDimension("origin");
      }}
    >
      <div className="dashboard-analytics-view-all">
        {kind === "intelligence" ? (
          <div className="dashboard-analytics-view-all__toolbar">
            <Segmented
              size="middle"
              value={intelligenceDimension}
              onChange={(value) =>
                setIntelligenceDimension(String(value) as IntelligenceDimension)
              }
              options={dimensionOptions}
            />
            {/* <Text type="secondary">
              {t("intelligence.segments", {
                count: intelligenceRows.length,
              })}
            </Text> */}
          </div>
        ) : null}

        {kind === "top-lanes" ? (
          <DataView
            className="dashboard-analytics-view-all__grid"
            style={{ height: "auto" }}
            columnDefs={topLaneColumns}
            rowData={topLaneRows}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            renderToolbar={renderViewAllToolbar}
            listOptions={createListOptions<TopLaneRow>()}
          />
        ) : null}

        {kind === "last-used" ? (
          <DataView
            className="dashboard-analytics-view-all__grid"
            style={{ height: "auto" }}
            columnDefs={lastUsedColumns}
            rowData={lastUsedRows}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            renderToolbar={renderViewAllToolbar}
            listOptions={createListOptions<LastUsedRow>()}
          />
        ) : null}

        {kind === "opportunities" ? (
          <DataView
            className="dashboard-analytics-view-all__grid"
            style={{ height: "auto" }}
            columnDefs={opportunityColumns}
            rowData={opportunityRows}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            renderToolbar={renderViewAllToolbar}
            listOptions={createListOptions<OpportunityRow>()}
          />
        ) : null}

        {kind === "intelligence" ? (
          <DataView
            className="dashboard-analytics-view-all__grid"
            style={{ height: "auto" }}
            columnDefs={intelligenceColumns}
            rowData={intelligenceRows}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            renderToolbar={renderViewAllToolbar}
            listOptions={createListOptions<IntelligenceRow>()}
          />
        ) : null}

        {kind === "consignees" ? (
          <DataView
            className="dashboard-analytics-view-all__grid"
            style={{ height: "auto" }}
            columnDefs={consigneeColumns}
            rowData={consigneeRows}
            emptyState={emptyState}
            allowedViewModes={["list"]}
            renderToolbar={renderViewAllToolbar}
            listOptions={createListOptions<ConsigneeRow>()}
          />
        ) : null}
      </div>
    </AppModal>
  );
}
