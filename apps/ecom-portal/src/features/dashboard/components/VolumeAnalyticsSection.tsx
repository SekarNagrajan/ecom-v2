// Modified by Sekar Nagarajan (2026-11-13 02:50)
import {
  AppChart,
  AppSparkline,
  createVerticalGradient,
  type ECOption,
} from "@solverminds/shared-ui/chart";
import { Card, Segmented, Select, Tooltip, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useChartTokens } from "../../theme/utils/use-portal-chart-tokens";
import {
  dashboardApi,
  VOLUME_ANALYTICS_STAGE_OPTIONS,
  VOLUME_TREND_PERIOD_OPTIONS,
  type VolumeAnalyticsStage,
  type VolumeKpi,
  type VolumeTrendPeriod,
  type VolumeTrendPoint,
} from "../api/dashboard.api";
import {
  DashboardVolumeTrendRecordsModal,
  type VolumeTrendDrilldownState,
} from "./dashboard-volume-trend-records-modal";

const { Text, Title } = Typography;

/** Sidebar margin transition is 0.25s — remeasure after it settles. */

const VOLUME_KPI_LABEL_KEYS: Record<string, string> = {
  "This Week": "volume.kpiLabels.thisWeek",
  "This Month": "volume.kpiLabels.thisMonth",
  "This Quarter": "volume.kpiLabels.thisQuarter",
  "This Year": "volume.kpiLabels.thisYear",
};

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  return <AppSparkline data={data} color={color} height={32} className="dashboard-sparkline" />;
}

interface VolumeTrendChartProps {
  data: VolumeTrendPoint[];
  period: VolumeTrendPeriod;
  onPeriodChange: (v: VolumeTrendPeriod) => void;
  onPointClick: (point: VolumeTrendPoint) => void;
}

function VolumeTrendChart({ data, period, onPeriodChange, onPointClick }: VolumeTrendChartProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const chartTokens = useChartTokens();

  const periodOptions = useMemo(
    () =>
      VOLUME_TREND_PERIOD_OPTIONS.map((option) => ({
        value: option.value,
        label: t(`volume.periods.${option.value}`),
      })),
    [t],
  );

  // Imperative-library exception: ECharts re-applies the option on identity change.
  const option = useMemo<ECOption>(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: chartTokens.colorBgElevated,
        borderColor: chartTokens.colorBorderSecondary,
        textStyle: { color: chartTokens.colorText },
        axisPointer: {
          type: "line",
          lineStyle: { color: chartTokens.colorPrimary, type: "dashed" },
        },
        formatter: (params: unknown) => {
          const point = Array.isArray(params) ? params[0] : params;
          const p = point as { axisValue?: string; value?: number };
          return t("volume.tooltipTeus", {
            label: p.axisValue ?? "",
            value: p.value ?? "",
          });
        },
      },
      grid: { top: 12, right: 12, bottom: 8, left: 8, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((d) => d.month),
        axisLine: { lineStyle: { color: chartTokens.colorBorderSecondary } },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          color: chartTokens.colorTextSecondary,
          hideOverlap: true,
        },
      },
      yAxis: {
        type: "value",
        min: "dataMin",
        axisLabel: {
          fontSize: 10,
          color: chartTokens.colorTextSecondary,
          formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)),
        },
        splitLine: {
          lineStyle: {
            color: chartTokens.colorBorderSecondary,
            type: "dashed",
          },
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "line",
          data: data.map((d) => ({
            value: d.feus,
            // Clickable points with TEUs get a larger hit target.
            symbolSize: d.feus > 0 ? 8 : 4,
          })),
          smooth: true,
          symbol: "circle",
          cursor: "pointer",
          itemStyle: {
            color: chartTokens.colorPrimary,
            borderColor: chartTokens.colorBgContainer,
            borderWidth: 2,
          },
          emphasis: {
            scale: true,
            scaleSize: 4,
            itemStyle: {
              color: chartTokens.colorPrimary,
              shadowBlur: 6,
              shadowColor: `${chartTokens.colorPrimary}55`,
            },
          },
          lineStyle: { color: chartTokens.colorPrimary, width: 2.5 },
          areaStyle: {
            color: createVerticalGradient(chartTokens.colorPrimary, 0.25),
          },
        },
      ],
    }),
    [data, chartTokens, t],
  );

  const handleClick = (params: unknown) => {
    const p = params as { componentType?: string; dataIndex?: number };
    if (p.componentType !== "series") return;
    const index = typeof p.dataIndex === "number" ? p.dataIndex : -1;
    const point = data[index];
    if (!point || point.feus <= 0) return;
    onPointClick(point);
  };

  const periodHint =
    period === "Weekly"
      ? t("volume.periodHintWeekly")
      : period === "Quarterly"
        ? t("volume.periodHintQuarterly")
        : t("volume.periodHintMonthly");

  return (
    <div className="dashboard-trend-wrap">
      <div className="dashboard-trend-head">
        <Text strong className="dashboard-metric-tile__label">
          {t("volume.trendTitle")}{" "}
          <Tooltip title={periodHint}>
            <AppIcon icon={Icons.info} size={12} />
          </Tooltip>
        </Text>
        <Select
          size="large"
          value={period}
          onChange={onPeriodChange}
          className="dashboard-select-sm"
          options={periodOptions}
        />
      </div>
      <Text type="secondary" className="dashboard-trend-click-hint">
        {t("volume.drilldown.clickHint")}
      </Text>
      <AppChart
        option={option}
        notMerge
        height="auto"
        className="dashboard-trend-chart"
        onEvents={{ click: handleClick }}
        ariaLabel={t("volume.title", { defaultValue: "Volume trend" })}
      />
    </div>
  );
}

