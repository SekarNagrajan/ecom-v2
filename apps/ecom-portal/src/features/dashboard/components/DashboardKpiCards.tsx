// Modified by Sekar Nagarajan (2026-09-17 18:32)
/**
 * KPI summary cards — enhancedDashboard.jsp filter keys with depot-style card chrome
 * (icon tile + title + large total + pipe breakdown + tone accent wash).
 * Payment pending uses verdigris / maritime teal (not error red) — industry-safe.
 * In Transit uses terra-cotta (#d66853) via BE_COLOR_MAP.TERRA_COTTA.
 */
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import {
  AppIcon,
  Icons,
  NavBookingIcon,
  NavPaymentHistoryIcon,
  NavShippingInstructionIcon,
} from "../../../components/icons";
import type { DashboardCounts } from "../api/dashboard.api";

const { Text } = Typography;

type SummaryTone =
  | "primary"
  | "success"
  | "warning"
  | "verdigris"
  | "terra"
  | "info"
  | "purple";

interface DashboardKpiCardsProps {
  counts: DashboardCounts;
  onFilterChange: (filter: string, label: string) => void;
  onViewShipments: () => void;
  activeFilter: string;
}

interface SummaryBreakdown {
  label: string;
  value: string | number;
}

interface SummaryCard {
  key: string;
  filterKey: string;
  title: string;
  value: number;
  icon: LucideIcon;
  tone: SummaryTone;
  breakdown: SummaryBreakdown[];
}

export function DashboardKpiCards({
  counts,
  onFilterChange,
  onViewShipments: _onViewShipments,
  activeFilter,
}: DashboardKpiCardsProps) {
  const cards: SummaryCard[] = [
    {
      key: "total",
      filterKey: "all",
      title: "Total Shipments",
      value: counts.totCou,
      icon: Icons.ship,
      tone: "purple",
      breakdown: [
        { label: "Confirmed", value: counts.bkConfirmed },
        { label: "SI Pending", value: counts.siPending },
      ],
    },
    {
      key: "confirmed",
      filterKey: "bkConfirmed",
      title: "Booking Confirmed",
      value: counts.bkConfirmed,
      icon: NavBookingIcon,
      tone: "info",
      breakdown: [
        { label: "At Origin", value: counts.orgCou },
        { label: "In Transit", value: counts.inTransitCou },
        { label: "Delivered", value: counts.delCou },
      ],
    },
    {
      key: "si",
      filterKey: "siPending",
      title: "SI Pending",
      value: counts.siPending,
      icon: NavShippingInstructionIcon,
      tone: "warning",
      breakdown: [
        { label: "Awaiting SI", value: counts.siPending },
        { label: "Confirmed", value: counts.bkConfirmed },
      ],
    },
    {
      key: "payment",
      filterKey: "payPending",
      title: "Payment Pending",
      value: counts.payPending,
      icon: NavPaymentHistoryIcon,
      tone: "verdigris",
      breakdown: [
        {
          label: "Outstanding",
          value: `USD ${counts.pendingAmount.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}`,
        },
        { label: "Invoices", value: counts.payPending },
      ],
    },
    {
      key: "transit",
      filterKey: "inTransit",
      title: "In Transit",
      value: counts.inTransitCou,
      icon: Icons.truck,
      tone: "terra",
      breakdown: [
        { label: "At Origin", value: counts.orgCou },
        { label: "In Transit", value: counts.inTransitCou },
        { label: "Delivered", value: counts.delCou },
      ],
    },
  ];

  return (
    <div className="dashboard-kpi-overview">
      {cards.map((card) => {
        const isActive = activeFilter === card.filterKey;
        return (
          <button
            key={card.key}
            type="button"
            className={[
              "dashboard-summary-card",
              `dashboard-summary-card--tone-${card.tone}`,
              isActive ? "dashboard-summary-card--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onFilterChange(card.filterKey, card.title)}
            aria-pressed={isActive}
            aria-label={`${card.title}: ${card.value}`}
          >
            <div className="dashboard-summary-card__head">
              <span
                className={`dashboard-summary-card__icon dashboard-summary-card__icon--${card.tone} app-icon-inherit`}
              >
                <AppIcon icon={card.icon} size={16} />
              </span>
              <Text className="dashboard-summary-card__title">
                {card.title}
              </Text>
            </div>
            <Text className="dashboard-summary-card__value">{card.value}</Text>
            <div className="dashboard-summary-card__meta custom-scroll">
              {card.breakdown.map((part, index) => (
                <span
                  key={`${card.key}-${part.label}`}
                  className="dashboard-summary-card__meta-item"
                >
                  {index > 0 ? (
                    <span className="dashboard-summary-card__sep" aria-hidden>
                      |
                    </span>
                  ) : null}
                  <span className="dashboard-summary-card__meta-label">
                    {part.label}:
                  </span>
                  <span className="dashboard-summary-card__meta-value">
                    {part.value}
                  </span>
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
