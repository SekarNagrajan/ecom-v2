// Created by Sekar Nagarajan (2026-11-12 13:20)
/**
 * Footer for singleton / bulk edit screens: dirty hint on the left, Cancel + primary Save on the
 * right. Buttons are disabled while the form is clean; Cancel is never `danger`.
 */
import { AppButton } from "@solverminds/shared-ui";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";

export interface AdminFormFooterProps {
  isDirty: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveIcon?: LucideIcon;
  /** Number of pending changes; drives the default hint text. */
  dirtyCount?: number;
  /** Overrides the default hint. */
  hint?: ReactNode;
  /** Extra content on the left (next to the hint). */
  extra?: ReactNode;
  className?: string;
}

function defaultHint(isDirty: boolean, dirtyCount?: number): ReactNode {
  if (!isDirty) return null;
  if (typeof dirtyCount === "number" && dirtyCount > 0) {
    return `${dirtyCount} unsaved change${dirtyCount === 1 ? "" : "s"}`;
  }
  return "You have unsaved changes";
}

export function AdminFormFooter({
  isDirty,
  isSaving,
  onCancel,
  onSave,
  saveLabel = "Save Changes",
  cancelLabel = "Cancel",
  saveIcon = Icons.save,
  dirtyCount,
  hint,
  extra,
  className,
}: AdminFormFooterProps) {
  const resolvedHint = hint === undefined ? defaultHint(isDirty, dirtyCount) : hint;

  return (
    <div
      className={["admin-form-footer", "form-step-footer", className]
        .filter(Boolean)
        .join(" ")}
    >
     
      <div className="admin-form-footer__actions">
        <AppButton danger onClick={onCancel} disabled={!isDirty || isSaving}>
          {cancelLabel}
        </AppButton>
        <AppButton
          type="primary"
          icon={<AppIcon icon={saveIcon} size={16} />}
          loading={isSaving}
          disabled={!isDirty}
          onClick={onSave}
        >
          {saveLabel}
        </AppButton>
      </div>
    </div>
  );
}
