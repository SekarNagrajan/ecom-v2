// Modified by Sekar Nagarajan (2026-09-28 16:17)
import type { CSSProperties, ReactNode } from "react";
import { Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";

const { Text } = Typography;

export function PreferenceSectionCard({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="a11y-section-card">{children}</div>;
}

export function PreferenceSectionRow({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="a11y-section-card__row">{children}</div>;
}

export function PreferenceCategoryLabel({ children }: { children: ReactNode }) {
  return <Text className="a11y-category-label">{children}</Text>;
}

export function PreferenceFieldHeader({
  title,
  description,
  action,
  titleExtra,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  titleExtra?: ReactNode;
}) {
  return (
    <div
      className={[
        "a11y-field-header",
        action ? "a11y-field-header--with-action" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="a11y-field-header__copy">
        <div className="a11y-field-header__title-row">
          <Text className="a11y-field-header__title">{title}</Text>
          {titleExtra}
        </div>
        <Text className="a11y-field-header__description">{description}</Text>
      </div>
      {action}
    </div>
  );
}

export function SelectableTile({
  selected,
  onClick,
  children,
  className,
  ariaLabel,
  style,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      className={["a11y-tile", selected ? "a11y-tile--selected" : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      style={style}
    >
      {children}
      {selected ? (
        <span className="a11y-tile__check" aria-hidden>
          <AppIcon icon={Icons.check} size={11} />
        </span>
      ) : null}
    </button>
  );
}

export function AccentSwatch({
  color,
  label,
  selected,
  onClick,
}: {
  color: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={["a11y-swatch", selected ? "a11y-swatch--selected" : ""]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundColor: color }}
      aria-label={label}
      aria-pressed={selected}
      title={label}
      onClick={onClick}
    >
      {selected ? <AppIcon icon={Icons.check} size={14} /> : null}
    </button>
  );
}

export function ThemeModePreview({
  mode,
}: {
  mode: "light" | "dark" | "auto";
}) {
  return (
    <div
      className={[
        "a11y-mode-card__preview",
        `a11y-mode-card__preview--${mode}`,
      ].join(" ")}
      aria-hidden
    >
      <div className="a11y-mode-card__preview-bars">
        <span style={{ width: "72%" }} />
        <span style={{ width: "90%" }} />
        <span style={{ width: "58%" }} />
      </div>
    </div>
  );
}
