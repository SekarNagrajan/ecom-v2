// Modified by Sekar Nagarajan (2026-09-15 11:55)
import { Typography, theme } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon } from "../icons";
import type { ModuleListViewMode } from "./hooks/use-module-view-mode";
import { ModuleViewModeTabs } from "./module-view-mode-tabs";

const { Title, Text } = Typography;

export interface ModuleScreenHeaderProps {
  extra?: ReactNode;
  icon: LucideIcon;
  marginBottom?: number;
  subtitle?: string;
  title: string;
  /** When set with `onViewModeChange`, renders list/card toggle in the header. */
  viewMode?: ModuleListViewMode;
  onViewModeChange?: (mode: ModuleListViewMode) => void;
  /**
   * Where to place the list/card toggle relative to `extra` actions.
   * Defaults to `after` (e.g. after New Booking).
   */
  viewModePlacement?: "before" | "after";
}

export function ModuleScreenHeader({
  extra,
  icon,
  marginBottom,
  subtitle,
  title,
  viewMode,
  onViewModeChange,
  viewModePlacement = "after",
}: ModuleScreenHeaderProps) {
  const { token } = theme.useToken();
  const showViewMode = Boolean(viewMode && onViewModeChange);
  const hasActions = showViewMode || Boolean(extra);

  const viewModeTabs =
    showViewMode && viewMode && onViewModeChange ? (
      <ModuleViewModeTabs value={viewMode} onChange={onViewModeChange} />
    ) : null;

  return (
    <div
      className="module-screen-header"
      style={marginBottom !== undefined ? { marginBottom } : undefined}
    >
      <div>
        <div className="module-screen-header__title-row">
          <AppIcon
            icon={icon}
            size={Math.round(Number(token.fontSizeHeading4))}
          />
          <Title level={4} className="module-screen-header__title">
            {title}
          </Title>
        </div>
        {subtitle ? (
          <Text type="secondary" className="module-screen-header__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {hasActions ? (
        <div className="module-screen-header__extra">
          <div className="module-screen-header__actions">
            {viewModePlacement === "before" ? viewModeTabs : null}
            {extra}
            {viewModePlacement === "after" ? viewModeTabs : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
