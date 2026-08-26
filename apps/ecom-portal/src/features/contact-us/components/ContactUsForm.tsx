// Modified by Sekar Nagarajan (2026-08-26 16:30)
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@solverminds/shared-ui";
import { Col, Descriptions, Row, Typography } from "antd";
import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import type { useContactUsController } from "../hooks/use-contact-us-controller";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

interface ContactUsFormProps {
  controller: ReturnType<typeof useContactUsController>;
}

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

function optLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}

/**
 * ContactUsForm — form body.
 * Authenticated: profile read-only + Subject/Message.
 * Guest: full editable fields (legacy ContactUs.jsp parity).
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

  const selectedCountry =
    useWatch({ control: form.control, name: "country" }) ?? "";
  const skipCountryClear = useRef(true);

  useEffect(() => {
    if (skipCountryClear.current) {
      skipCountryClear.current = false;
      return;
    }
    form.setValue("state", "");
  }, [selectedCountry, form]);

  return (
    <div className="contact-form-body">
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
        <Row gutter={[16, 16]} align="top">
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="name"
              label={reqLabel("Name")}
              size="large"
              placeholder="Enter your name"
              maxLength={100}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="companyName"
              label={reqLabel("Company Name")}
              size="large"
              placeholder="Enter company name"
              maxLength={50}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormSelect
              control={form.control}
              name="country"
              label={reqLabel("Country")}
              size="large"
              placeholder="Select Country"
              loading={countriesLoading}
              showSearch
              optionFilterProp="label"
              options={countries.map((c) => ({
                value: c.code,
                label: c.name,
              }))}
              className="contact-field-full"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormSelect
              control={form.control}
              name="state"
              label={optLabel("State")}
              size="large"
              placeholder="Select State"
              loading={statesLoading}
              showSearch
              optionFilterProp="label"
              options={states.map((s) => ({
                value: s.code,
                label: s.name,
              }))}
              className="contact-field-full"
              allowClear
              disabled={!selectedCountry}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.full}>
            <FormInput
              control={form.control}
              name="city"
              label={reqLabel("City")}
              size="large"
              placeholder="Enter city"
              maxLength={150}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="phone"
              label={optLabel("Phone")}
              size="large"
              placeholder="Enter phone number"
              maxLength={15}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="mobile"
              label={optLabel("Mobile")}
              size="large"
              placeholder="Enter mobile number"
              maxLength={11}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.full}>
            <FormInput
              control={form.control}
              name="email"
              type="email"
              label={reqLabel("Email")}
              size="large"
              placeholder="Enter email address"
              maxLength={300}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
        </Row>
      )}

      <FormInput
        control={form.control}
        name="subject"
        label={reqLabel("Subject")}
        size="large"
        placeholder="Enter subject"
        maxLength={100}
        formItemProps={FIELD_ITEM_PROPS}
      />

      <FormTextarea
        control={form.control}
        name="message"
        label={reqLabel("Message")}
        placeholder="Type your message here..."
        maxLength={5000}
        rows={5}
        showCount
        formItemProps={FIELD_ITEM_PROPS}
      />
    </div>
  );
}
