// Modified by Sekar Nagarajan (2026-08-25 18:20)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Progress, Tag, Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  ContractedLane,
  LastUsedLane,
  OpportunityLane,
  TopLane,
} from "../mocks/dashboard.mock";

const { Text } = Typography;

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
          Top Active Lanes (by FEUs)
        </Text>
      }
      extra={
        <Tooltip title="View All Lanes">
          <AppButton type="link" size="small">
            View All
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-table-wrap custom-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th className="is-center">Rank</th>
              <th>Lane (POL → POD)</th>
              <th>FEUs</th>
              <th>% of Total</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {lanes.map((lane) => (
              <tr
                key={lane.rank}
                className={lane.rank % 2 === 0 ? "is-alt" : undefined}
              >
                <td className="is-center dashboard-table__rank">{lane.rank}</td>
                <td>
                  <span className="dashboard-lane-chip-row">
                    <Tag color="blue">{lane.pol}</Tag>
                    <AppIcon icon={Icons.arrowRight} size={9} />
                    <Tag color="geekblue">{lane.pod}</Tag>
                  </span>
                </td>
                <td>
                  <Text strong>{lane.feus.toLocaleString()}</Text>
                </td>
                <td>
                  <Text type="secondary">{lane.pctOfTotal}%</Text>
                </td>
                <td>
                  <Progress
                    percent={Math.round((lane.feus / maxFeus) * 100)}
                    showInfo={false}
                    size="small"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-last-used">
        <div className="dashboard-last-used__head">
          <Text className="dashboard-subsection-label">Last Used Lanes</Text>
          <Tooltip title="View All Last Used Lanes">
            <AppButton type="link" size="small">
              View All
            </AppButton>
          </Tooltip>
        </div>
        <div className="dashboard-last-used__grid">
          {lastUsed.map((lane, idx) => (
            <div key={idx} className="dashboard-last-used__card">
              <span className="dashboard-lane-chip-row">
                <Text strong>{lane.pol}</Text>
                <AppIcon icon={Icons.arrowRight} size={8} />
                <Text strong>{lane.pod}</Text>
              </span>
              <Text type="secondary" className="dashboard-metric-tile__period">
                {lane.date}
              </Text>
            </div>
          ))}
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
          Lane Opportunity Visibility
        </Text>
      }
      extra={
        <Tooltip title="View All Opportunities">
          <AppButton type="link" size="small">
            View All
          </AppButton>
        </Tooltip>
      }
    >
      <div>
        <Text className="dashboard-subsection-label">
          Contracted Lanes with Limited / No Activity (Last 90 Days)
        </Text>
        {contracted.map((lane, idx) => (
          <div key={idx} className="dashboard-list-row">
            <span className="dashboard-lane-chip-row">
              <Tag>{lane.pol}</Tag>
              <AppIcon icon={Icons.arrowRight} size={9} />
              <Tag>{lane.pod}</Tag>
            </span>
            <Tag color="error">No Activity</Tag>
          </div>
        ))}
      </div>

      <div>
        <Text className="dashboard-subsection-label">
          Potential New Opportunities (Based on History)
        </Text>
        {opportunities.map((lane, idx) => (
          <div key={idx} className="dashboard-list-row">
            <span className="dashboard-lane-chip-row">
              <AppIcon icon={Icons.zap} size={11} />
              <Tag color="blue">{lane.pol}</Tag>
              <AppIcon icon={Icons.arrowRight} size={9} />
              <Tag color="blue">{lane.pod}</Tag>
            </span>
            <Tag
              color={
                lane.suggestion === "High Potential" ? "warning" : "processing"
              }
            >
              {lane.suggestion}
            </Tag>
          </div>
        ))}
      </div>
    </Card>
  );
}
