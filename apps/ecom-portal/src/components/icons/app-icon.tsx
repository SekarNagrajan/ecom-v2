// Modified by Sekar Nagarajan (2026-08-26 11:45)
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

/**
 * Semantic action tones for Lucide icons (agenct — token colors via AppIconStyles).
 * Each tone maps to a unique token color (no shared palette between actions).
 */
export type AppIconActionTone =
  | "view"
  | "print"
  | "edit"
  | "create"
  | "delete"
  | "approve"
  | "reject"
  | "navigate"
  | "track"
  | "history"
  | "download"
  | "muted";

/** One CSS class per tone — colors defined uniquely in AppIconStyles. */
const ACTION_TONE_CLASS: Record<AppIconActionTone, string> = {
  view: "app-icon-tone-view",
  print: "app-icon-tone-print",
  edit: "app-icon-tone-edit",
  create: "app-icon-tone-create",
  delete: "app-icon-tone-delete",
  approve: "app-icon-tone-approve",
  reject: "app-icon-tone-reject",
  navigate: "app-icon-tone-navigate",
  track: "app-icon-tone-track",
  history: "app-icon-tone-history",
  download: "app-icon-tone-download",
  muted: "app-icon-tone-muted",
};

export interface AppIconProps {
  "aria-label"?: string;
  className?: string;
  /** AG-Grid / DataView Actions column: hover tint + pointer affordance */
  gridAction?: boolean;
  icon: LucideIcon;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  /** Semantic color for this action (view/print/edit/…) — each tone is unique */
  tone?: AppIconActionTone;
  /** `navLocked` = public sidebar auth-required modules (muted, no primary hover) */
  variant?: "default" | "nav" | "navLocked" | "action";
}

export function AppIcon({
  "aria-label": ariaLabel,
  className = "",
  gridAction = false,
  icon: Icon,
  size = 18,
  strokeWidth = 2,
  style,
  tone,
  variant = "default",
}: AppIconProps) {
  const classes = [
    "app-icon",
    gridAction ? "app-icon-grid-action" : "",
    variant === "action" || tone ? "app-icon-action" : "",
    tone ? ACTION_TONE_CLASS[tone] : "",
    variant === "nav" ? "app-icon-nav" : "",
    variant === "navLocked" ? "app-icon-nav-locked" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!Icon) {
    return <span className={classes} style={style} aria-hidden />;
  }

  return (
    <span className={classes} style={style}>
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        color="currentColor"
        aria-hidden={ariaLabel ? undefined : true}
        aria-label={ariaLabel}
      />
    </span>
  );
}
