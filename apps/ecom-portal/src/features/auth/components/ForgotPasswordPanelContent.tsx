// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { AppButton } from "@solverminds/shared-ui";
import { Alert, Flex, Input, Result, Spin, Tooltip, Typography } from "antd";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ImageCaptcha } from "../../landing/components/ImageCaptcha";
import { useForgotPasswordController } from "../hooks/use-forgot-password-controller";
import { ForgotPasswordPanelStyles } from "./forgot-password-panel-styles";

const { Text, Title } = Typography;

interface ForgotPasswordPanelContentProps {
  onBack: () => void;
}

export function ForgotPasswordPanelContent({
  onBack,
}: ForgotPasswordPanelContentProps) {
  const { t } = useTranslation("auth");
  const controller = useForgotPasswordController();
  const { form, handleSubmit, serverError, isSubmitting, isSuccess } =
    controller;
  const {
    control,
    formState: { errors },
  } = form;

  if (isSuccess) {
    return (
      <>
        <ForgotPasswordPanelStyles />
        <Flex vertical className="forgot-panel forgot-panel__success">
          <Result
            status="success"
            title={t("forgotPasswordPanel.successTitle")}
            subTitle={t("forgotPasswordPanel.successSubtitle")}
            extra={
              <div className="forgot-panel__success-actions">
                <AppButton
                  key="backToLogin"
                  type="primary"
                  size="large"
                  onClick={onBack}
                >
                  {t("forgotPasswordPanel.backToLogin")}
                </AppButton>
                <AppButton
                  key="tryAgain"
                  type="text"
                  onClick={controller.resetForm}
                >
                  {t("forgotPasswordPanel.tryAgain")}
                </AppButton>
              </div>
            }
          />
        </Flex>
      </>
    );
  }

  return (
    <>
      <ForgotPasswordPanelStyles />
      <Flex vertical className="forgot-panel">
        <div className="forgot-panel__back">
          <Tooltip title={t("forgotPasswordPanel.backToLogin")}>
            <AppButton
              type="text"
              icon={<AppIcon icon={Icons.arrowLeft} size={16} />}
              onClick={onBack}
              aria-label={t("forgotPasswordPanel.backToLogin")}
            >
              {t("forgotPasswordPanel.backToLogin")}
            </AppButton>
          </Tooltip>
        </div>

        <Flex vertical className="forgot-panel__content">
          <div className="forgot-panel__header">
            <Title level={2} className="forgot-panel__title">
              <span className="forgot-panel__icon app-icon-inherit">
                <AppIcon icon={Icons.key} size={16} />
              </span>
              {t("forgotPasswordPanel.title")}
            </Title>
            <Text type="secondary" className="forgot-panel__subtitle">
              {t("forgotPasswordPanel.subtitle")}
            </Text>
          </div>

          {serverError && (
            <Alert
              type="error"
              showIcon
              message={t("forgotPasswordPanel.requestFailed")}
              description={serverError}
            />
          )}

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="forgot-panel__form"
          >
            <div className="forgot-panel__field">
              <label htmlFor="forgotUsername" className="form-field-label">
                {t("forgotPasswordPanel.loginUsername")}
                <Text type="danger"> *</Text>
              </label>
              <Controller
                control={control}
                name="userName"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="forgotUsername"
                    prefix={<AppIcon icon={Icons.user} size={16} />}
                    placeholder={t("forgotPasswordPanel.usernamePlaceholder")}
                    size="large"
                    maxLength={50}
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

            <div className="forgot-panel__field forgot-panel__field--captcha">
              <span className="form-field-label">
                {t("securityCheck")}
                <Text type="danger"> *</Text>
              </span>
              <ImageCaptcha
                control={control}
                name="captcha"
                captchaType="ForgotPassword"
                errorMessage={errors.captcha?.message}
              />
            </div>

            <AppButton
              className="forgot-panel__submit"
              disabled={isSubmitting}
              htmlType="submit"
              size="large"
              type="primary"
              icon={isSubmitting ? <Spin size="small" /> : undefined}
            >
              {isSubmitting
                ? t("forgotPasswordPanel.sending")
                : t("forgotPasswordPanel.resetPassword")}
            </AppButton>
          </form>
        </Flex>
      </Flex>
    </>
  );
}
