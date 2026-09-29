// Modified by Sekar Nagarajan (2026-09-15 15:30)
import { AppButton } from "@solverminds/shared-ui";
import { Spin, Tag, Tooltip, Typography } from "antd";
import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { CombinedRateItem } from "../types/rates.types";
import type { RateSearchMode } from "./RateSearchFilter";
import {
  rateTypeLabel,
  rateTypeTagColor,
} from "./list/rate-list-cells";

export type { CombinedRateItem } from "../types/rates.types";

const { Text } = Typography;

type RatesTranslateFn = TFunction<"rates">;

interface RateCardListProps {
  rates: CombinedRateItem[];
  isLoading?: boolean;
  /** False until the user clicks Search — show idle empty state. */
  hasSearched?: boolean;
  searchMode?: RateSearchMode;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
  onRequestQuote?: () => void;
}

interface RateCardProps {
  item: CombinedRateItem;
  t: RatesTranslateFn;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
}

function connectorTypeLabel(
  type: CombinedRateItem["type"],
  t: RatesTranslateFn,
): string {
  switch (type) {
    case "SURCHARGE":
      return t("rateCard.connector.accessorial");
    case "QUOTE":
      return t("rateCard.connector.quotedAmount");
    case "TARIFF":
    case "CONTRACT":
      return t("rateCard.connector.allInEstimate");
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function portCity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function RateCard({
  item,
  t,
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

  const showBreakdownHint =
    item.type === "TARIFF" || item.type === "CONTRACT";

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
              <Tag color="gold">{t("rateCard.recommendedTag")}</Tag>
            ) : null}
            <Tag color={rateTypeTagColor(item.type)}>
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
              {t("rateCard.ref", { id: item.id })}
            </Text>
          </div>

          <div className="rates-card__route">
            <div className="rates-card__endpoint rates-card__endpoint--origin">
              <Text className="rates-card__place">
                {portCity(item.originPortName).toUpperCase()},{" "}
                <span className="rates-card__port-code">{item.originPort}</span>
              </Text>
              <div className="rates-card__etime">
                <Tag color="blue">
                  {item.commodityName || t("rateCard.commodityFallback")}
                </Tag>
              </div>
              <Text className="rates-card__terminal">
                {t("rateCard.commodityLabel", {
                  value: item.commodity || "—",
                })}
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
                {connectorTypeLabel(item.type, t)}
              </Text>
              {showBreakdownHint ? (
                <Text className="rates-card__connector-hint">
                  {t("rateCard.connector.breakdown", {
                    base: item.baseAmount.toFixed(2),
                    surcharge: item.surchargeAmount.toFixed(2),
                  })}
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
                {t("rateCard.validRange", {
                  from: item.effectiveFrom,
                  to: item.effectiveTo,
                })}
              </Text>
            </div>
          </div>
        </div>

        <div className="rates-card__actions">
          {showBook ? (
            <AppButton type="primary" onClick={() => onBookNow(item)} block>
              {t("actions.bookAtThisRate")}
            </AppButton>
          ) : null}
          {showSurcharges ? (
            <AppButton
              className="rates-card__actions-button"
              onClick={() => onViewSurcharges(item)}
              block
            >
              {t("actions.viewSurcharges")}
            </AppButton>
          ) : null}
          <div className="rates-card__actions-secondary">
            <Tooltip title={t("actions.shareRateQuote")}>
              <AppButton
                size="small"
                icon={<AppIcon icon={Icons.mail} size={14} tone="navigate" />}
                onClick={() => onShareRate(item)}
              >
                {t("actions.share")}
              </AppButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {expanded && hasSurcharges ? (
        <div className="rates-card__surcharges">
          <Text strong>{t("rateCard.surchargeBreakdown")}</Text>
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
          <Tooltip title={t("rateCard.validFromTooltip")}>
            <div className="rates-card__validity-chip">
              <span className="rates-card__validity-icon rates-card__validity-icon--from app-icon-inherit">
                <AppIcon icon={Icons.calendar} size={14} />
              </span>
              <span>
                <span className="rates-card__validity-label">
                  {t("rateCard.validFrom")}
                </span>
                <span className="rates-card__validity-value">
                  {item.effectiveFrom}
                </span>
              </span>
            </div>
          </Tooltip>
          <Tooltip title={t("rateCard.validToTooltip")}>
            <div className="rates-card__validity-chip">
              <span className="rates-card__validity-icon rates-card__validity-icon--to app-icon-inherit">
                <AppIcon icon={Icons.clock} size={14} />
              </span>
              <span>
                <span className="rates-card__validity-label">
                  {t("rateCard.validTo")}
                </span>
                <span className="rates-card__validity-value">
                  {item.effectiveTo}
                </span>
              </span>
            </div>
          </Tooltip>
          <Tooltip
            title={t("rateCard.rateTypeTooltip", {
              type: rateTypeLabel(item.type, t),
            })}
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
                <span className="rates-card__validity-label">
                  {t("rateCard.rateType")}
                </span>
                <span className="rates-card__validity-value">
                  {rateTypeLabel(item.type, t)}
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
  hasSearched = true,
  searchMode = "PUBLISHED_TARIFF",
  onBookNow,
  onViewSurcharges,
  onShareRate,
  onRequestQuote,
}: RateCardListProps) {
  const { t } = useTranslation(["rates", "common", "modules"]);

  const allowRfqEmpty =
    searchMode === "PUBLISHED_TARIFF" ||
    searchMode === "SERVICE_CONTRACTS" ||
    searchMode === "SPOT_QUOTES";

  if (isLoading) {
    return (
      <div className="rates-empty">
        <Spin size="medium" />
        <Text type="secondary" className="rates-empty__text">
          {t("rateCard.searching")}
        </Text>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="rates-empty">
        <ModuleEmptyState
          variant="blank"
          title={t("empty.searchTitle")}
          message={t("empty.searchMessageCard")}
          artSize="md"
        />
      </div>
    );
  }

  if (rates.length === 0) {
    const actions =
      allowRfqEmpty && onRequestQuote
        ? [
            {
              key: "request-quote",
              label: t("actions.requestForQuote"),
              type: "primary" as const,
              icon: <AppIcon icon={Icons.zap} size={16} />,
              onClick: onRequestQuote,
            },
          ]
        : undefined;

    return (
      <div className="rates-empty">
        <ModuleEmptyState
          variant="filtered"
          title={t("empty.noResultsTitle")}
          message={t("empty.noResultsMessageCard")}
          actions={actions}
          artSize="md"
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
          t={t}
          onBookNow={onBookNow}
          onViewSurcharges={onViewSurcharges}
          onShareRate={onShareRate}
        />
      ))}
    </div>
  );
}
