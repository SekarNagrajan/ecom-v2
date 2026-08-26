// Modified by Sekar Nagarajan (2026-08-26 10:50)
import { AppButton } from "@solverminds/shared-ui";
import { Empty, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { SurchargeDTO } from "../types/rates.types";

const { Text, Title } = Typography;

export interface CombinedRateItem {
  id: string;
  type: "TARIFF" | "CONTRACT" | "SURCHARGE";
  title: string;
  code: string;
  originPort: string;
  originPortName: string;
  deliveryPort: string;
  deliveryPortName: string;
  eqpType: string;
  commodity: string;
  commodityName: string;
  currency: string;
  baseAmount: number;
  surchargeAmount: number;
  totalEstimatedAmount: number;
  effectiveFrom: string;
  effectiveTo: string;
  isRecommended?: boolean;
  surcharges?: SurchargeDTO[];
}

interface RateCardListProps {
  rates: CombinedRateItem[];
  isLoading?: boolean;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
}

interface RateCardProps {
  item: CombinedRateItem;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
}

function RateCard({
  item,
  onBookNow,
  onViewSurcharges,
  onShareRate,
}: RateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasSurcharges = Boolean(item.surcharges && item.surcharges.length > 0);

  return (
    <article
      className={[
        "rates-card",
        item.isRecommended ? "rates-card--recommended" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="rates-card__body">
        <div className="rates-card__header">
          <div className="rates-card__meta">
            {item.isRecommended ? (
              <Tag color="gold">Lowest Published Freight</Tag>
            ) : null}
            <Tag color={item.type === "CONTRACT" ? "purple" : "blue"}>
              {item.code} — {item.title}
            </Tag>
            <Tag color="cyan">{item.eqpType}</Tag>
          </div>
          <Text className="rates-card__ref">
            Ref: <Text code>{item.id}</Text>
          </Text>
        </div>

        <div className="rates-card__voyage">
          {/* Origin port */}
          <div className="rates-card__port rates-card__port--origin">
            <div className="rates-card__port-badge rates-card__port-badge--origin app-icon-inherit">
              <AppIcon icon={Icons.ship} size={22} />
            </div>
            <div className="rates-card__port-body">
              <div className="rates-card__port-label">Origin (POL)</div>
              <Title
                level={4}
                className="rates-card__port-code rates-card__port-code--origin"
              >
                {item.originPort}
              </Title>
              <Text className="rates-card__port-name">
                {item.originPortName}
              </Text>
              <div className="rates-card__port-tags">
                <Tag color="blue">{item.commodityName}</Tag>
              </div>
              <Text className="rates-card__port-detail">
                Commodity code: {item.commodity}
              </Text>
            </div>
          </div>

          {/* Static pricing connector (no animation) */}
          <div className="rates-card__pricing-lane">
            <Text className="rates-card__pricing-lane-label">All-In Rate</Text>
            <Text className="rates-card__pricing-lane-total">
              {item.currency} ${item.totalEstimatedAmount.toFixed(2)}
            </Text>
            <div className="rates-card__pricing-lane-track">
              <span className="rates-card__pricing-lane-dot rates-card__pricing-lane-dot--origin" />
              <span className="rates-card__pricing-lane-line" />
              <span className="rates-card__pricing-lane-mid app-icon-inherit">
                <AppIcon icon={Icons.dollarSign} size={14} />
              </span>
              <span className="rates-card__pricing-lane-line rates-card__pricing-lane-line--delivery" />
              <span className="rates-card__pricing-lane-dot rates-card__pricing-lane-dot--delivery" />
            </div>
            <Text className="rates-card__pricing-lane-hint">
              OFR ${item.baseAmount.toFixed(2)} + surcharges $
              {item.surchargeAmount.toFixed(2)}
            </Text>
          </div>

          {/* Delivery port */}
          <div className="rates-card__port rates-card__port--delivery">
            <div className="rates-card__port-badge rates-card__port-badge--delivery app-icon-inherit">
              <AppIcon icon={Icons.ship} size={22} />
            </div>
            <div className="rates-card__port-body">
              <div className="rates-card__port-label">Delivery (POD)</div>
              <Title
                level={4}
                className="rates-card__port-code rates-card__port-code--delivery"
              >
                {item.deliveryPort}
              </Title>
              <Text className="rates-card__port-name">
                {item.deliveryPortName}
              </Text>
              <div className="rates-card__port-tags">
                <Tag color="green">
                  OFR {item.currency} ${item.baseAmount.toFixed(2)}
                </Tag>
                <Tag color="orange">
                  + {item.currency} ${item.surchargeAmount.toFixed(2)}
                </Tag>
              </div>
              <Text className="rates-card__port-detail">Port-to-port rate</Text>
            </div>
          </div>

          <div className="rates-card__actions">
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.notebook} size={16} tone="create" />}
              onClick={() => onBookNow(item)}
              block
            >
              Book at This Rate
            </AppButton>
            <AppButton
              icon={<AppIcon icon={Icons.tag} size={16} tone="view" />}
              onClick={() => onViewSurcharges(item)}
              block
            >
              View Surcharges
            </AppButton>
            <div className="rates-card__actions-secondary">
              <Tooltip title="Share Rate Quote">
                <AppButton
                  size="small"
                  icon={<AppIcon icon={Icons.mail} size={14} tone="navigate" />}
                  onClick={() => onShareRate(item)}
                >
                  Share
                </AppButton>
              </Tooltip>
              {hasSurcharges ? (
                <Tooltip
                  title={
                    expanded
                      ? "Hide Surcharge Breakdown"
                      : "Show Surcharge Breakdown"
                  }
                >
                  <AppButton
                    size="small"
                    icon={
                      expanded ? (
                        <AppIcon icon={Icons.chevronUp} size={14} />
                      ) : (
                        <AppIcon icon={Icons.chevronDown} size={14} />
                      )
                    }
                    onClick={() => setExpanded(!expanded)}
                  >
                    Details
                  </AppButton>
                </Tooltip>
              ) : null}
            </div>
          </div>
        </div>

        {expanded && hasSurcharges ? (
          <div className="rates-card__surcharges">
            <Text strong>Itemized Surcharge Breakdown</Text>
            {item.surcharges!.map((sur) => (
              <div key={sur.id} className="rates-card__surcharge-row">
                <div>
                  <Tag color="purple">{sur.chargeCode}</Tag>{" "}
                  <Text strong>{sur.chargeName}</Text>
                </div>
                <Text className="text-amount-error rates-amount">
                  {sur.currency} ${sur.amount.toFixed(2)}
                </Text>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rates-card__footer">
        <div className="rates-card__validity">
          <Tooltip title="Rate Valid From Date">
            <div className="rates-card__validity-chip">
              <span className="rates-card__validity-icon rates-card__validity-icon--from app-icon-inherit">
                <AppIcon icon={Icons.calendar} size={14} />
              </span>
              <span>
                <span className="rates-card__validity-label">Valid From</span>
                <span className="rates-card__validity-value">
                  {item.effectiveFrom}
                </span>
              </span>
            </div>
          </Tooltip>
          <Tooltip title="Rate Valid To Date">
            <div className="rates-card__validity-chip">
              <span className="rates-card__validity-icon rates-card__validity-icon--to app-icon-inherit">
                <AppIcon icon={Icons.clock} size={14} />
              </span>
              <span>
                <span className="rates-card__validity-label">Valid To</span>
                <span className="rates-card__validity-value">
                  {item.effectiveTo}
                </span>
              </span>
            </div>
          </Tooltip>
          <Tooltip
            title={
              item.type === "CONTRACT"
                ? "Service Contract Rate"
                : "Published Tariff Rate"
            }
          >
            <div className="rates-card__validity-chip">
              <span
                className={[
                  "rates-card__validity-icon",
                  item.type === "CONTRACT"
                    ? "rates-card__validity-icon--contract"
                    : "rates-card__validity-icon--tariff",
                  "app-icon-inherit",
                ].join(" ")}
              >
                <AppIcon
                  icon={
                    item.type === "CONTRACT" ? Icons.shieldCheck : Icons.tag
                  }
                  size={14}
                />
              </span>
              <span>
                <span className="rates-card__validity-label">Rate Type</span>
                <span className="rates-card__validity-value">
                  {item.type === "CONTRACT" ? "Contract" : "Tariff"}
                </span>
              </span>
            </div>
          </Tooltip>
        </div>
        {/* {hasSurcharges ? (
          <AppButton
            type="link"
            size="small"
            icon={
              expanded ? (
                <AppIcon icon={Icons.chevronUp} size={14} />
              ) : (
                <AppIcon icon={Icons.chevronDown} size={14} />
              )
            }
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide surcharges" : "View surcharges"}
          </AppButton>
        ) : null} */}
      </div>
    </article>
  );
}

export function RateCardList({
  rates,
  isLoading,
  onBookNow,
  onViewSurcharges,
  onShareRate,
}: RateCardListProps) {
  if (isLoading) {
    return (
      <div className="rates-empty">
        <Spin size="medium" />
        <Text type="secondary" className="rates-empty__text">
          Searching freight rates…
        </Text>
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="rates-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={4}>
              <Text strong>No rates found</Text>
              <Text type="secondary">
                Try adjusting your ports, equipment, or commodity filters.
              </Text>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div className="rates-card-list">
      {rates.map((item) => (
        <RateCard
          key={item.id}
          item={item}
          onBookNow={onBookNow}
          onViewSurcharges={onViewSurcharges}
          onShareRate={onShareRate}
        />
      ))}
    </div>
  );
}
