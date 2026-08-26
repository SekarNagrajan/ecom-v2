// Modified by Sekar Nagarajan (2026-08-25 16:15)
import { Col, Flex, Input, Row, Select, Typography } from "antd";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

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
  const {
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const handleEmailBlur = async (email: string) => {
    if (!email || errors.email) return;
    setIsCheckingEmail(true);
    try {
      const data = await checkEmail(email);
      if (!data.available) {
        setError("email", {
          type: "manual",
          message: "This email is already registered.",
        });
      } else {
        clearErrors("email");
      }
    } catch {
      setError("email", {
        type: "manual",
        message: "Failed to verify email.",
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <Flex vertical gap={24} className="reg-step-body">
      <Row gutter={[24, 24]}>
        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>First Name</FieldLabel>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="First Name"
                    status={errors.firstName ? "error" : undefined}
                  />
                  {errors.firstName && (
                    <Text type="danger" className="form-field-error">
                      {errors.firstName.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Last Name</FieldLabel>
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    size="large"
                    placeholder="Last Name"
                    status={errors.lastName ? "error" : undefined}
                  />
                  {errors.lastName && (
                    <Text type="danger" className="form-field-error">
                      {errors.lastName.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Title</FieldLabel>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder="Title"
                    status={errors.title ? "error" : undefined}
                    className="reg-field-full"
                    options={[
                      { value: "Mr.", label: "Mr." },
                      { value: "Mrs.", label: "Mrs." },
                      { value: "Ms.", label: "Ms." },
                      { value: "Dr.", label: "Dr." },
                    ]}
                  />
                  {errors.title && (
                    <Text type="danger" className="form-field-error">
                      {errors.title.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.full}>
          <Flex vertical gap={8}>
            <FieldLabel required>Email Id</FieldLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    {...field}
                    type="email"
                    size="large"
                    placeholder="Email Id"
                    status={errors.email ? "error" : undefined}
                    onBlur={(e) => {
                      field.onBlur();
                      handleEmailBlur(e.target.value);
                    }}
                    disabled={isCheckingEmail}
                  />
                  {errors.email && (
                    <Text type="danger" className="form-field-error">
                      {errors.email.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Password</FieldLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <div>
                  <Input.Password
                    {...field}
                    size="large"
                    placeholder="Password"
                    status={errors.password ? "error" : undefined}
                  />
                  {errors.password && (
                    <Text type="danger" className="form-field-error">
                      {errors.password.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel required>Confirm Password</FieldLabel>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <div>
                  <Input.Password
                    {...field}
                    size="large"
                    placeholder="Confirm Password"
                    status={errors.confirmPassword ? "error" : undefined}
                  />
                  {errors.confirmPassword && (
                    <Text type="danger" className="form-field-error">
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.full}>
          <Flex vertical gap={8}>
            <FieldLabel required>Timezone</FieldLabel>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <div>
                  <Select
                    {...field}
                    value={field.value || undefined}
                    size="large"
                    placeholder="Timezone"
                    status={errors.timezone ? "error" : undefined}
                    className="reg-field-full"
                    options={[
                      { value: "GMT", label: "GMT - Greenwich Mean Time" },
                      {
                        value: "UTC",
                        label: "UTC - Universal Time Coordinated",
                      },
                      { value: "EST", label: "EST - Eastern Standard Time" },
                      { value: "PST", label: "PST - Pacific Standard Time" },
                      { value: "IST", label: "IST - Indian Standard Time" },
                    ]}
                  />
                  {errors.timezone && (
                    <Text type="danger" className="form-field-error">
                      {errors.timezone.message}
                    </Text>
                  )}
                </div>
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel>Default View</FieldLabel>
            <Controller
              name="defaultView"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  size="large"
                  placeholder="Default View"
                  className="reg-field-full"
                  options={[
                    { value: "STANDARD", label: "Standard" },
                    { value: "COMPACT", label: "Compact" },
                    { value: "DETAILED", label: "Detailed" },
                  ]}
                />
              )}
            />
          </Flex>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Flex vertical gap={8}>
            <FieldLabel>Preferred View</FieldLabel>
            <Controller
              name="preferredView"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  size="large"
                  placeholder="Preferred View"
                  className="reg-field-full"
                  options={[
                    { value: "HOME", label: "Home Page" },
                    { value: "DASHBOARD", label: "Dashboard" },
                    { value: "TRACKING", label: "Tracking" },
                  ]}
                />
              )}
            />
          </Flex>
        </Col>
      </Row>
    </Flex>
  );
}
