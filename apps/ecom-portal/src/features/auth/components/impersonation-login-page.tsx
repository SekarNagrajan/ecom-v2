// Modified by Sekar Nagarajan (2026-09-29 12:40)
import type { SubCustomerAccount } from "@solverminds/auth";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Icons } from "../../../components/icons";
import { useAdminLoginController } from "../hooks/use-admin-login-controller";
import { AdminLoginShell } from "./admin-login-shell";
import { CustomerPickerModal } from "./customer-picker-modal";

export function ImpersonationLoginPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [customerList, setCustomerList] = useState<SubCustomerAccount[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const { form, handleSubmit, serverError, isSubmitting } =
    useAdminLoginController({
      entryType: "admin",
      onSuccess: (customers) => {
        if (customers && customers.length > 0) {
          setCustomerList(customers);
          setShowPicker(true);
        } else {
          navigate({ to: "/app/dashboard" });
        }
      },
    });

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <>
      <AdminLoginShell
        entryType="admin"
        title={t("impersonationLogin.title")}
        subtitle={t("impersonationLogin.subtitle")}
        icon={Icons.userCog}
        submitLabel={t("impersonationLogin.submit")}
        userIdPlaceholder={t("impersonationLogin.userIdPlaceholder")}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        serverError={serverError}
        isSubmitting={isSubmitting}
      />

      <CustomerPickerModal
        open={showPicker}
        customerList={customerList}
        onSelect={() => {
          setShowPicker(false);
          navigate({ to: "/app/dashboard" });
        }}
        onCancel={() => setShowPicker(false)}
      />
    </>
  );
}