interface VolumeAnalyticsProps {
  kpis: VolumeKpi[];
  trend: VolumeTrendPoint[];
  trendPeriod: VolumeTrendPeriod;
  volumeStage: VolumeAnalyticsStage;
  onTrendPeriodChange: (v: VolumeTrendPeriod) => void;
  onVolumeStageChange: (v: VolumeAnalyticsStage) => void;
}

function getVolumeStageLabel(stage: VolumeAnalyticsStage, t: (key: string) => string): string {
  switch (stage) {
    case "all":
      return t("volume.stages.all");
    case "booking":
      return t("volume.stages.booking");
    case "si":
      return t("volume.stages.si");
    case "bl":
      return t("volume.stages.bl");
    case "inTransit":
      return t("kpi.inTransit");
    default: {
      const _exhaustive: never = stage;
      return _exhaustive;
    }
  }
}

function getVolumeKpiLabel(label: string, t: (key: string) => string): string {
  const key = VOLUME_KPI_LABEL_KEYS[label];
  return key ? t(key) : label;
}

export function VolumeAnalyticsSection({
  kpis,
  trend,
  trendPeriod,
  volumeStage,
  onTrendPeriodChange,
  onVolumeStageChange,
}: VolumeAnalyticsProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const chartTokens = useChartTokens();
  const stageLabel = getVolumeStageLabel(volumeStage, t);
  const [drilldown, setDrilldown] = useState<VolumeTrendDrilldownState | null>(null);

  const stageOptions = useMemo(
    () =>
      VOLUME_ANALYTICS_STAGE_OPTIONS.map((option) => ({
        value: option.value,
        label: getVolumeStageLabel(option.value, t),
      })),
    [t],
  );

  const handleTrendPointClick = async (point: VolumeTrendPoint) => {
    if (point.feus <= 0) return;
    setDrilldown({ point, loading: true, records: [] });
    try {
      const records = await dashboardApi.getVolumeTrendRecords({
        stage: volumeStage,
        period: trendPeriod,
        periodKey: point.periodKey,
      });
      setDrilldown({ point, loading: false, records });
    } catch {
      setDrilldown({ point, loading: false, records: [] });
    }
  };

  return (
    <>
      <Card
        className="dashboard-panel dashboard-volume-panel"
        title={
          <Text strong className="dashboard-panel__title">
            {t("volume.title")}{" "}
            <Text type="secondary" className="dashboard-volume-stage-label">
              · {stageLabel}
            </Text>
          </Text>
        }
        extra={
          <Segmented
            size="middle"
            className="dashboard-volume-stage-segmented"
            value={volumeStage}
            onChange={(value) => onVolumeStageChange(value as VolumeAnalyticsStage)}
            options={stageOptions}
          />
        }
      >
        <div className="dashboard-volume-analytics-grid">
          <div className="dashboard-volume-kpi-grid">
            {kpis.map((kpi) => {
              const isPositive = kpi.change >= 0;
              return (
                <div key={kpi.label} className="dashboard-metric-tile">
                  <div>
                    <Text className="dashboard-metric-tile__label">
                      {getVolumeKpiLabel(kpi.label, t)}
                    </Text>
                    <Text className="dashboard-metric-tile__period">({kpi.period})</Text>
                    <div className="dashboard-metric-tile__value-row">
                      <Title level={3} className="dashboard-metric-tile__value">
                        {kpi.value.toLocaleString()}
                      </Title>
                      <Text className="dashboard-metric-tile__unit">{kpi.unit}</Text>
                    </div>
                    <div className="dashboard-metric-tile__delta">
                      <span
                        className={
                          isPositive
                            ? "dashboard-delta-badge dashboard-delta-badge--up"
                            : "dashboard-delta-badge dashboard-delta-badge--down"
                        }
                      >
                        {isPositive ? (
                          <AppIcon icon={Icons.arrowUp} size={14} tone="create" />
                        ) : (
                          <AppIcon icon={Icons.arrowDown} size={14} tone="delete" />
                        )}
                        {Math.abs(kpi.change)}%
                      </span>
                      <Text type="secondary" className="dashboard-metric-tile__period">
                        {t("volume.vsPrev", {
                          value: kpi.changePrev.toLocaleString(),
                        })}
                      </Text>
                    </div>
                  </div>
                  <Sparkline
                    data={kpi.sparkline}
                    color={isPositive ? chartTokens.colorSuccess : chartTokens.colorError}
                  />
                </div>
              );
            })}
          </div>
          <VolumeTrendChart
            data={trend}
            period={trendPeriod}
            onPeriodChange={onTrendPeriodChange}
            onPointClick={(point) => void handleTrendPointClick(point)}
          />
        </div>
      </Card>

      <DashboardVolumeTrendRecordsModal state={drilldown} onClose={() => setDrilldown(null)} />
    </>
  );
}
