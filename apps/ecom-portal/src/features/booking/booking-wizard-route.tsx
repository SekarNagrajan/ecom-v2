// Modified by Sekar Nagarajan (2026-09-10 23:31)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Space, Steps, Typography, theme } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppIcon, Icons, NavBookingIcon } from "../../components/icons";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { useModuleTitles, useWizardStepTitles } from "../../i18n/use-module-titles";
import { bookingApi } from "./api/booking.api";
import { bookingKeys } from "./api/booking.keys";
import { BookingModuleStyles } from "./components/booking-module-styles";
import { DEFAULT_BOOKING_WIZARD_CONFIG } from "./config/booking-wizard-config";
import { buildBookingWizardSteps, getBookingStepIcon } from "./config/booking-wizard-steps";
import { useBookingWizard } from "./hooks/use-booking-wizard";
import { useBookingStore } from "./stores/booking.store";

const { Text, Title } = Typography;

export function BookingWizardRoute() {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const { token } = theme.useToken();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const payload = useBookingStore((s) => s.payload);
  const [savingDraft, setSavingDraft] = useState(false);
  const { currentStep, setCurrentStep, isSubmitting, handleSubmit, confirmation, handleStartOver } =
    useBookingWizard();

  const wizardSteps = useMemo(
    () =>
      buildBookingWizardSteps(DEFAULT_BOOKING_WIZARD_CONFIG, {
        master: WIZARD_STEP_TITLES.masterDetails,
        parties: WIZARD_STEP_TITLES.customerDetails,
        cargo: WIZARD_STEP_TITLES.cargoDetails,
        ens: WIZARD_STEP_TITLES.ensDetails,
        insurance: WIZARD_STEP_TITLES.insurance,
        files: WIZARD_STEP_TITLES.fileUpload,
        references: WIZARD_STEP_TITLES.references,
        preview: WIZARD_STEP_TITLES.preview,
      }),
    [WIZARD_STEP_TITLES],
  );

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const { draftId } = await bookingApi.saveDraft(payload);
      // After first draft of a duplicate, bind to the new ebookno so further saves update it.
      useBookingStore.setState((state) => ({
        payload: {
          ...state.payload,
          draftId,
          forceCreateNew: false,
          duplicatedFromId: undefined,
          masterDetails: state.payload.masterDetails
            ? {
                ...state.payload.masterDetails,
                onlineBookingNo: draftId,
              }
            : state.payload.masterDetails,
        },
      }));
      void queryClient.invalidateQueries({
        queryKey: bookingKeys.list(),
        refetchType: "all",
      });
      toast.success(t("booking:wizard.toasts.draftSaved", { draftId }));
    } catch {
      toast.error(t("booking:wizard.toasts.draftSaveFailed"));
    } finally {
      setSavingDraft(false);
    }
  };

  const steps = wizardSteps.map((step, index) => ({
    title: step.title,
    icon: getBookingStepIcon(step.icon, index, currentStep, token),
  }));

  const activeStep = wizardSteps[currentStep];

  return (
    <Card className="wizard-page-card">
      <BookingModuleStyles />
      <div className="wizard-page-header">
        <ModuleScreenHeader
          icon={NavBookingIcon}
          title={MODULE_TITLES.newBooking}
          marginBottom={0}
          extra={
            <Space wrap className="custom-scroll">
              {!confirmation ? (
                <AppButton
                  icon={<AppIcon icon={Icons.save} size={16} />}
                  loading={savingDraft}
                  disabled={isSubmitting}
                  onClick={() => void handleSaveDraft()}
                >
                  {t("booking:wizard.actions.saveDraft")}
                </AppButton>
              ) : null}

              {
                <AppButton
                  danger
                  icon={<AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />}
                  onClick={() => navigate({ to: "/app/booking" })}
                >
                  {t("booking:actions.backToBooking")}
                </AppButton>
              }
            </Space>
          }
        />
      </div>

      {confirmation ? (
        <div className="wizard-confirmation">
          <Card variant="outlined" className="booking-confirmation-card">
            <div className="booking-confirmation-card__body">
              <div className="booking-confirmation-card__icon" aria-hidden>
                <AppIcon icon={Icons.checkCircle} size={36} tone="approve" />
              </div>
              <Title level={3} className="booking-confirmation-card__title">
                {t("booking:wizard.confirm.submittedTitle")}
              </Title>
              <Text type="secondary" className="booking-confirmation-card__message">
                {t("booking:wizard.confirm.submittedMessage")}
              </Text>
              <div className="booking-confirmation-card__ref">
                <Text type="secondary" className="booking-confirmation-card__ref-label">
                  {t("booking:wizard.confirm.bookingReference")}
                </Text>
                <Text copyable strong className="booking-confirmation-card__ref-value">
                  {confirmation.bookingReference}
                </Text>
              </div>
              <Space wrap size="middle" className="booking-confirmation-card__actions">
                <AppButton
                  type="primary"
                  onClick={() => {
                    void queryClient.invalidateQueries({
                      queryKey: bookingKeys.list(),
                      refetchType: "all",
                    });
                    void navigate({ to: "/app/booking" });
                  }}
                >
                  {t("booking:wizard.actions.goToDashboard")}
                </AppButton>
                <AppButton onClick={handleStartOver}>
                  {t("booking:wizard.actions.createAnother")}
                </AppButton>
              </Space>
            </div>
          </Card>
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

          <div className="wizard-step-content">
            {activeStep?.render({
              onSubmit: handleSubmit,
              isSubmitting,
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
