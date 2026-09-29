// Modified by Sekar Nagarajan (2026-09-16 12:13)
import { AppButton } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { Segmented, Spin, Tooltip, Typography } from "antd";
import { startTransition, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import {
  useCarbonComputeQuery,
  useCarbonExportMutation,
} from "../api/carbon.queries";
import type { CarbonInput, CarbonLegResult } from "../types/carbon.types";
import { formatCo2e, pickDisplayTotal } from "../types/carbon.types";
import {
  transportModeLabel,
  type CarbonModeLabels,
} from "../utils/carbon-chart-options";
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
  const { t, i18n } = useTranslation(["carbon-calculator", "common"]);
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

  const unitLabels = useMemo(
    () => ({
      kg: t("units.kgCo2e"),
      t: t("units.tCo2e"),
    }),
    [t, i18n.language],
  );

  const modeLabels = useMemo<CarbonModeLabels>(
    () => ({
      SEA: t("modes.SEA"),
      ROAD: t("modes.ROAD"),
      RAIL: t("modes.RAIL"),
      AIR: t("modes.AIR"),
      INLAND_WATER: t("modes.INLAND_WATER"),
    }),
    [t, i18n.language],
  );

  const legColumnDefs: DataViewColumn<CarbonLegRow>[] = useMemo(
    () => [
      {
        headerName: t("columns.mode"),
        field: "mode",
        minWidth: 120,
        flex: 1,
        valueFormatter: (params) =>
          transportModeLabel(
            params.value as CarbonLegResult["mode"],
            modeLabels,
          ),
      },
      {
        headerName: t("columns.from"),
        field: "from",
        minWidth: 100,
        flex: 1,
      },
      {
        headerName: t("columns.to"),
        field: "to",
        minWidth: 100,
        flex: 1,
      },
      {
        headerName: t("columns.distanceKm"),
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
        headerName: unit === "kg" ? t("columns.co2eKg") : t("columns.co2eT"),
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
    ],
    [t, i18n.language, unit, modeLabels],
  );

  if (spinning && !result) {
    return (
      <div
        className="co2-result-loading module-loading-center"
        role="status"
        aria-label={t("a11y.loading")}
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
            : t("errors.computeFailed")}
        </Text>
      ) : null}

      {result ? (
        <Spin spinning={spinning}>
          <div className="co2-result-content">
            <div className="co2-result-toolbar">
              <div className="co2-result-toolbar__meta">
                <span className="co2-result-toolbar__lane">{laneLabel}</span>
                <span className="co2-result-toolbar__sub">
                  {input.equipment} ·{" "}
                  {t("results.containers", { count: input.containerCount })} ·{" "}
                  {input.cargoWeightKg.toLocaleString("en-US")} {t("units.kg")}
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
                {t("actions.exportPdf")}
              </AppButton>
            </div>

            <div className="co2-kpi-grid">
              <div className="co2-kpi-card co2-kpi-card--total">
                <span className="co2-kpi-card__label">{t("kpi.totalCo2e")}</span>
                <p className="co2-kpi-card__value">
                  {formatCo2e(pickDisplayTotal(result, unit), unit, unitLabels)}
                </p>
              </div>
              <div className="co2-kpi-card co2-kpi-card--ttw">
                <span className="co2-kpi-card__label">
                  {t("kpi.tankToWheel")}
                </span>
                <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.ttwCo2eKg : result.ttwCo2eTonnes,
                    unit,
                    unitLabels,
                  )}
                </p>
              </div>
              <div className="co2-kpi-card co2-kpi-card--wtt">
                <span className="co2-kpi-card__label">
                  {t("kpi.wellToTank")}
                </span>
                <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.wttCo2eKg : result.wttCo2eTonnes,
                    unit,
                    unitLabels,
                  )}
                </p>
              </div>
              {result.intensity.perTeu != null ? (
                <div className="co2-kpi-card co2-kpi-card--per-teu">
                  <span className="co2-kpi-card__label">{t("kpi.perTeu")}</span>
                  <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                    {formatIntensity(result.intensity.perTeu)} {t("units.tCo2e")}
                  </p>
                </div>
              ) : null}
              {result.intensity.perTonneKm != null ? (
                <div className="co2-kpi-card co2-kpi-card--per-tkm">
                  <span className="co2-kpi-card__label">
                    {t("kpi.perTonneKm")}
                  </span>
                  <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                    {formatIntensity(result.intensity.perTonneKm)}{" "}
                    {t("units.gCo2e")}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="co2-breakdown-block">
              <div className="co2-breakdown-block__header">
                <Text strong className="co2-breakdown-title">
                  {t("results.emissionsBreakdown")}
                </Text>
                <Segmented
                  className="module-view-mode-tabs co2-breakdown-view-tabs"
                  size="middle"
                  value={breakdownView}
                  aria-label={t("a11y.breakdownViewMode")}
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
                        <ViewModeIcon title={t("results.gridView")}>
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
                        <ViewModeIcon title={t("results.chartView")}>
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
                        title={t("empty.noLegBreakdownTitle")}
                        message={t("empty.noLegBreakdownMessage")}
                      />
                    }
                    allowedViewModes={["list"]}
                    renderToolbar={() => null}
                    listOptions={{
                      showToolbar: {
                        showTotalCount: true,
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
                {t("results.methodology", {
                  standard: result.methodology.standard,
                  version: result.methodology.version,
                })}
              </span>
            </div>
          </div>
        </Spin>
      ) : !isError ? (
        <ModuleEmptyState
          artSize="sm"
          variant="blank"
          title={t("empty.noResultTitle")}
          className="co2-result-empty"
        />
      ) : null}
    </div>
  );
}
