// Modified by Sekar Nagarajan (2026-09-01 16:36)
import { Input, Select, Typography } from "antd";
import { useMemo } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { SiEnsStepForm } from "../types/si.types";

const { Text } = Typography;

type PartyPrefix = "buyer" | "seller";

interface SiEnsPartyFieldsProps {
  control: Control<SiEnsStepForm>;
  prefix: PartyPrefix;
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

export function SiEnsPartyFields({
  control,
  prefix,
  errors,
}: SiEnsPartyFieldsProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const partyErrors = errors[prefix];

  const roleLabel =
    prefix === "buyer" ? t("wizard.ens.buyer") : t("wizard.ens.seller");

  const personTypeOptions = useMemo(
    () => [
      {
        value: "",
        label: t("wizard.ens.personTypeOptions.placeholder"),
      },
      {
        value: "Legal",
        label: t("wizard.ens.personTypeOptions.legal"),
      },
      {
        value: "Natural",
        label: t("wizard.ens.personTypeOptions.natural"),
      },
      {
        value: "Association of persons",
        label: t("wizard.ens.personTypeOptions.association"),
      },
    ],
    [t],
  );

  return (
    <div className="form-ens-party-grid">
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.party.name", { role: roleLabel })}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name={`${prefix}.name`}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              maxLength={150}
              className="form-field-full-width"
            />
          )}
        />
        <FieldError message={partyErrors?.name?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.party.address")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name={`${prefix}.address`}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              maxLength={150}
              className="form-field-full-width"
            />
          )}
        />
        <FieldError message={partyErrors?.address?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.party.address2")}
        </label>
        <Controller
          control={control}
          name={`${prefix}.address2`}
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
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.party.city")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name={`${prefix}.city`}
          render={({ field }) => (
            <Input
              {...field}
              size="large"
              maxLength={150}
              className="form-field-full-width"
            />
          )}
        />
        <FieldError message={partyErrors?.city?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.party.country")}
          <RequiredMark />
        </label>
        <Controller
          control={control}
          name={`${prefix}.country`}
          render={({ field }) => (
            <Input {...field} size="large" maxLength={50} />
          )}
        />
        <FieldError message={partyErrors?.country?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">{t("wizard.ens.party.state")}</label>
        <Controller
          control={control}
          name={`${prefix}.state`}
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
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.ens.party.zipCode")}
        </label>
        <Controller
          control={control}
          name={`${prefix}.zip`}
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
          {t("wizard.ens.party.telephone")}
        </label>
        <Controller
          control={control}
          name={`${prefix}.phone`}
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
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">{t("wizard.ens.party.fax")}</label>
        <Controller
          control={control}
          name={`${prefix}.fax`}
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
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">{t("wizard.ens.party.email")}</label>
        <Controller
          control={control}
          name={`${prefix}.email`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={75}
              type="email"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        <FieldError message={partyErrors?.email?.message} />
      </div>

      <div className="form-field-cell">
        <label className="form-field-label">{t("wizard.ens.party.eori")}</label>
        <Controller
          control={control}
          name={`${prefix}.eori`}
          render={({ field }) => (
            <Input
              size="large"
              maxLength={17}
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
          {t("wizard.ens.party.personType")}
        </label>
        <Controller
          control={control}
          name={`${prefix}.personType`}
          render={({ field }) => (
            <Select
              size="large"
              className="form-field-full-width"
              options={personTypeOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
    </div>
  );
}
