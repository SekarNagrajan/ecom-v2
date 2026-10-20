// Modified by Sekar Nagarajan (2026-10-19 17:25)
import { Card, Tag } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { VgmReferenceDetailsDTO } from "../types/vgm.types";
import { parsePortLabel } from "../utils/vgm.utils";

interface VgmReferenceStripProps {
  details: VgmReferenceDetailsDTO;
}

function dash(value?: string | null): string {
  return value && value.trim() !== "" ? value : "—";
}

function portCity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

/** Place name without the code; empty when the label carried no name part. */
function placeLabel(port: { code: string; name: string }): string {
  return port.name && port.name !== port.code ? portCity(port.name) : "";
}

function transitDays(etd?: string, eta?: string): number {
  if (!etd || !eta) return 0;
  const start = Date.parse(etd.replace(" ", "T"));
  const end = Date.parse(eta.replace(" ", "T"));
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

/**
 * Booking / B/L reference summary shown above the VGM declaration form:
 * parties on the left, origin → delivery route band with ETD / ETA and the
 * VGM POL / POD pair on the right. Everything is visible without toggles.
 */
export function VgmReferenceStrip({ details }: VgmReferenceStripProps) {
  const originPort = parsePortLabel(details.origin || details.pol || "");
  const deliveryPort = parsePortLabel(details.delivery || details.pod || "");
  const polPort = parsePortLabel(details.pol || "");
  const podPort = parsePortLabel(details.pod || "");
  const referenceLabel = details.type === "blno" ? "B/L" : "Booking";
  const transitTimeDays = transitDays(details.etd, details.eta);
  const originPlace = placeLabel(originPort);
  const deliveryPlace = placeLabel(deliveryPort);

  return (
    <Card
      className="vgm-section-card vgm-reference-card form-step-card"
      title="Booking / B/L Details"
      bordered={false}
      extra={
        <Tag color="blue" className="vgm-reference-card__ref-tag">
          <span className="vgm-reference-card__ref-kind">{referenceLabel}</span>
          <span className="vgm-reference-card__ref-no">{details.referenceNo}</span>
        </Tag>
      }
    >
      <div className="vgm-reference-layout">
        {/* Parties */}
        <div className="vgm-reference-parties">
          <div className="vgm-reference-fact">
            <span className="vgm-reference-fact__icon vgm-reference-fact__icon--ap app-icon-inherit">
              <AppIcon icon={Icons.building} size={18} />
            </span>
            <div className="vgm-reference-fact__copy">
              <span className="vgm-reference-fact__label">A/P Name</span>
              <span className="vgm-reference-fact__value" title={details.apName}>
                {dash(details.apName)}
              </span>
            </div>
          </div>
          <div className="vgm-reference-fact">
            <span className="vgm-reference-fact__icon vgm-reference-fact__icon--shipper app-icon-inherit">
              <AppIcon icon={Icons.user} size={18} />
            </span>
            <div className="vgm-reference-fact__copy">
              <span className="vgm-reference-fact__label">Shipper Name</span>
              <span
                className="vgm-reference-fact__value"
                title={details.shipperName}
              >
                {dash(details.shipperName)}
              </span>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="vgm-reference-route">
          <div className="vgm-reference-route__band">
            <div className="vgm-reference-route__stop">
              <span className="vgm-reference-route__eyebrow">Origin</span>
              <span className="vgm-reference-route__place">
                {originPlace || dash(originPort.code)}
              </span>
              {originPlace ? (
                <span className="vgm-reference-route__code">{originPort.code}</span>
              ) : null}
              <span className="vgm-reference-route__pill vgm-reference-route__pill--etd">
                ETD {dash(details.etd)}
              </span>
            </div>

            <div className="vgm-reference-route__connector" aria-hidden>
              <span className="vgm-reference-route__dot vgm-reference-route__dot--origin" />
              <span className="vgm-reference-route__dash" />
              <span className="vgm-reference-route__transit app-icon-inherit">
                <AppIcon icon={Icons.ship} size={14} />
                {transitTimeDays > 0 ? `${transitTimeDays} Days` : "Ocean"}
              </span>
              <span className="vgm-reference-route__dash" />
              <span className="vgm-reference-route__dot vgm-reference-route__dot--dest" />
            </div>

            <div className="vgm-reference-route__stop vgm-reference-route__stop--dest">
              <span className="vgm-reference-route__eyebrow">Delivery</span>
              <span className="vgm-reference-route__place">
                {deliveryPlace || dash(deliveryPort.code)}
              </span>
              {deliveryPlace ? (
                <span className="vgm-reference-route__code">
                  {deliveryPort.code}
                </span>
              ) : null}
              <span className="vgm-reference-route__pill vgm-reference-route__pill--eta">
                ETA {dash(details.eta)}
              </span>
            </div>
          </div>

          <div className="vgm-reference-route__ports">
            <span className="vgm-reference-port app-icon-inherit">
              <AppIcon icon={Icons.anchor} size={12} />
              <span className="vgm-reference-port__label">VGM POL</span>
              <span className="vgm-reference-port__code">{dash(polPort.code)}</span>
              {polPort.name !== polPort.code ? (
                <span className="vgm-reference-port__name">{polPort.name}</span>
              ) : null}
            </span>
            <span className="vgm-reference-port vgm-reference-port--pod app-icon-inherit">
              <AppIcon icon={Icons.anchor} size={12} />
              <span className="vgm-reference-port__label">VGM POD</span>
              <span className="vgm-reference-port__code">{dash(podPort.code)}</span>
              {podPort.name !== podPort.code ? (
                <span className="vgm-reference-port__name">{podPort.name}</span>
              ) : null}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
