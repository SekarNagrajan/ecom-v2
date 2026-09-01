// Created by Sekar Nagarajan (2026-08-31 14:46)
import { Card } from "antd";
import { useState } from "react";

import { ReferenceFieldsPanel } from "../../../booking/components/reference-fields-panel";
import {
  initialReferenceFields,
  type ReferenceField,
} from "../../../booking/utils/reference-field.utils";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

export function ReferenceStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onGoToStep,
  isSubmitting,
}: BLWizardStepProps) {
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

      <BlWizardFooter
        onPrevious={onPrevious}
        onNext={handleNext}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
