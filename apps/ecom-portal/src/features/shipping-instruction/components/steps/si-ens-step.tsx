// Modified by Sekar Nagarajan (2026-08-28 12:58)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, Segmented, Select, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import type { SIEnsInfo, SIWizardStepProps } from "../../types/si.types";

const { Text, Title } = Typography;

type EnsFormValues = {
  ensRequired: boolean;
  filingType: "N" | "S" | "P";
  declarantName: string;
  buyerName: string;
  sellerName: string;
  euZone: string;
};

export function SiEnsStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { control, handleSubmit, watch } = useForm<EnsFormValues>({
    defaultValues: {
      ensRequired: data.ens?.ensRequired ?? false,
      filingType: data.ens?.filingType ?? "N",
      declarantName: data.ens?.declarantName ?? "",
      buyerName: data.ens?.buyerName ?? "",
      sellerName: data.ens?.sellerName ?? "",
      euZone: data.ens?.euZone ?? "",
    },
  });

  const ensRequired = watch("ensRequired");

  const onValid = (values: EnsFormValues) => {
    const ens: SIEnsInfo = { ...values };
    onUpdate({ ens });
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
              ENS Filing
            </Title>
          }
        >
          <div className="si-ens-required-row">
            <div className="form-field-cell">
              <label className="form-field-label">ENS Required?</label>
              <Controller
                control={control}
                name="ensRequired"
                render={({ field: { value, onChange } }) => (
                  <Segmented
                    block
                    className="form-field-full-width si-master-segmented"
                    value={value ? "yes" : "no"}
                    onChange={(next) => onChange(next === "yes")}
                    options={[
                      { label: "No", value: "no" },
                      { label: "Yes", value: "yes" },
                    ]}
                  />
                )}
              />
            </div>
          </div>

          {ensRequired ? (
            <div className="si-ens-form-grid">
              <div className="form-field-cell">
                <label className="form-field-label">Filing Type</label>
                <Controller
                  control={control}
                  name="filingType"
                  render={({ field }) => (
                    <Select
                      {...field}
                      size="large"
                      className="form-field-full-width"
                      options={[
                        { value: "N", label: "Not required" },
                        { value: "S", label: "Shipper files" },
                        { value: "P", label: "Carrier files" },
                      ]}
                    />
                  )}
                />
              </div>
              <div className="form-field-cell">
                <label className="form-field-label">EU Zone</label>
                <Controller
                  control={control}
                  name="euZone"
                  render={({ field }) => <Input {...field} size="large" />}
                />
              </div>
              <div className="form-field-cell">
                <label className="form-field-label">Declarant</label>
                <Controller
                  control={control}
                  name="declarantName"
                  render={({ field }) => <Input {...field} size="large" />}
                />
              </div>
              <div className="form-field-cell">
                <label className="form-field-label">Buyer</label>
                <Controller
                  control={control}
                  name="buyerName"
                  render={({ field }) => <Input {...field} size="large" />}
                />
              </div>
              <div className="form-field-cell">
                <label className="form-field-label">Seller</label>
                <Controller
                  control={control}
                  name="sellerName"
                  render={({ field }) => <Input {...field} size="large" />}
                />
              </div>
            </div>
          ) : (
            <Text type="secondary">
              ENS filing is not required. Continue to the next step.
            </Text>
          )}
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
