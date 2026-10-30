// Modified by Sekar Nagarajan (2026-09-15 18:55)
import { Badge, Typography } from "antd";
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
  /** Grid / list record count shown as a red badge next to the title. */
  recordCount?: number;
}

/** Shared module/drawer header: icon + Title Case name + description. */
export function UmPanelHeader({
  icon,
  title,
  description,
  extra,
  compact = false,
  recordCount,
}: UmPanelHeaderProps) {
  const showRecordCount =
    typeof recordCount === "number" && Number.isFinite(recordCount);

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
          <div className="um-panel-header__title-row">
            <Title
              level={compact ? 5 : 4}
              className="um-panel-header__title"
            >
              {title}
            </Title>
            {showRecordCount ? (
              <Badge
                count={recordCount}
                overflowCount={9999}
                showZero
                className="module-screen-header__record-count"
                title={`${recordCount} record${recordCount === 1 ? "" : "s"}`}
              />
            ) : null}
          </div>
          <Text type="secondary" className="um-panel-header__description">
            {description}
          </Text>
        </div>
      </div>
      {extra ? <div className="um-panel-header__extra">{extra}</div> : null}
    </div>
  );
}
