// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Flex, List, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { UpcomingScheduleItem } from "../mocks/dashboard.mock";

const { Text, Title } = Typography;

interface DashboardUpcomingSchedulesProps {
  schedules: UpcomingScheduleItem[];
}

export function DashboardUpcomingSchedules({
  schedules,
}: DashboardUpcomingSchedulesProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: token.colorBgContainer,
        borderRadius: 12,
        border: `1px solid ${token.colorBorder}`,
        padding: "16px 20px",
        height: "100%",
      }}
    >
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Title level={5} style={{ margin: 0, fontWeight: 600 }}>
          {t("schedules.title")}
        </Title>
        <AppButton
          type="link"
          size="small"
          onClick={() => navigate({ to: "/app/schedules" })}
        >
          {t("actions.all")}
        </AppButton>
      </Flex>
      <List
        dataSource={schedules}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorder}`,
            }}
          >
            <div style={{ width: "100%" }}>
              <Flex align="center" justify="space-between" wrap gap={8}>
                <div>
                  <Text strong style={{ display: "block", fontSize: 14 }}>
                    {item.vessel}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t("schedules.voyageLine", {
                      voyage: item.voyage,
                      service: item.service,
                      pol: item.pol,
                      pod: item.pod,
                    })}
                  </Text>
                </div>
                <AppIcon icon={Icons.calendar} size={16} />
              </Flex>
              <Flex
                align="center"
                justify="space-between"
                wrap
                gap={8}
                style={{ marginTop: 8 }}
              >
                <Text style={{ fontSize: 12 }}>
                  {t("schedules.etd", { date: item.etd })}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: item.cutoffOverdue
                      ? token.colorWarning
                      : token.colorTextSecondary,
                  }}
                >
                  {item.cutoffOverdue ? (
                    <AppIcon
                      icon={Icons.alertTriangle}
                      size={12}
                      style={{ marginRight: 4, display: "inline-flex" }}
                    />
                  ) : null}
                  {t("schedules.cutoff", { date: item.cutoff })}
                </Text>
              </Flex>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}
