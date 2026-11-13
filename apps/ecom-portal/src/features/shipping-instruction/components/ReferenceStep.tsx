// Modified by Sekar Nagarajan (2026-09-29 16:55)
import { AppButton } from "@solverminds/shared-ui";
import { Card } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
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
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </div>
  );
}
