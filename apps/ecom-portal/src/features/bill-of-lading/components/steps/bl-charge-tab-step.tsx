// Modified by Sekar Nagarajan (2026-08-28 11:34)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Typography } from "antd";
import type { ReactNode } from "react";

import type { BLChargeLine } from "../../types/bl.types";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

function ReadonlyField({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="form-field-cell bl-master-readonly-field">
      <label className="form-field-label">{label}</label>
      {typeof value === "string" ? (
        <Text
          ellipsis={{ tooltip: value }}
          className={
            emphasis
              ? "form-step-readonly-value form-step-readonly-value--emphasis bl-master-readonly-value"
              : "form-step-readonly-value bl-master-readonly-value"
          }
        >
          {value}
        </Text>
      ) : (
        <div className="form-step-readonly-value bl-master-readonly-value">
          {value}
        </div>
      )}
    </div>
  );
}

function ChargeSummaryLine({ line, index }: { line: BLChargeLine; index: number }) {
  return (
    <Card
      size="small"
      className="form-step-card bl-charge-tab-line-card"
      title={`Charge ${index + 1}`}
    >
      <div className="bl-master-detail-grid bl-charge-tab-form-grid">
        <ReadonlyField label="Code" value={line.chargeCode} emphasis />
        <ReadonlyField label="Description" value={line.description} />
        <ReadonlyField
          label="Amount"
          value={`${line.currency} ${line.amount.toFixed(2)}`}
        />
        <ReadonlyField label="P/C" value={line.prepaidCollect} />
        <ReadonlyField label="Payor" value={line.payByCustType} />
      </div>
    </Card>
  );
}

export function BlChargeTabStep({
  data,
  onNext,
  onPrevious,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const charges = data.charges ?? [];

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll bl-charge-tab-step">
        <Card
          className="form-step-card form-step-section bl-charge-tab-card"
          title="Charge Summary"
        >
          {charges.length === 0 ? (
            <Text type="secondary" className="bl-charge-tab-empty">
              No charges available for this B/L.
            </Text>
          ) : (
            <div className="bl-charge-tab-lines">
              {charges.map((line, index) => (
                <ChargeSummaryLine key={line.id} line={line} index={index} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton
            onClick={onPrevious}
            disabled={isFirstStep || isSubmitting}
          >
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" onClick={onNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
