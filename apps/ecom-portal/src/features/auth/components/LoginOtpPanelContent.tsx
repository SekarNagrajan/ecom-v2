// Modified by Sekar Nagarajan (2026-09-11 16:08)
import { AppButton } from "@solverminds/shared-ui";
import { Flex, Input, Spin, Typography } from "antd";
import type { OTPRef } from "antd/es/input/OTP";
import { useEffect, useRef } from "react";

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
            aria-label="Back to Login"
          >
            Back to Login
          </AppButton>
        </div>

        <div className="pub-login-otp__body custom-scroll">
          <Flex vertical className="pub-login-otp__header">
            <Title level={3} className="pub-login-otp__title">
              Enter verification code
            </Title>
            <Text className="pub-login-otp__subtitle">
              We sent a {codeLength}-digit code to{" "}
              <span className="pub-login-otp__email">{otp.maskedEmail}</span>
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
                <span>Code expired</span>
              ) : (
                <span>
                  Expires in <strong>{otp.timerLabel}</strong>
                </span>
              )}
            </span>
          </div>

          <div className={otpWrapClass}>
            <label className="form-field-label pub-login-otp__field-label">
              Verification code
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
                Enter the {codeLength}-digit code from your email
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
              {otp.isVerifying ? "Verifying…" : "Verify and sign in"}
            </AppButton>

            <div className="pub-login-otp__resend">
              <Text type="secondary" className="pub-login-otp__resend-label">
                Didn&apos;t get the code?
              </Text>
              {otp.resendsLeft <= 0 ? (
                <Text type="secondary">Resend limit reached.</Text>
              ) : otp.resendCooldownLeft > 0 ? (
                <Text type="secondary">
                  Resend in {otp.resendCooldownLeft}s
                </Text>
              ) : (
                <AppButton
                  type="link"
                  className="pub-login-otp__resend-btn"
                  disabled={!otp.canResend}
                  loading={otp.isResending}
                  onClick={otp.handleResend}
                >
                  Resend code
                </AppButton>
              )}
            </div>
          </div>

          {/* TODO(remove for prod): devCode panel */}
          {otp.showDevCode && otp.devCode ? (
            <div
              className="pub-login-otp__demo"
              aria-label="Demo simulated email"
            >
              <div className="pub-login-otp__demo-top">
                <span className="pub-login-otp__demo-label">
                  DEMO — simulated email
                </span>
                <span className="pub-login-otp__demo-code">{otp.devCode}</span>
              </div>
              <Text className="pub-login-otp__demo-hint">
                Use this code to verify. Real OTP is never returned by the API.
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
