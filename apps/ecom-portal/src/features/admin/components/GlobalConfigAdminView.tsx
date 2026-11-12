// Modified by Sekar Nagarajan (2026-11-12 17:30)
/**
 * Global Configuration — login protection, account lockout and platform feature flags.
 *
 * UX model: settings are full-width cards of rows (switch / number / key) with per-row "Modified"
 * markers and revert. A side rail summarises the resulting security posture and lists every pending
 * change (saved → new) so the admin can review before saving; weakening a protection raises a
 * warning and a confirmation. The lockout rule reads as a sentence with duration presets. RHF
 * `values` keeps the form in sync with the server; the footer and the navigation guard react to
 * `formState.isDirty`.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppSegmented,
  FormInput,
  FormInputNumber,
  FormSwitch,
} from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { Alert, Tooltip, Typography } from "antd";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { FIELD_ITEM_PROPS, reqLabel } from "../../../components/shared/form-field-label";
import {
  GLOBAL_CONFIG_LIMITS,
  GlobalConfigFormSchema,
  type GlobalConfig,
} from "../types/admin.types";
import { AdminFormFooter } from "./shared/AdminFormFooter";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminSettingRow } from "./shared/AdminSettingRow";
import { AdminStatusPill, type AdminPillTone } from "./shared/AdminStatusPill";
import { AdminUnsavedGuard } from "./shared/AdminUnsavedGuard";

const { Text } = Typography;

/** Rows carry their own title / description; the Form.Item label is dropped. */
const ROW_ITEM_PROPS = { ...FIELD_ITEM_PROPS, className: "admin-setting-row__item" };

type GlobalConfigField = keyof GlobalConfig;
type SwitchField = Extract<
  GlobalConfigField,
  | "enableLoginCaptcha"
  | "enablePasswordValidation"
  | "allowIncompletedRegToLogin"
  | "v1DataEnableStatus"
  | "dashboardDisplay"
>;

const LOCK_PRESETS: { value: number; label: string }[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hr" },
  { value: 240, label: "4 hrs" },
  { value: 1440, label: "24 hrs" },
];
const CUSTOM_PRESET = "custom";

const FIELD_LABELS: Record<GlobalConfigField, string> = {
  enableLoginCaptcha: "Login reCAPTCHA",
  captchaSecretKey: "reCAPTCHA site key",
  attemptLimit: "Max invalid attempts",
  accountLockDurationMinutes: "Account lock duration",
  enablePasswordValidation: "Password complexity rules",
  allowIncompletedRegToLogin: "Incomplete registration login",
  v1DataEnableStatus: "V1 data synchronization",
  dashboardDisplay: "Executive cargo dashboard",
};

interface GlobalConfigAdminViewProps {
  config: GlobalConfig;
  onSave: (config: GlobalConfig) => Promise<void>;
  isSaving: boolean;
}

