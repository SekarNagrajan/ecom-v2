// Modified by Sekar Nagarajan (2026-09-01 10:58) — ScheduleCardList visual parity
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tag, Tooltip, Typography, theme } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { ScheduleModuleStyles } from "../../schedules/components/schedule-module-styles";
import { tokenMix } from "../../theme/utils/token-mix";
import type { VgmReferenceDetailsDTO } from "../types/vgm.types";
import { parsePortLabel } from "../utils/vgm.utils";

const { Text } = Typography;

interface VgmReferenceStripProps {
  details: VgmReferenceDetailsDTO;
}

function portCity(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function transitDays(etd?: string, eta?: string): number {
  if (!etd || !eta) return 0;
  const start = Date.parse(etd.replace(" ", "T"));
  const end = Date.parse(eta.replace(" ", "T"));
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function VgmReferenceScheduleCardStyles() {
  const { token } = theme.useToken();
  const primaryTint8 = tokenMix(token.colorPrimary, 8);
  const successTint8 = tokenMix(token.colorSuccess, 8);

  return (
    <style>{`
      .vgm-reference-schedule-card.schedule-card {
        width: 100%;
        border: none;
        border-radius: 0;
      }
      .vgm-reference-schedule-card .schedule-card__main {
        grid-template-columns: minmax(0, 1fr) !important;
        width: 100%;
        padding: ${token.paddingLG}px ${token.paddingXL}px;
      }
      .vgm-reference-schedule-card .schedule-card__content,
      .vgm-reference-schedule-card .schedule-card__meta,
      .vgm-reference-schedule-card .schedule-card__transport,
      .vgm-reference-schedule-card .schedule-card__footer {
        width: 100%;
      }
      .vgm-reference-schedule-card .schedule-card__route {
        width: 100%;
        gap: ${token.marginLG}px;
      }
      .vgm-reference-schedule-card .schedule-card__endpoint {
        padding: ${token.paddingMD}px ${token.paddingLG}px;
        border-radius: ${token.borderRadiusLG}px;
        border: 1px solid ${token.colorBorderSecondary};
        background: ${token.colorFillAlter};
        min-height: ${token.controlHeightLG * 3}px;
        justify-content: center;
      }
      .vgm-reference-schedule-card .schedule-card__endpoint--origin {
        border-left: 4px solid ${token.colorPrimary};
        background: linear-gradient(
          180deg,
          ${primaryTint8} 0%,
          ${token.colorFillAlter} 100%
        );
      }
      .vgm-reference-schedule-card .schedule-card__endpoint--dest {
        border-left: 4px solid ${token.colorSuccess};
        background: linear-gradient(
          180deg,
          ${successTint8} 0%,
          ${token.colorFillAlter} 100%
        );
      }
      .vgm-reference-schedule-card .schedule-card__place {
        font-size: ${token.fontSizeHeading5}px;
        font-weight: ${token.fontWeightStrong};
        color: ${token.colorText};
        line-height: 1.3;
      }
      .vgm-reference-schedule-card .schedule-card__connector {
        min-width: 0;
        width: 100%;
        padding-top: ${token.paddingMD}px;
      }
      .vgm-reference-schedule-card .schedule-card__connector-pill {
        padding: ${token.paddingXXS}px ${token.paddingMD}px;
        font-size: ${token.fontSize}px;
      }
      .vgm-reference-schedule-card .schedule-card__deadline-icon--party {
        background: ${token.colorInfoBg};
        color: ${token.colorInfo};
      }
      .vgm-reference-schedule-card .schedule-card__deadline-icon--shipper {
        background: ${token.colorWarningBg};
        color: ${token.colorWarning};
      }
      .vgm-reference-schedule-card .schedule-card__deadline-icon--pol,
      .vgm-reference-schedule-card .schedule-card__deadline-icon--pod {
        background: ${tokenMix(token.colorPrimary, 10)};
        color: ${token.colorPrimary};
      }
      @media (min-width: 768px) {
        .vgm-reference-schedule-card .schedule-card__route {
          grid-template-columns: minmax(0, 1.2fr) minmax(180px, 1fr) minmax(0, 1.2fr);
          align-items: stretch;
        }
        .vgm-reference-schedule-card .schedule-card__endpoint--dest {
          text-align: right;
          align-items: flex-end;
          border-left: 1px solid ${token.colorBorderSecondary};
          border-right: 4px solid ${token.colorSuccess};
        }
        .vgm-reference-schedule-card .schedule-card__connector {
          align-self: center;
        }
      }
    `}</style>
  );
}

export function VgmReferenceStrip({ details }: VgmReferenceStripProps) {
  const originPort = parsePortLabel(details.origin || details.pol || "");
  const deliveryPort = parsePortLabel(details.delivery || details.pod || "");
  const polPort = parsePortLabel(details.pol || "");
  const podPort = parsePortLabel(details.pod || "");
  const [open, setOpen] = useState(false);
  const referenceLabel = details.type === "blno" ? "B/L" : "Booking";
  const transitTimeDays = transitDays(details.etd, details.eta);

  return (
    <Card
      className="vgm-section-card form-step-card"
      title="Booking / B/L Details"
      bordered={false}
      extra={
        <div className="vgm-header-extra">
          <div className="vgm-meta-row vgm-meta-row--header">
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">A/P Name</span>
              <span className="vgm-meta-item__value">{details.apName}</span>
            </div>
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">Shipper Name</span>
              <span className="vgm-meta-item__value">
                {details.shipperName}
              </span>
            </div>
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">VGM POL</span>
              <span className="vgm-meta-item__value">{details.pol}</span>
            </div>
            <div className="vgm-meta-item">
              <span className="vgm-meta-item__label">VGM POD</span>
              <span className="vgm-meta-item__value">{details.pod}</span>
            </div>
          </div>
          <Tooltip title={open ? "Collapse details" : "Expand details"}>
            <AppButton
              type="text"
              size="small"
              aria-label={open ? "Collapse details" : "Expand details"}
              icon={
                <AppIcon
                  icon={open ? Icons.chevronUp : Icons.chevronDown}
                  size={18}
                />
              }
              onClick={() => setOpen((prev) => !prev)}
            />
          </Tooltip>
        </div>
      }
    >
      {open ? (
        <div className="vgm-reference-schedule-wrap">
          <ScheduleModuleStyles />
          <VgmReferenceScheduleCardStyles />
          <article className="schedule-card vgm-reference-schedule-card">
            <div className="schedule-card__main">
              <div className="schedule-card__content">
                {/* <div className="schedule-card__meta">
                  <Tag color="blue">
                    {referenceLabel} · {details.referenceNo}
                  </Tag>
                  <Tag color="cyan">{details.shipperName}</Tag>
                  <Tag color="geekblue">{details.apName}</Tag>
                  <Text type="secondary" className="schedule-card__distance">
                    Port to Port
                  </Text>
                </div> */}

                <div className="schedule-card__route">
                  <div className="schedule-card__endpoint schedule-card__endpoint--origin">
                    <Text className="schedule-card__place">
                      {portCity(originPort.name).toUpperCase()},{" "}
                      <span className="schedule-card__port-code">
                        {originPort.code}
                      </span>
                    </Text>
                    <div className="schedule-card__etime">
                      <Tag color="blue">ETD {details.etd ?? "—"}</Tag>
                    </div>
                    <Text className="schedule-card__terminal">
                      POL: {polPort.code} — {polPort.name}
                    </Text>
                  </div>

                  <div className="schedule-card__connector">
                    <div className="schedule-card__connector-line">
                      <span className="schedule-card__connector-dot" />
                      <span className="schedule-card__connector-rail" />
                      <span className="schedule-card__connector-pill">
                        {transitTimeDays > 0
                          ? `${transitTimeDays} Days`
                          : "Ocean"}
                      </span>
                      <span className="schedule-card__connector-rail" />
                      <span className="schedule-card__connector-dot" />
                    </div>
                    <Text className="schedule-card__connector-type">
                      Direct
                    </Text>
                  </div>

                  <div className="schedule-card__endpoint schedule-card__endpoint--dest">
                    <Text className="schedule-card__place">
                      {portCity(deliveryPort.name).toUpperCase()},{" "}
                      <span className="schedule-card__port-code">
                        {deliveryPort.code}
                      </span>
                    </Text>
                    <div className="schedule-card__etime">
                      <Tag color="green">ETA {details.eta ?? "—"}</Tag>
                    </div>
                    <Text className="schedule-card__terminal">
                      POD: {podPort.code} — {podPort.name}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </Card>
  );
}
