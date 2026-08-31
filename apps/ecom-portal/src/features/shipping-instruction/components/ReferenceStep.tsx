// Created by Sekar Nagarajan (2026-08-31 14:46)
import { AppButton } from "@solverminds/shared-ui";
import { Card } from "antd";
import { useState } from "react";

import { ReferenceFieldsPanel } from "../../booking/components/reference-fields-panel";
import {
  initialReferenceFields,
  type ReferenceField,
} from "../../booking/utils/reference-field.utils";
import type { SIWizardStepProps } from "../types/si.types";

export function ReferenceStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: SIWizardStepProps) {
  const [fields, setFields] = useState<ReferenceField[]>(() =>
    initialReferenceFields(data.referenceFields),
  );

  const handleNext = () => {
    onUpdate({ referenceFields: fields });
    onNext();
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <ReferenceFieldsPanel
            fields={fields}
            onChange={setFields}
          />
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isSubmitting}>
          Previous
        </AppButton>
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
