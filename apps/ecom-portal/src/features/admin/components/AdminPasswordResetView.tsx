// Modified by Sekar Nagarajan (2026-11-12 12:40)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, FormInput } from "@solverminds/shared-ui";
import { Alert, Col, Row, Typography } from "antd";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import { FIELD_ITEM_PROPS, reqLabel } from "../../../components/shared/form-field-label";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { AdminSectionPage } from "./shared/AdminSectionPage";

const { Text } = Typography;

const passwordResetSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

type PasswordResetForm = z.infer<typeof passwordResetSchema>;

interface AdminPasswordResetViewProps {
  onResetPassword: (
    username: string,
  ) => Promise<{ success: boolean; message: string }>;
}

export function AdminPasswordResetView({
  onResetPassword,
}: AdminPasswordResetViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const form = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema) as Resolver<PasswordResetForm>,
    defaultValues: { username: "" },
    mode: "onChange",
  });

  const handleCancel = () => {
    form.reset({ username: "" });
    setResultMsg(null);
  };

  const handleSave = form.handleSubmit(async (values) => {
    setIsSaving(true);
    setResultMsg(null);
    try {
      const res = await onResetPassword(values.username.trim());
      setResultMsg(res.message);
      form.reset({ username: "" });
    } catch {
      /* surfaced by the mutation's onError toast */
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <AdminSectionPage>
      <div className="admin-password-form">
        <Row gutter={[16, 16]}>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="username"
              label={reqLabel("Customer / Agency Login Name")}
              size="large"
              autoComplete="off"
              placeholder="Enter login username (e.g. CUST_ADMIN_01)"
              prefix={<AppIcon icon={Icons.key} size={16} />}
              formItemProps={FIELD_ITEM_PROPS}
            />

            {resultMsg ? (
              <Alert
                className="admin-password-alert"
                message="Security Action Logged"
                description={resultMsg}
                type="success"
                showIcon
              />
            ) : null}
          </Col>
        </Row>

        <div className="admin-form-footer form-step-footer">
          <AppButton onClick={handleCancel} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.send} size={16} />}
            loading={isSaving}
            onClick={handleSave}
          >
            Save
          </AppButton>
        </div>
      </div>
    </AdminSectionPage>
  );
}
