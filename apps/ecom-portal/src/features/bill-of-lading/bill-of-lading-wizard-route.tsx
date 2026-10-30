// Modified by Sekar Nagarajan (2026-08-31 16:36)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Space, Steps, theme } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavBillOfLadingIcon } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { formatModuleScreenTitle } from "../../constants/module-titles";
import {
  useModuleTitles,
  useWizardStepTitles,
} from "../../i18n/use-module-titles";
import { checkVoyageClosed } from "./api/bl.api";
import {
  useBLDetailQuery,
  useBLSubmitMutation,
  useBLUpdateMutation,
} from "./api/bl.queries";
import { BlLoadingCenter } from "./components/bl-loading-center";
import { BlModuleStyles } from "./components/bl-module-styles";
import {
  DEFAULT_BL_WIZARD_CONFIG,
  type BLWizardStepId,
} from "./config/bl-wizard-config";
import {
  buildBlWizardSteps,
  getStepIcon,
  renderBlWizardStep,
} from "./config/bl-wizard-steps";
import { useBLWizard } from "./hooks/use-bl-wizard";
import { useBLWizardConfig } from "./hooks/use-bl-wizard-config";
import type { BLDTO } from "./types/bl.types";

export function BillOfLadingWizardRoute() {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const { blNo } = useParams({ strict: false }) as { blNo: string };

  const {
    data: detail,
    isLoading,
    isError,
    error,
    refetch,
  } = useBLDetailQuery(blNo);
  const { data: wizardConfig = DEFAULT_BL_WIZARD_CONFIG } = useBLWizardConfig();

  const wizardSteps = useMemo(
    () =>
      buildBlWizardSteps(wizardConfig, {
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
    goNext,
    goPrevious,
    draft,
    updateDraft,
    isFirstStep,
    isLastStep,
  } = useBLWizard(detail, wizardSteps.length);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { mutateAsync: updateBl } = useBLUpdateMutation();
  const { mutateAsync: submitBl } = useBLSubmitMutation();

  const goDashboard = () => {
    navigate({ to: "/app/bl" });
  };

  const activeStep = wizardSteps[currentStep];

  const steps = wizardSteps.map((step, index) => ({
    title: step.title,
    icon: getStepIcon(step.icon, index, currentStep, token),
  }));

  const ensureEditAllowed = async () => {
    if (!draft) return false;
    const { closed } = await checkVoyageClosed(blNo);
    if (closed) {
      confirm.warning({
        title: t("confirms.voyageClosedTitle"),
        content: t("confirms.voyageClosedContent"),
      });
      goDashboard();
      return false;
    }
    if (
      draft.status === "C" &&
      wizardConfig.enableTermsOnConfirmedEdit &&
      !termsAccepted
    ) {
      setTermsOpen(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!draft) return;
    const allowed = await ensureEditAllowed();
    if (!allowed) return;
    setIsSubmitting(true);
    try {
      const updateRes = await updateBl({ blNo, payload: draft });
      if (updateRes.error) return;
      const submitRes = await submitBl(blNo);
      if (!submitRes.error && submitRes.data) {
        navigate({
          to: `/app/bl/${blNo}/submit-result`,
          state: { submitResult: submitRes.data.submitResult } as never,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepProps = {
    data: draft as BLDTO,
    onNext: goNext,
    onPrevious: goPrevious,
    onSubmit: handleSubmit,
    onUpdate: updateDraft,
    onCancel: goDashboard,
    onGoToStep: (stepId: BLWizardStepId) => {
      const index = wizardSteps.findIndex((step) => step.id === stepId);
      if (index >= 0) setCurrentStep(index);
    },
    isFirstStep,
    isLastStep,
    isSubmitting,
  };

  const renderStepContent = () => {
    if (isLoading || !draft || !activeStep) {
      return (
        <div className="custom-scroll form-step-scroll">
          <BlLoadingCenter />
        </div>
      );
    }
    return renderBlWizardStep(activeStep, stepProps);
  };

  if (isError) {
    return (
      <FeaturePageShell>
        <BlModuleStyles />
        <Card className="wizard-page-card">
          <div className="wizard-page-header">
            <ModuleScreenHeader
              icon={NavBillOfLadingIcon}
              title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, blNo)}
              marginBottom={0}
            />
          </div>
          <div className="wizard-confirmation">
            <Result
              status="error"
              title={t("wizard.errors.loadFailedTitle")}
              subTitle={
                error instanceof Error
                  ? error.message
                  : t("wizard.errors.loadFailedMessage")
              }
              extra={
                <Space>
                  <AppButton type="primary" onClick={() => refetch()}>
                    {t("wizard.actions.retry")}
                  </AppButton>
                  <AppButton
                    danger
                    icon={
                      <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                    }
                    onClick={goDashboard}
                  >
                    {t("wizard.actions.backToBl")}
                  </AppButton>
                </Space>
              }
            />
          </div>
        </Card>
      </FeaturePageShell>
    );
  }

  if (!isLoading && draft?.status === "I") {
    return (
      <FeaturePageShell>
        <BlModuleStyles />
        <Card className="wizard-page-card">
          <div className="wizard-page-header">
            <ModuleScreenHeader
              icon={NavBillOfLadingIcon}
              title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, blNo)}
              marginBottom={0}
            />
          </div>
          <div className="wizard-confirmation">
            <Result
              status="info"
              title={t("activity.issued")}
              subTitle={t("wizard.errors.issuedNotEditable")}
              extra={
                <AppButton onClick={() => navigate({ to: `/app/bl/${blNo}` })}>
                  {t("wizard.actions.viewBl")}
                </AppButton>
              }
            />
          </div>
        </Card>
      </FeaturePageShell>
    );
  }

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="wizard-page-card">
        <div className="wizard-page-header">
          <ModuleScreenHeader
            icon={NavBillOfLadingIcon}
            title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, blNo)}
            marginBottom={0}
            extra={
              <AppButton
                danger
                icon={
                  <AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />
                }
                onClick={goDashboard}
              >
                {t("wizard.actions.backToBl")}
              </AppButton>
            }
          />
        </div>

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
      </Card>

      <AppModal
        title={t("wizard.terms.modalTitle")}
        open={termsOpen}
        onCancel={() => setTermsOpen(false)}
        footer={
          <>
            <AppButton onClick={() => setTermsOpen(false)}>
              {t("actions.decline")}
            </AppButton>
            <AppButton
              type="primary"
              onClick={() => {
                setTermsAccepted(true);
                setTermsOpen(false);
                toast.success(t("wizard.toasts.termsAccepted"));
              }}
            >
              {t("actions.iAgree")}
            </AppButton>
          </>
        }
      >
        <div className="bl-terms-body custom-scroll">{t("wizard.terms.body")}</div>
      </AppModal>
    </FeaturePageShell>
  );
}
