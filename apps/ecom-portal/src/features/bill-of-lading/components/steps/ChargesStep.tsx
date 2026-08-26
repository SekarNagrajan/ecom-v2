// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Result, Typography } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

export function ChargesStep({
  data,
  onNext,
  onPrevious,
  onCancel,
  isSubmitting,
}: BLWizardStepProps) {
  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <Result
            icon={<AppIcon icon={Icons.dollarSign} size={16} />}
            title="Freight Option Selected"
            subTitle={
              <div className="form-step-section">
                <Text>The freight option for this shipment is set to:</Text>
                <div className="form-step-readonly-value form-step-readonly-value--emphasis">
                  {data.freightOption}
                </div>
                <div className="form-step-callout">
                  <Text type="secondary">
                    Actual charges will be calculated and applied during Bill of
                    Lading generation.
                  </Text>
                </div>
              </div>
            }
          />
        </Card>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" onClick={onNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </div>
  );
}
