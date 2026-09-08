// Modified by Sekar Nagarajan (2026-09-08 15:20)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppDrawer,
  FormInput,
  FormSelect,
} from "@solverminds/shared-ui";
import { Col, Flex, Row, Tag, Typography, theme } from "antd";
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { UserAvatar } from "../../../components/shared/user-avatar";
import {
  getUserFullName,
  getUserInitials,
} from "../../../components/shared/user-name.utils";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { ProfilePhotoModal } from "../../profile-photo/components/profile-photo-modal";
import { useProfilePhoto } from "../../profile-photo/providers/profile-photo-provider";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "../api/user-modules.queries";
import type { CustomerProfile } from "../types/user-modules.types";
import { customerProfileSchema } from "../types/user-modules.types";
import { UmLoadingCenter } from "./um-loading-center";
import { UmPanelHeader } from "./um-panel-header";
import { UserModulesModuleStyles } from "./user-modules-module-styles";

const { Text, Title } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const PROFILE_DESCRIPTION =
  "Manage primary contact information, company details, timezone, and communication preferences.";

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
  const { token } = theme.useToken();
  const isDrawer = Boolean(onClose);
  const { data: profile, isLoading } = useProfileQuery(open);
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfileMutation();
  const { photoUrl } = useProfilePhoto();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

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

  const fullName = getUserFullName(
    profile?.firstName,
    profile?.lastName,
    profile?.loginName || "User",
  );
  const initials = getUserInitials(fullName);
  const roleLabel = profile?.companyName || profile?.customerCode || null;

  const photoSection = (
    <section className="um-profile-photo-card">
      <Flex align="center" gap={token.marginMD}>
        <button
          aria-label="Change profile photo"
          className="um-profile-photo-trigger"
          onClick={() => setPhotoModalOpen(true)}
          onMouseEnter={() => setIsAvatarHovered(true)}
          onMouseLeave={() => setIsAvatarHovered(false)}
          type="button"
        >
          <UserAvatar
            initials={initials}
            src={photoUrl ?? undefined}
            size={64}
            style={{ fontSize: token.fontSizeLG }}
          />
          <span
            className={[
              "um-profile-photo-overlay",
              isAvatarHovered ? "um-profile-photo-overlay--visible" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden
          >
            <AppIcon icon={Icons.camera} size={18} tone="text" />
          </span>
        </button>
        <Flex vertical gap={token.paddingXXS} style={{ flex: 1, minWidth: 0 }}>
          <Title level={5} ellipsis style={{ margin: 0 }}>
            {fullName}
          </Title>
          {roleLabel ? (
            <Text
              type="secondary"
              ellipsis
              style={{ fontSize: token.fontSizeSM }}
            >
              {roleLabel}
            </Text>
          ) : null}
        </Flex>
      </Flex>
    </section>
  );

  const formFields = (
    <div className="um-form-section">
      {photoSection}
      <Row gutter={[16, 16]} align="top">
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
            prefix={<AppIcon icon={Icons.building} size={16} />}
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

  const panelHeader = (
    <UmPanelHeader
      icon={Icons.user}
      title={MODULE_TITLES.profile}
      description={PROFILE_DESCRIPTION}
      // extra={!isDrawer ? verifiedTag : undefined}
      compact={isDrawer}
    />
  );

  const photoModal = (
    <ProfilePhotoModal
      open={photoModalOpen}
      onClose={() => setPhotoModalOpen(false)}
      fullName={fullName}
      initials={initials}
      roleLabel={roleLabel}
    />
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
            header: "um-drawer-header-bar",
            body: "um-drawer-body custom-scroll",
            footer: "um-drawer-footer-bar",
          }}
          styles={{ body: { padding: 0 } }}
          title={panelHeader}
          footer={
            <div className="um-drawer-footer form-step-footer">
              <AppButton onClick={handleClose} disabled={isSaving} danger>
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
          {isLoading ? (
            <UmLoadingCenter />
          ) : (
            <>
              {/* {verifiedTag} */}
              {formFields}
            </>
          )}
        </AppDrawer>
        {photoModal}
      </>
    );
  }

  return (
    <div className="um-page-layout">
      <UserModulesModuleStyles />
      {panelHeader}
      {isLoading ? <UmLoadingCenter fill /> : formFields}
      {!isLoading ? (
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
      {photoModal}
    </div>
  );
}
