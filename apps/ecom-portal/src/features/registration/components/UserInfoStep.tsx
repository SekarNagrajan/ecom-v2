// Modified by Sekar Nagarajan (2026-08-27 22:15)
import { Col, Flex, Input, Row, Select, Typography } from "antd";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { checkEmail } from "../api/registration.api";
import type { RegistrationFormData } from "../types/registration.schema";

const { Text } = Typography;

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <span className="form-field-label">
      {children}
      {required ? <Text type="danger"> *</Text> : null}
    </span>
  );
}

export function UserInfoStep() {
  const { t } = useTranslation(["registration", "common"]);
  const {
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const titleOptions = [
    { value: "Mr.", label: t("options.titles.Mr") },
    { value: "Mrs.", label: t("options.titles.Mrs") },
    { value: "Ms.", label: t("options.titles.Ms") },
    { value: "Dr.", label: t("options.titles.Dr") },
  ];

  const timezoneOptions = [
    { value: "GMT", label: t("options.timezones.GMT") },
    { value: "UTC", label: t("options.timezones.UTC") },
    { value: "EST", label: t("options.timezones.EST") },
    { value: "PST", label: t("options.timezones.PST") },
    { value: "IST", label: t("options.timezones.IST") },
  ];

  const defaultViewOptions = [
    { value: "STANDARD", label: t("options.defaultView.STANDARD") },
    { value: "COMPACT", label: t("options.defaultView.COMPACT") },
    { value: "DETAILED", label: t("options.defaultView.DETAILED") },
  ];

  const preferredViewOptions = [
    { value: "HOME", label: t("options.preferredView.HOME") },
    { value: "DASHBOARD", label: t("options.preferredView.DASHBOARD") },
    { value: "TRACKING", label: t("options.preferredView.TRACKING") },
  ];

  const handleEmailBlur = async (email: string) => {
    if (!email || errors.email) return;
    setIsCheckingEmail(true);
    try {
      const data = await checkEmail(email);
      if (!data.available) {
        setError("email", {
          type: "manual",
          message: t("validation.emailAlreadyRegistered"),
        });
      } else {
        clearErrors("email");
      }
    } catch {
      setError("email", {
        type: "manual",
        message: t("validation.emailVerifyFailed"),
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <Flex vertical gap={16} className="reg-step-body">
      <Row gutter={[16, 16]}>
        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel required>{t("user.title")}</FieldLabel>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder={t("user.title")}
                    status={errors.title ? "error" : undefined}
                    className="reg-field-full"
                    options={titleOptions}
                  />
                  {errors.title ? (
                    <Text type="danger" className="form-field-error">
                      {errors.title.message}
                    </Text>
                  ) : null}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel required>{t("user.firstName")}</FieldLabel>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder={t("user.firstName")}
                    status={errors.firstName ? "error" : undefined}
                  />
                  {errors.firstName ? (
                    <Text type="danger" className="form-field-error">
                      {errors.firstName.message}
                    </Text>
                  ) : null}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel required>{t("user.lastName")}</FieldLabel>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder={t("user.lastName")}
                    status={errors.lastName ? "error" : undefined}
                  />
                  {errors.lastName ? (
                    <Text type="danger" className="form-field-error">
                      {errors.lastName.message}
                    </Text>
                  ) : null}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel required>{t("user.email")}</FieldLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    type="email"
                    size="large"
                    placeholder={t("user.email")}
                    status={errors.email ? "error" : undefined}
                    onBlur={(e) => {
                      field.onBlur();
                      handleEmailBlur(e.target.value);
                    }}
                    disabled={isCheckingEmail}
                  />
                  {errors.email ? (
                    <Text type="danger" className="form-field-error">
                      {errors.email.message}
                    </Text>
                  ) : null}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel required>{t("user.password")}</FieldLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div>
                  <Input.Password
                    {...field}
                    size="large"
                    placeholder={t("user.password")}
                    status={errors.password ? "error" : undefined}
                  />
                  {errors.password ? (
                    <Text type="danger" className="form-field-error">
                      {errors.password.message}
                    </Text>
                  ) : null}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel required>{t("user.confirmPassword")}</FieldLabel>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <div>
                  <Input.Password
                    {...field}
                    size="large"
                    placeholder={t("user.confirmPassword")}
                    status={errors.confirmPassword ? "error" : undefined}
                  />
                  {errors.confirmPassword ? (
                    <Text type="danger" className="form-field-error">
                      {errors.confirmPassword.message}
                    </Text>
                  ) : null}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel required>{t("user.timezone")}</FieldLabel>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder={t("user.timezone")}
                    status={errors.timezone ? "error" : undefined}
                    className="reg-field-full"
                    options={timezoneOptions}
                  />
                  {errors.timezone ? (
                    <Text type="danger" className="form-field-error">
                      {errors.timezone.message}
                    </Text>
                  ) : null}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel>{t("user.defaultView")}</FieldLabel>
            <Controller
              name="defaultView"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  size="large"
                  placeholder={t("user.defaultView")}
                  className="reg-field-full"
                  options={defaultViewOptions}
                />
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formThird}>
          <Flex vertical gap={8}>
            <FieldLabel>{t("user.preferredView")}</FieldLabel>
            <Controller
              name="preferredView"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  size="large"
                  placeholder={t("user.preferredView")}
                  className="reg-field-full"
                  options={preferredViewOptions}
                />
              )}
            />
          </Flex>
        </Col>
      </Row>
    </Flex>
  );
}
