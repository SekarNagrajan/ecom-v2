// Created by Sekar Nagarajan (2026-11-12 13:20)
/**
 * Token-coloured status pill for grid cells and context strips. Use antd `Tag` for codes; use
 * this for states (Enabled / Active / Restricted / Urgent …) so every section reads the same.
 */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon } from "../../../../components/icons";

export type AdminPillTone =
  | "success"
  | "neutral"
  | "warning"
  | "error"
  | "info"
  | "processing"
  | "primary";

export interface AdminStatusPillProps {
  tone: AdminPillTone;
  children: ReactNode;
  icon?: LucideIcon;
  /** Leading colour dot (default on when no icon is given). */
  dot?: boolean;
  className?: string;
  title?: string;
}

export function AdminStatusPill({
  tone,
  children,
  icon,
  dot,
  className,
  title,
}: AdminStatusPillProps) {
  const showDot = dot ?? !icon;
  return (
    <span
      className={["admin-pill", `admin-pill--${tone}`, className]
        .filter(Boolean)
        .join(" ")}
      title={title}
    >
      {icon ? (
        <AppIcon icon={icon} size={12} className="admin-pill__icon" />
      ) : showDot ? (
        <span  aria-hidden />
      ) : null}
      {children}
    </span>
  );
}
