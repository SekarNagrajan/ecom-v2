// Modified by Sekar Nagarajan (2026-08-26 16:20)
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon } from "../../../components/icons";

const { Title, Text } = Typography;

export interface UmPanelHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  extra?: ReactNode;
  /** Compact variant for AppDrawer title slots. */
  compact?: boolean;
}

/** Shared module/drawer header: icon + Title Case name + description. */
export function UmPanelHeader({
  icon,
  title,
  description,
  extra,
  compact = false,
}: UmPanelHeaderProps) {
  return (
    <div
      className={[
        "um-panel-header",
        compact ? "um-panel-header--compact" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="um-panel-header__main">
        <span className="um-panel-header__icon" aria-hidden>
          <AppIcon icon={icon} size={compact ? 22 : 24} />
        </span>
        <div className="um-panel-header__copy">
          <Title
            level={compact ? 5 : 4}
            className="um-panel-header__title"
          >
            {title}
          </Title>
          <Text type="secondary" className="um-panel-header__description">
            {description}
          </Text>
        </div>
      </div>
      {extra ? <div className="um-panel-header__extra">{extra}</div> : null}
    </div>
  );
}
