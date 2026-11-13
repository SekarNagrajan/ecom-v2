// Modified by Sekar Nagarajan (2026-11-13 02:50)
import { AppChart, type ECOption } from "@solverminds/shared-ui/chart";
import { theme } from "antd";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";

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

  // Imperative-library exception: ECharts re-applies the option on identity change.
  const option = useMemo<ECOption>(
    () => ({
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
    }),
    [approvedCount, pendingCount, rejectedCount, token],
  );

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
          <AppChart
            option={option}
            renderer="svg"
            height="auto"
            className="va-summary-chart__canvas"
            accessible={false}
            ariaLabel="Approval status breakdown"
          />
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
