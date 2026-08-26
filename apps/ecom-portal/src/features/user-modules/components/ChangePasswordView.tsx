// Modified by Sekar Nagarajan (2026-08-26 16:00)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDrawer, FormInput } from "@solverminds/shared-ui";
import { List, Progress, Space, Typography, theme } from "antd";
import { useWatch, useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { useChangePasswordMutation } from "../api/user-modules.queries";
import type { ChangePasswordPayload } from "../types/user-modules.types";
import { changePasswordSchema } from "../types/user-modules.types";
import { UserModulesModuleStyles } from "./user-modules-module-styles";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const DEFAULTS: ChangePasswordPayload = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export interface ChangePasswordViewProps {
  open?: boolean;
  onClose?: () => void;
}

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

export function ChangePasswordView({
  open = true,
  onClose,
}: ChangePasswordViewProps) {
  const { token } = theme.useToken();
  const isDrawer = Boolean(onClose);
  const { mutateAsync: changePassword, isPending } =
    useChangePasswordMutation();

  const form = useForm<ChangePasswordPayload>({
    resolver: zodResolver(
      changePasswordSchema,
    ) as Resolver<ChangePasswordPayload>,
    defaultValues: DEFAULTS,
    mode: "onChange",
  });

  const newPassword = useWatch({ control: form.control, name: "newPassword" }) ?? "";

  const checks = [
    { label: "At least 8 characters long", valid: newPassword.length >= 8 },
    {
      label: "Contains uppercase letter (A-Z)",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "Contains lowercase letter (a-z)",
      valid: /[a-z]/.test(newPassword),
    },
    { label: "Contains numeric digit (0-9)", valid: /[0-9]/.test(newPassword) },
    {
      label: "Contains special character (!@#$%^&*)",
      valid: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const passedCount = checks.filter((c) => c.valid).length;
  const strengthPercent = Math.round((passedCount / checks.length) * 100);
  const strengthLevel =
    strengthPercent <= 40 ? "weak" : strengthPercent <= 80 ? "medium" : "strong";
  const strengthLabel =
    strengthLevel === "weak"
      ? "WEAK"
      : strengthLevel === "medium"
        ? "MEDIUM"
        : "STRONG";
  const strokeColor =
    strengthLevel === "weak"
      ? token.colorError
      : strengthLevel === "medium"
        ? token.colorWarning
        : token.colorSuccess;

  const handleClose = () => {
    form.reset(DEFAULTS);
    onClose?.();
  };

  const handleSave = form.handleSubmit(async (values) => {
    await changePassword(values);
    form.reset(DEFAULTS);
    handleClose();
  });

  const formFields = (
    <div className="um-form-section">
      <FormInput
        control={form.control}
        name="oldPassword"
        type="password"
        label={reqLabel("Current Password")}
        size="large"
        prefix={<AppIcon icon={Icons.lock} size={16} />}
        placeholder="Enter current password"
        formItemProps={FIELD_ITEM_PROPS}
      />
      <FormInput
        control={form.control}
        name="newPassword"
        type="password"
        label={reqLabel("New Password")}
        size="large"
        prefix={<AppIcon icon={Icons.lock} size={16} />}
        placeholder="Enter new password"
        formItemProps={FIELD_ITEM_PROPS}
      />

      {newPassword ? (
        <div className="um-password-strength">
          <div className="um-password-strength__header">
            <Text className="um-password-strength__label">
              Password Security Strength:
            </Text>
            <Text
              className={`um-password-strength__level um-password-strength__level--${strengthLevel}`}
            >
              {strengthLabel}
            </Text>
          </div>
          <Progress
            percent={strengthPercent}
            strokeColor={strokeColor}
            showInfo={false}
          />
          <List
            className="um-password-strength__checks"
            size="small"
            dataSource={checks}
            renderItem={(item) => (
              <List.Item>
                <Space size={6}>
                  {item.valid ? (
                    <AppIcon icon={Icons.checkCircle} size={16} tone="approve" />
                  ) : (
                    <AppIcon icon={Icons.circleX} size={16} tone="reject" />
                  )}
                  <Text
                    type={item.valid ? "success" : "secondary"}
                    className="um-password-strength__check"
                  >
                    {item.label}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      ) : null}

      <FormInput
        control={form.control}
        name="confirmPassword"
        type="password"
        label={reqLabel("Confirm New Password")}
        size="large"
        prefix={<AppIcon icon={Icons.lock} size={16} />}
        placeholder="Re-enter new password"
        formItemProps={FIELD_ITEM_PROPS}
      />
    </div>
  );

  if (isDrawer) {
    return (
      <>
        <UserModulesModuleStyles />
        <AppDrawer
          open={open}
          onClose={handleClose}
          placement="right"
          dialogSize="md"
          destroyOnClose
          maskClosable={!isPending}
          keyboard={!isPending}
          classNames={{
            body: "um-drawer-body custom-scroll",
            footer: "um-drawer-footer-bar",
          }}
          styles={{ body: { padding: 0 } }}
          title={MODULE_TITLES.changePassword}
          footer={
            <div className="um-drawer-footer form-step-footer">
              <AppButton onClick={handleClose} disabled={isPending}>
                Cancel
              </AppButton>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.save} size={16} />}
                loading={isPending}
                onClick={handleSave}
              >
                Save
              </AppButton>
            </div>
          }
        >
          {formFields}
        </AppDrawer>
      </>
    );
  }

  return (
    <div className="um-page-layout">
      <ModuleScreenHeader
        icon={Icons.key}
        title={MODULE_TITLES.changePassword}
        subtitle="Update your portal authentication credentials to maintain account security"
      />
      {formFields}
      <div className="um-page-actions">
        <AppButton
          type="primary"
          icon={<AppIcon icon={Icons.save} size={16} />}
          loading={isPending}
          onClick={handleSave}
        >
          Update Password
        </AppButton>
      </div>
    </div>
  );
}
