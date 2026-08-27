// Modified by Sekar Nagarajan (2026-08-26 18:52)
import { AppModal } from "@solverminds/shared-ui";
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon } from "../icons";

const { Text } = Typography;

export interface BookingTemplateModalShellProps {
  children: ReactNode;
  icon: LucideIcon;
  onClose: () => void;
  open: boolean;
  subtitle: string;
  title: string;
  /** Defaults to lg (1000). Routing pipeline uses xl. */
  dialogSize?: "sm" | "md" | "lg" | "xl" | number;
}

export function BookingTemplateModalShell({
  children,
  icon,
  onClose,
  open,
  subtitle,
  title,
  dialogSize = "lg",
}: BookingTemplateModalShellProps) {
  return (
    <AppModal
      title={null}
      open={open}
      onCancel={onClose}
      closable={false}
      dialogSize={dialogSize}
      footer={null}
      destroyOnClose
      classNames={{ body: "booking-template-modal__modal-body" }}
    >
      <div className="booking-template-modal">
        <div className="booking-template-modal__header">
          <div className="booking-template-modal__header-main">
            <span className="booking-template-modal__header-icon app-icon-inherit primary-surface">
              <AppIcon icon={icon} size={20} />
            </span>
            <div>
              <Text strong className="booking-template-modal__header-title">
                {title}
              </Text>
              <Text className="booking-template-modal__header-subtitle">
                {subtitle}
              </Text>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="booking-template-modal__close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="booking-template-modal__body">{children}</div>
      </div>
    </AppModal>
  );
}

interface TemplateNameCellProps {
  name: string;
}

export function TemplateNameCell({ name }: TemplateNameCellProps) {
  return (
    <div className="booking-template-modal__name-cell">
      <Text strong>{name}</Text>
    </div>
  );
}

interface TemplateRouteCellProps {
  value: string;
}

export function TemplateRouteCell({ value }: TemplateRouteCellProps) {
  return (
    <div className="booking-template-modal__route-cell">
      <Text>{value}</Text>
    </div>
  );
}
