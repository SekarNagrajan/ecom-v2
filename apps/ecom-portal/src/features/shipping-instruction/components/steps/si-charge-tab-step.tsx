// Modified by Sekar Nagarajan (2026-09-29 16:55)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Typography } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
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

function prepaidCollectLabel(
  value: SIChargeLine["prepaidCollect"],
  t: (key: string) => string,
): string {
  switch (value) {
    case "PREPAID":
      return t("labels.prepaid");
    case "COLLECT":
      return t("labels.collect");
    case "PAY_AT":
      return t("labels.payAt");
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

export function SiChargeTabStep({
  data,
  onNext,
  onPrevious,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const charges: SIChargeLine[] = data.charges ?? [];

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll si-master-step-stack">
        <Card
          className="form-step-card form-step-section si-master-step-card"
          title={
            <Title level={5} className="form-step-card-title">
              {t("wizard.chargeSummary.title")}
            </Title>
          }
        >
          {charges.length === 0 ? (
            <ModuleEmptyState
              artSize="sm"
              variant="blank"
              title={t("empty.noCharges")}
              style={{ padding: 12 }}
            />
          ) : (
            <div className="si-charges-lines">
              {charges.map((line, index) => (
                <Card
                  key={line.id}
                  size="small"
                  className="form-step-card form-step-section si-master-step-card"
                  title={t("wizard.charges.chargeLineTitle", { n: index + 1 })}
                >
                  <div className="si-charge-tab-form-grid">
                    <ReadonlyField
                      label={t("columns.code")}
                      value={line.chargeCode}
                    />
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
                      value={prepaidCollectLabel(line.prepaidCollect, t)}
                    />
                    <ReadonlyField
                      label={t("labels.payor")}
                      value={line.payByCustType}
                    />
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
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" onClick={onNext} disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </div>
  );
}
