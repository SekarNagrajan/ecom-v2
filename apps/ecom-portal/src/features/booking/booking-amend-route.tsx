// Modified by Sekar Nagarajan (2026-11-26 19:05)
import { AppButton } from "@solverminds/shared-ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Result, Space, Spin, Steps, Typography, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppIcon, Icons, NavBookingIcon } from "../../components/icons";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { formatModuleScreenTitle } from "../../constants/module-titles";
import { useModuleTitles, useWizardStepTitles } from "../../i18n/use-module-titles";
import { bookingApi } from "./api/booking.api";
import { bookingKeys } from "./api/booking.keys";
import { BookingModuleStyles } from "./components/booking-module-styles";
import { DEFAULT_BOOKING_WIZARD_CONFIG } from "./config/booking-wizard-config";
import { buildBookingWizardSteps, getBookingStepIcon } from "./config/booking-wizard-steps";
import { useBookingWizard } from "./hooks/use-booking-wizard";
import { useBookingStore } from "./stores/booking.store";
import { defaultCargoData, migrateLegacyCargo } from "./types/booking.types";

const { Text, Title } = Typography;

export function BookingAmendRoute() {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { bookingId } = useParams({ strict: false });
  const { currentStep, setCurrentStep, isSubmitting, handleSubmit, confirmation } =
    useBookingWizard(true); // pass isEditMode
  const { initializeFromBooking } = useBookingStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const goToBookingList = () => {
    void queryClient.invalidateQueries({
      queryKey: bookingKeys.list(),
      refetchType: "all",
    });
    void navigate({ to: "/app/booking" });
  };

  const goToBookingView = () => {
    if (!bookingId) {
      goToBookingList();
      return;
    }
    void queryClient.invalidateQueries({
      queryKey: bookingKeys.detail(bookingId),
      refetchType: "all",
    });
    void navigate({ to: `/app/booking/${bookingId}` });
  };

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: bookingKeys.detail(bookingId ?? ""),
    queryFn: () => bookingApi.getBookingById(bookingId as string),
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (booking && !isInitialized) {
      initializeFromBooking({
        ...booking,
        cargo: booking.cargo ? migrateLegacyCargo(booking.cargo) : defaultCargoData(),
        documents: booking.documents ?? [],
        referenceFields: booking.referenceFields ?? [],
      });
      setIsInitialized(true);
    }
  }, [booking, initializeFromBooking, isInitialized]);

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

  const steps = wizardSteps.map((step, index) => ({
    title: step.title,
    icon: getBookingStepIcon(step.icon, index, currentStep, token),
  }));

  const activeStep = wizardSteps[currentStep];

  if (isLoading || !isInitialized) {
    return (
      <Card
        style={{
          textAlign: "center",
          padding: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Spin
          size="medium"
          description={t("booking:wizard.amend.loading")}
          style={{ justifyContent: "center", alignItems: "center" }}
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Result status="error" title={t("booking:wizard.amend.loadFailed")} />
      </Card>
    );
  }

  return (
    <Card className="wizard-page-card">
      <BookingModuleStyles />
      <div className="wizard-page-header">
        <ModuleScreenHeader
          icon={NavBookingIcon}
          title={formatModuleScreenTitle(MODULE_TITLES.amendBooking, bookingId)}
          marginBottom={0}
          extra={
            <AppButton
              danger
              icon={<AppIcon icon={Icons.arrowLeft} size={16} tone="delete" />}
              onClick={() => navigate({ to: "/app/booking" })}
            >
              {t("booking:actions.backToBooking")}
            </AppButton>
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
                {t("booking:wizard.amend.submittedTitle")}
              </Title>
              <Text type="secondary" className="booking-confirmation-card__message">
                {t("booking:wizard.amend.submittedMessage")}
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
                <AppButton type="primary" onClick={goToBookingList}>
                  {t("booking:wizard.actions.goToDashboard")}
                </AppButton>
                <AppButton onClick={goToBookingView}>
                  {t("booking:wizard.actions.viewBooking")}
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
