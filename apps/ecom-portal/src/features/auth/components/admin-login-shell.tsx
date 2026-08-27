// Created by Sekar Nagarajan (2026-08-27 12:23)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Alert, Card, Input, Spin, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import type { AdminLoginForm, LoginEntryType } from "../types/auth.types";
import { AdminLoginPageStyles } from "./admin-login-page-styles";
import { LoginEntrySwitcher } from "./login-entry-switcher";

const { Text, Title } = Typography;

interface AdminLoginShellProps {
  entryType: LoginEntryType;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  submitLabel: string;
  userIdPlaceholder: string;
  control: Control<AdminLoginForm>;
  errors: FieldErrors<AdminLoginForm>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  serverError: string | null;
  isSubmitting: boolean;
  /** Optional info banner above the form (e.g. default customer). */
  infoBanner?: ReactNode;
  hint?: string;
  footer?: ReactNode;
}

/** Shared centered login card for /cpanel, /eadmin, and /admin. */
export function AdminLoginShell({
  entryType,
  title,
  subtitle,
  icon,
  submitLabel,
  userIdPlaceholder,
  control,
  errors,
  handleSubmit,
  serverError,
  isSubmitting,
  infoBanner,
  hint,
  footer,
}: AdminLoginShellProps) {
  const navigate = useNavigate();
  const userIdFieldId = `${entryType}-userid`;
  const passwordFieldId = `${entryType}-password`;

  return (
    <div className="admin-login-page">
      <AdminLoginPageStyles />

      <Card className="admin-login-page__card" bordered={false}>
        <LoginEntrySwitcher activeEntry={entryType} />

        <header className="admin-login-page__header">
          <div className="admin-login-page__icon-wrap">
            <AppIcon icon={icon} size={28} />
          </div>
          <Title level={3} className="admin-login-page__title">
            {title}
          </Title>
          <p className="admin-login-page__subtitle">{subtitle}</p>
        </header>

        {infoBanner}

        {serverError ? (
          <Alert
            type="error"
            showIcon
            message="Login Failed"
            description={serverError}
            closable
            className="admin-login-page__alert"
          />
        ) : null}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="admin-login-page__form"
        >
          <div className="admin-login-page__field">
            <label htmlFor={userIdFieldId} className="form-field-label">
              User ID <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name="userId"
              render={({ field }) => (
                <Input
                  {...field}
                  id={userIdFieldId}
                  prefix={<AppIcon icon={Icons.user} size={16} />}
                  placeholder={userIdPlaceholder}
                  size="large"
                  maxLength={50}
                  autoComplete="username"
                  autoFocus
                  status={errors.userId ? "error" : undefined}
                />
              )}
            />
            {errors.userId ? (
              <Text type="danger" className="form-field-error">
                {errors.userId.message}
              </Text>
            ) : null}
          </div>

          <div className="admin-login-page__field">
            <label htmlFor={passwordFieldId} className="form-field-label">
              Password <Text type="danger">*</Text>
            </label>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input.Password
                  {...field}
                  id={passwordFieldId}
                  prefix={<AppIcon icon={Icons.lock} size={16} />}
                  placeholder="Enter your password"
                  size="large"
                  maxLength={20}
                  autoComplete="current-password"
                  status={errors.password ? "error" : undefined}
                  iconRender={(visible) =>
                    visible ? (
                      <AppIcon icon={Icons.eye} size={16} />
                    ) : (
                      <AppIcon icon={Icons.eyeOff} size={16} />
                    )
                  }
                />
              )}
            />
            {errors.password ? (
              <Text type="danger" className="form-field-error">
                {errors.password.message}
              </Text>
            ) : null}
          </div>

          <div className="admin-login-page__actions">
            <AppButton
              disabled={isSubmitting}
              htmlType="submit"
              size="large"
              type="primary"
              block
              icon={
                isSubmitting ? (
                  <Spin size="small" />
                ) : (
                  <AppIcon icon={Icons.logIn} size={16} />
                )
              }
            >
              {isSubmitting ? "Signing in…" : submitLabel}
            </AppButton>
          </div>
        </form>

        {hint ? <p className="admin-login-page__hint">{hint}</p> : null}

        {footer}

        {/* <div className="admin-login-page__home">
          <AppButton
            type="link"
            icon={<AppIcon icon={Icons.home} size={14} />}
            onClick={() => navigate({ to: '/' })}
          >
            Back to Home
          </AppButton>
        </div> */}
      </Card>
    </div>
  );
}
