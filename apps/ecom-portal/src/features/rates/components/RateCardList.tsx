// Modified by Sekar Nagarajan (2026-08-28 15:09)
import { AppButton } from "@solverminds/shared-ui";
import { Empty, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { SurchargeDTO } from "../types/rates.types";
import type { RateSearchMode } from "./RateSearchFilter";

const { Text } = Typography;

export interface CombinedRateItem {
  id: string;
  type: "TARIFF" | "CONTRACT" | "SURCHARGE" | "QUOTE";
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
  soc?: string;
  nor?: boolean;
  carrTerms?: string;
  transService?: string;
  quoteStatus?: string;
}

interface RateCardListProps {
  rates: CombinedRateItem[];
  isLoading?: boolean;
  searchMode?: RateSearchMode;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
  onRequestQuote?: () => void;
}

interface RateCardProps {
  item: CombinedRateItem;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
}

function typeLabel(type: CombinedRateItem["type"]): string {
  switch (type) {
    case "CONTRACT":
      return "Contract";
    case "SURCHARGE":
      return "Surcharge";
    case "QUOTE":
      return "Quote";
    default:
      return "Tariff";
  }
}

function typeTagColor(type: CombinedRateItem["type"]): string {
  switch (type) {
    case "CONTRACT":
      return "purple";
    case "SURCHARGE":
      return "orange";
    case "QUOTE":
      return "geekblue";
    default:
      return "blue";
  }
}

function portCity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function RateCard({
  item,
  onBookNow,
  onViewSurcharges,
  onShareRate,
}: RateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasSurcharges = Boolean(item.surcharges && item.surcharges.length > 0);
  const showBook = item.type === "TARIFF" || item.type === "CONTRACT";
  const showSurcharges =
    item.type === "TARIFF" ||
    item.type === "CONTRACT" ||
    (item.type === "SURCHARGE" && hasSurcharges);
  const socLabel =
    item.soc && item.soc !== "No" && item.soc.trim() !== ""
      ? item.soc
      : undefined;

  return (
    <article
      className={[
        "rates-card",
        item.isRecommended ? "rates-card--recommended" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="rates-card__main">
        <div className="rates-card__content">
          <div className="rates-card__meta">
            {item.isRecommended ? (
              <Tag color="gold">Lowest Published Freight</Tag>
            ) : null}
            <Tag color={typeTagColor(item.type)}>
              {item.code} — {item.title}
            </Tag>
            <Tag color="cyan">{item.eqpType}</Tag>
            {socLabel ? <Tag color="magenta">SOC {socLabel}</Tag> : null}
            {item.nor ? <Tag color="volcano">NOR</Tag> : null}
            {item.transService ? (
              <Tag color="processing">T-Svc {item.transService}</Tag>
            ) : null}
            {item.carrTerms ? <Tag>{item.carrTerms}</Tag> : null}
            {item.quoteStatus ? (
              <Tag color="blue">{item.quoteStatus.replace(/_/g, " ")}</Tag>
            ) : null}
            <Text type="secondary" className="rates-card__ref">
              Ref: {item.id}
            </Text>
          </div>

          <div className="rates-card__route">
            <div className="rates-card__endpoint rates-card__endpoint--origin">
              <Text className="rates-card__place">
                {portCity(item.originPortName).toUpperCase()},{" "}
                <span className="rates-card__port-code">{item.originPort}</span>
              </Text>
              <div className="rates-card__etime">
                <Tag color="blue">{item.commodityName || "Commodity"}</Tag>
              </div>
              <Text className="rates-card__terminal">
                Commodity: {item.commodity || "—"}
              </Text>
            </div>

            <div className="rates-card__connector">
              <div className="rates-card__connector-line">
                <span className="rates-card__connector-dot" />
                <span className="rates-card__connector-rail" />
                <span className="rates-card__connector-pill">
                  {item.currency} ${item.totalEstimatedAmount.toFixed(2)}
                </span>
                <span className="rates-card__connector-rail" />
                <span className="rates-card__connector-dot" />
              </div>
              <Text className="rates-card__connector-type">
                {item.type === "SURCHARGE"
                  ? "Accessorial"
                  : item.type === "QUOTE"
                  ? "Quoted amount"
                  : "All-in estimate"}
              </Text>
              {item.type !== "SURCHARGE" && item.type !== "QUOTE" ? (
                <Text className="rates-card__connector-hint">
                  OFR ${item.baseAmount.toFixed(2)} + surcharges $
                  {item.surchargeAmount.toFixed(2)}
                </Text>
              ) : null}
            </div>

            <div className="rates-card__endpoint rates-card__endpoint--dest">
              <Text className="rates-card__place">
                {portCity(item.deliveryPortName).toUpperCase()},{" "}
                <span className="rates-card__port-code">
                  {item.deliveryPort}
                </span>
              </Text>
              <div className="rates-card__etime">
                <Tag color="green">
                  OFR {item.currency} ${item.baseAmount.toFixed(2)}
                </Tag>
                {item.surchargeAmount > 0 ? (
                  <Tag color="orange">
                    + {item.currency} ${item.surchargeAmount.toFixed(2)}
                  </Tag>
                ) : null}
              </div>
              <Text className="rates-card__terminal">
                Valid {item.effectiveFrom} → {item.effectiveTo}
              </Text>
            </div>
          </div>
        </div>

        <div className="rates-card__actions">
          {showBook ? (
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.notebook} size={16} tone="create" />}
              onClick={() => onBookNow(item)}
              block
            >
              Book at This Rate
            </AppButton>
          ) : null}
          {showSurcharges ? (
            <AppButton
              icon={<AppIcon icon={Icons.tag} size={16} tone="view" />}
              onClick={() => onViewSurcharges(item)}
              block
            >
              View Surcharges
            </AppButton>
          ) : null}
          {/* <AppButton
            type="link"
            icon={
              expanded ? (
                <AppIcon icon={Icons.chevronUp} size={14} />
              ) : (
                <AppIcon icon={Icons.chevronDown} size={14} />
              )
            }
            onClick={() => setExpanded(!expanded)}
            block
            disabled={!hasSurcharges && item.type !== "QUOTE"}
          >
            {expanded ? "Close Details" : "Show Details"}
          </AppButton> */}
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
                {sur.isNor ? <Tag color="volcano">NOR</Tag> : null}
              </div>
              <Text className="text-amount-error rates-amount">
                {sur.currency} ${sur.amount.toFixed(2)}
              </Text>
            </div>
          ))}
        </div>
      ) : null}

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
          <Tooltip title={`${typeLabel(item.type)} rate`}>
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
                    item.type === "CONTRACT"
                      ? Icons.shieldCheck
                      : item.type === "QUOTE"
                      ? Icons.zap
                      : Icons.tag
                  }
                  size={14}
                />
              </span>
              <span>
                <span className="rates-card__validity-label">Rate Type</span>
                <span className="rates-card__validity-value">
                  {typeLabel(item.type)}
                </span>
              </span>
            </div>
          </Tooltip>
          {socLabel ? (
            <div className="rates-card__validity-chip">
              <span className="rates-card__validity-label">SOC</span>
              <span className="rates-card__validity-value">{socLabel}</span>
            </div>
          ) : null}
          {item.nor ? (
            <div className="rates-card__validity-chip">
              <span className="rates-card__validity-label">NOR</span>
              <span className="rates-card__validity-value">Yes</span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function RateCardList({
  rates,
  isLoading,
  searchMode = "PUBLISHED_TARIFF",
  onBookNow,
  onViewSurcharges,
  onShareRate,
  onRequestQuote,
}: RateCardListProps) {
  const allowRfqEmpty =
    searchMode === "PUBLISHED_TARIFF" ||
    searchMode === "SERVICE_CONTRACTS" ||
    searchMode === "SPOT_QUOTES";

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
            <Space direction="vertical" size={8}>
              <Text strong>No rates found</Text>
              <Text type="secondary">
                Try adjusting your ports, equipment, or commodity filters.
              </Text>
              {allowRfqEmpty && onRequestQuote ? (
                <AppButton
                  type="primary"
                  icon={<AppIcon icon={Icons.zap} size={16} />}
                  onClick={onRequestQuote}
                >
                  Request for Quote
                </AppButton>
              ) : null}
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
