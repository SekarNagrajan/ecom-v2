// Modified by Sekar Nagarajan (2026-11-12 13:40)
/**
 * Password Reset — force a reset for a customer / agency login. A confirmation guards the
 * security action; the result is shown as an inline receipt (and toasted by the mutation hook).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, FormInput, FormattedDate } from "@solverminds/shared-ui";
import { useConfirm } from "@solverminds/shared-ui/hooks";
import { Col, Row, Typography } from "antd";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import {
  FIELD_GUTTER,
  FIELD_ITEM_PROPS,
  reqLabel,
} from "../../../components/shared/form-field-label";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import type { PasswordResetResult } from "../api/admin.api";
import {
  PasswordResetFormSchema,
  type PasswordResetFormValues,
} from "../types/admin.types";
import { AdminFormFooter } from "./shared/AdminFormFooter";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminSectionPage } from "./shared/AdminSectionPage";

const { Text } = Typography;

interface Receipt {
  username: string;
  message: string;
  at: string;
}

interface AdminPasswordResetViewProps {
  onResetPassword: (username: string) => Promise<PasswordResetResult>;
  isPending: boolean;
}

export function AdminPasswordResetView({
  onResetPassword,
  isPending,
}: AdminPasswordResetViewProps) {
  const confirm = useConfirm();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(PasswordResetFormSchema) as Resolver<PasswordResetFormValues>,
    defaultValues: { username: "" },
    mode: "onChange",
  });

  const runReset = async (username: string) => {
    try {
      const result = await onResetPassword(username);
      setReceipt({ username, message: result.message, at: new Date().toISOString() });
      form.reset({ username: "" });
    } catch {
      /* surfaced by the mutation's onError toast */
    }
  };

  const handleReset = form.handleSubmit(({ username }) => {
    const target = username.trim();
    confirm.danger({
      title: "Reset Password",
      content: `Reset the password for ${target}? The current password stops working immediately and a temporary OTP is emailed to the user.`,
      okText: "Reset Password",
      cancelText: "Cancel",
      onOk: () => runReset(target),
    });
  });

  const handleCancel = () => {
    form.reset({ username: "" });
    setReceipt(null);
  };

  return (
    <AdminSectionPage>
      <div className="admin-password-form">
        <Row gutter={FIELD_GUTTER}>
          <Col {...RESPONSIVE_COL.formHalf}>
            <AdminFormSection
              icon={Icons.keyRound}
              title="Reset a login"
              hint="The user receives a temporary one-time password by email and must set a new password on next sign-in."
            >
              <FormInput
                control={form.control}
                name="username"
                label={reqLabel("Login Username")}
                size="large"
                autoComplete="off"
                placeholder="e.g. CUST_ADMIN_01"
                prefix={<AppIcon icon={Icons.key} size={16} />}
                formItemProps={FIELD_ITEM_PROPS}
                disabled={isPending}
              />
              <Text type="secondary" className="admin-field-hint">
                Customer or agency login name exactly as the user signs in.
              </Text>
            </AdminFormSection>

            {receipt ? (
              <div className="admin-receipt" role="status">
                <span className="admin-receipt__icon" aria-hidden>
                  <AppIcon icon={Icons.checkCircle} size={20} />
                </span>
                <div className="admin-receipt__copy">
                  <Text strong className="admin-receipt__title">
                    Password reset for {receipt.username}
                  </Text>
                  <Text type="secondary" className="admin-receipt__meta">
                    <FormattedDate value={receipt.at} showTime />
                  </Text>
                  <Text className="admin-receipt__message">{receipt.message}</Text>
                </div>
                <AppButton
                  type="text"
                  size="small"
                  onClick={() => setReceipt(null)}
                  aria-label="Dismiss receipt"
                >
                  Dismiss
                </AppButton>
              </div>
            ) : null}
          </Col>
        </Row>

        <AdminFormFooter
          isDirty={form.formState.isDirty || receipt !== null}
          isSaving={isPending}
          onCancel={handleCancel}
          onSave={() => void handleReset()}
          saveLabel="Reset Password"
          saveIcon={Icons.refreshCw}
          hint={null}
        />
      </div>
    </AdminSectionPage>
  );
}
