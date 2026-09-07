// Modified by Sekar Nagarajan (2026-09-07 17:24)
import { notification } from "antd";
import { redirect } from "@tanstack/react-router";

const PERMISSION_DENIED_NOTIFICATION_KEY = "ecom-permission-denied";

/**
 * Toast + redirect when a capability guard fails (CRM permission-guard parity).
 */
export function redirectForMissingCapability(message: string): never {
  notification.error({
    key: PERMISSION_DENIED_NOTIFICATION_KEY,
    title: "Access Denied",
    description: message,
    placement: "topRight",
  });

  throw redirect({ to: "/app/dashboard" });
}
