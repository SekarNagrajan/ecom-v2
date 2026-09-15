// Modified by Sekar Nagarajan (2026-09-15 12:23)
import { AppButton } from "@solverminds/shared-ui";
import { Spin, Table, Typography } from "antd";

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

interface CarbonResultPanelProps {
  input: CarbonInput;
}

function formatIntensity(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
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

  const unit = input.unit;
  const spinning = isLoading || isFetching;
  const laneLabel = `${input.origin} → ${input.destination}`;

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
              <div className="co2-kpi-card">
                <span className="co2-kpi-card__label">Tank-to-wheel</span>
                <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.ttwCo2eKg : result.ttwCo2eTonnes,
                    unit,
                  )}
                </p>
              </div>
              <div className="co2-kpi-card">
                <span className="co2-kpi-card__label">Well-to-tank</span>
                <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.wttCo2eKg : result.wttCo2eTonnes,
                    unit,
                  )}
                </p>
              </div>
              {result.intensity.perTeu != null ? (
                <div className="co2-kpi-card">
                  <span className="co2-kpi-card__label">Per TEU</span>
                  <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                    {formatIntensity(result.intensity.perTeu)} t CO₂e
                  </p>
                </div>
              ) : null}
              {result.intensity.perTonneKm != null ? (
                <div className="co2-kpi-card">
                  <span className="co2-kpi-card__label">Per tonne-km</span>
                  <p className="co2-kpi-card__value co2-kpi-card__value--sm">
                    {formatIntensity(result.intensity.perTonneKm)} g CO₂e
                  </p>
                </div>
              ) : null}
            </div>

            <CarbonResultCharts result={result} unit={unit} />

            {result.legs.length > 0 ? (
              <div className="co2-legs-block">
                <div className="co2-legs-block__header">
                  <Text strong className="co2-legs-title">
                    Per-leg Breakdown
                  </Text>
                  <span className="co2-legs-block__count">
                    {result.legs.length} leg
                    {result.legs.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="co2-legs-table responsive-table-wrap custom-scroll">
                  <Table<CarbonLegResult>
                    size="small"
                    pagination={false}
                    rowKey={(row) => `${row.mode}-${row.from}-${row.to}`}
                    dataSource={result.legs}
                    columns={[
                      {
                        title: "Mode",
                        dataIndex: "mode",
                        key: "mode",
                        width: 120,
                        render: (mode: CarbonLegResult["mode"]) =>
                          transportModeLabel(mode),
                      },
                      {
                        title: "From",
                        dataIndex: "from",
                        key: "from",
                        width: 90,
                      },
                      {
                        title: "To",
                        dataIndex: "to",
                        key: "to",
                        width: 90,
                      },
                      {
                        title: "Distance (km)",
                        dataIndex: "distanceKm",
                        key: "distanceKm",
                        align: "right",
                        render: (v: number) => v.toLocaleString("en-US"),
                      },
                      {
                        title: unit === "kg" ? "CO₂e (kg)" : "CO₂e (t)",
                        key: "co2e",
                        align: "right",
                        render: (_: unknown, row: CarbonLegResult) =>
                          unit === "kg"
                            ? row.co2eKg.toLocaleString("en-US")
                            : row.co2eTonnes.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }),
                      },
                    ]}
                  />
                </div>
              </div>
            ) : null}

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
