// Modified by Sekar Nagarajan (2026-08-28 12:58)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Typography } from "antd";
import type { ReactNode } from "react";

import type { SIChargeLine, SIWizardStepProps } from "../../types/si.types";

const { Text, Title } = Typography;

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="form-field-cell">
      <label className="form-field-label">{label}</label>
      {typeof value === "string" ? (
        <Text
          ellipsis={{ tooltip: value }}
          className="form-step-readonly-value"
        >
          {value}
        </Text>
      ) : (
        <div className="form-step-readonly-value">{value}</div>
      )}
    </div>
  );
}

export function SiChargeTabStep({
  data,
  onNext,
  onPrevious,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const charges: SIChargeLine[] = data.charges ?? [];

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll si-master-step-stack">
        <Card
          className="form-step-card form-step-section si-master-step-card"
          title={
            <Title level={5} className="form-step-card-title">
              Charge Summary
            </Title>
          }
        >
          {charges.length === 0 ? (
            <Text type="secondary">No charges available for this SI.</Text>
          ) : (
            <div className="si-charges-lines">
              {charges.map((line, index) => (
                <Card
                  key={line.id}
                  size="small"
                  className="form-step-card form-step-section si-master-step-card"
                  title={`Charge ${index + 1}`}
                >
                  <div className="si-charge-tab-form-grid">
                    <ReadonlyField label="Code" value={line.chargeCode} />
                    <ReadonlyField
                      label="Description"
                      value={line.description}
                    />
                    <ReadonlyField
                      label="Amount"
                      value={`${line.currency} ${line.amount.toFixed(2)}`}
                    />
                    <ReadonlyField label="P/C" value={line.prepaidCollect} />
                    <ReadonlyField label="Payor" value={line.payByCustType} />
                  </div>
                </Card>
              ))}
            </div>
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
        <AppButton type="primary" onClick={onNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
