// Modified by Sekar Nagarajan (2026-11-11 15:45)
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@solverminds/auth";
import { AppButton, AppDrawer, FormInput } from "@solverminds/shared-ui";
import { Col, Row, Typography } from "antd";
import { useEffect, type ReactNode } from "react";
import {
  Controller,
  useForm,
  type Control,
  type Resolver,
} from "react-hook-form";

import { AppIcon, Icons, NavIcons } from "../../../../components/icons";
import type { AppIconProps } from "../../../../components/icons";
import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import {
  useCreateSubUserMutation,
  useUpdateSubUserMutation,
} from "../../api/user-creation.queries";
import type {
  CreateSubUserPayload,
  ProvisionMode,
  SubUser,
  UpdateSubUserPayload,
} from "../../types/user-creation.types";
import {
  CREATE_SUB_USER_DEFAULTS,
  USC_MODULE_OPTIONS,
  createSubUserSchema,
  updateSubUserSchema,
} from "../../types/user-creation.types";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const FIELD_GUTTER: [number, number] = [16, 20];

/** Sidebar nav SVG icons — same set used in AuthenticatedSidebar. */
const MODULE_ICONS: Record<string, AppIconProps["icon"]> = {
  SCH: NavIcons.schedules,
  TRK: NavIcons.tracking,
  BKG: NavIcons.booking,
  SI: NavIcons.shippingInstruction,
  VGM: NavIcons.vgm,
  BL: NavIcons.billOfLading,
};

interface UscUpsertDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  editingUser?: SubUser | null;
  limitReached: boolean;
  onClose: () => void;
  onLimitBlocked: () => void;
}

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

function sessionCompanyName(
  user: ReturnType<typeof useAuthStore.getState>["user"],
): string {
  if (!user) return "";
  const active = user.activeSubCustomer;
  const match = user.subCustomerAccounts?.find((a) => a.custCode === active);
  return match?.compName || user.company || "";
}

function toUpdateDefaults(user: SubUser): UpdateSubUserPayload {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    companyName: user.companyName,
    custCountryCode: user.custCountryCode || "+1",
    custPhoneCode: user.custPhoneCode || "212",
    custPhoneNo: user.custPhoneNo,
    mobileCode: user.mobileCode || "+1",
    mobileNo: user.mobileNo,
    defLanguage: user.defLanguage || "en",
    prefLanguage: user.prefLanguage || "en",
    allowedModules: user.allowedModules?.length
      ? user.allowedModules
      : ["SCH", "TRK"],
  };
}

function toggleModule(moduleValue: string, current: string[]) {
  if (current.includes(moduleValue)) {
    return current.filter((v) => v !== moduleValue);
  }
  return [...current, moduleValue];
}

function SectionHeader({
  step,
  icon,
  title,
  hint,
  extra,
}: {
  step?: number;
  icon?: AppIconProps["icon"];
  title: string;
  hint: string;
  extra?: ReactNode;
}) {
  return (
    <div className="usc-form-section__header">
      {typeof step === "number" ? (
        <span className="usc-form-section__step" aria-hidden>
          {step}
        </span>
      ) : icon ? (
        <span className="usc-form-section__icon" aria-hidden>
          <AppIcon icon={icon} size={16} />
        </span>
      ) : null}
      <div className="usc-form-section__heading">
        <h3 className="usc-form-section__title">{title}</h3>
        <p className="usc-form-section__hint">{hint}</p>
      </div>
      {extra ? <div className="usc-form-section__extra">{extra}</div> : null}
    </div>
  );
}

