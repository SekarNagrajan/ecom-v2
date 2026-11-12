// Modified by Sekar Nagarajan (2026-11-12 13:40)
/**
 * Global Configuration — security policy, captcha and platform feature flags as settings rows.
 * RHF `values` keeps the form in sync with the server; the footer and the navigation guard
 * react to `formState.isDirty`.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  FormInput,
  FormInputNumber,
  FormSwitch,
} from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Col, Row, Tooltip } from "antd";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import {
  FIELD_GUTTER,
  FIELD_ITEM_PROPS,
  reqLabel,
} from "../../../components/shared/form-field-label";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import {
  GLOBAL_CONFIG_LIMITS,
  GlobalConfigFormSchema,
  type GlobalConfig,
} from "../types/admin.types";
import { AdminFormFooter } from "./shared/AdminFormFooter";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminSettingRow } from "./shared/AdminSettingRow";
import { AdminUnsavedGuard } from "./shared/AdminUnsavedGuard";

/** Switch rows carry their own title; the Form.Item label is dropped. */
const SWITCH_ITEM_PROPS = { ...FIELD_ITEM_PROPS, className: "admin-setting-row__item" };
const NUMBER_ITEM_PROPS = { ...FIELD_ITEM_PROPS, className: "admin-setting-row__item" };

interface GlobalConfigAdminViewProps {
  config: GlobalConfig;
  onSave: (config: GlobalConfig) => Promise<void>;
  isSaving: boolean;
}

export function GlobalConfigAdminView({
  config,
  onSave,
  isSaving,
}: GlobalConfigAdminViewProps) {
  const toast = useToast();

  const form = useForm<GlobalConfig>({
    resolver: zodResolver(GlobalConfigFormSchema) as Resolver<GlobalConfig>,
    values: config,
    mode: "onChange",
  });
  const { isDirty, dirtyFields } = form.formState;
  const captchaEnabled = form.watch("enableLoginCaptcha");
  const siteKey = form.watch("captchaSecretKey");

  const save = async (values: GlobalConfig) => {
    await onSave(values);
    form.reset(values);
  };

  const handleSave = form.handleSubmit(save);
  const handleCancel = () => form.reset(config);

  const copySiteKey = async () => {
    if (!siteKey) return;
    try {
      await navigator.clipboard.writeText(siteKey);
      toast.success("Site key copied");
    } catch {
      toast.error("Couldn't copy the site key");
    }
  };

  return (
    <AdminSectionPage>
      <AdminUnsavedGuard
        isDirty={isDirty}
        onSave={async () => {
          const valid = await form.trigger();
          if (!valid) return false;
          await save(form.getValues());
          return true;
        }}
        onDiscard={handleCancel}
      />

      <div className="admin-config-form">
        <Row gutter={FIELD_GUTTER} align="top">
          <Col {...RESPONSIVE_COL.formHalf}>
            <AdminFormSection
              icon={Icons.shieldCheck}
              title="Security & Authentication"
              hint="Login protection applied to every customer and agency sign-in."
            >
              <AdminSettingRow
                title="Login reCAPTCHA v2"
                description="Show a reCAPTCHA challenge on the login page."
                control={({ titleId, descriptionId }) => (
                  <FormSwitch
                    control={form.control}
                    name="enableLoginCaptcha"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    formItemProps={SWITCH_ITEM_PROPS}
                  />
                )}
              />
              {captchaEnabled ? (
                <AdminSettingRow
                  stacked
                  title="reCAPTCHA Site Key"
                  description="Public key rendered on the login page. The secret key stays on the server."
                  control={
                    <FormInput
                      control={form.control}
                      name="captchaSecretKey"
                      label={reqLabel("Site Key")}
                      size="large"
                      autoComplete="off"
                      className="admin-mono-input"
                      prefix={<AppIcon icon={Icons.key} size={16} />}
                      suffix={
                        <Tooltip title="Copy Site Key">
                          <AppButton
                            type="text"
                            size="small"
                            aria-label="Copy site key"
                            disabled={!siteKey}
                            icon={<AppIcon icon={Icons.copy} size={14} />}
                            onClick={() => void copySiteKey()}
                          />
                        </Tooltip>
                      }
                      formItemProps={FIELD_ITEM_PROPS}
                    />
                  }
                />
              ) : null}
              <AdminSettingRow
                title="Max Invalid Password Attempts"
                description={`Lock the account after this many failed attempts (${GLOBAL_CONFIG_LIMITS.attemptLimit.min}–${GLOBAL_CONFIG_LIMITS.attemptLimit.max}).`}
                control={({ titleId, descriptionId }) => (
                  <FormInputNumber
                    control={form.control}
                    name="attemptLimit"
                    size="large"
                    min={GLOBAL_CONFIG_LIMITS.attemptLimit.min}
                    max={GLOBAL_CONFIG_LIMITS.attemptLimit.max}
                    numericMode="positive-integer"
                    addonAfter="attempts"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    className="admin-setting-row__number"
                    formItemProps={NUMBER_ITEM_PROPS}
                  />
                )}
              />
              <AdminSettingRow
                title="Account Lock Duration"
                description={`How long a locked account stays locked (${GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.min}–${GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.max} minutes).`}
                control={({ titleId, descriptionId }) => (
                  <FormInputNumber
                    control={form.control}
                    name="accountLockDurationMinutes"
                    size="large"
                    min={GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.min}
                    max={GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.max}
                    numericMode="positive-integer"
                    addonAfter="minutes"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    className="admin-setting-row__number"
                    formItemProps={NUMBER_ITEM_PROPS}
                  />
                )}
              />
              <AdminSettingRow
                title="Password Complexity Rules"
                description="Require upper/lower case, a number and a symbol in new passwords."
                control={({ titleId, descriptionId }) => (
                  <FormSwitch
                    control={form.control}
                    name="enablePasswordValidation"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    formItemProps={SWITCH_ITEM_PROPS}
                  />
                )}
              />
            </AdminFormSection>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <AdminFormSection
              icon={Icons.layoutGrid}
              title="Platform & Feature Flags"
              hint="Portal-wide behaviour switches."
            >
              <AdminSettingRow
                title="Allow Incomplete Registration Login"
                description="Let users whose registration is still pending approval sign in with limited access."
                control={({ titleId, descriptionId }) => (
                  <FormSwitch
                    control={form.control}
                    name="allowIncompletedRegToLogin"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    formItemProps={SWITCH_ITEM_PROPS}
                  />
                )}
              />
              <AdminSettingRow
                title="V1 Data Synchronization"
                description="Keep syncing shipment data from the legacy V1 engine."
                control={({ titleId, descriptionId }) => (
                  <FormSwitch
                    control={form.control}
                    name="v1DataEnableStatus"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    formItemProps={SWITCH_ITEM_PROPS}
                  />
                )}
              />
              <AdminSettingRow
                title="Executive Cargo Dashboard"
                description="Show the cargo dashboard as the landing page after login."
                control={({ titleId, descriptionId }) => (
                  <FormSwitch
                    control={form.control}
                    name="dashboardDisplay"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                    formItemProps={SWITCH_ITEM_PROPS}
                  />
                )}
              />
            </AdminFormSection>
          </Col>
        </Row>

        <AdminFormFooter
          isDirty={isDirty}
          isSaving={isSaving}
          dirtyCount={Object.keys(dirtyFields).length}
          onCancel={handleCancel}
          onSave={() => void handleSave()}
        />
      </div>
    </AdminSectionPage>
  );
}
