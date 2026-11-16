// Modified by Sekar Nagarajan (2026-11-16 16:37) — primary route connector; drop duplicate SOC fact
import { AppButton } from "@solverminds/shared-ui";
import { Spin, Tooltip, Typography } from "antd";
import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { CombinedRateItem } from "../types/rates.types";
import type { RateSearchMode } from "./RateSearchFilter";
import { rateTypeLabel } from "./list/rate-list-cells";

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
  defaultExpanded?: boolean;
  onBookNow: (rate: CombinedRateItem) => void;
  onViewSurcharges: (rate: CombinedRateItem) => void;
  onShareRate: (rate: CombinedRateItem) => void;
}

function connectorTypeLabel(type: CombinedRateItem["type"], t: RatesTranslateFn): string {
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
  return name
    .replace(/\s*\([^)]*\)\s*/g, "")
    .replace(/,/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function portCountry(code: string, t: RatesTranslateFn): string | undefined {
  const label = t(`options.ports.${code}`, { defaultValue: "" });
  if (!label) return undefined;
  const afterDash = label.includes(" - ") ? label.split(" - ").slice(1).join(" - ") : label;
  const parts = afterDash
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return undefined;
  return parts[parts.length - 1];
}

/** Secondary place line under the port code (city [, country]). */
function routePlaceLine(portName: string, country?: string): string {
  const city = portCity(portName);
  if (!city) return country || "—";
  if (!country) return city;
  if (city.toLowerCase().includes(country.toLowerCase())) return city;
  return `${city}, ${country}`;
}

interface RateRouteLaneProps {
  originCode: string;
  originPlace: string;
  destCode: string;
  destPlace: string;
  compact?: boolean;
}

/** Origin → delivery lane: bold code, place below, ship on a connecting rail. */
function RateRouteLane({
  originCode,
  originPlace,
  destCode,
  destPlace,
  compact = false,
}: RateRouteLaneProps) {
  return (
    <div className={compact ? "rates-card__summary-route" : "rates-card__route-panel"}>
      <div className="rates-card__endpoint">
        <Text strong className="rates-card__port-code">
          {originCode || "—"}
        </Text>
        <Text type="secondary" className="rates-card__place" ellipsis={{ tooltip: originPlace }}>
          {originPlace}
        </Text>
      </div>

      <div className="rates-card__route-connector" aria-hidden>
        <span className="rates-card__route-track" />
        <span className="rates-card__route-ship app-icon-inherit">
          <AppIcon icon={Icons.ship} size={compact ? 12 : 14} />
        </span>
        <span className="rates-card__route-track" />
      </div>

      <div className="rates-card__endpoint rates-card__endpoint--dest">
        <Text strong className="rates-card__port-code">
          {destCode || "—"}
        </Text>
        <Text type="secondary" className="rates-card__place" ellipsis={{ tooltip: destPlace }}>
          {destPlace}
        </Text>
      </div>
    </div>
  );
}

function formatMoney(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function RateFieldChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rates-card__field-chip">
      <span className="rates-card__field-chip-label">{label} :</span>
      <span className="rates-card__field-chip-value">{value}</span>
    </span>
  );
}

function RateFlagChip({ label, tip }: { label: string; tip?: string }) {
  const chip = (
    <span className="rates-card__flag-chip">
      <span className="rates-card__flag-chip-text">{label}</span>
      <span className="rates-card__flag-chip-icon app-icon-inherit">
        <AppIcon icon={Icons.info} size={12} />
      </span>
    </span>
  );
  return tip ? <Tooltip title={tip}>{chip}</Tooltip> : chip;
}

function serviceValue(transService?: string): string | undefined {
  const raw = transService?.trim();
  if (!raw) return undefined;
  return raw.replace(/^T-Svc\s+/i, "").trim() || raw;
}

function RateMetaTags({
  item,
  t,
  compact = false,
}: {
  item: CombinedRateItem;
  t: RatesTranslateFn;
  compact?: boolean;
}) {
  const socActive = item.soc && item.soc !== "No" && item.soc.trim() !== "" ? item.soc : undefined;
  const service = serviceValue(item.transService);
  const commodity = item.commodity || item.commodityName;

  return (
    <>
      {!compact ? (
        <span className="rates-card__meta-code" title={item.title}>
          {item.code}
        </span>
      ) : null}
      {!compact && item.isRecommended ? (
        <span className="rates-card__lowest-badge">
          <span className="rates-card__lowest-badge-icon app-icon-inherit">
            <AppIcon icon={Icons.badgeCheck} size={12} />
          </span>
          {t("rateCard.lowestPrice")}
        </span>
      ) : null}
      {item.eqpType ? (
        <RateFieldChip label={t("rateCard.chipEquipment")} value={item.eqpType} />
      ) : null}
      {service ? <RateFieldChip label={t("rateCard.chipService")} value={service} /> : null}
      {compact && commodity ? (
        <RateFieldChip label={t("rateCard.commodity")} value={commodity} />
      ) : null}
      {!compact && socActive ? (
        <RateFlagChip
          label={t("contract.columns.soc")}
          tip={t("rateCard.socFlagTip", { value: socActive })}
        />
      ) : null}
      {!compact && item.nor ? (
        <RateFlagChip label={t("surchargeView.columns.nor")} tip={t("rateCard.norApplicable")} />
      ) : null}
      {!compact && item.carrTerms ? (
        <RateFieldChip label={t("rateCard.chipTerms")} value={item.carrTerms} />
      ) : null}
      {!compact && item.quoteStatus ? (
        <RateFieldChip
          label={t("rateCard.chipStatus")}
          value={item.quoteStatus.replace(/_/g, " ")}
        />
      ) : null}
    </>
  );
}

