// Modified by Sekar Nagarajan (2026-08-28 11:33)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, InputNumber, Select } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import type { BLCargoProtectLine } from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

function createEmptyLine(): BLCargoProtectLine {
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
  line: BLCargoProtectLine;
  onUpdate: (patch: Partial<BLCargoProtectLine>) => void;
}) {
  const { t } = useTranslation(["bill-of-lading", "common"]);

  return (
    <div className="bl-master-detail-grid bl-cargo-protect-form-grid">
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("wizard.cargoProtect.productCode")}
        </label>
        <Input
          size="large"
          value={line.productCode}
          onChange={(e) => onUpdate({ productCode: e.target.value })}
        />
      </div>
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("columns.description")}
        </label>
        <Input
          size="large"
          value={line.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
      </div>
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("columns.amount")}
        </label>
        <InputNumber
          size="large"
          min={0}
          className="form-field-full-width"
          value={line.amount}
          onChange={(value) => onUpdate({ amount: value ?? 0 })}
        />
      </div>
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">
          {t("wizard.charges.currency")}
        </label>
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

export function BlCargoProtectStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onGoToStep,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const { t } = useTranslation(["bill-of-lading", "common"]);

  const [lines, setLines] = useState<BLCargoProtectLine[]>(
    () => data.cargoProtect ?? [],
  );

  const updateLine = (id: string, patch: Partial<BLCargoProtectLine>) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => {
    setLines((prev) => [...prev, createEmptyLine()]);
  };

  const removeLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
  };

  const handleNext = () => {
    onUpdate({ cargoProtect: lines });
    onNext();
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll bl-cargo-protect-step">
        <Card
          className="form-step-card form-step-section bl-cargo-protect-card"
          title={t("wizard.cargoProtect.productsTitle")}
          extra={
            <AppButton
              type="dashed"
              icon={<AppIcon icon={Icons.filePlus} size={14} />}
              onClick={addLine}
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
            <div className="bl-cargo-protect-lines">
              {lines.map((line, index) => (
                <Card
                  key={line.id}
                  size="small"
                  className="form-step-card bl-cargo-protect-line-card"
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
                        onClick={() => removeLine(line.id)}
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

      <BlWizardFooter
        onPrevious={onPrevious}
        onNext={handleNext}
        isFirstStep={isFirstStep}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
