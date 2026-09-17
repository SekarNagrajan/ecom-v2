// Modified by Sekar Nagarajan (2026-09-16 17:13)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Progress, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  ContractedLane,
  LastUsedLane,
  OpportunityLane,
  TopLane,
} from "../mocks/dashboard.mock";

const { Text } = Typography;

function LaneRoute({
  pol,
  pod,
  tone = "default",
}: {
  pol: string;
  pod: string;
  tone?: "default" | "emphasis" | "muted";
}) {
  return (
    <span className={`dashboard-lane-route dashboard-lane-route--${tone}`}>
      <span className="dashboard-port-chip dashboard-port-chip--pol">{pol}</span>
      <AppIcon icon={Icons.arrowRight} size={12} />
      <span className="dashboard-port-chip dashboard-port-chip--pod">{pod}</span>
    </span>
  );
}

interface TopLanesProps {
  lanes: TopLane[];
  lastUsed: LastUsedLane[];
}

export function TopActiveLanesSection({ lanes, lastUsed }: TopLanesProps) {
  const maxFeus = lanes[0]?.feus ?? 1;

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          Top Active Lanes
        </Text>
      }
      extra={
        <Tooltip title="View all lanes by FEU volume">
          <AppButton type="link" size="small">
            View All
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-panel-stack">
        <div className="dashboard-table-wrap custom-scroll dashboard-panel-stack__grow">
          <table className="dashboard-table dashboard-table--lanes">
            <colgroup>
              <col className="dashboard-col-rank" />
              <col className="dashboard-col-lane" />
              <col className="dashboard-col-numeric" />
              <col className="dashboard-col-numeric" />
              <col className="dashboard-col-bar" />
            </colgroup>
            <thead>
              <tr>
                <th className="is-center">#</th>
                <th>Lane (POL → POD)</th>
                <th className="is-right">FEUs</th>
                <th className="is-right">Share</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {lanes.map((lane) => (
                <tr
                  key={lane.rank}
                  className={lane.rank % 2 === 0 ? "is-alt" : undefined}
                >
                  <td className="is-center">
                    <span className="dashboard-rank-badge">{lane.rank}</span>
                  </td>
                  <td>
                    <LaneRoute pol={lane.pol} pod={lane.pod} tone="emphasis" />
                  </td>
                  <td className="is-right">
                    <Text strong>{lane.feus.toLocaleString()}</Text>
                  </td>
                  <td className="is-right">
                    <Text type="secondary">{lane.pctOfTotal.toFixed(1)}%</Text>
                  </td>
                  <td>
                    <div className="dashboard-volume-bar">
                      <Progress
                        percent={Math.round((lane.feus / maxFeus) * 100)}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-last-used">
          <div className="dashboard-last-used__head">
            <div>
              <Text className="dashboard-subsection-label">
                Recently Used Lanes
              </Text>
              <Text type="secondary" className="dashboard-subsection-hint">
                Latest bookings on these corridors
              </Text>
            </div>
            <Tooltip title="View all recently used lanes">
              <AppButton type="link" size="small">
                View All
              </AppButton>
            </Tooltip>
          </div>
          <div className="dashboard-last-used__grid">
            {lastUsed.map((lane) => (
              <div
                key={`${lane.pol}-${lane.pod}-${lane.date}`}
                className="dashboard-last-used__card"
              >
                <LaneRoute pol={lane.pol} pod={lane.pod} />
                <Text type="secondary" className="dashboard-last-used__meta">
                  {lane.date}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface LaneOpportunityProps {
  contracted: ContractedLane[];
  opportunities: OpportunityLane[];
}

export function LaneOpportunitySection({
  contracted,
  opportunities,
}: LaneOpportunityProps) {
  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          Lane Opportunities
        </Text>
      }
      extra={
        <Tooltip title="View all lane opportunities">
          <AppButton type="link" size="small">
            View All
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-split-stack">
        <div className="dashboard-split-stack__block">
          <div className="dashboard-subsection-head">
            <Text className="dashboard-subsection-label">
              Quiet Contracted Lanes
            </Text>
            <Text type="secondary" className="dashboard-subsection-hint">
              No activity in the last 90 days
            </Text>
          </div>
          <div className="dashboard-opportunity-list custom-scroll">
            {contracted.map((lane) => (
              <div
                key={`${lane.pol}-${lane.pod}`}
                className="dashboard-list-row"
              >
                <LaneRoute pol={lane.pol} pod={lane.pod} tone="muted" />
                <span className="dashboard-status-pill dashboard-status-pill--idle">
                  No Activity
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-split-stack__block">
          <div className="dashboard-subsection-head">
            <Text className="dashboard-subsection-label">
              Suggested New Lanes
            </Text>
            <Text type="secondary" className="dashboard-subsection-hint">
              Based on your booking history
            </Text>
          </div>
          <div className="dashboard-opportunity-list custom-scroll">
            {opportunities.map((lane) => {
              const isHigh = lane.suggestion === "High Potential";
              return (
                <div
                  key={`${lane.pol}-${lane.pod}-${lane.suggestion}`}
                  className="dashboard-list-row"
                >
                  <LaneRoute pol={lane.pol} pod={lane.pod} tone="emphasis" />
                  <span
                    className={
                      isHigh
                        ? "dashboard-status-pill dashboard-status-pill--high"
                        : "dashboard-status-pill dashboard-status-pill--watch"
                    }
                  >
                    {lane.suggestion}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
