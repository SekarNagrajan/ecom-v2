// Modified by Sekar Nagarajan (2026-08-25 18:15)
import { Card, Select, Tooltip, Typography } from "antd";
import * as echarts from "echarts";
import { useLayoutEffect, useRef } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { useChartTokens } from "../../theme/utils/use-portal-chart-tokens";
import type { VolumeKpi, VolumeTrendPoint } from "../mocks/dashboard.mock";

const { Text, Title } = Typography;

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: "canvas" });
    chart.setOption({
      grid: { top: 2, right: 0, bottom: 2, left: 0 },
      xAxis: {
        type: "category",
        boundaryGap: false,
        show: false,
        data: data.map((_, i) => i),
      },
      yAxis: { type: "value", show: false },
      series: [
        {
          type: "line",
          data,
          smooth: true,
          symbol: "none",
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}35` },
              { offset: 1, color: `${color}00` },
            ]),
          },
        },
      ],
    });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [data, color]);

  return <div ref={ref} className="dashboard-sparkline" />;
}

interface VolumeTrendChartProps {
  data: VolumeTrendPoint[];
  period: string;
  onPeriodChange: (v: string) => void;
}

function VolumeTrendChart({
  data,
  period,
  onPeriodChange,
}: VolumeTrendChartProps) {
  const chartTokens = useChartTokens();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: "canvas" });
    chart.setOption({
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
        formatter: "{b}: <b>{c} FEUs</b>",
      },
      grid: { top: 16, right: 10, bottom: 30, left: 40, containLabel: false },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((d) => d.month),
        axisLine: { lineStyle: { color: chartTokens.colorBorderSecondary } },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          color: chartTokens.colorTextSecondary,
          rotate: 20,
        },
      },
      yAxis: {
        type: "value",
        min: "dataMin",
        axisLabel: {
          fontSize: 10,
          color: chartTokens.colorTextSecondary,
          formatter: (v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v),
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
          data: data.map((d) => d.feus),
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          itemStyle: {
            color: chartTokens.colorPrimary,
            borderColor: chartTokens.colorBgContainer,
            borderWidth: 2,
          },
          lineStyle: { color: chartTokens.colorPrimary, width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${chartTokens.colorPrimary}40` },
              { offset: 1, color: `${chartTokens.colorPrimary}00` },
            ]),
          },
        },
      ],
    });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [data, chartTokens]);

  return (
    <div className="dashboard-trend-wrap">
      <div className="dashboard-trend-head">
        <Text strong className="dashboard-metric-tile__label">
          Volume Trend (FEUs){" "}
          <Tooltip title="Monthly FEU Volume Over The Selected Period">
            <AppIcon icon={Icons.info} size={12} />
          </Tooltip>
        </Text>
        <Select
          size="large"
          value={period}
          onChange={onPeriodChange}
          className="dashboard-select-sm"
          options={[
            { value: "Monthly", label: "Monthly" },
            { value: "Weekly", label: "Weekly" },
            { value: "Quarterly", label: "Quarterly" },
          ]}
        />
      </div>
      <div ref={ref} className="dashboard-trend-chart" />
    </div>
  );
}

interface VolumeAnalyticsProps {
  kpis: VolumeKpi[];
  trend: VolumeTrendPoint[];
  trendPeriod: string;
  onTrendPeriodChange: (v: string) => void;
}

export function VolumeAnalyticsSection({
  kpis,
  trend,
  trendPeriod,
  onTrendPeriodChange,
}: VolumeAnalyticsProps) {
  const chartTokens = useChartTokens();

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          1. Shipment Volume Analytics (FEUs){" "}
          <Tooltip title="Freight Equivalent Units — Standard Container Measurement">
            <AppIcon icon={Icons.info} size={12} />
          </Tooltip>
        </Text>
      }
    >
      <div className="dashboard-metric-grid--2">
        <div className="dashboard-volume-kpi-grid">
          {kpis.map((kpi) => {
            const isPositive = kpi.change >= 0;
            return (
              <div key={kpi.label} className="dashboard-metric-tile">
                <div>
                  <Text className="dashboard-metric-tile__label">
                    {kpi.label}
                  </Text>
                  <Text className="dashboard-metric-tile__period">
                    ({kpi.period})
                  </Text>
                  <div className="dashboard-metric-tile__value-row">
                    <Title level={3} className="dashboard-metric-tile__value">
                      {kpi.value.toLocaleString()}
                    </Title>
                    <Text className="dashboard-metric-tile__unit">
                      {kpi.unit}
                    </Text>
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
                        <AppIcon icon={Icons.arrowUp} size={14} />
                      ) : (
                        <AppIcon icon={Icons.arrowDown} size={14} />
                      )}
                      {Math.abs(kpi.change)}%
                    </span>
                    <Text
                      type="secondary"
                      className="dashboard-metric-tile__period"
                    >
                      vs prev ({kpi.changePrev.toLocaleString()})
                    </Text>
                  </div>
                </div>
                <Sparkline
                  data={kpi.sparkline}
                  color={
                    isPositive
                      ? chartTokens.colorSuccess
                      : chartTokens.colorError
                  }
                />
              </div>
            );
          })}
        </div>
        <VolumeTrendChart
          data={trend}
          period={trendPeriod}
          onPeriodChange={onTrendPeriodChange}
        />
      </div>
    </Card>
  );
}
