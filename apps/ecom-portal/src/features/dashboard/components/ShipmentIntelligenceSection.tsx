// Modified by Sekar Nagarajan (2026-09-16 17:13)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Progress, Segmented, Tooltip, Typography, theme } from "antd";
import * as echarts from "echarts";
import { useLayoutEffect, useRef, useState } from "react";

import { useChartTokens } from "../../theme/utils/use-portal-chart-tokens";
import type {
  IntelligenceBreakdown,
  TopConsignee,
} from "../mocks/dashboard.mock";
import {
  MOCK_INTELLIGENCE_BY_ORIGIN,
  MOCK_INTELLIGENCE_BY_POD,
  MOCK_INTELLIGENCE_BY_POL,
} from "../mocks/dashboard.mock";
import {
  resolveDashboardTone,
  type DashboardTone,
} from "../utils/dashboard-tone";

const { Text } = Typography;

interface DonutChartProps {
  data: IntelligenceBreakdown[];
  totalFeus: number;
}

function DonutChart({ data, totalFeus }: DonutChartProps) {
  const chartTokens = useChartTokens();
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: "svg" });
    chart.setOption({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} FEUs ({d}%)",
        backgroundColor: chartTokens.colorBgElevated,
        borderColor: chartTokens.colorBorderSecondary,
        textStyle: { color: chartTokens.colorText },
      },
      graphic: [
        {
          type: "text",
          left: "center",
          top: "38%",
          style: {
            text: totalFeus.toLocaleString(),
            textAlign: "center",
            fill: chartTokens.colorText,
            fontSize: token.fontSizeHeading4,
            fontWeight: "bold",
          },
        },
        {
          type: "text",
          left: "center",
          top: "52%",
          style: {
            text: "FEUs",
            textAlign: "center",
            fill: chartTokens.colorTextSecondary,
            fontSize: token.fontSizeSM,
          },
        },
      ],
      series: [
        {
          type: "pie",
          radius: ["52%", "78%"],
          center: ["50%", "48%"],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { scale: true, scaleSize: 4 },
          data: data.map((d) => ({
            value: d.feus,
            name: d.name,
            itemStyle: {
              color: resolveDashboardTone(token, d.tone as DashboardTone),
            },
          })),
        },
      ],
    });
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [data, totalFeus, chartTokens, token]);

  return <div ref={ref} className="dashboard-donut" />;
}

interface BreakdownTableProps {
  data: IntelligenceBreakdown[];
  dimensionLabel: string;
}