function RateCard({
  item,
  t,
  defaultExpanded = false,
  onBookNow,
  onViewSurcharges,
  onShareRate,
}: RateCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasSurcharges = Boolean(item.surcharges && item.surcharges.length > 0);
  const showBook = item.type === "TARIFF" || item.type === "CONTRACT";
  const showSurcharges =
    item.type === "TARIFF" ||
    item.type === "CONTRACT" ||
    (item.type === "SURCHARGE" && hasSurcharges);
  const showBreakdownHint = item.type === "TARIFF" || item.type === "CONTRACT";

  const originCountry = portCountry(item.originPort, t);
  const destinationCountry = portCountry(item.deliveryPort, t);
  const originPlace = routePlaceLine(item.originPortName, originCountry);
  const destinationPlace = routePlaceLine(item.deliveryPortName, destinationCountry);
  return (
    <article
      className={[
        "rates-card",
        expanded ? "rates-card--expanded" : "rates-card--collapsed",
        item.isRecommended ? "rates-card--recommended" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "rates-card__panel",
          "rates-card__panel--summary",
          expanded ? "rates-card__panel--closed" : "rates-card__panel--open",
        ].join(" ")}
        aria-hidden={expanded}
      >
        <div className="rates-card__panel-inner">
          <div className="rates-card__summary">
            <RateRouteLane
              compact
              originCode={item.originPort}
              originPlace={originPlace}
              destCode={item.deliveryPort}
              destPlace={destinationPlace}
            />

            <div className="rates-card__summary-price">
              <Text strong className="rates-card__price-value">
                {formatMoney(item.currency, item.totalEstimatedAmount)}
              </Text>
              <Text type="secondary" className="rates-card__price-label">
                {connectorTypeLabel(item.type, t)}
              </Text>
            </div>

            <div className="rates-card__summary-tags">
              <RateMetaTags item={item} t={t} compact />
            </div>

            <Text type="secondary" className="rates-card__summary-valid">
              {t("rateCard.validRange", {
                from: item.effectiveFrom,
                to: item.effectiveTo,
              })}
            </Text>

            <div className="rates-card__summary-actions">
              {showBook ? (
                <AppButton
                  type="primary"
                  size="small"
                  tabIndex={expanded ? -1 : undefined}
                  onClick={() => onBookNow(item)}
                >
                  {t("actions.book")}
                </AppButton>
              ) : null}
              <AppButton
                type="text"
                className="rates-card__expand-toggle"
                aria-expanded={false}
                aria-label={t("rateCard.expandDetails")}
                tabIndex={expanded ? -1 : undefined}
                onClick={() => setExpanded(true)}
                icon={
                  <span className="app-icon-inherit">
                    <AppIcon icon={Icons.chevronDown} size={18} />
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={[
          "rates-card__panel",
          "rates-card__panel--detail",
          expanded ? "rates-card__panel--open" : "rates-card__panel--closed",
        ].join(" ")}
        aria-hidden={!expanded}
      >
        <div className="rates-card__panel-inner">
          <div className="rates-card__top">
            <div className="rates-card__meta">
              <RateMetaTags item={item} t={t} />
            </div>
            <div className="rates-card__top-end">
              <Text type="secondary" className="rates-card__ref">
                {t("rateCard.ref", { id: item.id })}
              </Text>
              <AppButton
                type="text"
                className="rates-card__expand-toggle rates-card__expand-toggle--open"
                aria-expanded
                aria-label={t("rateCard.collapseDetails")}
                tabIndex={expanded ? undefined : -1}
                onClick={() => setExpanded(false)}
                icon={
                  <span className="app-icon-inherit">
                    <AppIcon icon={Icons.chevronUp} size={18} />
                  </span>
                }
              />
            </div>
          </div>

          <div className="rates-card__body">
            <RateRouteLane
              originCode={item.originPort}
              originPlace={originPlace}
              destCode={item.deliveryPort}
              destPlace={destinationPlace}
            />

            <div className="rates-card__price-panel">
              <Text type="secondary" className="rates-card__price-label">
                {connectorTypeLabel(item.type, t)}
              </Text>
              <Text strong className="rates-card__price-value rates-card__price-value--lg">
                {formatMoney(item.currency, item.totalEstimatedAmount)}
              </Text>
              {showBreakdownHint ? (
                <Text type="secondary" className="rates-card__price-breakdown">
                  <span className="rates-card__price-ofr">
                    OFR {formatMoney(item.currency, item.baseAmount)}
                  </span>
                  {item.surchargeAmount > 0 ? (
                    <>
                      {" + "}
                      <span className="rates-card__price-surcharge">
                        Surcharges {formatMoney(item.currency, item.surchargeAmount)}
                      </span>
                    </>
                  ) : null}
                </Text>
              ) : null}
            </div>

            <div className="rates-card__facts-panel">
              <div className="rates-card__fact">
                <span className="rates-card__fact-icon app-icon-inherit">
                  <AppIcon icon={Icons.boxes} size={13} />
                </span>
                <div className="rates-card__fact-copy">
                  <Text type="secondary" className="rates-card__fact-label">
                    {t("rateCard.commodity")}
                  </Text>
                  <Text
                    strong
                    className="rates-card__fact-value"
                    ellipsis={{
                      tooltip:
                        item.commodityName || item.commodity || t("rateCard.commodityFallback"),
                    }}
                  >
                    {item.commodity || item.commodityName || t("rateCard.commodityFallback")}
                  </Text>
                </div>
              </div>
              <div className="rates-card__fact">
                <span className="rates-card__fact-icon app-icon-inherit">
                  <AppIcon icon={Icons.calendar} size={13} />
                </span>
                <div className="rates-card__fact-copy">
                  <Text type="secondary" className="rates-card__fact-label">
                    {t("rateCard.validFrom")}
                  </Text>
                  <Text strong className="rates-card__fact-value">
                    {item.effectiveFrom}
                  </Text>
                </div>
              </div>
              <div className="rates-card__fact">
                <span className="rates-card__fact-icon app-icon-inherit">
                  <AppIcon icon={Icons.clock} size={13} />
                </span>
                <div className="rates-card__fact-copy">
                  <Text type="secondary" className="rates-card__fact-label">
                    {t("rateCard.validTo")}
                  </Text>
                  <Text strong className="rates-card__fact-value">
                    {item.effectiveTo}
                  </Text>
                </div>
              </div>
              <div className="rates-card__fact">
                <span className="rates-card__fact-icon app-icon-inherit">
                  <AppIcon
                    icon={
                      item.type === "CONTRACT"
                        ? Icons.shieldCheck
                        : item.type === "QUOTE"
                          ? Icons.zap
                          : Icons.tag
                    }
                    size={13}
                  />
                </span>
                <div className="rates-card__fact-copy">
                  <Text type="secondary" className="rates-card__fact-label">
                    {t("rateCard.rateType")}
                  </Text>
                  <Text strong className="rates-card__fact-value">
                    {rateTypeLabel(item.type, t)}
                  </Text>
                </div>
              </div>
              {item.nor ? (
                <div className="rates-card__fact">
                  <span className="rates-card__fact-icon app-icon-inherit">
                    <AppIcon icon={Icons.alertTriangle} size={13} />
                  </span>
                  <div className="rates-card__fact-copy">
                    <Text type="secondary" className="rates-card__fact-label">
                      NOR
                    </Text>
                    <Text strong className="rates-card__fact-value">
                      Yes
                    </Text>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rates-card__actions">
              {showBook ? (
                <AppButton
                  type="primary"
                  size="small"
                  tabIndex={expanded ? undefined : -1}
                  onClick={() => onBookNow(item)}
                  block
                >
                  {t("actions.bookAtThisRate")}
                </AppButton>
              ) : null}
              {showSurcharges ? (
                <AppButton
                  size="small"
                  className="rates-card__actions-button rates-card__actions-button--surcharge"
                  tabIndex={expanded ? undefined : -1}
                  onClick={() => onViewSurcharges(item)}
                  block
                >
                  {t("actions.viewSurcharges")}
                </AppButton>
              ) : null}

              <AppButton
                size="small"
                block
                tabIndex={expanded ? undefined : -1}
                icon={<AppIcon icon={Icons.mail} size={14} tone="navigate" />}
                onClick={() => onShareRate(item)}
              >
                {t("actions.share")}
              </AppButton>
            </div>
          </div>
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
          defaultExpanded
          onBookNow={onBookNow}
          onViewSurcharges={onViewSurcharges}
          onShareRate={onShareRate}
        />
      ))}
    </div>
  );
}
