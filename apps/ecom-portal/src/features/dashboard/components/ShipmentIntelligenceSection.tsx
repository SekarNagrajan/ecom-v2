// Modified by Sekar Nagarajan (2026-08-25 18:20)
import { AppButton } from "@solverminds/shared-ui";
import {
  Card,
  Col,
  Progress,
  Row,
  Tabs,
  theme,
  Tooltip,
  Typography,
} from "antd";
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
            fontSize: 20,
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
            fontSize: 11,
          },
        },
      ],
      series: [
        {
          type: "pie",
          radius: ["50%", "76%"],
          center: ["50%", "47%"],
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
}

function BreakdownTable({ data }: BreakdownTableProps) {
  const { token } = theme.useToken();
  const max = data[0]?.feus ?? 1;

  return (
    <div className="dashboard-table-wrap custom-scroll">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Origin</th>
            <th className="is-right">FEUs</th>
            <th className="is-right">% Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const stroke = resolveDashboardTone(
              token,
              row.tone as DashboardTone,
            );
            return (
              <tr key={idx} className={idx % 2 === 1 ? "is-alt" : undefined}>
                <td>
                  <span className="dashboard-name-cell">
                    <span
                      className={`dashboard-dot dashboard-dot--${row.tone}`}
                    />
                    <Text ellipsis>{row.name}</Text>
                  </span>
                </td>
                <td className="is-right">
                  <Text strong>{row.feus.toLocaleString()}</Text>
                </td>
                <td className="is-right">
                  <Text type="secondary">{row.pctOfTotal}%</Text>
                </td>
                <td>
                  <Progress
                    percent={Math.round((row.feus / max) * 100)}
                    showInfo={false}
                    size="small"
                    strokeColor={stroke}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const INTELLIGENCE_TABS = [
  { key: "origin", label: "By Origin", data: MOCK_INTELLIGENCE_BY_ORIGIN },
  { key: "pol", label: "By POL", data: MOCK_INTELLIGENCE_BY_POL },
  { key: "pod", label: "By POD", data: MOCK_INTELLIGENCE_BY_POD },
  { key: "pickup", label: "By Pickup", data: MOCK_INTELLIGENCE_BY_ORIGIN },
  { key: "consignee", label: "By Consignee", data: MOCK_INTELLIGENCE_BY_POL },
  {
    key: "destination",
    label: "By Destination",
    data: MOCK_INTELLIGENCE_BY_POD,
  },
];

export function InteractiveShipmentIntelligenceCard() {
  const [activeTab, setActiveTab] = useState("origin");
  const currentTab = INTELLIGENCE_TABS.find((t) => t.key === activeTab)!;
  const totalFeus = currentTab.data.reduce((s, d) => s + d.feus, 0);

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          Interactive Shipment Intelligence
        </Text>
      }
      extra={
        <Tooltip title="Open Intelligence Report">
          <AppButton type="link" size="small">
            View Report
          </AppButton>
        </Tooltip>
      }
    >
      <Tabs
        size="small"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={INTELLIGENCE_TABS.map((t) => ({ key: t.key, label: t.label }))}
      />
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={9}>
          <DonutChart data={currentTab.data} totalFeus={totalFeus} />
        </Col>
        <Col xs={24} sm={15}>
          <BreakdownTable data={currentTab.data} />
        </Col>
      </Row>
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
          Top Consignees (By FEUs)
        </Text>
      }
      extra={
        <Tooltip title="View All Consignees">
          <AppButton type="link" size="small">
            View All
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-table-wrap custom-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th className="is-right">FEUs</th>
              <th className="is-right">% Total</th>
              <th>Volume Share</th>
            </tr>
          </thead>
          <tbody>
            {consignees.map((c, idx) => {
              const stroke = resolveDashboardTone(
                token,
                c.tone as DashboardTone,
              );
              return (
                <tr key={idx} className={idx % 2 === 1 ? "is-alt" : undefined}>
                  <td>
                    <Text>{c.name}</Text>
                  </td>
                  <td className="is-right">
                    <Text strong>{c.feus.toLocaleString()}</Text>
                  </td>
                  <td className="is-right">
                    <Text type="secondary">{c.pctOfTotal}%</Text>
                  </td>
                  <td>
                    <Progress
                      percent={Math.round((c.feus / max) * 100)}
                      showInfo={false}
                      size="small"
                      strokeColor={stroke}
                    />
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
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <InteractiveShipmentIntelligenceCard />
      </Col>
      <Col xs={24} lg={10}>
        <TopConsigneesCard consignees={consignees} />
      </Col>
    </Row>
  );
}
