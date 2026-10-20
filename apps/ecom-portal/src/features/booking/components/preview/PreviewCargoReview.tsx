// Modified by Sekar Nagarajan (2026-09-05 00:18)
import { Typography } from "antd";
import { Fragment, useState } from "react";

import { useTranslation } from "react-i18next";
import { AppIcon, Icons } from "../../../../components/icons";
import type { ContainerItem } from "../../types/booking.types";
import { sumContainerCargo } from "../../utils/booking-cargo-completeness";
import { BookingPreviewEmpty } from "./booking-preview-section";

const { Text } = Typography;

type SpecialKind = "dg" | "oog" | "soc" | "reefer" | "nor";

interface PreviewCargoReviewProps {
  containers: ContainerItem[];
}

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function teuForContainerType(containerType: string): number {
  const match = /^(\d+)/.exec(containerType.trim());
  const feet = match ? Number(match[1]) : 20;
  if (feet >= 45) return 2.25;
  if (feet >= 40) return 2;
  return 1;
}

type SpecialTranslateFn = (key: string, options?: Record<string, unknown>) => string;

function specialLabel(container: ContainerItem, t?: SpecialTranslateFn): {
  kind: SpecialKind;
  label: string;
} | null {
  const hasDg = (container.commodities ?? []).some(
    (line) => line.isDangerousGoods,
  );
  if (hasDg) {
    const dgClass = (container.commodities ?? []).find(
      (line) => line.isDangerousGoods && line.dgClass,
    )?.dgClass;
    return {
      kind: "dg",
      label: dgClass
        ? (t ? t("wizard.preview.cargo.special.dgClass", { class: dgClass }) : `DG · Class ${dgClass}`)
        : (t ? t("wizard.preview.cargo.special.dg") : "DG"),
    };
  }
  if (container.isOog) return { kind: "oog", label: t ? t("wizard.preview.cargo.special.oog") : "OOG" };
  if (container.isSoc) return { kind: "soc", label: t ? t("wizard.preview.cargo.special.soc") : "SOC" };
  if (container.reeferMode === "operating") {
    return {
      kind: "reefer",
      label:
        container.setTemp !== undefined && container.setTemp !== null
          ? (t ? t("wizard.preview.cargo.special.reeferTemp", { temp: container.setTemp }) : `Reefer ${container.setTemp}°C`)
          : (t ? t("wizard.preview.cargo.special.reefer") : "Reefer"),
    };
  }
  if (container.reeferMode === "nor") return { kind: "nor", label: t ? t("wizard.preview.cargo.special.nor") : "NOR" };
  return null;
}

function formatWeight(value: number): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })} kg`;
}

function formatVolume(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatTeu(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatTare(value?: number): string {
  if (value === undefined || value === null) return "—";
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} kg`;
}

function toggleRowId(current: Set<string>, id: string): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/**
 * Airy Review cargo (copy1) — KPI stats toggle the container table
 * (collapsed by default); rows expand for read-only details + commodities.
 */
