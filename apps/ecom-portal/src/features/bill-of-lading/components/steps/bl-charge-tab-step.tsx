// Modified by Sekar Nagarajan (2026-08-28 11:34)
import { Card, Typography } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import type { BLChargeLine } from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
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

function ChargeSummaryLine({
  line,
  index,
  t,
}: {
  line: BLChargeLine;
  index: number;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <Card
      size="small"
      className="form-step-card bl-charge-tab-line-card"
      title={t("wizard.charges.chargeLineTitle", { n: index + 1 })}
    >
      <div className="bl-master-detail-grid bl-charge-tab-form-grid">
        <ReadonlyField label={t("columns.code")} value={line.chargeCode} emphasis />
        <ReadonlyField
          label={t("columns.description")}
          value={line.description}
        />
        <ReadonlyField
          label={t("columns.amount")}
          value={`${line.currency} ${line.amount.toFixed(2)}`}
        />
        <ReadonlyField
          label={t("wizard.charges.pceShort")}
          value={line.prepaidCollect}
        />
        <ReadonlyField label={t("columns.payor")} value={line.payByCustType} />
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
  const { t } = useTranslation(["bill-of-lading", "common"]);
  const charges = data.charges ?? [];

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll bl-charge-tab-step">
        <Card
          className="form-step-card form-step-section bl-charge-tab-card"
          title={t("wizard.chargeSummary.title")}
        >
          {charges.length === 0 ? (
            <ModuleEmptyState
              artSize="sm"
              variant="blank"
              title={t("empty.noCharges")}
              style={{ padding: 12 }}
            />
          ) : (
            <div className="bl-charge-tab-lines">
              {charges.map((line, index) => (
                <ChargeSummaryLine
                  key={line.id}
                  line={line}
                  index={index}
                  t={t}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <BlWizardFooter
        onPrevious={onPrevious}
        onNext={onNext}
        isFirstStep={isFirstStep}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
