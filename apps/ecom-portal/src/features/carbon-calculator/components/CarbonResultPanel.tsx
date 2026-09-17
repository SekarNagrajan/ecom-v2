// Modified by Sekar Nagarajan (2026-09-16 12:13)
import { AppButton } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { Segmented, Spin, Tooltip, Typography } from "antd";
import { startTransition, useState, type ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import {
  useCarbonComputeQuery,
  useCarbonExportMutation,
} from "../api/carbon.queries";
import type { CarbonInput, CarbonLegResult } from "../types/carbon.types";
import { formatCo2e, pickDisplayTotal } from "../types/carbon.types";
import { transportModeLabel } from "../utils/carbon-chart-options";
import { CarbonResultCharts } from "./CarbonResultCharts";

const { Text } = Typography;

type CarbonBreakdownView = "list" | "chart";

const VIEW_MODE_TOOLTIP_DELAY = 0.5;
const VIEW_MODE_ICON_SIZE = 16;

interface CarbonResultPanelProps {
  input: CarbonInput;
}

interface CarbonLegRow extends CarbonLegResult {
  id: string;
}

function ViewModeIcon({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title} mouseEnterDelay={VIEW_MODE_TOOLTIP_DELAY}>
      <span className="module-view-mode-tabs__icon">{children}</span>
    </Tooltip>
  );
}

