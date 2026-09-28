// Created by Sekar Nagarajan (2026-09-28 16:17)
import { resolveToastDuration } from "@solverminds/shared-ui/providers";
import { notification } from "antd";
import type { ReactNode } from "react";

import { useAppConfigStore } from "../stores/app-config.store";

type ToastType = "success" | "info" | "warning" | "error";

/**
 * Static toast helper for non-hook call sites (guards, utilities).
 * Reads notification timing from the persisted app config store.
 */
export function showPreferenceToast(
  type: ToastType,
  description: ReactNode,
  options?: {
    key?: string;
    title?: ReactNode;
    placement?: "top" | "topRight" | "bottom" | "bottomRight";
  },
): void {
  const notifications = useAppConfigStore.getState().config.notifications;
  const duration = resolveToastDuration(type, notifications);

  notification[type]({
    key: options?.key,
    title:
      options?.title ?? type.charAt(0).toUpperCase() + type.slice(1),
    description,
    placement: options?.placement ?? "topRight",
    duration,
    closable: true,
  });
}
