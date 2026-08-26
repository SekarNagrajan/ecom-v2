// Modified by Sekar Nagarajan (2026-08-25 16:30)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import {
  Alert,
  Checkbox,
  Flex,
  Input,
  Spin,
  Tooltip,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { Controller } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { ForgotPasswordPanelContent } from "../../auth/components/ForgotPasswordPanelContent";
import type { useLoginController } from "../../auth/hooks/use-login-controller";
import { PublicLoginPanelStyles } from "./public-login-panel-styles";

const { Text, Title } = Typography;

interface PublicLoginPanelProps {
  open: boolean;
  onClose: () => void;
  /** Login controller from `useLoginController` hook */
  controller: ReturnType<typeof useLoginController>;
}

export function PublicLoginPanel({
  open,
  onClose,
  controller,
}: PublicLoginPanelProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "forgot-password">("login");
  const [rememberMe, setRememberMe] = useState(false);

  const { form, handleSubmit, serverError, isSubmitting, showCaptcha } =
    controller;
  const {
    control,
    formState: { errors },
  } = form;

  const goToRegister = () => {
    onClose();
    navigate({ to: "/register" });
  };

  return (
    <AppDrawer
      title={null}
      open={open}
      onClose={onClose}
      placement="right"
      width={440}
      closable={false}
      styles={{
        body: {
          padding: `${token.paddingLG * 2}px ${token.paddingLG * 1.5}px`,
          display: "flex",
          flexDirection: "column",
          background: token.colorBgContainer,
        },
      }}
    >
      <PublicLoginPanelStyles />

      <Tooltip title="Close">
        <AppButton
          type="text"
          className="pub-login-panel__close"
          onClick={onClose}
          aria-label="Close login panel"
          icon={
            <AppIcon
              icon={Icons.x}
              size={18}
              style={{ color: token.colorError }}
            />
          }
        />
      </Tooltip>

      {view === "forgot-password" ? (
        <div className="pub-login-panel__forgot-wrap">
          <ForgotPasswordPanelContent onBack={() => setView("login")} />
        </div>
      ) : (
        <div className="pub-login-panel">
          <Flex vertical className="pub-login-panel__header">
            <Title level={2} className="pub-login-panel__title">
              Login to your Account
            </Title>
            <Text type="secondary" className="pub-login-panel__subtitle">
              Welcome to E-COM PORTAL. Enter your credentials to continue.
            </Text>
          </Flex>

          <div className="pub-login-panel__body">
            {serverError && (
              <Alert
                id="login-error-alert"
                type="error"
                showIcon
                message="Login Failed"
                description={serverError}
                closable
                className="pub-login-panel__alert"
              />
            )}

            <form
              id="login-form"
              onSubmit={handleSubmit}
              autoComplete="off"
              className="pub-login-panel__form"
            >
              <div className="pub-login-panel__field">
                <label htmlFor="login-username" className="form-field-label">
                  Username
                  <Text type="danger"> *</Text>
                </label>
                <Controller
                  control={control}
                  name="userName"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="login-username"
                      prefix={<AppIcon icon={Icons.user} size={16} />}
                      placeholder="Enter your username"
                      size="large"
                      maxLength={50}
                      autoComplete="off"
                      autoFocus
                      status={errors.userName ? "error" : undefined}
                    />
                  )}
                />
                {errors.userName && (
                  <Text type="danger" className="form-field-error">
                    {errors.userName.message}
                  </Text>
                )}
              </div>

              <div className="pub-login-panel__field pub-login-panel__field--password">
                <label htmlFor="login-password" className="form-field-label">
                  Password
                  <Text type="danger"> *</Text>
                </label>
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      id="login-password"
                      prefix={<AppIcon icon={Icons.lock} size={16} />}
                      placeholder="Enter your password"
                      size="large"
                      maxLength={20}
                      autoComplete="off"
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
                {errors.password && (
                  <Text type="danger" className="form-field-error">
                    {errors.password.message}
                  </Text>
                )}
              </div>

              <Flex
                justify="space-between"
                align="center"
                className="pub-login-panel__meta"
              >
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Remember me
                </Checkbox>
                <button
                  type="button"
                  className="pub-login-panel__forgot"
                  onClick={() => setView("forgot-password")}
                >
                  Forgot Password?
                </button>
              </Flex>

              {showCaptcha && (
                <div className="pub-login-panel__captcha">
                  <span className="form-field-label">Security Check</span>
                  <div
                    id="login-captcha-container"
                    className="pub-login-panel__captcha-box"
                  >
                    <AppIcon icon={Icons.shieldCheck} size={16} />
                    <span>
                      Google reCAPTCHA will appear here after too many failed
                      attempts.
                    </span>
                  </div>
                </div>
              )}

              <div className="pub-login-panel__actions">
                <AppButton
                  disabled={isSubmitting}
                  htmlType="submit"
                  id="login-submit-btn"
                  size="large"
                  type="primary"
                  icon={
                    isSubmitting ? (
                      <Spin
                        size="small"
                        style={{ color: token.colorPrimaryBg }}
                      />
                    ) : undefined
                  }
                >
                  {isSubmitting ? "Logging in…" : "Login"}
                </AppButton>
                <AppButton
                  size="large"
                  htmlType="button"
                  onClick={goToRegister}
                  disabled={isSubmitting}
                >
                  Register Now
                </AppButton>
              </div>

              <Text className="pub-login-panel__register-hint">
                New to the portal? Use Register Now to create an account.
              </Text>
            </form>
          </div>
        </div>
      )}
    </AppDrawer>
  );
}
