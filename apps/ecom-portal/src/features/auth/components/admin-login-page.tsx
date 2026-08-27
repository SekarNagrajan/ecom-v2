// Modified by Sekar Nagarajan (2026-08-27 13:05)
import { useNavigate } from "@tanstack/react-router";

import { AppIcon, Icons } from "../../../components/icons";
import { useAdminLoginController } from "../hooks/use-admin-login-controller";
import { AdminLoginShell } from "./admin-login-shell";

/** Default customer applied on cpanel admin login (parity with tenant scope). */
export const CPANEL_DEFAULT_CUSTOMER = {
  custCode: "CUST-001",
  compName: "Apex Logistics Global",
} as const;

export function AdminLoginPage() {
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
      title="System Administration"
      subtitle="Enter your admin User ID and password to continue."
      icon={Icons.shieldUser}
      submitLabel="Sign In to Control Panel"
      userIdPlaceholder="e.g. admin or sysadmin"
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
              Default customer account
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
