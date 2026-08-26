// Modified by Sekar Nagarajan (2026-08-26 15:55)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDrawer, FormInput } from "@solverminds/shared-ui";
import { Col, Row, Typography } from "antd";
import { Controller, useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../../components/icons";
import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { useCreateSubUserMutation } from "../../api/user-creation.queries";
import type { CreateSubUserPayload } from "../../types/user-creation.types";
import {
  CREATE_SUB_USER_DEFAULTS,
  USC_MODULE_OPTIONS,
  createSubUserSchema,
} from "../../types/user-creation.types";

const { Text, Title } = Typography;

/** Label above input (agenct: form-field-label + vertical Form.Item). */
const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

interface UscCreateDrawerProps {
  open: boolean;
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

function optLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}

export function UscCreateDrawer({
  open,
  limitReached,
  onClose,
  onLimitBlocked,
}: UscCreateDrawerProps) {
  const { mutateAsync: createSubUser, isPending: isCreating } =
    useCreateSubUserMutation();

  const createForm = useForm<CreateSubUserPayload>({
    resolver: zodResolver(
      createSubUserSchema,
    ) as Resolver<CreateSubUserPayload>,
    defaultValues: CREATE_SUB_USER_DEFAULTS,
  });

  const handleClose = () => {
    onClose();
    createForm.reset(CREATE_SUB_USER_DEFAULTS);
  };

  const handleSave = createForm.handleSubmit(async (values) => {
    if (limitReached) {
      onLimitBlocked();
      return;
    }
    await createSubUser(values);
    handleClose();
  });

  const toggleModule = (moduleValue: string, current: string[]) => {
    if (current.includes(moduleValue)) {
      return current.filter((v) => v !== moduleValue);
    }
    return [...current, moduleValue];
  };

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      placement="right"
      dialogSize="md"
      destroyOnClose
      maskClosable={!isCreating}
      keyboard={!isCreating}
      classNames={{
        body: "usc-drawer-body custom-scroll",
        footer: "usc-drawer-footer-bar",
      }}
      styles={{ body: { padding: 0 } }}
      title={
        <div className="usc-drawer-title">
          <AppIcon icon={Icons.userPlus} size={22} />
          <div>
            <Title level={4} className="usc-drawer-title__text">
              Create Sub-User Account
            </Title>
            <Text type="secondary" className="usc-drawer-title__meta">
              Set credentials, profile details, and module access for a new
              company delegate.
            </Text>
          </div>
        </div>
      }
      footer={
        <div className="usc-drawer-footer form-step-footer">
          <AppButton onClick={handleClose} disabled={isCreating}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.userPlus} size={16} />}
            loading={isCreating}
            onClick={handleSave}
          >
            Save
          </AppButton>
        </div>
      }
    >
      <section className="usc-form-section usc-form-section--credentials">
        <div className="usc-form-section__header">
          <AppIcon icon={Icons.key} size={16} />
          <div>
            <Title level={5} className="usc-form-section__title">
              Credentials
            </Title>
            <Text type="secondary" className="usc-form-section__hint">
              Login identity used to sign in to the portal.
            </Text>
          </div>
        </div>
        <Row gutter={[16, 16]}>
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
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={createForm.control}
              name="password"
              type="password"
              label={reqLabel("Initial Password")}
              size="large"
              prefix={<AppIcon icon={Icons.lock} size={16} />}
              placeholder="Enter password"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
        </Row>
      </section>

      <section className="usc-form-section usc-form-section--profile">
        <div className="usc-form-section__header">
          <AppIcon icon={Icons.user} size={16} />
          <div>
            <Title level={5} className="usc-form-section__title">
              Profile
            </Title>
            <Text type="secondary" className="usc-form-section__hint">
              Contact details shown on the sub-user record.
            </Text>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={createForm.control}
              name="firstName"
              label={reqLabel("First Name")}
              size="large"
              placeholder="John"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={createForm.control}
              name="lastName"
              label={reqLabel("Last Name")}
              size="large"
              placeholder="Doe"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={createForm.control}
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
              control={createForm.control}
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
              control={createForm.control}
              name="companyName"
              label={optLabel("Company Profile")}
              size="large"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
        </Row>
      </section>

      <section className="usc-form-section usc-form-section--access">
        <div className="usc-form-section__header">
          <AppIcon icon={Icons.shieldCheck} size={16} />
          <div>
            <Title level={5} className="usc-form-section__title">
              Module Access Entitlements
            </Title>
            <Text type="secondary" className="usc-form-section__hint">
              Choose which portal modules this sub-user can open.
            </Text>
          </div>
        </div>

        <Controller
          control={createForm.control}
          name="allowedModules"
          render={({ field }) => (
            <div
              className="usc-modules-grid"
              role="group"
              aria-label="Module access entitlements"
            >
              {USC_MODULE_OPTIONS.map((option) => {
                const selected = (field.value ?? []).includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      "usc-module-card",
                      selected ? "usc-module-card--selected" : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    onClick={() =>
                      field.onChange(
                        toggleModule(option.value, field.value ?? []),
                      )
                    }
                  >
                    <span className="usc-module-card__code">
                      {option.value}
                    </span>
                    <span className="usc-module-card__label">
                      {option.label.replace(` (${option.value})`, "")}
                    </span>
                    <span className="usc-module-card__check" aria-hidden>
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
      </section>
    </AppDrawer>
  );
}
