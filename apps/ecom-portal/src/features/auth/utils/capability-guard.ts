// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { redirect } from "@tanstack/react-router";

import i18n from "../../../i18n/config";
import { showPreferenceToast } from "../../theme/utils/show-preference-toast";

const PERMISSION_DENIED_NOTIFICATION_KEY = "ecom-permission-denied";

/**
 * Toast + redirect when a capability guard fails (CRM permission-guard parity).
 */
export function redirectForMissingCapability(message: string): never {
  showPreferenceToast("error", message, {
    key: PERMISSION_DENIED_NOTIFICATION_KEY,
    title: i18n.t("auth:errors.accessDenied"),
    placement: "topRight",
  });

  throw redirect({ to: "/app/dashboard" });
}
