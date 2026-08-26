// Modified by Sekar Nagarajan (2026-08-25 18:25)
/**
 * KPI cards — enhancedDashboard.jsp parity (Total / Confirmed / SI / Payment / lifecycle).
 * Equal-height cards via reserved sub-line + flex columns. Token classes only (agenct).
 */
import { Card, Statistic, Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../components/icons";
import type { DashboardCounts } from "../api/dashboard.api";

const { Text } = Typography;

type KpiTone = "primary" | "success" | "warning" | "error" | "purple" | "info";

interface DashboardKpiCardsProps {
  counts: DashboardCounts;
  onFilterChange: (filter: string, label: string) => void;
  activeFilter: string;
}

interface KpiCard {
  key: string;
  label: string;
  value: number;
  subValue?: string;
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
      value: counts.totCou,
      icon: Icons.ship,
      tone: "primary",
    },
    {
      key: "bkConfirmed",
      label: "Booking Confirmed",
      value: counts.bkConfirmed,
      icon: Icons.notebook,
      tone: "success",
    },
    {
      key: "siPending",
      label: "SI Pending",
      value: counts.siPending,
      icon: Icons.fileText,
      tone: "warning",
    },
    {
      key: "payPending",
      label: "Payment Pending",
      value: counts.payPending,
      subValue: `USD ${counts.pendingAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
      icon: Icons.creditCard,
      tone: "error",
    },
    {
      key: "origin",
      label: "At Origin",
      value: counts.orgCou,
      icon: Icons.mapPin,
      tone: "purple",
    },
    {
      key: "inTransit",
      label: "In Transit",
      value: counts.inTransitCou,
      icon: Icons.anchor,
      tone: "info",
    },
    {
      key: "delivered",
      label: "Delivered",
      value: counts.delCou,
      icon: Icons.truck,
      tone: "success",
    },
  ];

  return (
    <div className="dashboard-kpi-row">
      {cards.map((card) => {
        const isActive = activeFilter === card.key;
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
              <div className="dashboard-kpi-card__head">
                <div
                  className={`dashboard-kpi-card__icon dashboard-kpi-card__icon--${card.tone}`}
                >
                  <AppIcon icon={card.icon} size={18} />
                </div>
                <Text type="secondary" className="dashboard-kpi-card__label">
                  {card.label}
                </Text>
              </div>
              <div className="dashboard-kpi-card__value">
                <Statistic
                  value={card.value}
                  className={`dashboard-kpi-card__stat dashboard-kpi-card__stat--${card.tone}`}
                />
              </div>
              <Text
                type="secondary"
                className={
                  card.subValue
                    ? "dashboard-kpi-card__sub"
                    : "dashboard-kpi-card__sub dashboard-kpi-card__sub--empty"
                }
              >
                {card.subValue || "\u00a0"}
              </Text>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
