import { Badge, List, Spin, Tag, Typography } from "antd";

import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { AlertHistoryLog } from "../types/user-modules.types";

const { Text } = Typography;

export interface AlertActivityLogListProps {
  logs: AlertHistoryLog[];
  loading?: boolean;
  className?: string;
}

export function AlertActivityLogList({
  logs,
  loading = false,
  className,
}: AlertActivityLogListProps) {
  if (loading) {
    return (
      <div className="um-alerts-log-loading" role="status" aria-label="Loading">
        <Spin size="small" />
      </div>
    );
  }

  return (
    <List
      className={["um-alerts-log", "custom-scroll", className]
        .filter(Boolean)
        .join(" ")}
      itemLayout="horizontal"
      dataSource={logs}
      locale={{
        emptyText: (
          <ModuleEmptyState
            artSize="sm"
            variant="blank"
            title="No recent alert activity"
            className="um-alerts-empty"
          />
        ),
      }}
      renderItem={(log) => (
        <List.Item className="um-alerts-log__item">
          <List.Item.Meta
            avatar={
              <Badge status={log.isRead ? "default" : "processing"} />
            }
            title={
              <div className="um-alerts-log__title">
                <Text strong>{log.title}</Text>
                <Tag color="blue">{log.category}</Tag>
              </div>
            }
            description={
              <div className="um-alerts-log__desc">
                <Text className="um-alerts-log__message">{log.message}</Text>
                <Text type="secondary" className="um-alerts-log__meta">
                  {log.timestamp} • Ref: {log.referenceNo}
                </Text>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
}
