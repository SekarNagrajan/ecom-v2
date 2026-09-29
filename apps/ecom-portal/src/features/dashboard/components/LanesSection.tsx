// Modified by Sekar Nagarajan (2026-09-16 17:13)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Progress, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

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
      <span className="dashboard-port-chip dashboard-port-chip--pol">
        {pol}
      </span>
      <AppIcon icon={Icons.arrowRight} size={12} />
      <span className="dashboard-port-chip dashboard-port-chip--pod">
        {pod}
      </span>
    </span>
  );
}

function getLaneSuggestionLabel(
  suggestion: OpportunityLane["suggestion"],
  t: (key: string) => string,
): string {
  switch (suggestion) {
    case "High Potential":
      return t("lanes.suggestions.highPotential");
    case "Medium Potential":
      return t("lanes.suggestions.mediumPotential");
    default: {
      const _exhaustive: never = suggestion;
      return _exhaustive;
    }
  }
}

interface TopLanesProps {
  lanes: TopLane[];
  lastUsed: LastUsedLane[];
}

export function TopActiveLanesSection({ lanes, lastUsed }: TopLanesProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const maxFeus = lanes[0]?.feus ?? 1;

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          {t("lanes.topActive")}
        </Text>
      }
      extra={
        <Tooltip title={t("lanes.viewAllByFeu")}>
          <AppButton type="link" size="small">
            {t("actions.viewAll")}
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
                <th>{t("lanes.lanePolPod")}</th>
                <th className="is-right">{t("lanes.feus")}</th>
                <th className="is-right">{t("lanes.share")}</th>
                <th>{t("lanes.volume")}</th>
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
                {t("lanes.recentlyUsed")}
              </Text>
              <Text type="secondary" className="dashboard-subsection-hint">
                {t("lanes.recentlyUsedHint")}
              </Text>
            </div>
            <Tooltip title={t("lanes.viewAllRecentlyUsed")}>
              <AppButton type="link" size="small">
                {t("actions.viewAll")}
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
  const { t } = useTranslation(["dashboard", "common", "modules"]);

  return (
    <Card
      className="dashboard-panel"
      title={
        <Text strong className="dashboard-panel__title">
          {t("lanes.opportunities")}
        </Text>
      }
      extra={
        <Tooltip title={t("lanes.viewAllOpportunities")}>
          <AppButton type="link" size="small">
            {t("actions.viewAll")}
          </AppButton>
        </Tooltip>
      }
    >
      <div className="dashboard-split-stack">
        <div className="dashboard-split-stack__block">
          <div className="dashboard-subsection-head">
            <Text className="dashboard-subsection-label">
              {t("lanes.quietContracted")}
            </Text>
            <Text type="secondary" className="dashboard-subsection-hint">
              {t("lanes.quietHint")}
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
                  {t("lanes.noActivity")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-split-stack__block">
          <div className="dashboard-subsection-head">
            <Text className="dashboard-subsection-label">
              {t("lanes.suggestedNew")}
            </Text>
            <Text type="secondary" className="dashboard-subsection-hint">
              {t("lanes.suggestedHint")}
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
                    {getLaneSuggestionLabel(lane.suggestion, t)}
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