/** 30 → "30 minutes", 90 → "1 hr 30 min", 1440 → "24 hours". */
export function formatLockDuration(minutes: number | undefined): string {
  if (!minutes || !Number.isFinite(minutes)) return "—";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours} hr ${rest} min`;
}

/** Human-readable value for the pending-changes list. */
export function formatConfigValue(field: GlobalConfigField, value: unknown): string {
  if (typeof value === "boolean") return value ? "On" : "Off";
  if (field === "accountLockDurationMinutes") return formatLockDuration(Number(value));
  if (field === "attemptLimit") return `${value ?? "—"} attempts`;
  if (field === "captchaSecretKey") {
    const key = String(value ?? "");
    return key ? `${key.slice(0, 6)}…${key.slice(-4)}` : "not set";
  }
  return String(value ?? "—");
}

/** Which protections the on-screen values weaken compared with what is saved. */
export function weakenedProtections(saved: GlobalConfig, next: GlobalConfig): string[] {
  const out: string[] = [];
  if (saved.enableLoginCaptcha && !next.enableLoginCaptcha) out.push("Login reCAPTCHA will be turned off");
  if (saved.enablePasswordValidation && !next.enablePasswordValidation) out.push("Password complexity rules will be turned off");
  if (next.attemptLimit > saved.attemptLimit) out.push(`Accounts lock after ${next.attemptLimit} attempts instead of ${saved.attemptLimit}`);
  if (next.accountLockDurationMinutes < saved.accountLockDurationMinutes) {
    out.push(`Lockout shortens to ${formatLockDuration(next.accountLockDurationMinutes)}`);
  }
  return out;
}

const SITE_KEY_PATTERN = /^6L[0-9A-Za-z_-]{38}$/;

export function GlobalConfigAdminView({
  config,
  onSave,
  isSaving,
}: GlobalConfigAdminViewProps) {
  const toast = useToast();
  const confirm = useConfirm();

  const form = useForm<GlobalConfig>({
    resolver: zodResolver(GlobalConfigFormSchema) as Resolver<GlobalConfig>,
    values: config,
    mode: "onChange",
  });
  const { isDirty, dirtyFields } = form.formState;
  const values = form.watch();
  const dirtyKeys = (Object.keys(dirtyFields) as GlobalConfigField[]).filter((k) => dirtyFields[k]);
  const dirtyCount = dirtyKeys.length;
  const isModified = (field: GlobalConfigField) => Boolean(dirtyFields[field]);
  const revert = (field: GlobalConfigField) => form.resetField(field);

  const warnings = weakenedProtections(config, values);
  const lockPreset = LOCK_PRESETS.some((p) => p.value === values.accountLockDurationMinutes)
    ? String(values.accountLockDurationMinutes)
    : CUSTOM_PRESET;
  const siteKeyLooksValid = !values.captchaSecretKey || SITE_KEY_PATTERN.test(values.captchaSecretKey);

  const protections: { label: string; on: boolean; icon: typeof Icons.shieldCheck; detail: string }[] = [
    {
      label: "Login reCAPTCHA",
      on: values.enableLoginCaptcha,
      icon: Icons.shieldCheck,
      detail: values.enableLoginCaptcha
        ? values.captchaSecretKey
          ? "Site key set"
          : "Site key missing"
        : "Bots are not challenged at login",
    },
    {
      label: "Password rules",
      on: values.enablePasswordValidation,
      icon: Icons.key,
      detail: values.enablePasswordValidation ? "Complexity enforced" : "Any password accepted",
    },
    {
      label: "Account lockout",
      on: true,
      icon: Icons.lock,
      detail: `${values.attemptLimit ?? "—"} attempts → ${formatLockDuration(values.accountLockDurationMinutes)}`,
    },
  ];
  const protectionsOn = protections.filter((p) => p.on).length;
  const postureTone: AdminPillTone =
    protectionsOn === protections.length ? "success" : protectionsOn >= 2 ? "warning" : "error";

  const save = async (next: GlobalConfig) => {
    await onSave(next);
    form.reset(next);
  };

  const handleSave = form.handleSubmit((next) => {
    const weakened = weakenedProtections(config, next);
    if (weakened.length === 0) return save(next);
    confirm.danger({
      title: "Weaken login protection?",
      content: (
        <ul className="admin-confirm-list">
          {weakened.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ),
      okText: "Save anyway",
      cancelText: "Keep editing",
      onOk: () => save(next),
    });
  });
  const handleCancel = () => form.reset(config);

  const setLockPreset = (value: string) => {
    if (value === CUSTOM_PRESET) return;
    form.setValue("accountLockDurationMinutes", Number(value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const copySiteKey = async () => {
    if (!values.captchaSecretKey) return;
    try {
      await navigator.clipboard.writeText(values.captchaSecretKey);
      toast.success("Site key copied");
    } catch {
      toast.error("Couldn't copy the site key");
    }
  };

  const switchRow = (
    field: SwitchField,
    title: string,
    description: string,
    icon: typeof Icons.shieldCheck,
  ) => (
    <AdminSettingRow
      icon={icon}
      title={title}
      description={description}
      modified={isModified(field)}
      onRevert={() => revert(field)}
      control={({ titleId, descriptionId }) => (
        <FormSwitch
          control={form.control}
          name={field}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          formItemProps={ROW_ITEM_PROPS}
        />
      )}
    />
  );

  const rail = (
    <aside className="admin-config-rail" aria-label="Security posture and pending changes">
      <div className="admin-posture">
        <div className="admin-posture__head">
          <Text strong className="admin-posture__title">
            Security posture
          </Text>
          <AdminStatusPill tone={postureTone} dot={false}>
            {protectionsOn} of {protections.length} on
          </AdminStatusPill>
        </div>
        <ul className="admin-posture__list">
          {protections.map((p) => (
            <li
              key={p.label}
              className={["admin-posture__item", p.on ? "" : "admin-posture__item--off"]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="admin-posture__icon" aria-hidden>
                <AppIcon icon={p.on ? Icons.checkCircle : Icons.circleX} size={16} />
              </span>
              <span className="admin-posture__copy">
                <span className="admin-posture__label">{p.label}</span>
                <Text type="secondary" className="admin-posture__detail">
                  {p.detail}
                </Text>
              </span>
            </li>
          ))}
        </ul>
        <Text type="secondary" className="admin-posture__note">
          Reflects the values on screen, including unsaved edits.
        </Text>
      </div>

      {warnings.length > 0 ? (
        <Alert
          type="warning"
          showIcon
          className="admin-config-warning"
          title="This change weakens login protection"
          description={
            <ul className="admin-confirm-list">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          }
        />
      ) : null}

      <div className="admin-pending" aria-live="polite">
        <div className="admin-pending__head">
          <Text strong className="admin-pending__title">
            Pending changes
          </Text>
          <AdminStatusPill tone={dirtyCount ? "warning" : "neutral"} dot={false}>
            {dirtyCount}
          </AdminStatusPill>
        </div>
        {dirtyCount === 0 ? (
          <Text type="secondary" className="admin-pending__empty">
            Everything matches the saved configuration.
          </Text>
        ) : (
          <ul className="admin-pending__list">
            {dirtyKeys.map((field) => (
              <li key={field} className="admin-pending__item">
                <span className="admin-pending__field">{FIELD_LABELS[field]}</span>
                <span className="admin-pending__diff">
                  <Text type="secondary" delete>
                    {formatConfigValue(field, config[field])}
                  </Text>
                  <AppIcon icon={Icons.arrowRight} size={12} className="admin-pending__arrow" />
                  <Text strong>{formatConfigValue(field, values[field])}</Text>
                </span>
                <Tooltip title={`Revert ${FIELD_LABELS[field]}`}>
                  <AppButton
                    type="text"
                    size="small"
                    aria-label={`Revert ${FIELD_LABELS[field]}`}
                    icon={<AppIcon icon={Icons.undo2} size={14} />}
                    onClick={() => revert(field)}
                  />
                </Tooltip>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );

  return (
    <AdminSectionPage
      footer={
        <AdminFormFooter
          isDirty={isDirty}
          isSaving={isSaving}
          dirtyCount={dirtyCount}
          onCancel={handleCancel}
          onSave={() => void handleSave()}
        />
      }
    >
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

      <div className="admin-config-layout">
        <div className="admin-config-main">
          <AdminFormSection
            icon={Icons.shieldCheck}
            title="Login Protection"
            hint="Applied to every customer and agency sign-in."
          >
            {switchRow(
              "enableLoginCaptcha",
              "Login reCAPTCHA v2",
              "Show a reCAPTCHA challenge on the login page.",
              Icons.shieldCheck,
            )}
            {values.enableLoginCaptcha ? (
              <AdminSettingRow
                stacked
                title="reCAPTCHA Site Key"
                description="Public key rendered on the login page. The secret key stays on the server."
                modified={isModified("captchaSecretKey")}
                onRevert={() => revert("captchaSecretKey")}
                control={
                  <div className="admin-setting-row__stack">
                    <FormInput
                      control={form.control}
                      name="captchaSecretKey"
                      label={reqLabel("Site Key")}
                      size="large"
                      autoComplete="off"
                      autoFocus={!config.captchaSecretKey}
                      placeholder="6Lc…"
                      className="admin-mono-input"
                      prefix={<AppIcon icon={Icons.key} size={16} />}
                      suffix={
                        <Tooltip title="Copy Site Key">
                          <AppButton
                            type="text"
                            size="small"
                            aria-label="Copy site key"
                            disabled={!values.captchaSecretKey}
                            icon={<AppIcon icon={Icons.copy} size={14} />}
                            onClick={() => void copySiteKey()}
                          />
                        </Tooltip>
                      }
                      formItemProps={FIELD_ITEM_PROPS}
                    />
                    {!siteKeyLooksValid ? (
                      <Text type="warning" className="admin-field-hint">
                        Google reCAPTCHA v2 site keys start with “6L” and are 40 characters long — double-check this value.
                      </Text>
                    ) : null}
                  </div>
                }
              />
            ) : null}
            {switchRow(
              "enablePasswordValidation",
              "Password Complexity Rules",
              "Require upper and lower case, a number and a symbol in new passwords.",
              Icons.key,
            )}
          </AdminFormSection>

          <AdminFormSection
            icon={Icons.lock}
            title="Account Lockout"
            hint="What happens after repeated failed sign-ins."
          >
            <div className="admin-rule-sentence" role="group" aria-label="Lockout rule">
              <span className="admin-rule-sentence__text">After</span>
              <FormInputNumber
                control={form.control}
                name="attemptLimit"
                size="large"
                min={GLOBAL_CONFIG_LIMITS.attemptLimit.min}
                max={GLOBAL_CONFIG_LIMITS.attemptLimit.max}
                numericMode="positive-integer"
                aria-label="Maximum invalid password attempts"
                className="admin-rule-sentence__number"
                formItemProps={ROW_ITEM_PROPS}
              />
              <span className="admin-rule-sentence__text">
                failed sign-in attempts, lock the account for
              </span>
              <AppSegmented<string>
                value={lockPreset}
                onChange={setLockPreset}
                options={[
                  ...LOCK_PRESETS.map((p) => ({ value: String(p.value), label: p.label })),
                  { value: CUSTOM_PRESET, label: "Custom" },
                ]}
                aria-label="Account lock duration preset"
                className="admin-rule-sentence__presets"
              />
              {lockPreset === CUSTOM_PRESET ? (
                <FormInputNumber
                  control={form.control}
                  name="accountLockDurationMinutes"
                  size="large"
                  min={GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.min}
                  max={GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.max}
                  step={5}
                  numericMode="positive-integer"
                  addonAfter="minutes"
                  aria-label="Account lock duration in minutes"
                  className="admin-rule-sentence__number admin-rule-sentence__number--wide"
                  formItemProps={ROW_ITEM_PROPS}
                />
              ) : null}
            </div>
            <div className="admin-rule-sentence__meta">
              <Text type="secondary">
                Attempts {GLOBAL_CONFIG_LIMITS.attemptLimit.min}–{GLOBAL_CONFIG_LIMITS.attemptLimit.max} ·
                duration {GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.min}–
                {GLOBAL_CONFIG_LIMITS.accountLockDurationMinutes.max} minutes. Locked accounts reopen
                automatically after {formatLockDuration(values.accountLockDurationMinutes)}.
              </Text>
              <span className="admin-rule-sentence__badges">
                {isModified("attemptLimit") ? (
                  <AppButton type="link" size="small" icon={<AppIcon icon={Icons.undo2} size={12} />} onClick={() => revert("attemptLimit")}>
                    Revert attempts
                  </AppButton>
                ) : null}
                {isModified("accountLockDurationMinutes") ? (
                  <AppButton type="link" size="small" icon={<AppIcon icon={Icons.undo2} size={12} />} onClick={() => revert("accountLockDurationMinutes")}>
                    Revert duration
                  </AppButton>
                ) : null}
              </span>
            </div>
          </AdminFormSection>

          <AdminFormSection
            icon={Icons.layoutGrid}
            title="Platform & Feature Flags"
            hint="Portal-wide behaviour switches."
          >
            {switchRow(
              "allowIncompletedRegToLogin",
              "Allow Incomplete Registration Login",
              "Let users whose registration is still pending approval sign in with limited access.",
              Icons.userPlus,
            )}
            {switchRow(
              "v1DataEnableStatus",
              "V1 Data Synchronization",
              "Keep syncing shipment data from the legacy V1 engine.",
              Icons.refreshCw,
            )}
            {switchRow(
              "dashboardDisplay",
              "Executive Cargo Dashboard",
              "Show the cargo dashboard as the landing page after login.",
              Icons.layoutDashboard,
            )}
          </AdminFormSection>
        </div>

        {rail}
      </div>
    </AdminSectionPage>
  );
}
