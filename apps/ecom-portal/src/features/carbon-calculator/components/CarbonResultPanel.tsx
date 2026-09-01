// Modified by Sekar Nagarajan (2026-08-25 13:10)
import { AppButton } from "@solverminds/shared-ui";
import { Spin, Table, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import {
  useCarbonComputeQuery,
  useCarbonExportMutation,
} from "../api/carbon.queries";
import type { CarbonInput, CarbonLegResult } from "../types/carbon.types";
import { formatCo2e, pickDisplayTotal } from "../types/carbon.types";

const { Text } = Typography;

interface CarbonResultPanelProps {
  input: CarbonInput;
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

  return (
    <Spin spinning={spinning} tip="Calculating CO₂e estimate…">
      <div className="co2-result-panel">
        {isError ? (
          <Text type="danger" className="co2-result-error">
            {error instanceof Error
              ? error.message
              : "Failed to compute carbon footprint."}
          </Text>
        ) : null}

        {result ? (
          <>
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
                type="primary"
                size="large"
                loading={exportMutation.isPending}
                icon={
                  <AppIcon icon={Icons.download} size={16} tone="download" />
                }
                onClick={() => exportMutation.mutate(input)}
              >
                Export PDF
              </AppButton>
            </div>

            <div className="co2-summary-cards">
              <div className="co2-summary-card co2-summary-card--total">
                <span className="co2-summary-card__label">Total CO₂e</span>
                <p className="co2-summary-card__value">
                  {formatCo2e(pickDisplayTotal(result, unit), unit)}
                </p>
              </div>
              <div className="co2-summary-card">
                <span className="co2-summary-card__label">Tank-to-wheel</span>
                <p className="co2-summary-card__value co2-summary-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.ttwCo2eKg : result.ttwCo2eTonnes,
                    unit,
                  )}
                </p>
              </div>
              <div className="co2-summary-card">
                <span className="co2-summary-card__label">Well-to-tank</span>
                <p className="co2-summary-card__value co2-summary-card__value--sm">
                  {formatCo2e(
                    unit === "kg" ? result.wttCo2eKg : result.wttCo2eTonnes,
                    unit,
                  )}
                </p>
              </div>
            </div>

            {(result.intensity.perTeu != null ||
              result.intensity.perTonneKm != null) && (
              <div className="co2-intensity">
                {result.intensity.perTeu != null ? (
                  <span>
                    Per TEU:{" "}
                    <strong>
                      {result.intensity.perTeu.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      t CO₂e
                    </strong>
                  </span>
                ) : null}
                {result.intensity.perTonneKm != null ? (
                  <span>
                    Per tonne-km:{" "}
                    <strong>
                      {result.intensity.perTonneKm.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      g CO₂e
                    </strong>
                  </span>
                ) : null}
              </div>
            )}

            {result.legs.length > 0 ? (
              <div className="co2-legs-table responsive-table-wrap">
                <Text strong className="co2-legs-title">
                  Per-leg breakdown
                </Text>
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
                      width: 100,
                    },
                    {
                      title: "From",
                      dataIndex: "from",
                      key: "from",
                      width: 90,
                    },
                    { title: "To", dataIndex: "to", key: "to", width: 90 },
                    {
                      title: "Distance (km)",
                      dataIndex: "distanceKm",
                      key: "distanceKm",
                      render: (v: number) => v.toLocaleString("en-US"),
                    },
                    {
                      title: unit === "kg" ? "CO₂e (kg)" : "CO₂e (t)",
                      key: "co2e",
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
            ) : null}

            <div className="co2-info-strip">
              <AppIcon icon={Icons.info} size={16} />
              <span>
                Methodology: {result.methodology.standard} (factor version{" "}
                {result.methodology.version}). Figures are estimates; actual
                emissions vary with vessel, weather, and routing.
              </span>
            </div>
          </>
        ) : spinning ? (
          <div className="co2-result-spin-placeholder" aria-hidden />
        ) : !isError ? (
          <div className="co2-result-idle">No result yet.</div>
        ) : null}
      </div>
    </Spin>
  );
}
