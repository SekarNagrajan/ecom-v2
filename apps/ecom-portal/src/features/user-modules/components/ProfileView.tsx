// Modified by Sekar Nagarajan (2026-08-26 16:00)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppDrawer,
  FormInput,
  FormSelect,
} from "@solverminds/shared-ui";
import { Col, Row, Tag, Typography } from "antd";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "../api/user-modules.queries";
import type { CustomerProfile } from "../types/user-modules.types";
import { customerProfileSchema } from "../types/user-modules.types";
import { UmLoadingCenter } from "./um-loading-center";
import { UserModulesModuleStyles } from "./user-modules-module-styles";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (United States)" },
  { value: "es", label: "Spanish (Español)" },
  { value: "zh", label: "Mandarin Chinese (中文)" },
  { value: "de", label: "German (Deutsch)" },
];

const TIMEZONE_OPTIONS = [
  { value: "UTC-5 (EST)", label: "Eastern Standard Time (EST / UTC-5)" },
  { value: "UTC+0 (GMT)", label: "Greenwich Mean Time (GMT / UTC+0)" },
  { value: "UTC+8 (SGT)", label: "Singapore Time (SGT / UTC+8)" },
  { value: "UTC+1 (CET)", label: "Central European Time (CET / UTC+1)" },
];

export interface ProfileViewProps {
  open?: boolean;
  onClose?: () => void;
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

export function ProfileView({ open = true, onClose }: ProfileViewProps) {
  const isDrawer = Boolean(onClose);
  const { data: profile, isLoading } = useProfileQuery(open);
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfileMutation();

  const form = useForm<CustomerProfile>({
    resolver: zodResolver(customerProfileSchema) as Resolver<CustomerProfile>,
    defaultValues: {
      loginName: "",
      customerCode: "",
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneCode: "+1",
      phoneNo: "",
      mobileCode: "+1",
      mobileNo: "",
      taxId: "",
      country: "",
      city: "",
      address: "",
      defLanguage: "en",
      prefTimeZone: "UTC-5 (EST)",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile, form]);

  const handleClose = () => {
    onClose?.();
  };

  const handleSave = form.handleSubmit(async (values) => {
    await updateProfile(values);
    handleClose();
  });

  const formFields = (
    <div className="um-form-section">
      <Row gutter={[16, 16]}>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="loginName"
            label={optLabel("Login Account ID")}
            size="large"
            prefix={<AppIcon icon={Icons.user} size={16} />}
            disabled
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="companyName"
            label={optLabel("Company Name")}
            size="large"
            disabled
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="firstName"
            label={reqLabel("First Name")}
            size="large"
            placeholder="Enter first name"
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="lastName"
            label={reqLabel("Last Name")}
            size="large"
            placeholder="Enter last name"
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="email"
            type="email"
            label={reqLabel("Primary Email Address")}
            size="large"
            prefix={<AppIcon icon={Icons.mail} size={16} />}
            placeholder="Enter email address"
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="phoneNo"
            label={reqLabel("Telephone Number")}
            size="large"
            prefix={<AppIcon icon={Icons.phone} size={16} />}
            placeholder="Enter contact phone"
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="country"
            label={optLabel("Country")}
            size="large"
            prefix={<AppIcon icon={Icons.mapPin} size={16} />}
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormInput
            control={form.control}
            name="taxId"
            label={optLabel("Tax ID / Registration Number")}
            size="large"
            placeholder="Enter Tax ID"
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormSelect
            control={form.control}
            name="defLanguage"
            label={optLabel("Preferred Portal Language")}
            size="large"
            options={LANGUAGE_OPTIONS}
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
        <Col {...RESPONSIVE_COL.formHalf}>
          <FormSelect
            control={form.control}
            name="prefTimeZone"
            label={optLabel("Preferred Timezone")}
            size="large"
            options={TIMEZONE_OPTIONS}
            formItemProps={FIELD_ITEM_PROPS}
          />
        </Col>
      </Row>
    </div>
  );

  const verifiedTag = (
    <Tag
      className="um-verified-tag"
      icon={<AppIcon icon={Icons.shieldCheck} size={14} />}
      color="green"
    >
      Verified Customer ({profile?.customerCode || "CUST-001"})
    </Tag>
  );

  const pageBody = (
    <div className="um-page-layout">
      <ModuleScreenHeader
        icon={Icons.user}
        title={MODULE_TITLES.profile}
        subtitle="Manage primary contact information, company details, timezone, and communication preferences"
        extra={verifiedTag}
      />
      {isLoading ? <UmLoadingCenter fill={!isDrawer} /> : formFields}
      {!isDrawer && !isLoading ? (
        <div className="um-page-actions">
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={isSaving}
            onClick={handleSave}
          >
            Save Profile Updates
          </AppButton>
        </div>
      ) : null}
    </div>
  );

  if (isDrawer) {
    return (
      <>
        <UserModulesModuleStyles />
        <AppDrawer
          open={open}
          onClose={handleClose}
          placement="right"
          dialogSize="md"
          destroyOnClose
          maskClosable={!isSaving}
          keyboard={!isSaving}
          classNames={{
            body: "um-drawer-body custom-scroll",
            footer: "um-drawer-footer-bar",
          }}
          styles={{ body: { padding: 0 } }}
          title={MODULE_TITLES.profile}
          footer={
            <div className="um-drawer-footer form-step-footer">
              <AppButton onClick={handleClose} disabled={isSaving}>
                Cancel
              </AppButton>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.save} size={16} />}
                loading={isSaving}
                onClick={handleSave}
              >
                Save
              </AppButton>
            </div>
          }
        >
          {isLoading ? <UmLoadingCenter /> : formFields}
        </AppDrawer>
      </>
    );
  }

  return pageBody;
}
