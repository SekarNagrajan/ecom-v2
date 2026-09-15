// Modified by Sekar Nagarajan (2026-09-15 13:01)
import { Segmented, Tooltip, theme } from "antd";
import { startTransition, type CSSProperties, type ReactNode } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { ScheduleViewMode } from "../hooks/use-schedule-view-mode";

const VIEW_MODE_TOOLTIP_DELAY = 0.5;
const VIEW_MODE_ICON_SIZE = 18;

function ViewModeIcon({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title} mouseEnterDelay={VIEW_MODE_TOOLTIP_DELAY}>
      <span className="schedule-view-mode-tabs__icon">{children}</span>
    </Tooltip>
  );
}

export interface ScheduleViewModeTabsProps {
  value: ScheduleViewMode;
  onChange: (mode: ScheduleViewMode) => void;
}

/**
 * List / card / calendar switcher for the Available Sailings results bar.
 * Unselected: white track + dark icons; selected: primary + white icons.
 */
export function ScheduleViewModeTabs({
  value,
  onChange,
}: ScheduleViewModeTabsProps) {
  const { token } = theme.useToken();

  const rootStyle = {
    ["--module-view-mode-h" as string]: `${token.controlHeight}px`,
  } as CSSProperties;

  return (
    <Segmented
      className="module-view-mode-tabs schedule-view-mode-tabs"
      size="middle"
      value={value}
      aria-label="Schedule view mode"
      style={rootStyle}
      onChange={(next) => {
        startTransition(() => {
          if (next === "card" || next === "calendar" || next === "list") {
            onChange(next);
          }
        });
      }}
      options={[
        {
          value: "list",
          icon: (
            <ViewModeIcon title="List View">
              <AppIcon icon={Icons.list} size={VIEW_MODE_ICON_SIZE} />
            </ViewModeIcon>
          ),
        },
        {
          value: "card",
          icon: (
            <ViewModeIcon title="Card View">
              <AppIcon icon={Icons.layoutGrid} size={VIEW_MODE_ICON_SIZE} />
            </ViewModeIcon>
          ),
        },
        {
          value: "calendar",
          icon: (
            <ViewModeIcon title="Calendar View">
              <AppIcon icon={Icons.calendar} size={VIEW_MODE_ICON_SIZE} />
            </ViewModeIcon>
          ),
        },
      ]}
    />
  );
}
