// Modified by Sekar Nagarajan (2026-08-28 11:33)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, InputNumber, Select, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import type { BLCargoProtectLine } from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

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
  return (
    <div className="bl-master-detail-grid bl-cargo-protect-form-grid">
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">Product Code</label>
        <Input
          size="large"
          value={line.productCode}
          onChange={(e) => onUpdate({ productCode: e.target.value })}
        />
      </div>
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">Description</label>
        <Input
          size="large"
          value={line.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
        />
      </div>
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">Amount</label>
        <InputNumber
          size="large"
          min={0}
          className="form-field-full-width"
          value={line.amount}
          onChange={(value) => onUpdate({ amount: value ?? 0 })}
        />
      </div>
      <div className="form-field-cell bl-master-readonly-field">
        <label className="form-field-label">Currency</label>
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
          title="Cargo Protect Products"
          extra={
            <AppButton
              type="dashed"
              icon={<AppIcon icon={Icons.filePlus} size={14} />}
              onClick={addLine}
            >
              Add Row
            </AppButton>
          }
        >
          {lines.length === 0 ? (
            <Text type="secondary" className="bl-cargo-protect-empty">
              No cargo protect lines. Click Add Row to include coverage
              products.
            </Text>
          ) : (
            <div className="bl-cargo-protect-lines">
              {lines.map((line, index) => (
                <Card
                  key={line.id}
                  size="small"
                  className="form-step-card bl-cargo-protect-line-card"
                  title={`Line ${index + 1}`}
                  extra={
                    <ListActionsRow>
                      <ListActionButton
                        title="Remove row"
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
