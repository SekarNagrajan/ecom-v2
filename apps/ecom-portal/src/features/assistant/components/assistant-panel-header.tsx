// Modified by Sekar Nagarajan (2026-10-20 15:23)
import { Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";

const { Title, Text } = Typography;

/**
 * Drawer header identity: gradient bot avatar with a live status dot,
 * title + online caption, impersonation note, and the action cluster
 * (expand/shrink, new chat) supplied through `extra`.
 */
export function AssistantPanelHeader({
  title,
  status,
  actingAs,
  extra,
}: {
  title: string;
  status: string;
  actingAs?: string;
  extra?: ReactNode;
}) {
  return (
    <div className="assistant-panel-header">
      <span className="assistant-panel-header__icon" aria-hidden>
        <AppIcon icon={Icons.wechatChat} size={22} />
        <span className="assistant-panel-header__dot" />
      </span>
      <div className="assistant-panel-header__copy">
        <Title level={5} className="assistant-panel-header__title">
          {title}
        </Title>
        <Text type="secondary" className="assistant-panel-header__status">
          <span className="assistant-panel-header__status-dot" aria-hidden />
          {status}
        </Text>
        {actingAs ? (
          <Text className="assistant-panel-header__acting">{actingAs}</Text>
        ) : null}
      </div>
      {extra ? (
        <div className="assistant-panel-header__extra">{extra}</div>
      ) : null}
    </div>
  );
}
