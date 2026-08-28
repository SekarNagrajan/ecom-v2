// Modified by Sekar Nagarajan (2026-08-28 12:40)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Steps, Typography, theme } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import {
  MODULE_TITLES,
  formatModuleScreenTitle,
} from "../../constants/module-titles";
import { useSiDetailQuery } from "./api/si.queries";
import { SiLoadingCenter } from "./components/si-loading-center";
import { SiModuleStyles } from "./components/si-module-styles";
import { buildSiWizardSteps } from "./config/si-wizard-steps";
import { DEFAULT_SI_WIZARD_CONFIG } from "./config/si-wizard-config";
import { useSiWizardConfigQuery } from "./hooks/use-si-wizard-config";
import { useSiWizard } from "./hooks/use-si-wizard";

const { Text } = Typography;

export function ShippingInstructionWizardRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const params = useParams({ from: "/app/shipping-instruction/wizard/$id" });
  const { data: siDetails, isLoading, isError } = useSiDetailQuery(params.id);
  const { data: wizardConfig = DEFAULT_SI_WIZARD_CONFIG } =
    useSiWizardConfigQuery();

  const wizardSteps = buildSiWizardSteps(wizardConfig);

  const {
    currentStep,
    setCurrentStep,
    confirmationSiNo,
    isSubmitting,
    handleNext,
    handlePrevious,
    handleSubmit,
    draft,
    updateDraft,
  } = useSiWizard(params.id, siDetails);

  const getStepIcon = (
    icon: React.ReactNode,
    index: number,
    current: number,
  ) => {
    const isCompleted = index < current;
    const isActive = index === current;

    let background = token.colorBgContainer;
    let borderColor = token.colorBorder;
    let color = token.colorTextQuaternary;

    if (isCompleted) {
      background = token.colorSuccess;
      borderColor = token.colorSuccess;
      color = token.colorWhite;
    } else if (isActive) {
      background = token.colorPrimary;
      borderColor = token.colorPrimary;
      color = token.colorWhite;
    }

    return (
      <span
        className={[
          "wizard-step-icon",
          isActive ? "pipeline-stage-current-badge" : undefined,
          "app-icon-inherit",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          background,
          border: `2px solid ${borderColor}`,
          color,
        }}
      >
        {icon}
      </span>
    );
  };

  const steps = wizardSteps.map((step, index) => ({
    title: step.title,
    icon: getStepIcon(step.icon, index, currentStep),
  }));

  const goDashboard = () => {
    navigate({ to: "/app/shipping-instruction" });
  };

  const renderStepContent = () => {
    // Modified by Sekar Nagarajan (2026-08-28 12:40)
    // Match Booking form-step-layout so loading/error fill the wizard body.
    if (isLoading) {
      return (
        <div className="form-step-layout">
          <div className="custom-scroll form-step-scroll">
            <SiLoadingCenter />
          </div>
        </div>
      );
    }
    if (isError || !siDetails) {
      return (
        <div className="form-step-layout">
          <div className="custom-scroll form-step-scroll">
            <Result
              status="error"
              title="Unable to load Shipping Instruction"
              extra={
                <AppButton type="primary" onClick={goDashboard}>
                  Back to Dashboard
                </AppButton>
              }
            />
          </div>
        </div>
      );
    }

    const StepComponent = wizardSteps[currentStep]?.Component;
    if (!StepComponent) return null;

    return (
      <StepComponent
        data={draft ?? siDetails}
        onNext={() => handleNext(wizardSteps.length)}
        onPrevious={handlePrevious}
        onSubmit={handleSubmit}
        onUpdate={updateDraft}
        onCancel={goDashboard}
        isFirstStep={currentStep === 0}
        isLastStep={currentStep === wizardSteps.length - 1}
        isSubmitting={isSubmitting}
      />
    );
  };

  return (
    <FeaturePageShell>
      <SiModuleStyles />
      <Card className="wizard-page-card">
        <div className="wizard-page-header">
          <ModuleScreenHeader
            icon={Icons.clipboardList}
            title={formatModuleScreenTitle(
              MODULE_TITLES.shippingInstruction,
              siDetails?.bookingNo,
            )}
            marginBottom={0}
            extra={
              <AppButton onClick={goDashboard}>Back to Dashboard</AppButton>
            }
          />
        </div>

        {confirmationSiNo ? (
          <div className="wizard-confirmation">
            <Result
              status="success"
              icon={
                <AppIcon icon={Icons.checkCircle} size={16} tone="approve" />
              }
              title="Shipping Instruction Submitted Successfully"
              subTitle={
                <div>
                  Your Shipping Instruction has been forwarded to the carrier
                  via EDI.
                  <div className="si-confirmation__ref">
                    SI Reference:{" "}
                    <Text
                      copyable
                      strong
                      className="si-confirmation__ref-value"
                    >
                      {confirmationSiNo}
                    </Text>
                  </div>
                </div>
              }
              extra={[
                <AppButton type="primary" key="dashboard" onClick={goDashboard}>
                  Go to Dashboard
                </AppButton>,
              ]}
            />
          </div>
        ) : (
          <div className="wizard-page-body">
            <div className="wizard-steps-scroll">
              <div className="wizard-steps-inner">
                <Steps
                  className="custom-booking-steps"
                  current={currentStep}
                  onChange={setCurrentStep}
                  items={steps}
                  labelPlacement="vertical"
                />
              </div>
            </div>

            <div className="wizard-step-content">{renderStepContent()}</div>
          </div>
        )}
      </Card>
    </FeaturePageShell>
  );
}
