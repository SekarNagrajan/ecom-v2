// Modified by Sekar Nagarajan (2026-08-26 16:30)
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon } from "../../../components/icons";

const { Title, Text } = Typography;

export interface ContactPanelHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  compact?: boolean;
}

/** Contact Us header: icon + Title Case name + description. */
export function ContactPanelHeader({
  icon,
  title,
  description,
  compact = false,
}: ContactPanelHeaderProps) {
  return (
    <div
      className={[
        "contact-panel-header",
        compact ? "contact-panel-header--compact" : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="contact-panel-header__main">
        <span className="contact-panel-header__icon" aria-hidden>
          <AppIcon icon={icon} size={compact ? 22 : 24} />
        </span>
        <div className="contact-panel-header__copy">
          <Title
            level={compact ? 5 : 4}
            className="contact-panel-header__title"
          >
            {title}
          </Title>
          <Text type="secondary" className="contact-panel-header__description">
            {description}
          </Text>
        </div>
      </div>
    </div>
  );
}
