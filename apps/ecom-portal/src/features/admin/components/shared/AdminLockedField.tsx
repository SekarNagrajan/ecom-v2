// Created by Sekar Nagarajan (2026-11-12 13:20)
/**
 * Read-only identity block for drawer edit mode (e.g. Ref No, Port / Terminal) — values that are
 * part of the record's server key and cannot change after creation.
 */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";

export interface AdminLockedFieldProps {
  label: ReactNode;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  badge?: string;
  className?: string;
}

export function AdminLockedField({
  label,
  value,
  icon = Icons.lock,
  hint,
  badge = "Locked",
  className,
}: AdminLockedFieldProps) {
  return (
    <div className={["admin-locked-field", className].filter(Boolean).join(" ")}>
      <span className="admin-locked-field__icon" aria-hidden>
        <AppIcon icon={icon} size={16} />
      </span>
      <div className="admin-locked-field__copy">
        <span className="admin-locked-field__label">{label}</span>
        <span className="admin-locked-field__value">{value}</span>
        {hint ? <span className="admin-locked-field__hint">{hint}</span> : null}
      </div>
      <span className="admin-locked-field__badge">{badge}</span>
    </div>
  );
}
