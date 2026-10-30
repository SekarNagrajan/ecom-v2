// Modified by Sekar Nagarajan (2026-09-29 16:55)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, InputNumber, Select, Typography } from "antd";
import { useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import type {
  SiChargesStepValues,
  SIPrepaidCollect,
  SIWizardStepProps,
} from "../types/si.types";
import { createSiChargesStepSchema } from "../types/si.types";

const { Text, Title } = Typography;

function createEmptyCharge(): SiChargesStepValues["charges"][number] {
  return {
    id: `chg-${crypto.randomUUID()}`,
    chargeCode: "",
    description: "",
    amount: 0,
    currency: "USD",
    prepaidCollect: "PREPAID",
    payByCustType: "Shipper",
    prepaidAmount: 0,
    collectAmount: 0,
    payAtAmount: 0,
  };
}

function ChargeLineFields({
  control,
  index,
  errors,
  pcOptions,
  payorOptions,
}: {
  control: Control<SiChargesStepValues>;
  index: number;
  errors: FieldErrors<SiChargesStepValues>;
  pcOptions: { value: SIPrepaidCollect; label: string }[];
  payorOptions: { value: string; label: string }[];
}) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const rowErrors = errors.charges?.[index];

  return (
    <div className="si-charges-form-grid">
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("columns.code")} <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name={`charges.${index}.chargeCode`}
          render={({ field }) => <Input {...field} size="large" />}
        />
        {rowErrors?.chargeCode ? (
          <Text type="danger" className="form-field-error">
            {rowErrors.chargeCode.message}
          </Text>
        ) : null}
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("columns.description")} <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name={`charges.${index}.description`}
          render={({ field }) => <Input {...field} size="large" />}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("columns.amount")} <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name={`charges.${index}.amount`}
          render={({ field }) => (
            <InputNumber
              {...field}
              size="large"
              min={0}
              className="form-field-full-width"
            />
          )}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">{t("labels.currency")}</label>
        <Controller
          control={control}
          name={`charges.${index}.currency`}
          render={({ field }) => (
            <Select
              {...field}
              size="large"
              className="form-field-full-width"
              options={[
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
                { value: "AED", label: "AED" },
              ]}
            />
          )}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.charges.pceShort")}
        </label>
        <Controller
          control={control}
          name={`charges.${index}.prepaidCollect`}
          render={({ field }) => (
            <Select
              {...field}
              size="large"
              className="form-field-full-width"
              options={pcOptions}
            />
          )}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">{t("labels.payor")}</label>
        <Controller
          control={control}
          name={`charges.${index}.payByCustType`}
          render={({ field }) => (
            <Select
              {...field}
              size="large"
              className="form-field-full-width"
              options={payorOptions}
            />
          )}
        />
      </div>
    </div>
  );
}

export function ChargesStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const schema = useMemo(() => createSiChargesStepSchema(t), [t]);
  const pcOptions: { value: SIPrepaidCollect; label: string }[] = useMemo(
    () => [
      { value: "PREPAID", label: t("labels.prepaid") },
      { value: "COLLECT", label: t("labels.collect") },
      { value: "PAY_AT", label: t("labels.payAt") },
    ],
    [t],
  );
  const payorOptions = useMemo(
    () => [
      { value: "Shipper", label: t("parties.shipper") },
      { value: "Consignee", label: t("parties.consignee") },
      { value: "Notify", label: t("parties.notify") },
    ],
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SiChargesStepValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      charges:
        data.charges && data.charges.length > 0
          ? data.charges
          : [createEmptyCharge()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges",
  });

  const onValid = (values: SiChargesStepValues) => {
    onUpdate({ charges: values.charges });
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll si-master-step-stack">
        <Card
          className="form-step-card form-step-section si-master-step-card"
          title={
            <Title level={5} className="form-step-card-title">
              {t("wizard.charges.title")}
            </Title>
          }
          extra={
            <AppButton
              type="dashed"
              icon={<AppIcon icon={Icons.filePlus} size={14} />}
              onClick={() => append(createEmptyCharge())}
            >
              {t("actions.addCharge")}
            </AppButton>
          }
        >
          <div className="si-charges-lines">
            {fields.map((field, index) => (
              <Card
                key={field.id}
                size="small"
                className="form-step-card form-step-section si-master-step-card"
                title={t("wizard.charges.chargeLineTitle", { n: index + 1 })}
                extra={
                  fields.length > 1 ? (
                    <ListActionsRow>
                      <ListActionButton
                        title={t("actions.removeCharge")}
                        icon={
                          <AppIcon icon={Icons.x} size={16} tone="delete" />
                        }
                        tone="delete"
                        onClick={() => remove(index)}
                      />
                    </ListActionsRow>
                  ) : null
                }
              >
                <ChargeLineFields
                  control={control}
                  index={index}
                  errors={errors}
                  pcOptions={pcOptions}
                  payorOptions={payorOptions}
                />
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
        >
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </form>
  );
}
