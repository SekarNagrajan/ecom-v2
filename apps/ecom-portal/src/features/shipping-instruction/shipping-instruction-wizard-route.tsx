// Modified by Sekar Nagarajan (2026-09-29 16:55)
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Card, Result, Steps, Typography, theme } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavShippingInstructionIcon,
} from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { formatModuleScreenTitle } from "../../constants/module-titles";
import {
  useModuleTitles,
  useWizardStepTitles,
} from "../../i18n/use-module-titles";
import { useSiDetailQuery } from "./api/si.queries";
import { SiLoadingCenter } from "./components/si-loading-center";
import { SiModuleStyles } from "./components/si-module-styles";
import { DEFAULT_SI_WIZARD_CONFIG } from "./config/si-wizard-config";
import { buildSiWizardSteps } from "./config/si-wizard-steps";
import { useSiWizard } from "./hooks/use-si-wizard";
import { useSiWizardConfigQuery } from "./hooks/use-si-wizard-config";
import {
  applyDashboardSiSeed,
  parseSiWizardSearch,
} from "./utils/si-dashboard-seed";

const { Text } = Typography;

export function ShippingInstructionWizardRoute() {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const params = useParams({ from: "/app/shipping-instruction/wizard/$id" });
  const rawSearch = useSearch({ strict: false }) as Record<string, unknown>;
  const createSeed = parseSiWizardSearch(rawSearch);
  const { data: rawDetails, isLoading, isError } = useSiDetailQuery(params.id);
  const siDetails = rawDetails
    ? applyDashboardSiSeed(rawDetails, params.id, createSeed)
    : undefined;
  const { data: wizardConfig = DEFAULT_SI_WIZARD_CONFIG } =
    useSiWizardConfigQuery();

  const wizardSteps = useMemo(
    () =>
      buildSiWizardSteps(wizardConfig, {
        master: WIZARD_STEP_TITLES.masterDetails,
        parties: WIZARD_STEP_TITLES.parties,
        routing: WIZARD_STEP_TITLES.routing,
        cargo: WIZARD_STEP_TITLES.cargoDetails,
        insurance: WIZARD_STEP_TITLES.insurance,
        cargoProtect: WIZARD_STEP_TITLES.cargoProtect,
        charges: WIZARD_STEP_TITLES.charges,
        ens: WIZARD_STEP_TITLES.ensDetails,
        chargeTab: WIZARD_STEP_TITLES.chargeSummary,
        files: WIZARD_STEP_TITLES.fileUpload,
        references: WIZARD_STEP_TITLES.references,
        preview: WIZARD_STEP_TITLES.preview,
      }),
    [wizardConfig, WIZARD_STEP_TITLES],
  );

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
              title={t("empty.unableToLoadSi")}
              extra={
                <AppButton
                  danger
                  icon={
                    <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                  }
                  onClick={goDashboard}
                >
                  {t("actions.backToSi")}
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
        onGoToStep={(stepId) => {
          const index = wizardSteps.findIndex((step) => step.id === stepId);
          if (index >= 0) setCurrentStep(index);
        }}
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
            icon={NavShippingInstructionIcon}
            title={formatModuleScreenTitle(
              MODULE_TITLES.shippingInstruction,
              siDetails?.bookingNo,
            )}
            marginBottom={0}
            extra={
              <AppButton
                danger
                icon={
                  <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                }
                onClick={goDashboard}
              >
                {t("actions.backToSi")}
              </AppButton>
            }
          />
        </div>

        {confirmationSiNo ? (
          <div className="wizard-confirmation">
            <Result
              status="success"
              icon={
                <AppIcon icon={Icons.checkCircle} size={64} tone="approve" />
              }
              title={t("wizard.submitSuccessTitle")}
              subTitle={
                <div>
                  {t("wizard.submitSuccessSubtitle")}
                  <div className="si-confirmation__ref">
                    {t("wizard.siReference")}{" "}
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
                  {t("actions.goToDashboard")}
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
