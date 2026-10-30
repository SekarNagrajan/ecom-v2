// Modified by Sekar Nagarajan (2026-09-11 18:25)
import { FormInput, FormSelect, FormTextarea } from "@solverminds/shared-ui";
import { Col, Descriptions, Row, Typography } from "antd";
import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { useAiTextAssist } from "../../ai-assist";
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
  const { t } = useTranslation(["contact-us", "common"]);
  const {
    form,
    isAuthenticated,
    user,
    countries,
    countriesLoading,
    states,
    statesLoading,
  } = controller;
  const { textareaAssistProps } = useAiTextAssist();

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
          <Descriptions.Item label={t("profile.name")}>
            {user.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("profile.company")}>
            {user.company || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("profile.email")}>
            {user.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label={t("profile.role")}>
            {user.role || "-"}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Row gutter={[16, 16]} align="top">
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="name"
              label={reqLabel(t("fields.name"))}
              size="large"
              placeholder={t("placeholders.name")}
              maxLength={100}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="companyName"
              label={reqLabel(t("fields.companyName"))}
              size="large"
              placeholder={t("placeholders.companyName")}
              maxLength={50}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormSelect
              control={form.control}
              name="country"
              label={reqLabel(t("fields.country"))}
              size="large"
              placeholder={t("placeholders.country")}
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
              label={optLabel(t("fields.state"))}
              size="large"
              placeholder={t("placeholders.state")}
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
              label={reqLabel(t("fields.city"))}
              size="large"
              placeholder={t("placeholders.city")}
              maxLength={150}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="phone"
              label={optLabel(t("fields.phone"))}
              size="large"
              placeholder={t("placeholders.phone")}
              maxLength={15}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="mobile"
              label={optLabel(t("fields.mobile"))}
              size="large"
              placeholder={t("placeholders.mobile")}
              maxLength={11}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.full}>
            <FormInput
              control={form.control}
              name="email"
              type="email"
              label={reqLabel(t("fields.email"))}
              size="large"
              placeholder={t("placeholders.email")}
              maxLength={300}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
        </Row>
      )}

      <FormInput
        control={form.control}
        name="subject"
        label={reqLabel(t("fields.subject"))}
        size="large"
        placeholder={t("placeholders.subject")}
        maxLength={100}
        formItemProps={FIELD_ITEM_PROPS}
      />

      <FormTextarea
        control={form.control}
        name="message"
        label={reqLabel(t("fields.message"))}
        placeholder={t("placeholders.message")}
        maxLength={5000}
        rows={5}
        showCount
        formItemProps={FIELD_ITEM_PROPS}
        {...textareaAssistProps}
      />
    </div>
  );
}
