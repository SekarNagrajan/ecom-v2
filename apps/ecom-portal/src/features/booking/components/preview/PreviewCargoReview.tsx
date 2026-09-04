// Modified by Sekar Nagarajan (2026-09-05 00:18)
import { Typography } from "antd";
import { Fragment, useState } from "react";

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

function specialLabel(container: ContainerItem): {
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
      label: dgClass ? `DG · Class ${dgClass}` : "DG",
    };
  }
  if (container.isOog) return { kind: "oog", label: "OOG" };
  if (container.isSoc) return { kind: "soc", label: "SOC" };
  if (container.reeferMode === "operating") {
    return {
      kind: "reefer",
      label:
        container.setTemp !== undefined && container.setTemp !== null
          ? `Reefer ${container.setTemp}°C`
          : "Reefer",
    };
  }
  if (container.reeferMode === "nor") return { kind: "nor", label: "NOR" };
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
    return <BookingPreviewEmpty label="No containers" />;
  }

  return (
    <div className="booking-review__cargo">
      <p className="booking-review__cargo-hint">
        {totals.containers.toLocaleString()}{" "}
        {totals.containers === 1 ? "container" : "containers"} ·{" "}
        {lineCount.toLocaleString()} commodity{" "}
        {lineCount === 1 ? "line" : "lines"} · expand the summary, then click a
        row to view details and commodities.
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
        aria-label="Toggle container table"
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
          <span className="booking-cargo-stats__label">Total containers</span>
        </div>
        <div className="booking-cargo-stats__item">
          <span className="booking-cargo-stats__value">
            {formatWeight(totals.weight)}
          </span>
          <span className="booking-cargo-stats__label">Total weight</span>
        </div>
        <div className="booking-cargo-stats__item">
          <span className="booking-cargo-stats__value">
            {formatVolume(totals.volume)} CBM
          </span>
          <span className="booking-cargo-stats__label">Total volume</span>
        </div>
        <div className="booking-cargo-stats__item booking-cargo-stats__item--last">
          <span className="booking-cargo-stats__value">
            {formatTeu(totals.teu)}
          </span>
          <span className="booking-cargo-stats__label">Total TEU</span>
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
                <th>Container numbers</th>
                <th>Type</th>
                <th>Tare weight</th>
                <th>Carrier seal</th>
                <th>Shipper seal</th>
                <th>Special</th>
                <th aria-label="Expand" />
              </tr>
            </thead>
            <tbody>
              {containers.map((container, containerIndex) => {
                const rowId = container.id || `container-${containerIndex}`;
                const rowOpen = openRows.has(rowId);
                const special = specialLabel(container);
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
                            `Container ${containerIndex + 1}`}
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

interface PreviewContainerDetailPanelProps {
  containerIndex: number;
  container: ContainerItem;
}

function PreviewContainerDetailPanel({
  containerIndex,
  container,
}: PreviewContainerDetailPanelProps) {
  const detailFields = [
    {
      label: "Container no.",
      value:
        container.containerNo?.trim() || `Container ${containerIndex + 1}`,
    },
    { label: "Carrier seal", value: "—" },
    { label: "Shipper seal", value: "—" },
    { label: "Tare weight", value: formatTare(container.tareWeight) },
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

      <PreviewCommodityTable commodities={container.commodities ?? []} />
    </div>
  );
}

interface PreviewCommodityTableProps {
  commodities: NonNullable<ContainerItem["commodities"]>;
}

function PreviewCommodityTable({ commodities }: PreviewCommodityTableProps) {
  const totalWeight = commodities.reduce(
    (sum, line) => sum + Number(line?.weight || 0),
    0,
  );

  return (
    <div className="booking-cargo-commodities">
      <div className="booking-cargo-commodity-toolbar">
        <div className="booking-cargo-commodity-toolbar__title">
          <Text strong className="booking-cargo-commodity-toolbar__heading">
            Commodities ({commodities.length})
          </Text>
          <span className="booking-cargo-commodity-toolbar__weight">
            Total weight: {formatWeight(totalWeight)}
          </span>
        </div>
      </div>

      <div className="booking-cargo-commodity-table-wrap custom-scroll">
        <table className="booking-cargo-commodity-table">
          <thead>
            <tr>
              <th className="booking-cargo-commodity-table__num">#</th>
              <th>Commodity</th>
              <th>HS code</th>
              <th>Package type</th>
              <th>Packages</th>
              <th>Weight</th>
              <th>Volume</th>
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
