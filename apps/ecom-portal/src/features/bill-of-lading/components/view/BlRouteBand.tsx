// Modified by Sekar Nagarajan (2026-10-19 15:03)
import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import type { BLRouting, BLRoutingLeg } from "../../types/bl.types";

const { Text } = Typography;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

/** Split "INNSA - NHAVA SHEVA" style labels into code + place. */
function splitPort(value?: string | null): { code: string; place: string } {
  const raw = dash(value);
  if (raw === "—") return { code: "—", place: "" };
  const match = raw.match(/^([A-Za-z0-9]{3,})\s*[-–—]\s*(.+)$/);
  if (match) return { code: match[1].toUpperCase(), place: match[2].trim() };
  return { code: raw, place: "" };
}

function formatScheduleDate(value?: string): string {
  if (!value) return "—";
  const parsed = new Date(
    value.includes("T") ? value : value.replace(" ", "T"),
  );
  if (Number.isNaN(parsed.getTime())) return value;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mon = MONTHS[parsed.getMonth()];
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  const hasTime = parsed.getHours() !== 0 || parsed.getMinutes() !== 0;
  return hasTime ? `${dd} ${mon}, ${hh}:${min}` : `${dd} ${mon}`;
}

function vesselLine(leg: BLRoutingLeg): string {
  return [leg.vesselName, leg.voyage].filter(Boolean).join(" / ") || "—";
}

/**
 * Read-only routing band for the B/L view — equal-width Origin / Delivery
 * columns with a centered mid rail, then a horizontally aligned leg grid.
 */
export function BlRouteBand({ routing }: { routing: BLRouting }) {
  const { t } = useTranslation("bill-of-lading");
  const legs = routing.scheduleLegs ?? [];
  const primaryLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  const origin = splitPort(routing.originPrint);
  const delivery = splitPort(routing.deliveryPrint);
  const pol = splitPort(routing.polPrint);
  const pod = splitPort(routing.podPrint);

  const vesselVoyage = dash(routing.vesselVoyage);
  const showVia =
    (pol.code !== "—" && pol.code !== origin.code) ||
    (pod.code !== "—" && pod.code !== delivery.code);
  const legsLabel = `${t("labels.scheduleLegs")} · ${legs.length}`;

  return (
    <div className="bl-route-band">
      <div className="bl-route-band__journey">
        <div className="bl-route-band__endpoint">
          <span className="bl-route-band__eyebrow">{t("labels.origin")}</span>
          <Text strong className="bl-route-band__code">
            {origin.code}
          </Text>
          <span className="bl-route-band__place">
            {origin.place || "\u00a0"}
          </span>
          <span
            className={[
              "bl-route-band__date-pill",
              "bl-route-band__date-pill--etd",
              primaryLeg?.etd ? "" : "bl-route-band__date-pill--empty",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {primaryLeg?.etd
              ? `${t("wizard.routing.etd")} ${formatScheduleDate(primaryLeg.etd)}`
              : "\u00a0"}
          </span>
        </div>

        <div className="bl-route-band__mid">
          <div
            className={[
              "bl-route-band__vessel",
              "app-icon-inherit",
              vesselVoyage === "—" ? "bl-route-band__vessel--empty" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {vesselVoyage !== "—" ? (
              <>
                <AppIcon icon={Icons.ship} size={14} />
                <span>{vesselVoyage}</span>
              </>
            ) : (
              "\u00a0"
            )}
          </div>

          <div className="bl-route-band__rail">
            <span
              className="bl-route-band__node bl-route-band__node--origin"
              aria-hidden
            />
            <span className="bl-route-band__track" aria-hidden />
            <span className="bl-route-band__transit">{legsLabel}</span>
            <span className="bl-route-band__track" aria-hidden />
            <span
              className="bl-route-band__node bl-route-band__node--dest"
              aria-hidden
            />
          </div>

          <div
            className={[
              "bl-route-band__via-row",
              showVia ? "" : "bl-route-band__via-row--empty",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {showVia ? (
              <>
                <span className="bl-route-band__via">
                  <span className="bl-route-band__via-label">
                    {t("wizard.master.portOfLoading")}
                  </span>
                  <span className="bl-route-band__via-code">{pol.code}</span>
                </span>
                <AppIcon icon={Icons.arrowRight} size={12} />
                <span className="bl-route-band__via">
                  <span className="bl-route-band__via-label">
                    {t("wizard.master.portOfDischarge")}
                  </span>
                  <span className="bl-route-band__via-code">{pod.code}</span>
                </span>
              </>
            ) : (
              "\u00a0"
            )}
          </div>
        </div>

        <div className="bl-route-band__endpoint bl-route-band__endpoint--dest">
          <span className="bl-route-band__eyebrow">{t("labels.delivery")}</span>
          <Text strong className="bl-route-band__code">
            {delivery.code}
          </Text>
          <span className="bl-route-band__place">
            {delivery.place || "\u00a0"}
          </span>
          <span
            className={[
              "bl-route-band__date-pill",
              "bl-route-band__date-pill--eta",
              lastLeg?.eta ? "" : "bl-route-band__date-pill--empty",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {lastLeg?.eta
              ? `${t("wizard.routing.eta")} ${formatScheduleDate(lastLeg.eta)}`
              : "\u00a0"}
          </span>
        </div>
      </div>

      {/* {legs.length > 0 ? (
        <ol className="bl-route-legs">
          {legs.map((leg, index) => (
            <li key={leg.id} className="bl-route-leg">
              <span className="bl-route-leg__marker" aria-hidden>
                <span className="bl-route-leg__dot" />
                {index < legs.length - 1 ? (
                  <span className="bl-route-leg__stem" />
                ) : null}
              </span>
              <div className="bl-route-leg__body">
                <span className="bl-route-leg__type">{dash(leg.legType)}</span>
                <span className="bl-route-leg__vessel">{vesselLine(leg)}</span>
                <span className="bl-route-leg__ports app-icon-inherit">
                  <span className="bl-route-leg__port">
                    {dash(leg.polPortName)}
                  </span>
                  <AppIcon icon={Icons.arrowRight} size={12} />
                  <span className="bl-route-leg__port">
                    {dash(leg.podPortName)}
                  </span>
                </span>
                <span className="bl-route-leg__dates">
                  <span>
                    {t("wizard.routing.etd")}{" "}
                    <strong>{formatScheduleDate(leg.etd)}</strong>
                  </span>
                  <span>
                    {t("wizard.routing.eta")}{" "}
                    <strong>{formatScheduleDate(leg.eta)}</strong>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : null} */}
    </div>
  );
}
