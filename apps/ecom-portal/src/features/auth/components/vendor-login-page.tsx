// Modified by Sekar Nagarajan (2026-08-27 12:23)
import { useNavigate } from "@tanstack/react-router";

import { Icons } from "../../../components/icons";
import { useAdminLoginController } from "../hooks/use-admin-login-controller";
import { AdminLoginShell } from "./admin-login-shell";

export function VendorLoginPage() {
  const navigate = useNavigate();

  const { form, handleSubmit, serverError, isSubmitting } =
    useAdminLoginController({
      entryType: "eadmin",
      onSuccess: () => {
        navigate({ to: "/app/vendor-approvals" });
      },
    });

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <AdminLoginShell
      entryType="eadmin"
      title="Agency Administration"
      subtitle="Vendor and agency admin portal access."
      icon={Icons.building}
      submitLabel="Sign In to Agency Portal"
      userIdPlaceholder="e.g. vendor or agency"
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      serverError={serverError}
      isSubmitting={isSubmitting}
    />
  );
}
