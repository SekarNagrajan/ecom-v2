// Modified by Sekar Nagarajan (2026-08-28 12:58)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, InputNumber, Select, Typography } from "antd";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
} from "react-hook-form";

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
import { siChargesStepSchema } from "../types/si.types";

const { Text, Title } = Typography;

const PC_OPTIONS: { value: SIPrepaidCollect; label: string }[] = [
  { value: "PREPAID", label: "Prepaid" },
  { value: "COLLECT", label: "Collect" },
  { value: "PAY_AT", label: "Pay At" },
];

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
}: {
  control: Control<SiChargesStepValues>;
  index: number;
  errors: FieldErrors<SiChargesStepValues>;
}) {
  const rowErrors = errors.charges?.[index];

  return (
    <div className="si-charges-form-grid">
      <div className="form-field-cell">
        <label className="form-field-label">
          Code <Text type="danger">*</Text>
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
          Description <Text type="danger">*</Text>
        </label>
        <Controller
          control={control}
          name={`charges.${index}.description`}
          render={({ field }) => <Input {...field} size="large" />}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">
          Amount <Text type="danger">*</Text>
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
        <label className="form-field-label">Currency</label>
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
        <label className="form-field-label">P/C</label>
        <Controller
          control={control}
          name={`charges.${index}.prepaidCollect`}
          render={({ field }) => (
            <Select
              {...field}
              size="large"
              className="form-field-full-width"
              options={PC_OPTIONS}
            />
          )}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">Payor</label>
        <Controller
          control={control}
          name={`charges.${index}.payByCustType`}
          render={({ field }) => (
            <Select
              {...field}
              size="large"
              className="form-field-full-width"
              options={[
                { value: "Shipper", label: "Shipper" },
                { value: "Consignee", label: "Consignee" },
                { value: "Notify", label: "Notify" },
              ]}
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SiChargesStepValues>({
    resolver: zodResolver(siChargesStepSchema),
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
              Freight Charges
            </Title>
          }
          extra={
            <AppButton
              type="dashed"
              icon={<AppIcon icon={Icons.filePlus} size={14} />}
              onClick={() => append(createEmptyCharge())}
            >
              Add Charge
            </AppButton>
          }
        >
          <div className="si-charges-lines">
            {fields.map((field, index) => (
              <Card
                key={field.id}
                size="small"
                className="form-step-card form-step-section si-master-step-card"
                title={`Charge ${index + 1}`}
                extra={
                  fields.length > 1 ? (
                    <ListActionsRow>
                      <ListActionButton
                        title="Remove charge"
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
          Previous
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
