// Modified by Sekar Nagarajan (2026-09-08 12:25)
/**
 * KPI cards — enhancedDashboard.jsp parity (Total / Confirmed / SI / Payment / lifecycle).
 * Layout: Total Shipments hero + Shipment Progress strip + Action Required panel.
 */
import { Card, Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../components/icons";
import type { DashboardCounts } from "../api/dashboard.api";

const { Text, Title } = Typography;

type KpiTone =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "purple"
  | "info"
  | "orange";
type KpiTrendDirection = "up" | "down" | "neutral";

interface DashboardKpiCardsProps {
  counts: DashboardCounts;
  onFilterChange: (filter: string, label: string) => void;
  onViewShipments: () => void;
  activeFilter: string;
}

interface ProgressMetric {
  key: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: KpiTrendDirection;
  icon: LucideIcon;
  tone: KpiTone;
}

interface ActionItem {
  key: string;
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "warning" | "error" | "orange";
}

export function DashboardKpiCards({
  counts,
  onFilterChange,
  onViewShipments,
  activeFilter,
}: DashboardKpiCardsProps) {
  const progressMetrics: ProgressMetric[] = [
    {
      key: "bkConfirmed",
      label: "Booking Confirmed",
      value: String(counts.bkConfirmed),
      trend: "+2 confirmed this week",
      trendDirection: "up",
      icon: Icons.notebook,
      tone: "success",
    },
    {
      key: "origin",
      label: "At Origin",
      value: String(counts.orgCou),
      trend: "Awaiting departure",
      trendDirection: "neutral",
      icon: Icons.mapPin,
      tone: "purple",
    },
    {
      key: "inTransit",
      label: "In Transit",
      value: String(counts.inTransitCou),
      trend: "2 arriving this week",
      trendDirection: "up",
      icon: Icons.anchor,
      tone: "info",
    },
    {
      key: "delivered",
      label: "Delivered",
      value: String(counts.delCou),
      trend: "Completed shipments",
      trendDirection: "up",
      icon: Icons.truck,
      tone: "success",
    },
  ];

  const actionItems: ActionItem[] = [
    {
      key: "siPending",
      label: "SI Pending",
      value: String(counts.siPending),
      detail: "2 overdue cutoff",
      icon: Icons.fileText,
      tone: "warning",
    },
    {
      key: "payPending",
      label: "Payment Pending",
      value: String(counts.payPending),
      detail: `USD ${counts.pendingAmount.toLocaleString("en-US", {
        minimumFractionDigits: 0,
      })} outstanding`,
      icon: Icons.creditCard,
      tone: "error",
    },
  ];

  return (
    <div className="dashboard-kpi-overview">
      <Card
        className="dashboard-kpi-total"
        onClick={() => onFilterChange("all", "Total Shipments")}
      >
        <div className="dashboard-kpi-total__accent" aria-hidden />
        <div className="dashboard-kpi-total__body">
          <div className="dashboard-kpi-total__head">
            <div className="dashboard-kpi-total__icon app-icon-inherit">
              <AppIcon icon={Icons.ship} size={16} />
            </div>
            <Text className="dashboard-kpi-total__eyebrow">
              Total Shipments
            </Text>
          </div>
          <Title level={2} className="dashboard-kpi-total__metric">
            {counts.totCou}
          </Title>
          <Text className="dashboard-kpi-total__subtitle">
            Across all lifecycle stages
          </Text>
          <button
            type="button"
            className="dashboard-kpi-total__link"
            onClick={(event) => {
              event.stopPropagation();
              onViewShipments();
            }}
          >
            View shipments
            <span className="dashboard-kpi-total__link-arrow app-icon-inherit">
              <AppIcon icon={Icons.arrowRight} size={12} />
            </span>
          </button>
        </div>
      </Card>

      <Card className="dashboard-kpi-progress">
        <div className="dashboard-kpi-progress__header">
          <Title level={5} className="dashboard-kpi-progress__title">
            Shipment Progress
          </Title>
          <Text className="dashboard-kpi-progress__subtitle">
            Current operational status
          </Text>
        </div>
        <div className="dashboard-kpi-progress__grid">
          {progressMetrics.map((metric) => {
            const isActive = activeFilter === metric.key;
            return (
              <button
                key={metric.key}
                type="button"
                className={[
                  "dashboard-kpi-progress__cell",
                  `dashboard-kpi-progress__cell--tone-${metric.tone}`,
                  isActive ? "dashboard-kpi-progress__cell--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onFilterChange(metric.key, metric.label)}
              >
                <div
                  className={`dashboard-kpi-progress__icon dashboard-kpi-progress__icon--${metric.tone} app-icon-inherit`}
                >
                  <AppIcon icon={metric.icon} size={13} />
                </div>
                <Text className="dashboard-kpi-progress__label">
                  {metric.label}
                </Text>
                <Title
                  level={3}
                  className={`dashboard-kpi-progress__metric dashboard-kpi-progress__metric--${metric.tone}`}
                >
                  {metric.value}
                </Title>
                <Text
                  className={`dashboard-kpi-progress__trend dashboard-kpi-progress__trend--${metric.trendDirection}`}
                >
                  {metric.trend}
                </Text>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="dashboard-kpi-action">
        <div className="dashboard-kpi-action__header">
          <div className="dashboard-kpi-action__header-icon app-icon-inherit">
            <AppIcon icon={Icons.alertTriangle} size={14} />
          </div>
          <div className="dashboard-kpi-action__header-copy">
            <Title level={5} className="dashboard-kpi-action__title">
              Action Required
            </Title>
            <Text className="dashboard-kpi-action__subtitle">
              Items requiring your attention
            </Text>
          </div>
        </div>
        <div className="dashboard-kpi-action__list">
          {actionItems.map((item) => {
            const isActive = activeFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                className={[
                  "dashboard-kpi-action__row",
                  `dashboard-kpi-action__row--tone-${item.tone}`,
                  isActive ? "dashboard-kpi-action__row--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onFilterChange(item.key, item.label)}
              >
                <div
                  className={`dashboard-kpi-action__row-icon dashboard-kpi-action__row-icon--${item.tone} app-icon-inherit`}
                >
                  <AppIcon icon={item.icon} size={13} />
                </div>
                <div className="dashboard-kpi-action__row-main">
                  <Text className="dashboard-kpi-action__row-label">
                    {item.label}
                  </Text>
                  <Title
                    level={3}
                    className={`dashboard-kpi-action__row-value dashboard-kpi-action__row-value--${item.tone}`}
                  >
                    {item.value}
                  </Title>
                </div>
                <div className="dashboard-kpi-action__row-meta">
                  <Text className="dashboard-kpi-action__row-detail">
                    {item.detail}
                  </Text>
                  <span className="dashboard-kpi-action__row-chevron app-icon-inherit">
                    <AppIcon icon={Icons.chevronRight} size={14} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
