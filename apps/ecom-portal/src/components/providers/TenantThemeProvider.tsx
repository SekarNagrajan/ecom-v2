// Modified by Sekar Nagarajan (2026-08-25 17:25)
/**
 * Thin portal shell — CRM parity: Ant Design theme comes from the root
 * AppConfigProvider (buildAntdTheme + darkAlgorithm). This provider only
 * injects portal GlobalThemeStyles, AppIconStyles, and dynamic fonts.
 */
import { useTenantStore } from "@solverminds/auth";
import React, { useEffect } from "react";

import { useAppConfigStore } from "../../features/theme/stores/app-config.store";
import { AppIconStyles } from "../icons/app-icon-styles";
import { GlobalThemeStyles } from "../shared/global-theme-styles";

interface TenantThemeProviderProps {
  children: React.ReactNode;
}

export function TenantThemeProvider({ children }: TenantThemeProviderProps) {
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const appConfig = useAppConfigStore((state) => state.config);

  const fontFamily =
    appConfig?.fontFamily ||
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const isCompact = appConfig?.density === "compact";
  const isComfortable = appConfig?.density === "comfortable";
  const fontSize =
    appConfig?.baseFontSize ?? (isCompact ? 13 : isComfortable ? 15 : 14);

  useEffect(() => {
    const fontId = "dynamic-google-fonts";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto+Flex:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    document.body.style.fontFamily = fontFamily;

    let styleEl = document.getElementById(
      "dynamic-font-override",
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-font-override";
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      html {
        font-size: ${fontSize}px;
        font-family: ${fontFamily};
      }
      body, #root,
      .ag-theme-alpine, .ag-root-wrapper, .ag-header, .ag-cell,
      .ag-theme-quartz, .ag-theme-quartz-dark,
      .ant-typography, .ant-btn, .ant-input, .ant-select, .ant-select-selector,
      .ant-menu, .ant-table, .ant-card, .ant-tabs, .ant-modal, .ant-drawer,
      .ant-form, .ant-segmented, .ant-pagination, .ant-dropdown, .ant-picker,
      .ant-steps, .ant-tag, .ant-badge, .ant-collapse, .ant-list, .ant-statistic {
        font-family: ${fontFamily} !important;
      }
      body, #root {
        font-size: ${fontSize}px;
      }
      .ag-theme-alpine, .ag-theme-quartz, .ag-theme-quartz-dark,
      .ag-root-wrapper, .ag-header, .ag-cell, .ag-header-cell-text {
        font-size: inherit;
      }
    `;
  }, [fontFamily, fontSize, activeTenant.id]);

  return (
    <>
      <AppIconStyles />
      <GlobalThemeStyles />
      {children}
    </>
  );
}
