// Modified by Sekar Nagarajan (2026-09-01 16:36)
import { Input, Segmented, Typography } from "antd";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { SiEnsStepForm } from "../types/si.types";

const { Text } = Typography;

interface SiEnsDeclarantFieldsProps {
  control: Control<SiEnsStepForm>;
  errors: FieldErrors<SiEnsStepForm>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text type="danger" className="form-field-error">
      {message}
    </Text>
  );
}

function RequiredMark() {
  return <Text type="danger"> *</Text>;
}

export function SiEnsDeclarantFields({
  control,
  errors,
}: SiEnsDeclarantFieldsProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const dErrors = errors.declarant;

  return (
    <div className="form-ens-party-grid">
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.name")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.name"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={150}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.name?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.address")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.address"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={150}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.address?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.address2")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.address2"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={150}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.address2?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.city")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.city"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={150}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.city?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.zipCode")}
        </label>
        <Controller
          control={control}
          name="declarant.zip"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={15}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.country")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.country"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={50}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.country?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.state")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.state"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={50}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.state?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.telephone")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.telephone"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={25}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.telephone?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.eori")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.eori"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={20}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.eori?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.email")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.email"
          render={({ field }) => (
            <Input
              size="large"
              maxLength={100}
              type="email"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={dErrors?.email?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.declarant.filingType")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name="declarant.fillingType"
          render={({ field: { value, onChange } }) => (
            <Segmented
              block
              className="form-field-full-width form-segmented"
              value={value ?? "House BL"}
              onChange={onChange}
              options={[
                {
                  label: t("wizard.ens.options.houseBl"),
                  value: "House BL",
                },
                {
                  label: t("wizard.ens.options.subHouseBl"),
                  value: "Sub-House BL",
                },
              ]}
            />
          )}
        />
        <FieldError message={dErrors?.fillingType?.message} />
      </div>
    </div>
  );
}
