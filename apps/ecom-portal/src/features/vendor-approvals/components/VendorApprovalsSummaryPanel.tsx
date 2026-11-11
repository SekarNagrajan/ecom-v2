import { theme } from "antd";
import * as echarts from "echarts";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { ApprovalStatus } from "../types/vendor-approvals.types";

export type SummaryFilter = ApprovalStatus | "ALL";

interface VendorApprovalsSummaryPanelProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
  activeFilter: SummaryFilter;
  onFilterChange: (filter: SummaryFilter) => void;
}

interface SummaryCardConfig {
  key: SummaryFilter;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "pending" | "approved" | "rejected" | "total";
}

export function VendorApprovalsSummaryPanel({
  pendingCount,
  approvedCount,
  rejectedCount,
  totalCount,
  activeFilter,
  onFilterChange,
}: VendorApprovalsSummaryPanelProps) {
  const { token } = theme.useToken();
  const chartHostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartHostRef.current) return;
    chartRef.current = echarts.init(chartHostRef.current, undefined, {
      renderer: "svg",
    });
    const onResize = () => chartRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption({
      animationDuration: 280,
      series: [
        {
          type: "pie",
          radius: ["68%", "88%"],
          center: ["50%", "50%"],
          silent: true,
          label: { show: false },
          labelLine: { show: false },
          data:
            approvedCount + pendingCount + rejectedCount === 0
              ? [
                  {
                    name: "Empty",
                    value: 1,
                    itemStyle: { color: token.colorFillSecondary },
                  },
                ]
              : [
                  {
                    name: "Approved",
                    value: approvedCount,
                    itemStyle: { color: token.colorSuccess },
                  },
                  {
                    name: "Pending",
                    value: pendingCount,
                    itemStyle: { color: token.colorWarning },
                  },
                  {
                    name: "Rejected",
                    value: rejectedCount,
                    itemStyle: { color: token.colorError },
                  },
                ].filter((d) => d.value > 0),
        },
      ],
    });
  }, [
    approvedCount,
    pendingCount,
    rejectedCount,
    token.colorError,
    token.colorFillSecondary,
    token.colorSuccess,
    token.colorWarning,
  ]);

  const cards: SummaryCardConfig[] = [
    {
      key: "PENDING",
      label: "Pending",
      value: pendingCount,
      icon: Icons.clock,
      tone: "pending",
    },
    {
      key: "APPROVED",
      label: "Approved",
      value: approvedCount,
      icon: Icons.check,
      tone: "approved",
    },
    {
      key: "REJECTED",
      label: "Rejected",
      value: rejectedCount,
      icon: Icons.x,
      tone: "rejected",
    },
    {
      key: "ALL",
      label: "Total",
      value: totalCount,
      icon: Icons.boxes,
      tone: "total",
    },
  ];

  return (
    <section className="va-summary-panel" aria-label="Approval summary">
      <div className="va-summary-panel__inner">
        <div className="va-summary-chart" aria-hidden={totalCount === 0}>
          <div ref={chartHostRef} className="va-summary-chart__canvas" />
          <div className="va-summary-chart__center">
            <span className="va-summary-chart__total">{totalCount}</span>
            <span className="va-summary-chart__total-label">Total</span>
          </div>
        </div>

        <div className="va-summary-divider" aria-hidden />

        <div className="va-summary-cards">
          {cards.map((card) => {
            const isActive = activeFilter === card.key;
            return (
              <button
                key={card.key}
                type="button"
                className={[
                  "va-summary-card",
                  `va-summary-card--${card.tone}`,
                  isActive ? "va-summary-card--active" : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onFilterChange(card.key)}
                aria-pressed={isActive}
                aria-label={`Show ${card.label.toLowerCase()} approvals`}
              >
                <span className="va-summary-card__icon">
                  <AppIcon icon={card.icon} size={16} />
                </span>
                <span className="va-summary-card__content">
                  <span className="va-summary-card__label">{card.label}</span>
                  <span className="va-summary-card__value">{card.value}</span>
                </span>
                <span className="va-summary-card__chevron" aria-hidden>
                  <AppIcon icon={Icons.chevronRight} size={16} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
