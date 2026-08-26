// Modified by Sekar Nagarajan (2026-08-25 18:15)
/**
 * Resolve dashboard chart/series tone keys to Ant Design tokens (agenct — no hex in UI).
 */
import { theme } from "antd";

export type DashboardTone =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple"
  | "neutral";

export function useDashboardToneColor(tone: DashboardTone | string): string {
  const { token } = theme.useToken();
  switch (tone) {
    case "primary":
      return token.colorPrimary;
    case "success":
      return token.colorSuccess;
    case "warning":
      return token.colorWarning;
    case "error":
      return token.colorError;
    case "info":
      return token.colorInfo;
    case "purple":
      return token.purple;
    case "neutral":
      return token.colorTextQuaternary;
    default:
      return token.colorPrimary;
  }
}

export function resolveDashboardTone(
  token: ReturnType<typeof theme.useToken>["token"],
  tone: DashboardTone | string,
): string {
  switch (tone) {
    case "primary":
      return token.colorPrimary;
    case "success":
      return token.colorSuccess;
    case "warning":
      return token.colorWarning;
    case "error":
      return token.colorError;
    case "info":
      return token.colorInfo;
    case "purple":
      return token.purple;
    case "neutral":
      return token.colorTextQuaternary;
    default:
      return token.colorPrimary;
  }
}
