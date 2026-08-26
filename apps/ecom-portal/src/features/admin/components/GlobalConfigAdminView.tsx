// Modified by Sekar Nagarajan (2026-08-26 16:35)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  FormInput,
  FormInputNumber,
  FormSwitch,
} from "@solverminds/shared-ui";
import { Card, Col, Row, Typography } from "antd";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import {
  GlobalConfigSchema,
  type GlobalConfig,
} from "../types/admin.types";
import { AdminLoadingCenter } from "./admin-loading-center";
import { AdminPanelShell } from "./AdminPanelShell";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const TOGGLE_ITEM_PROPS = {
  layout: "horizontal" as const,
  colon: false,
  className: "admin-config-toggle",
};

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  enableLoginCaptcha: true,
  captchaSecretKey: "",
  attemptLimit: 3,
  accountLockDurationMinutes: 30,
  enablePasswordValidation: true,
  allowIncompletedRegToLogin: true,
  v1DataEnableStatus: true,
  dashboardDisplay: true,
};

interface GlobalConfigAdminViewProps {
  config?: GlobalConfig;
  onSave: (config: GlobalConfig) => void | Promise<void>;
}

function optLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

export function GlobalConfigAdminView({
  config,
  onSave,
}: GlobalConfigAdminViewProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<GlobalConfig>({
    resolver: zodResolver(GlobalConfigSchema) as Resolver<GlobalConfig>,
    defaultValues: DEFAULT_GLOBAL_CONFIG,
    values: config,
    mode: "onChange",
  });

  const handleCancel = () => {
    form.reset(config ?? DEFAULT_GLOBAL_CONFIG);
  };

  const handleUpdate = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      await onSave(values);
    } finally {
      setIsSaving(false);
    }
  });

  if (!config) {
    return (
      <AdminPanelShell
        icon={Icons.settings}
        title="Global System Configuration"
        subtitle="Manage core security rules, captcha policies, and feature flags."
      >
        <AdminLoadingCenter />
      </AdminPanelShell>
    );
  }

  return (
    <AdminPanelShell
      icon={Icons.settings}
      title="Global System Configuration"
      subtitle="Manage core security rules, captcha policies, and feature flags."
    >
      <div className="admin-config-form">
        <Row gutter={[16, 16]} align="top">
          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="admin-inner-card"
              type="inner"
              title={
                <span className="admin-config-section__title">
                  <AppIcon icon={Icons.shieldCheck} size={16} />
                  <span>Security & Authentication Controls</span>
                </span>
              }
            >
              <div className="admin-config-section__body">
                <FormSwitch
                  control={form.control}
                  name="enableLoginCaptcha"
                  label={optLabel("Enable Login reCAPTCHA v2")}
                  formItemProps={TOGGLE_ITEM_PROPS}
                />

                <FormInput
                  control={form.control}
                  name="captchaSecretKey"
                  label={optLabel("Captcha Secret Key")}
                  size="large"
                  type="password"
                  autoComplete="off"
                  prefix={<AppIcon icon={Icons.lock} size={16} />}
                  formItemProps={FIELD_ITEM_PROPS}
                />

                <FormInputNumber
                  control={form.control}
                  name="attemptLimit"
                  label={reqLabel("Max Invalid Password Attempts")}
                  size="large"
                  min={1}
                  max={10}
                  numericMode="positive-integer"
                  className="admin-stack-full"
                  formItemProps={FIELD_ITEM_PROPS}
                />

                <FormInputNumber
                  control={form.control}
                  name="accountLockDurationMinutes"
                  label={reqLabel("Account Lock Duration (Minutes)")}
                  size="large"
                  min={5}
                  max={1440}
                  numericMode="positive-integer"
                  className="admin-stack-full"
                  formItemProps={FIELD_ITEM_PROPS}
                />

                <FormSwitch
                  control={form.control}
                  name="enablePasswordValidation"
                  label={optLabel("Enable Password Complexity Rules")}
                  formItemProps={TOGGLE_ITEM_PROPS}
                />
              </div>
            </Card>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="admin-inner-card"
              type="inner"
              title={
                <span className="admin-config-section__title">
                  <AppIcon icon={Icons.layoutGrid} size={16} />
                  <span>Platform & Tenant Feature Flags</span>
                </span>
              }
            >
              <div className="admin-config-section__body">
                <FormSwitch
                  control={form.control}
                  name="allowIncompletedRegToLogin"
                  label={optLabel("Allow Incomplete Registration Login")}
                  formItemProps={TOGGLE_ITEM_PROPS}
                />

                <FormSwitch
                  control={form.control}
                  name="v1DataEnableStatus"
                  label={optLabel("V1 Data Synchronization Engine")}
                  formItemProps={TOGGLE_ITEM_PROPS}
                />

                <FormSwitch
                  control={form.control}
                  name="dashboardDisplay"
                  label={optLabel("Enable Executive Cargo Dashboard")}
                  formItemProps={TOGGLE_ITEM_PROPS}
                />
              </div>
            </Card>
          </Col>
        </Row>

        <div className="admin-form-footer form-step-footer">
          <AppButton onClick={handleCancel} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={isSaving}
            onClick={handleUpdate}
          >
            Update
          </AppButton>
        </div>
      </div>
    </AdminPanelShell>
  );
}
