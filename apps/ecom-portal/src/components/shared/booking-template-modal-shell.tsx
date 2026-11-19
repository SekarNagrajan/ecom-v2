// Modified by Sekar Nagarajan (2026-09-03 18:41)
import { AppModal } from "@solverminds/shared-ui";
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const { Text } = Typography;

export interface BookingTemplateModalShellProps {
  children: ReactNode;
  /** Kept for call-site compatibility; default AppModal header does not render it. */
  icon?: LucideIcon;
  onClose: () => void;
  open: boolean;
  subtitle?: string;
  title: string;
  /** Defaults to lg (1000). Routing pipeline uses xl. */
  dialogSize?: "sm" | "md" | "lg" | "xl" | number;
}

export function BookingTemplateModalShell({
  children,
  onClose,
  open,
  subtitle,
  title,
  dialogSize = "lg",
}: BookingTemplateModalShellProps) {
  return (
    <AppModal
      title={
        subtitle ? (
          <div className="booking-template-modal__title-block">
            <span>{title}</span>
            <Text
              type="secondary"
              className="booking-template-modal__title-sub"
            >
              {subtitle}
            </Text>
          </div>
        ) : (
          title
        )
      }
      open={open}
      onCancel={onClose}
      dialogSize={dialogSize}
      footer={null}
      destroyOnClose
      classNames={{ body: "booking-template-modal__modal-body" }}
    >
      <div className="booking-template-modal">
        <div className="booking-template-modal__body custom-scroll">
          {children}
        </div>
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
