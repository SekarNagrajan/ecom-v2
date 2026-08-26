// Modified by Sekar Nagarajan (2026-08-26 12:19)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Result, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { SIDTO } from "../types/si.types";

const { Text } = Typography;

interface StepProps {
  data: SIDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}

export function ChargesStep({
  data,
  onNext,
  onPrevious,
  onCancel,
  isSubmitting,
}: StepProps) {
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
                <div className="form-step-readonly-value si-charges-freight">
                  {data.freightOption}
                </div>
                <div className="si-charges-note">
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
