// Modified by Sekar Nagarajan (2026-09-16 17:13)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Progress, Segmented, Tooltip, Typography, theme } from "antd";
import * as echarts from "echarts";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["dashboard", "common", "modules"]);
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
        formatter: (params: unknown) => {
          const p = params as {
            name?: string;
            value?: number;
            percent?: number;
          };
          return t("intelligence.tooltipFeus", {
            name: p.name ?? "",
            value: p.value ?? "",
            percent: p.percent ?? "",
          });
        },
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
            text: "TEUs",
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
  }, [data, totalFeus, chartTokens, token, t]);

  return <div ref={ref} className="dashboard-donut" />;
}

interface BreakdownTableProps {
  data: IntelligenceBreakdown[];
  dimensionLabel: string;
}

function BreakdownTable({ data, dimensionLabel }: BreakdownTableProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
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
            <th className="is-right">{t("intelligence.columns.teus")}</th>
            <th className="is-right">{t("intelligence.columns.share")}</th>
            <th>{t("intelligence.columns.volume")}</th>
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

export function InteractiveShipmentIntelligenceCard() {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const [activeKey, setActiveKey] = useState<string>("origin");

  const dimensions = useMemo(
    () =>
      [
        {
          key: "origin",
          label: t("intelligence.dimensions.origin"),
          column: t("intelligence.dimensionColumns.origin"),
          data: MOCK_INTELLIGENCE_BY_ORIGIN,
        },
        {
          key: "pol",
          label: t("intelligence.dimensions.pol"),
          column: t("intelligence.dimensionColumns.pol"),
          data: MOCK_INTELLIGENCE_BY_POL,
        },
        {
          key: "pod",
          label: t("intelligence.dimensions.pod"),
          column: t("intelligence.dimensionColumns.pod"),
          data: MOCK_INTELLIGENCE_BY_POD,
        },
        {
          key: "pickup",
          label: t("intelligence.dimensions.pickup"),
          column: t("intelligence.dimensionColumns.pickup"),
          data: MOCK_INTELLIGENCE_BY_ORIGIN,
        },
        {
          key: "consignee",
          label: t("intelligence.dimensions.consignee"),
          column: t("intelligence.dimensionColumns.consignee"),
          data: MOCK_INTELLIGENCE_BY_POL,
        },
        {
          key: "destination",
          label: t("intelligence.dimensions.destination"),
          column: t("intelligence.dimensionColumns.destination"),
          data: MOCK_INTELLIGENCE_BY_POD,
        },
      ] as const,
    [t],
  );

  const current =
    dimensions.find((d) => d.key === activeKey) ?? dimensions[0];
  const totalFeus = current.data.reduce((sum, row) => sum + row.feus, 0);

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          {t("intelligence.title")}
        </Text>
      }
      extra={
        <Tooltip title={t("intelligence.viewReportTooltip")}>
          <AppButton type="link" size="small">
            {t("actions.viewReport")}
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
            options={dimensions.map((d) => ({
              value: d.key,
              label: d.label,
            }))}
          />
          <div className="dashboard-intelligence-summary">
            <Text type="secondary">{t("intelligence.total")}</Text>
            <Text strong>
              {t("intelligence.totalTeus", {
                count: totalFeus.toLocaleString(),
              })}
            </Text>
            <Text type="secondary">·</Text>
            <Text type="secondary">
              {t("intelligence.segments", { count: current.data.length })}
            </Text>
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
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const { token } = theme.useToken();
  const max = consignees[0]?.feus ?? 1;

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          {t("intelligence.topConsignees")}
        </Text>
      }
      extra={
        <Tooltip title={t("intelligence.viewAllConsigneesTooltip")}>
          <AppButton type="link" size="small">
            {t("actions.viewAll")}
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
              <th className="is-center">{t("intelligence.columns.rank")}</th>
              <th>{t("intelligence.columns.company")}</th>
              <th className="is-right">{t("intelligence.columns.teus")}</th>
              <th className="is-right">{t("intelligence.columns.share")}</th>
              <th>{t("intelligence.columns.volume")}</th>
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
