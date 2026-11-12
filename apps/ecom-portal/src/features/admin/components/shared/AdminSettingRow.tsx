// Created by Sekar Nagarajan (2026-11-12 13:40)
/**
 * Settings row for singleton configuration screens: title + description on the left, a compact
 * control (switch, number, select) on the right; `stacked` puts a full-width control underneath.
 */
import { Typography } from "antd";
import { useId, type ReactNode } from "react";

const { Text } = Typography;

export interface AdminSettingRowProps {
  title: ReactNode;
  description?: ReactNode;
  /** The control. Receives nothing; wire `aria-labelledby`/`aria-describedby` via the render callback if needed. */
  control: ReactNode | ((ids: { titleId: string; descriptionId: string }) => ReactNode);
  /** Full-width control under the copy instead of inline on the right. */
  stacked?: boolean;
  className?: string;
}

export function AdminSettingRow({
  title,
  description,
  control,
  stacked = false,
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
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="admin-setting-row__copy">
        <Text id={titleId} className="admin-setting-row__title">
          {title}
        </Text>
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
