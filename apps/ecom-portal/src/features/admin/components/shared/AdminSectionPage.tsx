// Created by Sekar Nagarajan (2026-11-12 12:40)
/**
 * Section chrome rendered inside the Control Panel tab body: a light section header (title,
 * subtitle, record count, right-aligned actions), the body, and an optional sticky footer.
 * The module-level ModuleScreenHeader lives in AdminShell, so this header is deliberately lighter.
 * Title / subtitle default to the active section's canonical (translated) copy.
 */
import { Badge, Typography } from "antd";
import { useId, type ReactNode } from "react";

import { useAdminLabels } from "../../hooks/use-admin-labels";
import { useAdminSection } from "../../hooks/use-admin-section";

const { Title, Text } = Typography;

export interface AdminSectionPageProps {
  children: ReactNode;
  /** Right-aligned header actions (one primary AppButton + optional secondaries). */
  extra?: ReactNode;
  /** Sticky footer slot — usually an AdminFormFooter. */
  footer?: ReactNode;
  /** Red count badge next to the title (list sections). */
  recordCount?: number;
  /** Overrides the registry title. */
  title?: string;
  /** Overrides the registry subtitle; pass `null` to hide it. */
  subtitle?: string | null;
  /** Lets the body scroll on its own (grids, boards). */
  scrollBody?: boolean;
  className?: string;
}

export function AdminSectionPage({
  children,
  extra,
  footer,
  recordCount,
  title,
  subtitle,
  scrollBody = false,
  className,
}: AdminSectionPageProps) {
  const { section } = useAdminSection();
  const labels = useAdminLabels();
  const headingId = useId();

  const resolvedTitle = title ?? labels.sectionTitle(section);
  const resolvedSubtitle =
    subtitle === undefined ? labels.sectionSubtitle(section) : subtitle;
  const showRecordCount =
    typeof recordCount === "number" && Number.isFinite(recordCount);

  const bodyClassName = [
    "admin-section__body",
    scrollBody ? "admin-section__body--scroll custom-scroll" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={["admin-section", className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <header className="admin-section__header">
        <div className="admin-section__heading">
          <Title level={5} id={headingId} className="admin-section__title">
            {resolvedTitle}
            {showRecordCount ? (
              <Badge
                count={recordCount}
                overflowCount={9999}
                showZero
                className="module-screen-header__record-count admin-section__count"
                title={`${recordCount} record${recordCount === 1 ? "" : "s"}`}
              />
            ) : null}
          </Title>
          {resolvedSubtitle ? (
            <Text type="secondary" className="admin-section__subtitle">
              {resolvedSubtitle}
            </Text>
          ) : null}
        </div>
        {extra ? <div className="admin-section__extra">{extra}</div> : null}
      </header>
      <div className={bodyClassName}>{children}</div>
      {footer ? <div className="admin-section__footer">{footer}</div> : null}
    </section>
  );
}
