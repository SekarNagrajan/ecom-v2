// Modified by Sekar Nagarajan (2026-11-12 17:10)
/**
 * Settings row for singleton configuration screens: title + description on the left, a compact
 * control (switch, number, select) on the right; `stacked` puts a full-width control underneath.
 * `modified` marks an unsaved change and `onRevert` offers a one-click return to the saved value.
 */
import { AppButton } from "@solverminds/shared-ui";
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useId, type ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import { AdminStatusPill } from "./AdminStatusPill";

const { Text } = Typography;

export interface AdminSettingRowProps {
  title: ReactNode;
  description?: ReactNode;
  /** Decorative leading icon. */
  icon?: LucideIcon;
  /** The control, or a render callback receiving ids for aria-labelledby / aria-describedby. */
  control: ReactNode | ((ids: { titleId: string; descriptionId: string }) => ReactNode);
  /** Full-width control under the copy instead of inline on the right. */
  stacked?: boolean;
  /** Unsaved change on this row. */
  modified?: boolean;
  /** Shown as a "Revert" link while `modified`. */
  onRevert?: () => void;
  className?: string;
}

export function AdminSettingRow({
  title,
  description,
  icon,
  control,
  stacked = false,
  modified = false,
  onRevert,
  className,
}: AdminSettingRowProps) {
  const titleId = useId();
  const descriptionId = useId();
  const rendered = typeof control === "function" ? control({ titleId, descriptionId }) : control;

  return (
    <div
      className={[
        "admin-setting-row",
        stacked ? "admin-setting-row--stacked" : "",
        modified ? "admin-setting-row--modified" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <span className="admin-setting-row__icon" aria-hidden>
          <AppIcon icon={icon} size={16} />
        </span>
      ) : null}
      <div className="admin-setting-row__copy">
        <div className="admin-setting-row__title-row">
          <Text id={titleId} className="admin-setting-row__title">
            {title}
          </Text>
          {modified ? (
            <AdminStatusPill tone="warning" dot={false} className="admin-setting-row__badge">
              Modified
            </AdminStatusPill>
          ) : null}
          {modified && onRevert ? (
            <AppButton
              type="link"
              size="small"
              className="admin-setting-row__revert"
              icon={<AppIcon icon={Icons.undo2} size={12} />}
              onClick={onRevert}
            >
              Revert
            </AppButton>
          ) : null}
        </div>
        {description ? (
          <Text id={descriptionId} type="secondary" className="admin-setting-row__description">
            {description}
          </Text>
        ) : null}
      </div>
      <div className="admin-setting-row__control">{rendered}</div>
    </div>
  );
}
