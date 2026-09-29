// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useAdminLoginController } from "../hooks/use-admin-login-controller";
import { AdminLoginShell } from "./admin-login-shell";

/** Default customer applied on cpanel admin login (parity with tenant scope). */
export const CPANEL_DEFAULT_CUSTOMER = {
  custCode: "CUST-001",
  compName: "Apex Logistics Global",
} as const;

export function AdminLoginPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const { form, handleSubmit, serverError, isSubmitting } =
    useAdminLoginController({
      entryType: "cpanel",
      onSuccess: () => {
        navigate({
          to: "/app/admin",
          search: { section: "special-privileges" },
        } as never);
      },
    });

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <AdminLoginShell
      entryType="cpanel"
      title={t("adminLogin.title")}
      subtitle={t("adminLogin.subtitle")}
      icon={Icons.shieldUser}
      submitLabel={t("adminLogin.submit")}
      userIdPlaceholder={t("adminLogin.userIdPlaceholder")}
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      serverError={serverError}
      isSubmitting={isSubmitting}
      infoBanner={
        <div
          className="admin-login-page__default-customer"
          role="status"
          aria-live="polite"
        >
          <AppIcon icon={Icons.building} size={18} />
          <div>
            <span className="admin-login-page__default-customer-title">
              {t("adminLogin.defaultCustomerTitle")}
            </span>
            <span className="admin-login-page__default-customer-value">
              {CPANEL_DEFAULT_CUSTOMER.custCode} —{" "}
              {CPANEL_DEFAULT_CUSTOMER.compName}
            </span>
          </div>
        </div>
      }
    />
  );
}