function BreakdownTable({ data, dimensionLabel }: BreakdownTableProps) {
  const { token } = theme.useToken();
  const max = data[0]?.feus ?? 1;

  return (
    <div className="dashboard-table-wrap custom-scroll dashboard-intelligence-table">
      <table className="dashboard-table dashboard-table--intelligence">
        <colgroup>
          <col className="dashboard-col-name" />
          <col className="dashboard-col-numeric" />
          <col className="dashboard-col-numeric" />
          <col className="dashboard-col-bar" />
        </colgroup>
        <thead>
          <tr>
            <th>{dimensionLabel}</th>
            <th className="is-right">FEUs</th>
            <th className="is-right">Share</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const stroke = resolveDashboardTone(
              token,
              row.tone as DashboardTone,
            );
            return (
              <tr
                key={row.name}
                className={idx % 2 === 1 ? "is-alt" : undefined}
              >
                <td>
                  <span className="dashboard-name-cell">
                    <span
                      className={`dashboard-dot dashboard-dot--${row.tone}`}
                    />
                    <Tooltip title={row.name}>
                      <Text ellipsis className="dashboard-name-cell__text">
                        {row.name}
                      </Text>
                    </Tooltip>
                  </span>
                </td>
                <td className="is-right">
                  <Text strong>{row.feus.toLocaleString()}</Text>
                </td>
                <td className="is-right">
                  <Text type="secondary">{row.pctOfTotal.toFixed(1)}%</Text>
                </td>
                <td>
                  <div className="dashboard-volume-bar">
                    <Progress
                      percent={Math.round((row.feus / max) * 100)}
                      showInfo={false}
                      size="small"
                      strokeColor={stroke}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const INTELLIGENCE_DIMENSIONS = [
  {
    key: "origin",
    label: "Origin",
    column: "Origin",
    data: MOCK_INTELLIGENCE_BY_ORIGIN,
  },
  {
    key: "pol",
    label: "POL",
    column: "Port of Loading",
    data: MOCK_INTELLIGENCE_BY_POL,
  },
  {
    key: "pod",
    label: "POD",
    column: "Port of Discharge",
    data: MOCK_INTELLIGENCE_BY_POD,
  },
  {
    key: "pickup",
    label: "Pickup",
    column: "Pickup",
    data: MOCK_INTELLIGENCE_BY_ORIGIN,
  },
  {
    key: "consignee",
    label: "Consignee",
    column: "Consignee",
    data: MOCK_INTELLIGENCE_BY_POL,
  },
  {
    key: "destination",
    label: "Destination",
    column: "Destination",
    data: MOCK_INTELLIGENCE_BY_POD,
  },
] as const;

export function InteractiveShipmentIntelligenceCard() {
  const [activeKey, setActiveKey] = useState<string>("origin");
  const current =
    INTELLIGENCE_DIMENSIONS.find((d) => d.key === activeKey) ??
    INTELLIGENCE_DIMENSIONS[0];
  const totalFeus = current.data.reduce((sum, row) => sum + row.feus, 0);

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          Shipment Intelligence
        </Text>
      }
      extra={
        <Tooltip title="Open the full intelligence report">
          <AppButton type="link" size="small">
            View Report
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-panel-stack">
        <div className="dashboard-intelligence-toolbar">
          <Segmented
            size="middle"
            className="dashboard-intelligence-segmented"
            value={activeKey}
            onChange={(value) => setActiveKey(String(value))}
            options={INTELLIGENCE_DIMENSIONS.map((d) => ({
              value: d.key,
              label: d.label,
            }))}
          />
          <div className="dashboard-intelligence-summary">
            <Text type="secondary">Total</Text>
            <Text strong>{totalFeus.toLocaleString()} FEUs</Text>
            <Text type="secondary">·</Text>
            <Text type="secondary">{current.data.length} segments</Text>
          </div>
        </div>

        <div className="dashboard-intelligence-layout">
          <div className="dashboard-intelligence-chart">
            <DonutChart data={current.data} totalFeus={totalFeus} />
          </div>
          <BreakdownTable data={current.data} dimensionLabel={current.column} />
        </div>
      </div>
    </Card>
  );
}

interface TopConsigneesProps {
  consignees: TopConsignee[];
}

export function TopConsigneesCard({ consignees }: TopConsigneesProps) {
  const { token } = theme.useToken();
  const max = consignees[0]?.feus ?? 1;

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          Top Consignees
        </Text>
      }
      extra={
        <Tooltip title="View all consignees by FEU volume">
          <AppButton type="link" size="small">
            View All
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-table-wrap custom-scroll dashboard-panel-stack__grow">
        <table className="dashboard-table dashboard-table--consignees">
          <colgroup>
            <col className="dashboard-col-rank" />
            <col className="dashboard-col-name" />
            <col className="dashboard-col-numeric" />
            <col className="dashboard-col-numeric" />
            <col className="dashboard-col-bar" />
          </colgroup>
          <thead>
            <tr>
              <th className="is-center">#</th>
              <th>Company</th>
              <th className="is-right">FEUs</th>
              <th className="is-right">Share</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {consignees.map((c, idx) => {
              const stroke = resolveDashboardTone(
                token,
                c.tone as DashboardTone,
              );
              return (
                <tr
                  key={c.name}
                  className={idx % 2 === 1 ? "is-alt" : undefined}
                >
                  <td className="is-center">
                    <span className="dashboard-rank-badge">{idx + 1}</span>
                  </td>
                  <td>
                    <Tooltip title={c.name}>
                      <Text ellipsis className="dashboard-name-cell__text">
                        {c.name}
                      </Text>
                    </Tooltip>
                  </td>
                  <td className="is-right">
                    <Text strong>{c.feus.toLocaleString()}</Text>
                  </td>
                  <td className="is-right">
                    <Text type="secondary">{c.pctOfTotal.toFixed(1)}%</Text>
                  </td>
                  <td>
                    <div className="dashboard-volume-bar">
                      <Progress
                        percent={Math.round((c.feus / max) * 100)}
                        showInfo={false}
                        size="small"
                        strokeColor={stroke}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface ShipmentIntelligenceProps {
  consignees: TopConsignee[];
}

export function ShipmentIntelligenceSection({
  consignees,
}: ShipmentIntelligenceProps) {
  return (
    <div className="dashboard-equal-row dashboard-intelligence-row">
      <div className="dashboard-intelligence-row__primary">
        <InteractiveShipmentIntelligenceCard />
      </div>
      <div className="dashboard-intelligence-row__secondary">
        <TopConsigneesCard consignees={consignees} />
      </div>
    </div>
  );
}
