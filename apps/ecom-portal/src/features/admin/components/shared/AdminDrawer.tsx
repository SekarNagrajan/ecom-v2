// Created by Sekar Nagarajan (2026-11-12 13:20)
/**
 * Create / edit / detail drawer shell for the Control Panel: icon + title + meta header, scrolling
 * body of AdminFormSection cards, Cancel + primary footer. Closing a dirty form asks first, the
 * mask/Escape are locked while saving, and focus returns to the trigger on close.
 */
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode, RefObject } from "react";

import { AppIcon } from "../../../../components/icons";

export interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  dialogSize?: ComponentProps<typeof AppDrawer>["dialogSize"];
  /** Disables Cancel, mask and Escape while a mutation is in flight. */
  isPending?: boolean;
  /** When true, closing asks "Discard changes?" first. */
  isDirty?: boolean;
  primaryLabel?: ReactNode;
  primaryIcon?: LucideIcon;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  cancelLabel?: ReactNode;
  /** Replaces the default Cancel + primary footer. Pass `null` for no footer. */
  footer?: ReactNode | null;
  /** Element (or a wrapper around the button) to focus again when the drawer closes. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
}

export function AdminDrawer({
  open,
  onClose,
  icon,
  title,
  subtitle,
  children,
  dialogSize = "md",
  isPending = false,
  isDirty = false,
  primaryLabel = "Save Changes",
  primaryIcon,
  onPrimary,
  primaryDisabled = false,
  cancelLabel = "Cancel",
  footer,
  returnFocusRef,
  className,
}: AdminDrawerProps) {
  const confirm = useConfirm();

  const requestClose = () => {
    if (isPending) return;
    if (isDirty) {
      confirm.show({
        title: "Discard changes?",
        content: "Your unsaved changes will be lost.",
        okText: "Discard",
        cancelText: "Keep editing",
        okButtonProps: { danger: true },
        onOk: onClose,
      });
      return;
    }
    onClose();
  };

  const defaultFooter = (
    <div className="admin-drawer-actions form-step-footer">
      <AppButton onClick={requestClose} disabled={isPending}>
        {cancelLabel}
      </AppButton>
      {onPrimary ? (
        <AppButton
          type="primary"
          icon={primaryIcon ? <AppIcon icon={primaryIcon} size={16} /> : undefined}
          loading={isPending}
          disabled={primaryDisabled}
          onClick={onPrimary}
        >
          {primaryLabel}
        </AppButton>
      ) : null}
    </div>
  );

  return (
    <AppDrawer
      open={open}
      onClose={requestClose}
      placement="right"
      dialogSize={dialogSize}
      destroyOnHidden
      maskClosable={!isPending}
      keyboard={!isPending}
      className={className}
      classNames={{
        header: "admin-drawer-header-bar",
        body: "admin-drawer-body custom-scroll",
        footer: "admin-drawer-footer-bar",
      }}
      styles={{ body: { padding: 0 } }}
      afterOpenChange={(isOpen) => {
        if (isOpen) return;
        const host = returnFocusRef?.current;
        if (!host) return;
        const target = host.matches("button, [tabindex]")
          ? host
          : host.querySelector<HTMLElement>("button, [tabindex]");
        target?.focus();
      }}
      title={
        <div className="admin-drawer-title">
          <span className="admin-drawer-title__icon" aria-hidden>
            <AppIcon icon={icon} size={20} />
          </span>
          <div className="admin-drawer-title__copy">
            <div className="admin-drawer-title__text">{title}</div>
            {subtitle ? (
              <div className="admin-drawer-title__meta">{subtitle}</div>
            ) : null}
          </div>
        </div>
      }
      footer={footer === undefined ? defaultFooter : footer}
    >
      {children}
    </AppDrawer>
  );
}
