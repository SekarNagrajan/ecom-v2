// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { AppButton } from "@solverminds/shared-ui";
import { Flex, Input, Spin, Typography } from "antd";
import type { OTPRef } from "antd/es/input/OTP";
import { useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { OTP_LOGIN_CONFIG } from "../config/otp-login-config";
import {
  useOtpLoginController,
  type OtpSessionSnapshot,
} from "../hooks/use-otp-login-controller";
import { LoginOtpPanelStyles } from "./login-otp-panel-styles";

const { Text, Title } = Typography;

interface LoginOtpPanelContentProps {
  session: OtpSessionSnapshot;
  onBack: () => void;
  onVerifiedSuccess: () => void;
  onLocked: () => void;
  onResendLimit: () => void;
  onCodeSent: (message: string) => void;
}

export function LoginOtpPanelContent({
  session,
  onBack,
  onVerifiedSuccess,
  onLocked,
  onResendLimit,
  onCodeSent,
}: LoginOtpPanelContentProps) {
  const { t } = useTranslation("auth");
  const otpRef = useRef<OTPRef>(null);
  const otp = useOtpLoginController({
    session,
    onVerifiedSuccess,
    onLocked,
    onResendLimit,
    onCodeSent,
  });

  const codeLength = otp.codeLength || OTP_LOGIN_CONFIG.codeLength;

  useEffect(() => {
    otpRef.current?.focus();
  }, [session]);

  useEffect(() => {
    if (otp.code === "" && otp.inlineError) {
      otpRef.current?.focus();
    }
  }, [otp.code, otp.inlineError]);

  const otpWrapClass = [
    "pub-login-otp__otp-wrap",
    otp.shake ? "pub-login-otp__otp-wrap--shake" : "",
    otp.inlineError ? "pub-login-otp__otp-wrap--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <LoginOtpPanelStyles />
      <div className="pub-login-otp" role="dialog" aria-modal="true">
        <div className="pub-login-otp__back">
          <AppButton
            type="text"
            icon={<AppIcon icon={Icons.arrowLeft} size={16} />}
            onClick={onBack}
            aria-label={t("otp.backToLogin")}
          >
            {t("otp.backToLogin")}
          </AppButton>
        </div>

        <div className="pub-login-otp__body custom-scroll">
          <Flex vertical className="pub-login-otp__header">
            <Title level={3} className="pub-login-otp__title">
              {t("otp.title")}
            </Title>
            <Text className="pub-login-otp__subtitle">
              <Trans
                i18nKey="otp.subtitle"
                ns="auth"
                values={{ codeLength, email: otp.maskedEmail }}
                components={{
                  email: <span className="pub-login-otp__email" />,
                }}
              />
            </Text>
          </Flex>

          <div className="pub-login-otp__status-row">
            <span
              className={
                otp.expired
                  ? "pub-login-otp__timer pub-login-otp__timer--expired"
                  : "pub-login-otp__timer"
              }
              aria-live="polite"
            >
              <AppIcon icon={Icons.clock} size={14} />
              {otp.expired ? (
                <span>{t("otp.codeExpired")}</span>
              ) : (
                <span>
                  <Trans
                    i18nKey="otp.expiresIn"
                    ns="auth"
                    values={{ time: otp.timerLabel }}
                    components={{ time: <strong /> }}
                  />
                </span>
              )}
            </span>
          </div>

          <div className={otpWrapClass}>
            <label className="form-field-label pub-login-otp__field-label">
              {t("otp.verificationCode")}
              <Text type="danger"> *</Text>
            </label>
            <div className="pub-login-otp__otp-cells">
              <Input.OTP
                ref={otpRef}
                length={codeLength}
                size="large"
                value={otp.code}
                onChange={otp.handleCodeChange}
                disabled={otp.isVerifying}
                type="tel"
                autoComplete="one-time-code"
                formatter={(str) => str.replace(/\D/g, "")}
              />
            </div>
            {otp.inlineError ? (
              <Text
                type="danger"
                className="pub-login-otp__error form-field-error"
              >
                {otp.inlineError}
              </Text>
            ) : (
              <Text type="secondary" className="pub-login-otp__hint">
                {t("otp.hint", { codeLength })}
              </Text>
            )}
          </div>

          <div className="pub-login-otp__actions">
            <AppButton
              type="primary"
              size="large"
              block
              className="pub-login-otp__verify"
              disabled={!otp.canVerify}
              onClick={otp.handleVerify}
              icon={otp.isVerifying ? <Spin size="small" /> : undefined}
            >
              {otp.isVerifying
                ? t("otp.verifying")
                : t("otp.verifyAndSignIn")}
            </AppButton>

            <div className="pub-login-otp__resend">
              <Text type="secondary" className="pub-login-otp__resend-label">
                {t("otp.didntGetCode")}
              </Text>
              {otp.resendsLeft <= 0 ? (
                <Text type="secondary">{t("otp.resendLimitReached")}</Text>
              ) : otp.resendCooldownLeft > 0 ? (
                <Text type="secondary">
                  {t("otp.resendIn", { seconds: otp.resendCooldownLeft })}
                </Text>
              ) : (
                <AppButton
                  type="link"
                  className="pub-login-otp__resend-btn"
                  disabled={!otp.canResend}
                  loading={otp.isResending}
                  onClick={otp.handleResend}
                >
                  {t("otp.resendCode")}
                </AppButton>
              )}
            </div>
          </div>

          {/* TODO(remove for prod): devCode panel */}
          {otp.showDevCode && otp.devCode ? (
            <div
              className="pub-login-otp__demo"
              aria-label={t("otp.demoAriaLabel")}
            >
              <div className="pub-login-otp__demo-top">
                <span className="pub-login-otp__demo-label">
                  {t("otp.demoLabel")}
                </span>
                <span className="pub-login-otp__demo-code">{otp.devCode}</span>
              </div>
              <Text className="pub-login-otp__demo-hint">
                {t("otp.demoHint")}
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