function ProfileFields({
  control,
}: {
  control: Control<CreateSubUserPayload> | Control<UpdateSubUserPayload>;
}) {
  const typedControl = control as Control<CreateSubUserPayload>;
  return (
    <Row gutter={FIELD_GUTTER}>
      <Col {...RESPONSIVE_COL.formHalf}>
        <FormInput
          control={typedControl}
          name="firstName"
          label={reqLabel("First Name")}
          size="large"
          prefix={<AppIcon icon={Icons.user} size={16} />}
          placeholder="John"
          formItemProps={FIELD_ITEM_PROPS}
        />
      </Col>
      <Col {...RESPONSIVE_COL.formHalf}>
        <FormInput
          control={typedControl}
          name="lastName"
          label={reqLabel("Last Name")}
          size="large"
          prefix={<AppIcon icon={Icons.user} size={16} />}
          placeholder="Doe"
          formItemProps={FIELD_ITEM_PROPS}
        />
      </Col>
      <Col {...RESPONSIVE_COL.formHalf}>
        <FormInput
          control={typedControl}
          name="email"
          type="email"
          label={reqLabel("Email Address")}
          size="large"
          prefix={<AppIcon icon={Icons.mail} size={16} />}
          placeholder="john.doe@company.com"
          formItemProps={FIELD_ITEM_PROPS}
        />
      </Col>
      <Col {...RESPONSIVE_COL.formHalf}>
        <FormInput
          control={typedControl}
          name="custPhoneNo"
          label={reqLabel("Contact Phone")}
          size="large"
          prefix={<AppIcon icon={Icons.phone} size={16} />}
          placeholder="+1 212 555-0199"
          formItemProps={FIELD_ITEM_PROPS}
        />
      </Col>
      <Col {...RESPONSIVE_COL.full}>
        <FormInput
          control={typedControl}
          name="companyName"
          label={reqLabel("Company")}
          size="large"
          prefix={<AppIcon icon={Icons.building} size={16} />}
          placeholder="Company name"
          formItemProps={FIELD_ITEM_PROPS}
        />
      </Col>
    </Row>
  );
}

