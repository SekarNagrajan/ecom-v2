// Modified by Sekar Nagarajan (2026-08-25 17:25)
/**
 * Portal chart tokens — CRM-parity adapter (mirrors shared-ui useChartTokens).
 * Prefer these over hardcoded hex in ECharts / dashboard analytics.
 */
import { theme } from "antd";

export interface ChartTokens {
  colorText: string;
  colorTextSecondary: string;
  colorTextTertiary: string;
  colorBorder: string;
  colorBorderSecondary: string;
  colorBgContainer: string;
  colorBgElevated: string;
  colorBgLayout: string;
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  fontFamily: string;
  fontSize: number;
}

export function useChartTokens(): ChartTokens {
  const { token } = theme.useToken();
  return {
    colorText: token.colorText,
    colorTextSecondary: token.colorTextSecondary,
    colorTextTertiary: token.colorTextTertiary,
    colorBorder: token.colorBorder,
    colorBorderSecondary: token.colorBorderSecondary,
    colorBgContainer: token.colorBgContainer,
    colorBgElevated: token.colorBgElevated,
    colorBgLayout: token.colorBgLayout,
    colorPrimary: token.colorPrimary,
    colorSuccess: token.colorSuccess,
    colorWarning: token.colorWarning,
    colorError: token.colorError,
    colorInfo: token.colorInfo,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
  };
}
