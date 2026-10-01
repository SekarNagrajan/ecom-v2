// Modified by Sekar Nagarajan (2026-08-28 12:57)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, InputNumber, Select, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import type {
  SICargoProtectLine,
  SIWizardStepProps,
} from "../../types/si.types";

const { Title } = Typography;

function createEmptyLine(): SICargoProtectLine {
  return {
    id: `cp-${crypto.randomUUID()}`,
    productCode: "",
    description: "",
    amount: 0,
    currency: "USD",
  };
}

function CargoProtectLineFields({
  line,
  onUpdate,
}: {
  line: SICargoProtectLine;
  onUpdate: (patch: Partial<SICargoProtectLine>) => void;
}) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);

  return (
    <div className="si-cargo-protect-form-grid">
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("wizard.cargoProtect.productCode")}
        </label>
        <Input
          size="large"
          value={line.productCode}
          onChange={(e) => onUpdate({ productCode: e.target.value })}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">
          {t("columns.description")}
        </label>
        <Input
          size="large"
          value={line.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">{t("columns.amount")}</label>
        <InputNumber
          size="large"
          min={0}
          className="form-field-full-width"
          value={line.amount}
          onChange={(value) => onUpdate({ amount: value ?? 0 })}
        />
      </div>
      <div className="form-field-cell">
        <label className="form-field-label">{t("labels.currency")}</label>
        <Select
          size="large"
          className="form-field-full-width"
          value={line.currency}
          onChange={(value) => onUpdate({ currency: value })}
          options={[
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "AED", label: "AED" },
          ]}
        />
      </div>
    </div>
  );
}

export function SiCargoProtectStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);

  const [lines, setLines] = useState<SICargoProtectLine[]>(
    () => data.cargoProtect ?? [],
  );

  const updateLine = (id: string, patch: Partial<SICargoProtectLine>) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  };

  const handleNext = () => {
    onUpdate({ cargoProtect: lines });
    onNext();
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll si-master-step-stack">
        <Card
          className="form-step-card form-step-section si-master-step-card"
          title={
            <Title level={5} className="form-step-card-title">
              {t("wizard.cargoProtect.productsTitle")}
            </Title>
          }
          extra={
            <AppButton
              type="dashed"
              icon={<AppIcon icon={Icons.filePlus} size={14} />}
              onClick={() => setLines((prev) => [...prev, createEmptyLine()])}
            >
              {t("wizard.cargoProtect.addRow")}
            </AppButton>
          }
        >
          {lines.length === 0 ? (
            <ModuleEmptyState
              artSize="sm"
              variant="blank"
              title={t("wizard.cargoProtect.emptyTitle")}
              message={t("wizard.cargoProtect.emptyMessage")}
              style={{ padding: 12 }}
            />
          ) : (
            <div className="si-cargo-protect-lines">
              {lines.map((line, index) => (
                <Card
                  key={line.id}
                  size="small"
                  className="form-step-card form-step-section si-master-step-card"
                  title={t("wizard.cargoProtect.lineTitle", {
                    n: index + 1,
                  })}
                  extra={
                    <ListActionsRow>
                      <ListActionButton
                        title={t("wizard.cargoProtect.removeRow")}
                        icon={
                          <AppIcon icon={Icons.x} size={16} tone="delete" />
                        }
                        tone="delete"
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter((item) => item.id !== line.id),
                          )
                        }
                      />
                    </ListActionsRow>
                  }
                >
                  <CargoProtectLineFields
                    line={line}
                    onUpdate={(patch) => updateLine(line.id, patch)}
                  />
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
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </div>
  );
}
