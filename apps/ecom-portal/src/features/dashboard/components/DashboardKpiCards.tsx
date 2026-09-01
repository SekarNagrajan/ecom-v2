// Modified by Sekar Nagarajan (2026-09-01 11:25)
/**
 * KPI cards — enhancedDashboard.jsp parity (Total / Confirmed / SI / Payment / lifecycle).
 * Visual layout matches dashboard stat cards: eyebrow label, metric, trend, icon top-right.
 */
import { Card, Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../components/icons";
import type { DashboardCounts } from "../api/dashboard.api";

const { Text, Title } = Typography;

type KpiTone = "primary" | "success" | "warning" | "error" | "purple" | "info";
type KpiTrendDirection = "up" | "down" | "neutral";

interface DashboardKpiCardsProps {
  counts: DashboardCounts;
  onFilterChange: (filter: string, label: string) => void;
  activeFilter: string;
}

interface KpiCard {
  key: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: KpiTrendDirection;
  icon: LucideIcon;
  tone: KpiTone;
}

export function DashboardKpiCards({
  counts,
  onFilterChange,
  activeFilter,
}: DashboardKpiCardsProps) {
  const cards: KpiCard[] = [
    {
      key: "all",
      label: "Total Shipments",
      value: String(counts.totCou),
      trend: "Across all lifecycle stages",
      trendDirection: "neutral",
      icon: Icons.ship,
      tone: "primary",
    },
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
      key: "siPending",
      label: "SI Pending",
      value: String(counts.siPending),
      trend: "2 overdue cutoff",
      trendDirection: "down",
      icon: Icons.fileText,
      tone: "warning",
    },
    {
      key: "payPending",
      label: "Payment Pending",
      value: String(counts.payPending),
      trend: `USD ${counts.pendingAmount.toLocaleString("en-US", {
        minimumFractionDigits: 0,
      })} outstanding`,
      trendDirection: "down",
      icon: Icons.creditCard,
      tone: "error",
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

  return (
    <div className="dashboard-kpi-row">
      {cards.map((card) => {
        const isActive = activeFilter === card.key;
        const trendIcon =
          card.trendDirection === "up"
            ? Icons.arrowUp
            : card.trendDirection === "down"
              ? Icons.arrowDown
              : null;

        return (
          <div key={card.key} className="dashboard-kpi-col">
            <Card
              hoverable
              className={[
                "dashboard-kpi-card",
                `dashboard-kpi-card--tone-${card.tone}`,
                isActive ? "dashboard-kpi-card--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onFilterChange(card.key, card.label)}
            >
              <div className="dashboard-kpi-card__body">
                <div className="dashboard-kpi-card__head">
                  <div className="dashboard-kpi-card__main">
                    <Text className="dashboard-kpi-card__eyebrow">
                      {card.label}
                    </Text>
                    <Title
                      level={3}
                      className={`dashboard-kpi-card__metric dashboard-kpi-card__metric--${card.tone}`}
                    >
                      {card.value}
                    </Title>
                  </div>
                  <div
                    className={`dashboard-kpi-card__icon dashboard-kpi-card__icon--${card.tone}`}
                  >
                    <AppIcon icon={card.icon} size={20} />
                  </div>
                </div>
                <div
                  className={`dashboard-kpi-card__trend dashboard-kpi-card__trend--${card.trendDirection}`}
                >
                  {trendIcon ? (
                    <span className="dashboard-kpi-card__trend-icon app-icon-inherit">
                      <AppIcon icon={trendIcon} size={11} />
                    </span>
                  ) : null}
                  <Text className="dashboard-kpi-card__trend-text">
                    {card.trend}
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
