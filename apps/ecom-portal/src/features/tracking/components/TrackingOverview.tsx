// Modified by Sekar Nagarajan (2026-10-27 11:05)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { TrackingSearchResult } from "../types/tracking.types";
import { TrackingPipeline } from "./TrackingPipeline";

const { Text } = Typography;

interface TrackingOverviewProps {
  data: TrackingSearchResult;
}

function PortName({ name }: { name: string }) {
  return (
    <Text
      type="secondary"
      className="tracking-overview-route__port-name"
      ellipsis={{ tooltip: name }}
    >
      {name}
    </Text>
  );
}

/** Compact route + facts header; cargo journey expands via chevron. */
export function TrackingOverview({ data }: TrackingOverviewProps) {
  const [journeyOpen, setJourneyOpen] = useState(false);
  const progress = Math.max(0, Math.min(100, data.progressPercent ?? 0));
  const etaIsActual = Boolean(data.actualEta);

  return (
    <Card className="tracking-overview">
      <div className="tracking-overview__header">
        <div className="tracking-overview__summary">
          <div className="tracking-overview-route" aria-label="Route progress">
            <div className="tracking-overview-route__port tracking-overview-route__port--pol">
              <Text strong className="tracking-overview-route__port-code">
                {data.polPortCode}
              </Text>
              <PortName name={data.polPortName} />
            </div>

            <div
              className={[
                "tracking-overview-route__track",
                progress > 0 && progress < 100
                  ? "tracking-overview-route__track--in-transit"
                  : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="tracking-overview-route__rail" aria-hidden>
                <span
                  className="tracking-overview-route__rail-fill"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span
                className="tracking-overview-route__marker app-icon-inherit"
                style={{ left: `${progress}%` }}
                aria-label={`${progress}% complete`}
              >
                <span className="tracking-overview-route__marker-pulse" aria-hidden />
                <AppIcon icon={Icons.ship} size={16} />
              </span>
            </div>

            <div className="tracking-overview-route__port tracking-overview-route__port--pod">
              <Text strong className="tracking-overview-route__port-code">
                {data.podPortCode}
              </Text>
              <PortName name={data.podPortName} />
            </div>
            
          </div>

          <div className="tracking-overview-facts">
            <div className="tracking-overview-fact">
              <Text type="secondary" className="tracking-overview-fact__label">
                Booking no
              </Text>
              <Text strong className="tracking-overview-fact__value" ellipsis>
                {data.bookingNo}
              </Text>
              <Tooltip title={data.blNo ? `BL: ${data.blNo}` : undefined}>
                <Text
                  type="secondary"
                  className="tracking-overview-fact__sub"
                >
                  {data.blNo || "—"}
                </Text>
              </Tooltip>
            </div>

            <div className="tracking-overview-fact">
              <Text type="secondary" className="tracking-overview-fact__label">
                Carrier
              </Text>
              <Text strong className="tracking-overview-fact__value" ellipsis>
                {data.vesselName}
              </Text>
              <Text type="secondary" className="tracking-overview-fact__sub">
                Voyage {data.voyage}
                {data.bound ? ` ${data.bound}` : ""}
              </Text>
            </div>

            <div className="tracking-overview-fact">
              <Text type="secondary" className="tracking-overview-fact__label">
                ETA 
              </Text>
              <Text strong className="tracking-overview-fact__value" ellipsis>
                {data.eta || "—"}
              </Text>
              <Text type="secondary" className="tracking-overview-fact__sub">
                {etaIsActual ? "Actual" : "Estimated"}
              </Text>
            </div>
          </div>

          <div className="tracking-overview__toggle-col">
            <Tooltip
              title={journeyOpen ? "Hide Cargo Journey" : "Show Cargo Journey"}
            >
              <AppButton
                appVariant="ghost"
                className={[
                  "tracking-overview__toggle",
                  journeyOpen ? "tracking-overview__toggle--open" : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-expanded={journeyOpen}
                aria-controls="tracking-overview-journey"
                onClick={() => setJourneyOpen((open) => !open)}
                icon={
                  <span className="tracking-overview__toggle-chevron app-icon-inherit">
                    <AppIcon icon={Icons.chevronDown} size={18} />
                  </span>
                }
              />
            </Tooltip>
          </div>
        </div>
      </div>

      <div
        id="tracking-overview-journey"
        className={[
          "tracking-overview__journey-panel",
          journeyOpen ? "tracking-overview__journey-panel--open" : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!journeyOpen}
      >
        <div className="tracking-overview__journey-panel-inner">
          <div className="tracking-overview__journey">
            <TrackingPipeline milestones={data.milestones} eta={data.eta} />

            <div className="tracking-deadlines" aria-label="Cut-off deadlines">
              <Tooltip title="Container Gate-In Closing">
                <div className="tracking-deadline">
                  <span className="tracking-deadline__icon tracking-deadline__icon--gate app-icon-inherit">
                    <AppIcon icon={Icons.calendar} size={16} />
                  </span>
                  <span>
                    <span className="tracking-deadline__label">Gate-In</span>
                    <span className="tracking-deadline__value">
                      {data.deadlines.containerGateIn}
                    </span>
                  </span>
                </div>
              </Tooltip>
              <Tooltip title="Shipping Instruction Document Closing">
                <div className="tracking-deadline">
                  <span className="tracking-deadline__icon tracking-deadline__icon--si app-icon-inherit">
                    <AppIcon icon={Icons.calendar} size={16} />
                  </span>
                  <span>
                    <span className="tracking-deadline__label">SI Cut-Off</span>
                    <span className="tracking-deadline__value">
                      {data.deadlines.siDocClosing}
                    </span>
                  </span>
                </div>
              </Tooltip>
              <Tooltip title="Verified Gross Mass (VGM) Closing">
                <div className="tracking-deadline">
                  <span className="tracking-deadline__icon tracking-deadline__icon--vgm app-icon-inherit">
                    <AppIcon icon={Icons.calendar} size={16} />
                  </span>
                  <span>
                    <span className="tracking-deadline__label">
                      VGM Cut-Off
                    </span>
                    <span className="tracking-deadline__value">
                      {data.deadlines.vgmClosing}
                    </span>
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