export function PreviewCargoReview({ containers }: PreviewCargoReviewProps) {
  const { t } = useTranslation("booking");
  const [tableOpen, setTableOpen] = useState(false);
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());

  const lineCount = containers.reduce(
    (n, container) => n + (container.commodities?.length ?? 0),
    0,
  );

  const totals = containers.reduce(
    (acc, container) => {
      const sums = sumContainerCargo(container);
      const qty = Number(container.quantity || 1);
      acc.containers += qty;
      acc.weight += sums.weight;
      acc.volume += sums.volume;
      acc.teu += qty * teuForContainerType(container.containerType ?? "");
      return acc;
    },
    { containers: 0, weight: 0, volume: 0, teu: 0 },
  );

  const toggleTable = () => {
    setTableOpen((open) => !open);
  };

  if (containers.length === 0) {
    return <BookingPreviewEmpty label={t("wizard.preview.empty.noContainers")} />;
  }

  return (
    <div className="booking-review__cargo">
      <p className="booking-review__cargo-hint">
        {t("wizard.preview.cargo.hint", {
          containers: totals.containers.toLocaleString(),
          containerLabel: totals.containers === 1 ? t("wizard.preview.cargo.container") : t("wizard.preview.cargo.containers"),
          lines: lineCount.toLocaleString(),
          lineLabel: lineCount === 1 ? t("wizard.preview.cargo.line") : t("wizard.preview.cargo.lines"),
        })}
      </p>

      <div
        className={[
          "booking-cargo-stats",
          tableOpen ? "booking-cargo-stats--open" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={tableOpen}
        aria-controls="booking-cargo-container-table"
        aria-label={t("wizard.preview.cargo.toggleTableAria")}
        onClick={toggleTable}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleTable();
          }
        }}
      >
        <div className="booking-cargo-stats__item">
          <span className="booking-cargo-stats__value">
            {totals.containers.toLocaleString()}
          </span>
          <span className="booking-cargo-stats__label">{t("wizard.preview.cargo.totalContainers")}</span>
        </div>
        <div className="booking-cargo-stats__item">
          <span className="booking-cargo-stats__value">
            {formatWeight(totals.weight)}
          </span>
          <span className="booking-cargo-stats__label">{t("wizard.preview.cargo.totalWeight")}</span>
        </div>
        <div className="booking-cargo-stats__item">
          <span className="booking-cargo-stats__value">
            {formatVolume(totals.volume)} CBM
          </span>
          <span className="booking-cargo-stats__label">{t("wizard.preview.cargo.totalVolume")}</span>
        </div>
        <div className="booking-cargo-stats__item booking-cargo-stats__item--last">
          <span className="booking-cargo-stats__value">
            {formatTeu(totals.teu)}
          </span>
          <span className="booking-cargo-stats__label">{t("wizard.preview.cargo.totalTeu")}</span>
          <AppIcon
            icon={Icons.chevronRight}
            size={16}
            className={[
              "booking-cargo-stats__chevron",
              tableOpen ? "booking-cargo-stats__chevron--open" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>
      </div>

      {tableOpen ? (
        <div
          id="booking-cargo-container-table"
          className="booking-cargo-table-wrap custom-scroll"
        >
          <table className="booking-cargo-table">
            <thead>
              <tr>
                <th>{t("wizard.preview.cargo.colContainerNumbers")}</th>
                <th>{t("wizard.preview.cargo.colType")}</th>
                <th>{t("wizard.preview.cargo.colTareWeight")}</th>
                <th>{t("wizard.preview.cargo.colCarrierSeal")}</th>
                <th>{t("wizard.preview.cargo.colShipperSeal")}</th>
                <th>{t("wizard.preview.cargo.colSpecial")}</th>
                <th aria-label={t("wizard.preview.cargo.expandAria")} />
              </tr>
            </thead>
            <tbody>
              {containers.map((container, containerIndex) => {
                const rowId = container.id || `container-${containerIndex}`;
                const rowOpen = openRows.has(rowId);
                const special = specialLabel(container, t);
                const toggleRow = () => {
                  setOpenRows((current) => toggleRowId(current, rowId));
                };

                return (
                  <Fragment key={rowId}>
                    <tr
                      className={[
                        "booking-cargo-table__row",
                        rowOpen ? "booking-cargo-table__row--open" : undefined,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="button"
                      tabIndex={0}
                      aria-expanded={rowOpen}
                      aria-controls={`booking-cargo-row-${rowId}`}
                      onClick={toggleRow}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleRow();
                        }
                      }}
                    >
                      <td>
                        <span className="booking-cargo-table__no">
                          {container.containerNo?.trim() ||
                            t("wizard.preview.cargo.containerFallback", { n: containerIndex + 1 })}
                        </span>
                      </td>
                      <td>{dash(container.containerType)}</td>
                      <td>{formatTare(container.tareWeight)}</td>
                      <td>—</td>
                      <td>—</td>
                      <td>
                        {special ? (
                          <span
                            className={`booking-cargo-special booking-cargo-special--${special.kind}`}
                          >
                            {special.label}
                          </span>
                        ) : (
                          <span className="booking-cargo-table__empty">—</span>
                        )}
                      </td>
                      <td className="booking-cargo-table__expand">
                        <AppIcon
                          icon={Icons.chevronRight}
                          size={16}
                          className={[
                            "booking-cargo-table__chevron",
                            rowOpen
                              ? "booking-cargo-table__chevron--open"
                              : undefined,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        />
                      </td>
                    </tr>
                    {rowOpen ? (
                      <tr
                        id={`booking-cargo-row-${rowId}`}
                        className="booking-cargo-table__detail-row"
                      >
                        <td colSpan={7}>
                          <PreviewContainerDetailPanel
                            containerIndex={containerIndex}
                            container={container}
                            t={t}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface PreviewContainerDetailPanelProps {
  containerIndex: number;
  container: ContainerItem;
  t: TranslateFn;
}

function PreviewContainerDetailPanel({
  containerIndex,
  container,
  t,
}: PreviewContainerDetailPanelProps) {
  const detailFields = [
    {
      label: t("wizard.preview.cargo.containerNo"),
      value:
        container.containerNo?.trim() || t("wizard.preview.cargo.containerFallback", { n: containerIndex + 1 }),
    },
    { label: t("wizard.preview.cargo.colCarrierSeal"), value: "—" },
    { label: t("wizard.preview.cargo.colShipperSeal"), value: "—" },
    { label: t("wizard.preview.cargo.colTareWeight"), value: formatTare(container.tareWeight) },
  ];

  return (
    <div className="booking-cargo-edit-panel">
      <div className="booking-cargo-edit-panel__fields">
        {detailFields.map((field) => (
          <div key={field.label} className="booking-cargo-edit-panel__field">
            <span className="booking-review__label">{field.label}</span>
            <span className="booking-review__value">{field.value}</span>
          </div>
        ))}
      </div>

      <PreviewCommodityTable commodities={container.commodities ?? []} t={t} />
    </div>
  );
}

interface PreviewCommodityTableProps {
  commodities: NonNullable<ContainerItem["commodities"]>;
  t: TranslateFn;
}

function PreviewCommodityTable({ commodities, t }: PreviewCommodityTableProps) {
  const totalWeight = commodities.reduce(
    (sum, line) => sum + Number(line?.weight || 0),
    0,
  );

  return (
    <div className="booking-cargo-commodities">
      <div className="booking-cargo-commodity-toolbar">
        <div className="booking-cargo-commodity-toolbar__title">
          <Text strong className="booking-cargo-commodity-toolbar__heading">
            {t("wizard.preview.cargo.commoditiesTitle", { count: commodities.length })}
          </Text>
          <span className="booking-cargo-commodity-toolbar__weight">
            {t("wizard.preview.cargo.totalWeightValue", { weight: formatWeight(totalWeight) })}
          </span>
        </div>
      </div>

      <div className="booking-cargo-commodity-table-wrap custom-scroll">
        <table className="booking-cargo-commodity-table">
          <thead>
            <tr>
              <th className="booking-cargo-commodity-table__num">#</th>
              <th>{t("wizard.preview.cargo.colCommodity")}</th>
              <th>{t("wizard.preview.cargo.colHsCode")}</th>
              <th>{t("wizard.preview.cargo.colPackageType")}</th>
              <th>{t("wizard.preview.cargo.colPackages")}</th>
              <th>{t("wizard.preview.cargo.colWeight")}</th>
              <th>{t("wizard.preview.cargo.colVolume")}</th>
            </tr>
          </thead>
          <tbody>
            {commodities.map((line, commodityIndex) => (
              <tr key={line.id || `commodity-${commodityIndex}`}>
                <td className="booking-cargo-commodity-table__num">
                  {commodityIndex + 1}
                </td>
                <td>
                  <span className="booking-cargo-commodity-table__name">
                    {dash(line?.commodity || line?.description)}
                  </span>
                  {line?.isDangerousGoods ? (
                    <span className="booking-cargo-special booking-cargo-special--dg">
                      DG
                    </span>
                  ) : null}
                </td>
                <td className="booking-cargo-commodity-table__hs">
                  {dash(line?.hsCode)}
                </td>
                <td>{dash(line?.packageType)}</td>
                <td>{dash(line?.packageQuantity)}</td>
                <td>
                  {line?.weight !== undefined && line?.weight !== null
                    ? `${line.weight} kg`
                    : "—"}
                </td>
                <td>
                  {line?.volume !== undefined && line?.volume !== null
                    ? formatVolume(line.volume)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
