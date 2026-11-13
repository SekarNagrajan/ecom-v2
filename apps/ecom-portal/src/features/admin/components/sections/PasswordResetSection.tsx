// Modified by Sekar Nagarajan (2026-11-12 13:40)
/** Password Reset tab — no query; the view drives the mutation. */
import { useResetPasswordMutation } from "../../api/admin.queries";
import { AdminPasswordResetView } from "../AdminPasswordResetView";

export function PasswordResetSection() {
  const resetPassword = useResetPasswordMutation();
  return (
    <AdminPasswordResetView
      onResetPassword={resetPassword.mutateAsync}
      isPending={resetPassword.isPending}
    />
  );
}
