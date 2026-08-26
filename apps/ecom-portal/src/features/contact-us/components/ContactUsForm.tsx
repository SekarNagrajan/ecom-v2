// Modified by Sekar Nagarajan (2026-08-25 16:25)
import { Col, Descriptions, Flex, Input, Row, Select, Typography } from "antd";
import { Controller } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import type { useContactUsController } from "../hooks/use-contact-us-controller";

const { Text } = Typography;
const { TextArea } = Input;

interface ContactUsFormProps {
  controller: ReturnType<typeof useContactUsController>;
}

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

/**
 * ContactUsForm — renders the form body.
 *
 * Two modes (parity with legacy ContactUs.jsp):
 * 1. **Authenticated**: Profile fields shown as read-only labels, only Subject + Message editable.
 * 2. **Guest**: All fields editable with full validation.
 */
export function ContactUsForm({ controller }: ContactUsFormProps) {
  const {
    form,
    isAuthenticated,
    user,
    countries,
    countriesLoading,
    states,
    statesLoading,
  } = controller;
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <Flex vertical gap={20} className="contact-form-body">
      {isAuthenticated && user ? (
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          className="contact-profile-desc"
        >
          <Descriptions.Item label="Name">
            {user.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Company">
            {user.company || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            {user.role || "-"}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Row gutter={[16, 20]}>
          <Col {...RESPONSIVE_COL.formHalf}>
            <Flex vertical gap={8}>
              <FieldLabel required>Name</FieldLabel>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-name"
                    size="large"
                    placeholder="Enter your name"
                    maxLength={100}
                    status={errors.name ? "error" : undefined}
                  />
                )}
              />
              {errors.name && (
                <Text type="danger" className="form-field-error">
                  {errors.name.message}
                </Text>
              )}
            </Flex>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Flex vertical gap={8}>
              <FieldLabel required>Company Name</FieldLabel>
              <Controller
                control={control}
                name="companyName"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-company"
                    size="large"
                    placeholder="Enter company name"
                    maxLength={50}
                    status={errors.companyName ? "error" : undefined}
                  />
                )}
              />
              {errors.companyName && (
                <Text type="danger" className="form-field-error">
                  {errors.companyName.message}
                </Text>
              )}
            </Flex>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Flex vertical gap={8}>
              <FieldLabel required>Country</FieldLabel>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || undefined}
                    id="contact-country"
                    placeholder="Select Country"
                    loading={countriesLoading}
                    showSearch
                    size="large"
                    optionFilterProp="label"
                    options={countries.map((c) => ({
                      value: c.code,
                      label: c.name,
                    }))}
                    className="contact-field-full"
                    status={errors.country ? "error" : undefined}
                    onChange={(val) => {
                      field.onChange(val);
                      form.setValue("state", "");
                    }}
                  />
                )}
              />
              {errors.country && (
                <Text type="danger" className="form-field-error">
                  {errors.country.message}
                </Text>
              )}
            </Flex>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Flex vertical gap={8}>
              <FieldLabel>State</FieldLabel>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value || undefined}
                    id="contact-state"
                    placeholder="Select State"
                    loading={statesLoading}
                    showSearch
                    size="large"
                    optionFilterProp="label"
                    options={states.map((s) => ({
                      value: s.code,
                      label: s.name,
                    }))}
                    className="contact-field-full"
                    allowClear
                    disabled={!form.watch("country")}
                  />
                )}
              />
            </Flex>
          </Col>

          <Col {...RESPONSIVE_COL.full}>
            <Flex vertical gap={8}>
              <FieldLabel required>City</FieldLabel>
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-city"
                    size="large"
                    placeholder="Enter city"
                    maxLength={150}
                    status={errors.city ? "error" : undefined}
                  />
                )}
              />
              {errors.city && (
                <Text type="danger" className="form-field-error">
                  {errors.city.message}
                </Text>
              )}
            </Flex>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Flex vertical gap={8}>
              <FieldLabel>Phone</FieldLabel>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-phone"
                    size="large"
                    placeholder="Enter phone number"
                    maxLength={15}
                    status={errors.phone ? "error" : undefined}
                  />
                )}
              />
              {errors.phone && (
                <Text type="danger" className="form-field-error">
                  {errors.phone.message}
                </Text>
              )}
            </Flex>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Flex vertical gap={8}>
              <FieldLabel>Mobile</FieldLabel>
              <Controller
                control={control}
                name="mobile"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-mobile"
                    size="large"
                    placeholder="Enter mobile number"
                    maxLength={11}
                    status={errors.mobile ? "error" : undefined}
                  />
                )}
              />
              {errors.mobile && (
                <Text type="danger" className="form-field-error">
                  {errors.mobile.message}
                </Text>
              )}
            </Flex>
          </Col>

          <Col {...RESPONSIVE_COL.full}>
            <Flex vertical gap={8}>
              <FieldLabel required>Email</FieldLabel>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="contact-email"
                    size="large"
                    placeholder="Enter email address"
                    maxLength={300}
                    status={errors.email ? "error" : undefined}
                  />
                )}
              />
              {errors.email && (
                <Text type="danger" className="form-field-error">
                  {errors.email.message}
                </Text>
              )}
            </Flex>
          </Col>
        </Row>
      )}

      <Flex vertical gap={8}>
        <FieldLabel required>Subject</FieldLabel>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Input
              {...field}
              id="contact-subject"
              size="large"
              placeholder="Enter subject"
              maxLength={100}
              status={errors.subject ? "error" : undefined}
            />
          )}
        />
        {errors.subject && (
          <Text type="danger" className="form-field-error">
            {errors.subject.message}
          </Text>
        )}
      </Flex>

      <Flex vertical gap={8}>
        <FieldLabel required>Message</FieldLabel>
        <Controller
          control={control}
          name="message"
          render={({ field }) => (
            <TextArea
              {...field}
              id="contact-message"
              placeholder="Type your message here..."
              maxLength={5000}
              rows={5}
              showCount
              status={errors.message ? "error" : undefined}
            />
          )}
        />
        {errors.message && (
          <Text type="danger" className="form-field-error">
            {errors.message.message}
          </Text>
        )}
      </Flex>
    </Flex>
  );
}