function ModulePicker({
  control,
  error,
  showMetaInline = true,
}: {
  control: Control<CreateSubUserPayload> | Control<UpdateSubUserPayload>;
  error?: string;
  showMetaInline?: boolean;
}) {
  return (
    <Controller
      control={control as Control<CreateSubUserPayload>}
      name="allowedModules"
      render={({ field }) => {
        const selected = field.value ?? [];
        return (
          <div className="usc-modules">
            {showMetaInline ? (
              <div className="usc-modules__meta">
                <span className="usc-modules__count">
                  {selected.length} of {USC_MODULE_OPTIONS.length} selected
                </span>
                {selected.length > 0 ? (
                  <button
                    type="button"
                    className="usc-modules__clear"
                    onClick={() => field.onChange([])}
                  >
                    Clear All
                  </button>
                ) : null}
              </div>
            ) : null}
            <div
              className="usc-modules-grid"
              role="group"
              aria-label="Module access"
            >
              {USC_MODULE_OPTIONS.map((option) => {
                const isOn = selected.includes(option.value);
                const moduleIcon =
                  MODULE_ICONS[option.value] ?? NavIcons.dashboard;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      "usc-module-card",
                      isOn ? "usc-module-card--selected" : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={isOn}
                    onClick={() =>
                      field.onChange(toggleModule(option.value, selected))
                    }
                  >
                    <span className="usc-module-card__icon" aria-hidden>
                      <AppIcon icon={moduleIcon} size={18} variant="nav" />
                    </span>
                    <span className="usc-module-card__copy">
                      <span className="usc-module-card__code">
                        {option.value}
                      </span>
                      <span className="usc-module-card__label">
                        {option.label.replace(` (${option.value})`, "")}
                      </span>
                    </span>
                    <span
                      className={[
                        "usc-module-card__check",
                        isOn ? "usc-module-card__check--on" : undefined,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-hidden
                    >
                      {isOn ? (
                        <AppIcon
                          icon={Icons.check}
                          size={12}
                          className="usc-module-card__tick"
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
            {error ? (
              <Text type="danger" className="usc-modules-error">
                {error}
              </Text>
            ) : null}
          </div>
        );
      }}
    />
  );
}

function ModuleHeaderExtra({
  control,
}: {
  control: Control<CreateSubUserPayload> | Control<UpdateSubUserPayload>;
}) {
  return (
    <Controller
      control={control as Control<CreateSubUserPayload>}
      name="allowedModules"
      render={({ field }) => {
        const selected = field.value ?? [];
        return (
          <div className="usc-modules__header-actions">
            <span className="usc-modules__count">
              {selected.length} of {USC_MODULE_OPTIONS.length} selected
            </span>
            {selected.length > 0 ? (
              <button
                type="button"
                className="usc-modules__clear"
                onClick={() => field.onChange([])}
              >
                Clear All
              </button>
            ) : null}
          </div>
        );
      }}
    />
  );
}

export function UscUpsertDrawer({
  open,
  mode,
  editingUser,
  limitReached,
  onClose,
  onLimitBlocked,
}: UscUpsertDrawerProps) {
  const authUser = useAuthStore((s) => s.user);
  const { mutateAsync: createSubUser, isPending: isCreating } =
    useCreateSubUserMutation();
  const { mutateAsync: updateSubUser, isPending: isUpdating } =
    useUpdateSubUserMutation();
  const isPending = isCreating || isUpdating;
  const isEdit = mode === "edit";

  const createForm = useForm<CreateSubUserPayload>({
    resolver: zodResolver(
      createSubUserSchema,
    ) as Resolver<CreateSubUserPayload>,
    defaultValues: {
      ...CREATE_SUB_USER_DEFAULTS,
      companyName: sessionCompanyName(authUser),
    },
  });

  const editForm = useForm<UpdateSubUserPayload>({
    resolver: zodResolver(
      updateSubUserSchema,
    ) as Resolver<UpdateSubUserPayload>,
    defaultValues: editingUser
      ? toUpdateDefaults(editingUser)
      : toUpdateDefaults({
          ...CREATE_SUB_USER_DEFAULTS,
          id: "",
          isActive: true,
          createdDate: "",
          inviteStatus: "NONE",
        } as SubUser),
  });

  const provisionMode = createForm.watch("provisionMode");
  const modulesError = (
    isEdit ? editForm : createForm
  ).formState.errors.allowedModules?.message?.toString();

  useEffect(() => {
    if (!open) return;
    if (isEdit && editingUser) {
      editForm.reset(toUpdateDefaults(editingUser));
      return;
    }
    createForm.reset({
      ...CREATE_SUB_USER_DEFAULTS,
      companyName: sessionCompanyName(authUser),
    });
  }, [open, isEdit, editingUser, authUser, createForm, editForm]);

  const handleClose = () => {
    onClose();
    createForm.reset({
      ...CREATE_SUB_USER_DEFAULTS,
      companyName: sessionCompanyName(authUser),
    });
    if (editingUser) editForm.reset(toUpdateDefaults(editingUser));
  };

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (limitReached) {
      onLimitBlocked();
      return;
    }
    await createSubUser({
      ...values,
      password:
        values.provisionMode === "PASSWORD" ? values.password : undefined,
    });
    handleClose();
  });

  const handleUpdate = editForm.handleSubmit(async (values) => {
    if (!editingUser) return;
    await updateSubUser({ id: editingUser.id, payload: values });
    handleClose();
  });

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      placement="right"
      dialogSize="md"
      destroyOnClose
      maskClosable={!isPending}
      keyboard={!isPending}
      classNames={{
        header: "usc-drawer-header-bar",
        body: "usc-drawer-body custom-scroll",
        footer: "usc-drawer-footer-bar",
      }}
      styles={{ body: { padding: 0 } }}
      title={
        <div className="usc-drawer-title">
          <span className="usc-drawer-title__icon" aria-hidden>
            <AppIcon icon={isEdit ? Icons.user : Icons.userPlus} size={20} />
          </span>
          <div className="usc-drawer-title__copy">
            <div className="usc-drawer-title__text">
              {isEdit ? "Edit Sub-User" : "Add Sub-User"}
            </div>
            <div className="usc-drawer-title__meta">
              {isEdit
                ? "Update profile details and module access."
                : "Provision access, then complete profile and modules."}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="usc-drawer-footer form-step-footer">
          <AppButton danger onClick={handleClose} disabled={isPending}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={
              <AppIcon
                icon={
                  isEdit
                    ? Icons.check
                    : provisionMode === "INVITE"
                      ? Icons.send
                      : Icons.userPlus
                }
                size={16}
              />
            }
            loading={isPending}
            onClick={isEdit ? handleUpdate : handleCreate}
          >
            {isEdit
              ? "Save Changes"
              : provisionMode === "INVITE"
                ? "Send Invite"
                : "Create User"}
          </AppButton>
        </div>
      }
    >
      {!isEdit ? (
        <section className="usc-form-section">
          <SectionHeader
            step={1}
            icon={Icons.key}
            title="Access method"
            hint="Choose how this user will sign in for the first time."
          />

          <Controller
            control={createForm.control}
            name="provisionMode"
            render={({ field }) => (
              <div
                className="usc-provision-options"
                role="radiogroup"
                aria-label="Access method"
              >
                {(
                  [
                    {
                      value: "PASSWORD" as ProvisionMode,
                      title: "Set password",
                      description:
                        "Create credentials now. User can sign in immediately.",
                      icon: Icons.lock,
                    },
                    {
                      value: "INVITE" as ProvisionMode,
                      title: "Send invite",
                      description:
                        "Email a link so they set their own password.",
                      icon: Icons.mail,
                    },
                  ] as const
                ).map((option) => {
                  const selected = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={[
                        "usc-provision-option",
                        selected ? "usc-provision-option--selected" : undefined,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => field.onChange(option.value)}
                    >
                      <span className="usc-provision-option__icon" aria-hidden>
                        <AppIcon icon={option.icon} size={16} />
                      </span>
                      <span className="usc-provision-option__copy">
                        <span className="usc-provision-option__title">
                          {option.title}
                        </span>
                        <span className="usc-provision-option__desc">
                          {option.description}
                        </span>
                      </span>
                      <span className="usc-provision-option__check" aria-hidden>
                        {selected ? (
                          <AppIcon icon={Icons.check} size={14} />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          />

          <Row gutter={FIELD_GUTTER} className="usc-form-section__fields">
            <Col {...RESPONSIVE_COL.formHalf}>
              <FormInput
                control={createForm.control}
                name="loginName"
                label={reqLabel("Login Username")}
                size="large"
                prefix={<AppIcon icon={Icons.user} size={16} />}
                placeholder="e.g. SUB_EMP_01"
                formItemProps={FIELD_ITEM_PROPS}
              />
            </Col>
            {provisionMode === "PASSWORD" ? (
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={createForm.control}
                  name="password"
                  type="password"
                  label={reqLabel("Initial Password")}
                  size="large"
                  prefix={<AppIcon icon={Icons.lock} size={16} />}
                  placeholder="Min. 6 characters"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
            ) : (
              <Col {...RESPONSIVE_COL.formHalf}>
                <div className="usc-invite-hint">
                  <AppIcon icon={Icons.mail} size={16} />
                  <div>
                    <strong>Invitation email</strong>
                    <span>
                      They receive a link to set their password securely.
                    </span>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </section>
      ) : (
        <section className="usc-form-section">
          <SectionHeader
            icon={Icons.lock}
            title="Login"
            hint="Username is locked after the account is created."
          />
          <div
            className="usc-locked-login"
            title="Login name cannot be changed"
          >
            <span className="usc-locked-login__leading" aria-hidden>
              <AppIcon icon={Icons.user} size={16} />
            </span>
            <div className="usc-locked-login__copy">
              <span className="usc-locked-login__label">Login Username</span>
              <strong className="usc-locked-login__value">
                {editingUser?.loginName}
              </strong>
            </div>
            <span className="usc-locked-login__badge">
              <AppIcon icon={Icons.lock} size={12} />
              Locked
            </span>
          </div>
        </section>
      )}

      <section className="usc-form-section">
        <SectionHeader
          step={isEdit ? undefined : 2}
          icon={Icons.user}
          title="Profile"
          hint="Contact details shown on the sub-user record."
        />
        <div className="usc-form-section__fields">
          <ProfileFields
            control={isEdit ? editForm.control : createForm.control}
          />
        </div>
      </section>

      <section className="usc-form-section">
        <SectionHeader
          step={isEdit ? undefined : 3}
          icon={Icons.layoutGrid}
          title="Module Access"
          hint="Select at least one portal module this user can open."
          extra={
            isEdit ? (
              <ModuleHeaderExtra control={editForm.control} />
            ) : undefined
          }
        />
        <ModulePicker
          control={isEdit ? editForm.control : createForm.control}
          error={modulesError}
          showMetaInline={!isEdit}
        />
      </section>
    </AppDrawer>
  );
}
