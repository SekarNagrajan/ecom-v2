// Modified by Sekar Nagarajan (2026-09-05 01:12)
import { Typography } from "antd";
import { Fragment, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { SICargoLine, SIContainer } from "../types/si.types";
import { SiPreviewEmpty } from "./preview/si-preview-section";

const { Text } = Typography;

type SpecialKind = "dg" | "oog" | "soc" | "reefer" | "nor";

interface SiPreviewCargoReviewProps {
  containers: SIContainer[];
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

function specialLabel(container: SIContainer): {
  kind: SpecialKind;
  label: string;
} | null {
  const hasDg = (container.cargoLines ?? []).some(
    (line) => line.isDangerousGoods,
  );
  if (hasDg) {
    const dgClass = (container.cargoLines ?? []).find(
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

function sumCargoLines(lines: SICargoLine[]): {
  weight: number;
  volume: number;
} {
  return lines.reduce(
    (acc, line) => {
      acc.weight += Number(line.grossWeight || 0);
      acc.volume += Number(line.volume || 0);
      return acc;
    },
    { weight: 0, volume: 0 },
  );
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
 * Airy Review cargo for SI/BL Preview — KPI stats toggle the container
 * table (collapsed by default); rows expand for read-only details + lines.
 */
export function SiPreviewCargoReview({ containers }: SiPreviewCargoReviewProps) {
  const [tableOpen, setTableOpen] = useState(false);
  const [openRows, setOpenRows] = useState<Set<string>>(new Set());

  const lineCount = containers.reduce(
    (n, container) => n + (container.cargoLines?.length ?? 0),
    0,
  );

  const totals = containers.reduce(
    (acc, container) => {
      const sums = sumCargoLines(container.cargoLines ?? []);
      acc.containers += 1;
      acc.weight += sums.weight;
      acc.volume += sums.volume;
      acc.teu += teuForContainerType(container.eqpSize ?? "");
      return acc;
    },
    { containers: 0, weight: 0, volume: 0, teu: 0 },
  );

  const toggleTable = () => {
    setTableOpen((open) => !open);
  };

  if (containers.length === 0) {
    return <SiPreviewEmpty label="No containers" />;
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
        aria-controls="si-bl-cargo-container-table"
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
          id="si-bl-cargo-container-table"
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
                      aria-controls={`si-bl-cargo-row-${rowId}`}
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
                      <td>{dash(container.eqpSize)}</td>
                      <td>{formatTare(container.tareWeight)}</td>
                      <td>{dash(container.carrierSeal)}</td>
                      <td>{dash(container.shipperSeal)}</td>
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
                        id={`si-bl-cargo-row-${rowId}`}
                        className="booking-cargo-table__detail-row"
                      >
                        <td colSpan={7}>
                          <SiPreviewContainerDetailPanel
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

function SiPreviewContainerDetailPanel({
  containerIndex,
  container,
}: {
  containerIndex: number;
  container: SIContainer;
}) {
  const detailFields = [
    {
      label: "Container no.",
      value:
        container.containerNo?.trim() || `Container ${containerIndex + 1}`,
    },
    { label: "Carrier seal", value: dash(container.carrierSeal) },
    { label: "Shipper seal", value: dash(container.shipperSeal) },
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

      <SiPreviewCommodityTable cargoLines={container.cargoLines ?? []} />
    </div>
  );
}

function SiPreviewCommodityTable({ cargoLines }: { cargoLines: SICargoLine[] }) {
  const totalWeight = cargoLines.reduce(
    (sum, line) => sum + Number(line?.grossWeight || 0),
    0,
  );

  return (
    <div className="booking-cargo-commodities">
      <div className="booking-cargo-commodity-toolbar">
        <div className="booking-cargo-commodity-toolbar__title">
          <Text strong className="booking-cargo-commodity-toolbar__heading">
            Commodities ({cargoLines.length})
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
            {cargoLines.map((line, commodityIndex) => (
              <tr key={line.id || `commodity-${commodityIndex}`}>
                <td className="booking-cargo-commodity-table__num">
                  {commodityIndex + 1}
                </td>
                <td>
                  <span className="booking-cargo-commodity-table__name">
                    {dash(line?.commodityCode || line?.description)}
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
                <td>{dash(line?.packageCount)}</td>
                <td>
                  {line?.grossWeight !== undefined && line?.grossWeight !== null
                    ? `${line.grossWeight} kg`
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
