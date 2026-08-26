// Modified by Sekar Nagarajan (2026-08-25 17:25)
import { AppSwitch } from "@solverminds/shared-ui";
import { useAppConfig } from "@solverminds/shared-ui/hooks";
import { Tooltip } from "antd";
import { useTransition } from "react";

import { useThemePreferences } from "../../features/theme/providers/theme-preferences-provider";
import { AppIcon, Icons } from "../icons";

export function HeaderThemeToggle() {
  const { effectiveThemeMode } = useAppConfig();
  const { updatePreference } = useThemePreferences();
  const [, startTransition] = useTransition();

  const isDark = effectiveThemeMode === "dark";
  const tooltipTitle = isDark ? "Switch To Light Theme" : "Switch To Dark Theme";

  const handleChange = (checked: boolean) => {
    startTransition(() => {
      updatePreference("themeMode", checked ? "dark" : "light");
    });
  };

  return (
    <Tooltip title={tooltipTitle}>
      <span className="app-header-theme-toggle">
        <AppSwitch
          aria-label={tooltipTitle}
          checked={isDark}
          onChange={handleChange}
          checkedChildren={<AppIcon icon={Icons.moon} size={12} />}
          unCheckedChildren={<AppIcon icon={Icons.sun} size={12} />}
        />
      </span>
    </Tooltip>
  );
}
