// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Icons } from "../../../components/icons";
import { useAdminLoginController } from "../hooks/use-admin-login-controller";
import { AdminLoginShell } from "./admin-login-shell";

export function VendorLoginPage() {
  const { t } = useTranslation("auth");
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
      title={t("vendorLogin.title")}
      subtitle={t("vendorLogin.subtitle")}
      icon={Icons.building}
      submitLabel={t("vendorLogin.submit")}
      userIdPlaceholder={t("vendorLogin.userIdPlaceholder")}
      control={control}
      errors={errors}
      handleSubmit={handleSubmit}
      serverError={serverError}
      isSubmitting={isSubmitting}
    />
  );
}
