// Modified by Sekar Nagarajan (2026-08-28 12:57)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, InputNumber, Select, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import type {
  SICargoProtectLine,
  SIWizardStepProps,
} from "../../types/si.types";

const { Text, Title } = Typography;

function createEmptyLine(): SICargoProtectLine {
  return {
    id: `cp-${crypto.randomUUID()}`,
    productCode: "",
    description: "",
    amount: 0,
    currency: "USD",
  };
}

export function SiCargoProtectStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
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
              Cargo Protect Products
            </Title>
          }
          extra={
            <AppButton
              type="dashed"
              icon={<AppIcon icon={Icons.filePlus} size={14} />}
              onClick={() => setLines((prev) => [...prev, createEmptyLine()])}
            >
              Add Row
            </AppButton>
          }
        >
          {lines.length === 0 ? (
            <Text type="secondary">
              No cargo protect lines. Click Add Row to include coverage products.
            </Text>
          ) : (
            <div className="si-cargo-protect-lines">
              {lines.map((line, index) => (
                <Card
                  key={line.id}
                  size="small"
                  className="form-step-card form-step-section si-master-step-card"
                  title={`Line ${index + 1}`}
                  extra={
                    <ListActionsRow>
                      <ListActionButton
                        title="Remove row"
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
                  <div className="si-cargo-protect-form-grid">
                    <div className="form-field-cell">
                      <label className="form-field-label">Product Code</label>
                      <Input
                        size="large"
                        value={line.productCode}
                        onChange={(e) =>
                          updateLine(line.id, { productCode: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">Description</label>
                      <Input
                        size="large"
                        value={line.description}
                        onChange={(e) =>
                          updateLine(line.id, { description: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">Amount</label>
                      <InputNumber
                        size="large"
                        min={0}
                        className="form-field-full-width"
                        value={line.amount}
                        onChange={(value) =>
                          updateLine(line.id, { amount: value ?? 0 })
                        }
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">Currency</label>
                      <Select
                        size="large"
                        className="form-field-full-width"
                        value={line.currency}
                        onChange={(value) =>
                          updateLine(line.id, { currency: value })
                        }
                        options={[
                          { value: "USD", label: "USD" },
                          { value: "EUR", label: "EUR" },
                          { value: "AED", label: "AED" },
                        ]}
                      />
                    </div>
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
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
