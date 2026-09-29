// Modified by Sekar Nagarajan (2026-08-28 11:35)
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

import { AppIcon, Icons } from "../../../../components/icons";
import {
    ListActionButton,
    ListActionsRow,
} from "../../../../components/shared/list-action-button";
import {
    blChargesStepSchema,
    type BLChargesStepValues,
    type BLPrepaidCollect,
} from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "AED", label: "AED" },
];

function createEmptyCharge(): BLChargesStepValues["charges"][number] {
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
  t,
  pcOptions,
}: {
  control: Control<BLChargesStepValues>;
  index: number;
  errors: FieldErrors<BLChargesStepValues>;
  t: (key: string, options?: Record<string, unknown>) => string;
  pcOptions: { value: BLPrepaidCollect; label: string }[];
}) {
  const rowErrors = errors.charges?.[index];

  return (
    <div className="bl-master-detail-grid bl-charges-form-grid">
      <div className="form-field-cell bl-master-readonly-field">
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

      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("columns.description")} <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name={`charges.${index}.description`}
          render={({ field }) => <Input {...field} size="large" />}
        />
        {rowErrors?.description ? (
          <Text type="danger" className="form-field-error">
            {rowErrors.description.message}
          </Text>
        ) : null}
      </div>

      <div className="form-field-cell bl-master-readonly-field">
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

      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("wizard.charges.currency")} <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name={`charges.${index}.currency`}
          render={({ field }) => (
            <Select
              {...field}
              size="large"
              className="form-field-full-width"
              options={CURRENCY_OPTIONS}
            />
          )}
        />
      </div>

      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("wizard.charges.pceShort")} <Text type="danger">*</Text>
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

      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("columns.payor")} <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name={`charges.${index}.payByCustType`}
          render={({ field }) => <Input {...field} size="large" />}
        />
        {rowErrors?.payByCustType ? (
          <Text type="danger" className="form-field-error">
            {rowErrors.payByCustType.message}
          </Text>
        ) : null}
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
}: BLWizardStepProps) {
  const { t } = useTranslation(["bill-of-lading", "common"]);

  const pcOptions = useMemo(
    (): { value: BLPrepaidCollect; label: string }[] => [
      { value: "PREPAID", label: t("charges.prepaid") },
      { value: "COLLECT", label: t("charges.collect") },
      { value: "PAY_AT", label: t("charges.payAt") },
    ],
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BLChargesStepValues>({
    resolver: zodResolver(blChargesStepSchema),
    defaultValues: {
      charges: data.charges.length > 0 ? data.charges : [createEmptyCharge()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "charges",
  });

  const onValid = (values: BLChargesStepValues) => {
    onUpdate({ charges: values.charges });
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll bl-charges-step">
        <Card
          className="form-step-card form-step-section bl-charges-card"
          title={t("wizard.charges.title")}
          extra={
            <AppButton
              type="dashed"
              icon={<AppIcon icon={Icons.filePlus} size={14} />}
              onClick={() => append(createEmptyCharge())}
            >
              {t("wizard.charges.addCharge")}
            </AppButton>
          }
        >
          {typeof errors.charges?.message === "string" ? (
            <Text
              type="danger"
              className="form-field-error bl-charges-form-error"
            >
              {errors.charges.message}
            </Text>
          ) : null}

          <div className="bl-charges-lines">
            {fields.map((field, index) => (
              <Card
                key={field.id}
                size="small"
                className="form-step-card bl-charges-line-card"
                title={t("wizard.charges.chargeLineTitle", { n: index + 1 })}
                extra={
                  fields.length > 1 ? (
                    <ListActionsRow>
                      <ListActionButton
                        title={t("wizard.charges.removeCharge")}
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
                  t={t}
                  pcOptions={pcOptions}
                />
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <BlWizardFooter
        onPrevious={onPrevious}
        nextHtmlType="submit"
        isFirstStep={isFirstStep}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
