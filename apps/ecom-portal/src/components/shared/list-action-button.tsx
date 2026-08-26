// Modified by Sekar Nagarajan (2026-08-25 18:30)
import { AppButton } from "@solverminds/shared-ui";
import { Tooltip } from "antd";
import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  AppIcon,
  type AppIconActionTone,
  type AppIconProps,
} from "../icons/app-icon";

const ACTION_TOOLTIP_DELAY = 0.5; // 500ms

export interface ListActionButtonProps {
  icon: ReactNode;
  title: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  danger?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  /** Semantic Lucide tone; `danger` forces `reject` */
  tone?: AppIconActionTone;
}

function withGridActionIcon(
  icon: ReactNode,
  tone?: AppIconActionTone,
): ReactNode {
  if (isValidElement<AppIconProps>(icon) && icon.type === AppIcon) {
    return cloneElement(icon as ReactElement<AppIconProps>, {
      gridAction: true,
      tone: tone ?? icon.props.tone,
    });
  }
  return icon;
}

export function ListActionButton({
  icon,
  title,
  onClick,
  danger,
  disabled,
  ariaLabel,
  tone,
}: ListActionButtonProps) {
  const resolvedTone: AppIconActionTone | undefined = danger
    ? "reject"
    : tone;

  return (
    <Tooltip title={title} mouseEnterDelay={ACTION_TOOLTIP_DELAY}>
      <AppButton
        type="link"
        size="small"
        icon={withGridActionIcon(icon, resolvedTone)}
        aria-label={ariaLabel ?? title}
        danger={danger}
        disabled={disabled}
        onClick={onClick}
        className="list-action-button"
      />
    </Tooltip>
  );
}

interface ListActionsRowProps {
  children: ReactNode;
}

export function ListActionsRow({ children }: ListActionsRowProps) {
  return <div className="list-actions-row">{children}</div>;
}
