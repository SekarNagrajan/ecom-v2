// Created by Sekar Nagarajan (2026-11-12 13:20)
/**
 * Card that groups related fields inside a drawer or page form: numbered step or icon, title,
 * hint and an optional right-hand slot (same anatomy as the user-creation upsert drawer).
 */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon } from "../../../../components/icons";

export interface AdminFormSectionProps {
  title: ReactNode;
  hint?: ReactNode;
  step?: number;
  icon?: LucideIcon;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminFormSection({
  title,
  hint,
  step,
  icon,
  extra,
  children,
  className,
}: AdminFormSectionProps) {
  return (
    <section className={["admin-form-section", className].filter(Boolean).join(" ")}>
      <header className="admin-form-section__header">
        {typeof step === "number" ? (
          <span className="admin-form-section__step" aria-hidden>
            {step}
          </span>
        ) : icon ? (
          <span className="admin-form-section__icon" aria-hidden>
            <AppIcon icon={icon} size={16} />
          </span>
        ) : null}
        <div className="admin-form-section__heading">
          <h3 className="admin-form-section__title">{title}</h3>
          {hint ? <p className="admin-form-section__hint">{hint}</p> : null}
        </div>
        {extra ? <div className="admin-form-section__extra">{extra}</div> : null}
      </header>
      <div className="admin-form-section__body">{children}</div>
    </section>
  );
}
