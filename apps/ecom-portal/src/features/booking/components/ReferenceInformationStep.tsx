// Modified by Sekar Nagarajan (2026-08-31 15:01)
import { AppButton } from "@solverminds/shared-ui";
import { Card } from "antd";
import { useState } from "react";

import { useBookingStore } from "../stores/booking.store";
import {
  initialReferenceFields,
  type ReferenceField,
} from "../utils/reference-field.utils";
import { ReferenceFieldsPanel } from "./reference-fields-panel";

export function ReferenceInformationStep() {
  const { payload, updateReferenceFields, nextStep, prevStep } =
    useBookingStore();
  const [fields, setFields] = useState<ReferenceField[]>(() =>
    initialReferenceFields(payload.referenceFields),
  );

  const handleNext = () => {
    updateReferenceFields(fields);
    nextStep();
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <ReferenceFieldsPanel
            fields={fields}
            onChange={setFields}
            rateReferenceNo={payload.masterDetails?.rateReference}
          />
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" onClick={handleNext}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
