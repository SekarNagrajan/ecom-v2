// Modified by Sekar Nagarajan (2026-08-27 12:23)
import type { SubCustomerAccount } from "@solverminds/auth";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Icons } from "../../../components/icons";
import { useAdminLoginController } from "../hooks/use-admin-login-controller";
import { AdminLoginShell } from "./admin-login-shell";
import { CustomerPickerModal } from "./customer-picker-modal";

export function ImpersonationLoginPage() {
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
        title="Admin Access"
        subtitle="Sign in to access and manage customer accounts."
        icon={Icons.userCog}
        submitLabel="Sign In"
        userIdPlaceholder="e.g. impersonate or support"
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
