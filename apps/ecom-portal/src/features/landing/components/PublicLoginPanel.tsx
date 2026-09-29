// Modified by Sekar Nagarajan (2026-09-11 16:08)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
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
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ForgotPasswordPanelContent } from "../../auth/components/ForgotPasswordPanelContent";
import { LoginOtpPanelContent } from "../../auth/components/LoginOtpPanelContent";
import type { useLoginController } from "../../auth/hooks/use-login-controller";
import { PublicLoginPanelStyles } from "./public-login-panel-styles";

const { Text, Title } = Typography;

type PanelView = "login" | "forgot-password" | "otp";

interface PublicLoginPanelProps {
  open: boolean;
  onClose: () => void;
  /** Login controller from `useLoginController` hook */
  controller: ReturnType<typeof useLoginController>;
  /** Shown when redirected after a dead session (CRM parity). */
  sessionExpired?: boolean;
}

export function PublicLoginPanel({
  open,
  onClose,
  controller,
  sessionExpired = false,
}: PublicLoginPanelProps) {
  const { t } = useTranslation(["auth", "common"]);
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [view, setView] = useState<PanelView>("login");
  const [rememberMe, setRememberMe] = useState(false);

  const {
    form,
    handleSubmit,
    serverError,
    isSubmitting,
    showCaptcha,
    phase,
    otpSession,
    otpEnabled,
    clearOtpPhase,
    completeOtpSuccess,
  } = controller;
  const {
    control,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (otpEnabled && phase === "otp" && otpSession && view !== "otp") {
      setView("otp");
      toast.info(t("verificationSent"));
    }
  }, [otpEnabled, phase, otpSession, view, toast]);

  useEffect(() => {
    if (!open) {
      setView("login");
      clearOtpPhase();
    }
  }, [open]);

  const handleClose = () => {
    setView("login");
    clearOtpPhase();
    onClose();
  };

  const goToRegister = () => {
    handleClose();
    navigate({ to: "/register" });
  };

  const handleOtpBack = () => {
    clearOtpPhase();
    setView("login");
  };

  const handleOtpLocked = () => {
    confirm.error({
      title: t("accountLockedTitle"),
      content: t("accountLockedContent"),
      okText: t("common:actions.ok"),
      onOk: () => {
        clearOtpPhase();
        setView("login");
      },
    });
  };

  const handleResendLimit = () => {
    toast.error(t("resendLimit"));
    clearOtpPhase();
    setView("login");
  };

  return (
    <AppDrawer
      title={null}
      open={open}
      onClose={handleClose}
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

      <Tooltip title={t("common:actions.close")}>
        <AppButton
          type="text"
          className="pub-login-panel__close"
          onClick={handleClose}
          aria-label={t("closeLoginPanel")}
          icon={<AppIcon icon={Icons.x} size={18} />}
        />
      </Tooltip>

      {view === "forgot-password" ? (
        <div className="pub-login-panel__forgot-wrap">
          <ForgotPasswordPanelContent onBack={() => setView("login")} />
        </div>
      ) : view === "otp" && otpEnabled && otpSession ? (
        <div className="pub-login-panel__forgot-wrap">
          <LoginOtpPanelContent
            session={otpSession}
            onBack={handleOtpBack}
            onVerifiedSuccess={() => {
              toast.success(t("signedIn"));
              completeOtpSuccess();
            }}
            onLocked={handleOtpLocked}
            onResendLimit={handleResendLimit}
            onCodeSent={(message) => toast.info(message)}
          />
        </div>
      ) : (
        <div className="pub-login-panel">
          <Flex vertical className="pub-login-panel__header">
            <Title level={2} className="pub-login-panel__title">
              {t("loginTitle")}
            </Title>
          </Flex>

          <div className="pub-login-panel__body">
            {sessionExpired && (
              <Alert
                type="warning"
                showIcon
                title={t("sessionExpiredTitle")}
                description={t("sessionExpiredDesc")}
                className="pub-login-panel__alert"
              />
            )}
            {serverError && (
              <Alert
                id="login-error-alert"
                type="error"
                showIcon
                title={t("loginFailed")}
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
                  {t("username")}
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
                      placeholder={t("usernamePlaceholder")}
                      size="large"
                      maxLength={50}
                      autoComplete="off"
                      autoFocus
                      status={
                        errors.userName || serverError ? "error" : undefined
                      }
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
                  {t("password")}
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
                      placeholder={t("passwordPlaceholder")}
                      size="large"
                      maxLength={20}
                      autoComplete="off"
                      status={
                        errors.password || serverError ? "error" : undefined
                      }
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
                  {t("rememberMe")}
                </Checkbox>
                <button
                  type="button"
                  className="pub-login-panel__forgot"
                  onClick={() => setView("forgot-password")}
                >
                  {t("forgotPassword")}
                </button>
              </Flex>

              {showCaptcha && (
                <div className="pub-login-panel__captcha">
                  <span className="form-field-label">
                    {t("securityCheck")}
                  </span>
                  <div
                    id="login-captcha-container"
                    className="pub-login-panel__captcha-box"
                  >
                    <AppIcon icon={Icons.shieldCheck} size={16} />
                    <span>{t("captchaHint")}</span>
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
                  {isSubmitting ? t("loggingIn") : t("login")}
                </AppButton>
                <AppButton
                  size="large"
                  htmlType="button"
                  onClick={goToRegister}
                  disabled={isSubmitting}
                >
                  {t("registerNow")}
                </AppButton>
              </div>

              <Text className="pub-login-panel__register-hint">
                {t("registerHint")}
              </Text>
              {/* <Text className="pub-login-panel__register-hint">
                Demo OTP login: demo@solverminds.com / Demo@1234
              </Text> */}
            </form>
          </div>
        </div>
      )}
    </AppDrawer>
  );
}
