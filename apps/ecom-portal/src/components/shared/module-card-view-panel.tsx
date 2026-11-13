// Modified by Sekar Nagarajan (2026-09-15 12:15)
import type { ReactNode } from "react";

export interface ModuleCardViewPanelProps {
  /** When true, shows the outlined card-view frame. List mode stays borderless. */
  active: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Outlined host for module card grids (Booking / SI / BL).
 * Cards render inside this panel; list/AG Grid mode stays unframed.
 */
export function ModuleCardViewPanel({
  active,
  children,
  className,
}: ModuleCardViewPanelProps) {
  const classes = [
    "module-card-view-panel",
    active ? "module-card-view-panel--active" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
