// Modified by Sekar Nagarajan (2026-09-15 12:00)
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Segmented, Tooltip, theme } from "antd";
import { startTransition, type CSSProperties, type ReactNode } from "react";

import type { ModuleListViewMode } from "./hooks/use-module-view-mode";

const VIEW_MODE_TOOLTIP_DELAY = 0.5;
/** Match AppButton / header action icon size (16px). */
const VIEW_MODE_ICON_SIZE = 16;

function ViewModeIcon({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title} mouseEnterDelay={VIEW_MODE_TOOLTIP_DELAY}>
      <span className="module-view-mode-tabs__icon">{children}</span>
    </Tooltip>
  );
}

export interface ModuleViewModeTabsProps {
  value: ModuleListViewMode;
  onChange: (mode: ModuleListViewMode) => void;
}

/**
 * Icon-only list/card switcher sized to align with module header AppButtons.
 */
export function ModuleViewModeTabs({
  value,
  onChange,
}: ModuleViewModeTabsProps) {
  const { token } = theme.useToken();

  const rootStyle = {
    ["--module-view-mode-h" as string]: `${token.controlHeight}px`,
  } as CSSProperties;

  return (
    <Segmented
      className="module-view-mode-tabs"
      size="middle"
      value={value}
      aria-label="View mode"
      style={rootStyle}
      onChange={(next) => {
        startTransition(() => {
          onChange(next === "card" ? "card" : "list");
        });
      }}
      options={[
        {
          value: "list",
          icon: (
            <ViewModeIcon title="List View">
              <UnorderedListOutlined
                style={{ fontSize: VIEW_MODE_ICON_SIZE }}
              />
            </ViewModeIcon>
          ),
        },
        {
          value: "card",
          icon: (
            <ViewModeIcon title="Card View">
              <AppstoreOutlined style={{ fontSize: VIEW_MODE_ICON_SIZE }} />
            </ViewModeIcon>
          ),
        },
      ]}
    />
  );
}