function formatIntensity(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function toLegRows(legs: CarbonLegResult[]): CarbonLegRow[] {
  return legs.map((leg, index) => ({
    ...leg,
    id: `${leg.mode}-${leg.from}-${leg.to}-${index}`,
  }));
}

export function CarbonResultPanel({ input }: CarbonResultPanelProps) {
  const {
    data: result,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCarbonComputeQuery(input);
  const exportMutation = useCarbonExportMutation();
  const [breakdownView, setBreakdownView] =
    useState<CarbonBreakdownView>("list");

  const unit = input.unit;
  const spinning = isLoading || isFetching;
  const laneLabel = `${input.origin} → ${input.destination}`;
  const legRows = result ? toLegRows(result.legs) : [];

  const legColumnDefs: DataViewColumn<CarbonLegRow>[] = [
    {
      headerName: "Mode",
      field: "mode",
      minWidth: 120,
      flex: 1,
      valueFormatter: (params) =>
        transportModeLabel(params.value as CarbonLegResult["mode"]),
    },
    {
      headerName: "From",
      field: "from",
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: "To",
      field: "to",
      minWidth: 100,
      flex: 1,
    },
    {
      headerName: "Distance (km)",
      field: "distanceKm",
      minWidth: 130,
      flex: 1,
      type: "rightAligned",
      valueFormatter: (params) =>
        typeof params.value === "number"
          ? params.value.toLocaleString("en-US")
          : "",
    },
    {
      headerName: unit === "kg" ? "CO₂e (kg)" : "CO₂e (t)",
      field: unit === "kg" ? "co2eKg" : "co2eTonnes",
      minWidth: 130,
      flex: 1,
      type: "rightAligned",
      valueFormatter: (params) => {
        if (typeof params.value !== "number") return "";
        return unit === "kg"
          ? params.value.toLocaleString("en-US")
          : params.value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
      },
    },
  ];

  if (spinning && !result) {
    return (
      <div
        className="co2-result-loading module-loading-center"
        role="status"
        aria-label="Loading"
      >
        <Spin size="medium" />
      </div>
    );
  }

  return (
    <div className="co2-result-panel">
      {isError ? (
        <Text type="danger" className="co2-result-error form-field-error">
          {error instanceof Error
            ? error.message
            : "Failed to compute carbon footprint."}
        </Text>
      ) : null}

      {result ? (
        <Spin spinning={spinning}>
          <div className="co2-result-content">
            <div className="co2-result-toolbar">
              <div className="co2-result-toolbar__meta">
                <span className="co2-result-toolbar__lane">{laneLabel}</span>
                <span className="co2-result-toolbar__sub">
                  {input.equipment} · {input.containerCount} container
                  {input.containerCount === 1 ? "" : "s"} ·{" "}
                  {input.cargoWeightKg.toLocaleString("en-US")} kg
                </span>
              </div>
              <AppButton
                type="default"
                size="medium"
                loading={exportMutation.isPending}
                icon={
                  <AppIcon icon={Icons.download} size={16} tone="download" />
                }
                onClick={() => exportMutation.mutate(input)}
              >
                Export PDF
              </AppButton>
            </div>

            <div className="co2-kpi-grid">
              <div className="co2-kpi-card co2-kpi-card--total">
                <span className="co2-kpi-card__label">Total CO₂e</span>
                <p className="co2-kpi-card__value">
                  {formatCo2e(pickDisplayTotal(result, unit), unit)}
                </p>
              </div>
              <div className="co2-kpi-card co2-kpi-card--ttw">
                <span className="co2-kpi-card__label">Tank-to-wheel</span>
                <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.ttwCo2eKg : result.ttwCo2eTonnes,
                    unit,
                  )}
                </p>
              </div>
              <div className="co2-kpi-card co2-kpi-card--wtt">
                <span className="co2-kpi-card__label">Well-to-tank</span>
                <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.wttCo2eKg : result.wttCo2eTonnes,
                    unit,
                  )}
                </p>
              </div>
              {result.intensity.perTeu != null ? (
                <div className="co2-kpi-card co2-kpi-card--per-teu">
                  <span className="co2-kpi-card__label">Per TEU</span>
                  <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                    {formatIntensity(result.intensity.perTeu)} t CO₂e
                  </p>
                </div>
              ) : null}
              {result.intensity.perTonneKm != null ? (
                <div className="co2-kpi-card co2-kpi-card--per-tkm">
                  <span className="co2-kpi-card__label">Per tonne-km</span>
                  <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                    {formatIntensity(result.intensity.perTonneKm)} g CO₂e
                  </p>
                </div>
              ) : null}
            </div>

            <div className="co2-breakdown-block">
              <div className="co2-breakdown-block__header">
                <Text strong className="co2-breakdown-title">
                  Emissions Breakdown
                  {legRows.length > 0 ? (
                    <span className="co2-breakdown-block__count">
                      {legRows.length}
                    </span>
                  ) : null}
                </Text>
                <Segmented
                  className="module-view-mode-tabs co2-breakdown-view-tabs"
                  size="middle"
                  value={breakdownView}
                  aria-label="Breakdown view mode"
                  onChange={(next) => {
                    startTransition(() => {
                      if (next === "list" || next === "chart") {
                        setBreakdownView(next);
                      }
                    });
                  }}
                  options={[
                    {
                      value: "list",
                      icon: (
                        <ViewModeIcon title="Grid View">
                          <AppIcon
                            icon={Icons.list}
                            size={VIEW_MODE_ICON_SIZE}
                          />
                        </ViewModeIcon>
                      ),
                    },
                    {
                      value: "chart",
                      icon: (
                        <ViewModeIcon title="Chart View">
                          <AppIcon
                            icon={Icons.barChart}
                            size={VIEW_MODE_ICON_SIZE}
                          />
                        </ViewModeIcon>
                      ),
                    },
                  ]}
                />
              </div>

              {breakdownView === "list" ? (
                <div className="co2-legs-table responsive-table-wrap custom-scroll">
                  <DataView
                    className="co2-legs-data-view"
                    columnDefs={legColumnDefs}
                    rowData={legRows}
                    emptyState={
                      <ModuleEmptyState
                        variant="blank"
                        title="No leg breakdown"
                        message="Per-leg emissions will appear here when the estimate includes transport legs."
                      />
                    }
                    allowedViewModes={["list"]}
                    renderToolbar={() => null}
                    listOptions={{
                      showToolbar: {
                        showTotalCount: false,
                        fullScreen: true,
                      },
                      sideBar: true,
                      pagination: true,
                      paginationPageSize: 10,
                      pageSizeOptions: [10, 20, 50],
                      defaultColDef: { filter: true },
                      gridOptions: {
                        animateRows: true,
                        getRowId: (params: { data: CarbonLegRow }) =>
                          params.data.id,
                      },
                    }}
                  />
                </div>
              ) : (
                <CarbonResultCharts result={result} unit={unit} />
              )}
            </div>

            <div className="co2-info-strip">
              <AppIcon icon={Icons.info} size={16} />
              <span>
                Methodology: {result.methodology.standard} (factor version{" "}
                {result.methodology.version}). Figures are estimates; actual
                emissions vary with vessel, weather, and routing.
              </span>
            </div>
          </div>
        </Spin>
      ) : !isError ? (
        <ModuleEmptyState
          artSize="sm"
          variant="blank"
          title="No result yet"
          className="co2-result-empty"
        />
      ) : null}
    </div>
  );
}
