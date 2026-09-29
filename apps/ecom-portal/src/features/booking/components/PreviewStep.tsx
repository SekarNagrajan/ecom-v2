// Modified by Sekar Nagarajan (2026-09-11 12:12)
/**
 * Preview — airy review of all wizard inputs with Edit → jump to step.
 * Layout: header + section stack (route, master, parties, cargo, ENS,
 * insurance, documents, references) + terms + footer.
 */
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Checkbox, Flex, Result } from "antd";
import { useState } from "react";

import { useTranslation } from "react-i18next";
import { AppIcon, Icons } from "../../../components/icons";
import { useWizardStepTitles } from "../../../i18n/use-module-titles";
import { useBookingStore } from "../stores/booking.store";
import type { SelectedRoute } from "../types/booking.types";
import { orderedAssignedParties } from "../utils/party-role.utils";
import { BookingModuleStyles } from "./booking-module-styles";
import { PreviewCargoReview } from "./preview/PreviewCargoReview";
import { PreviewRouteBand } from "./preview/PreviewRouteBand";
import { PreviewSummaryStrip } from "./preview/PreviewSummaryStrip";
import {
  BookingPreviewEmpty,
  BookingPreviewFieldGrid,
  BookingPreviewPartyCard,
  BookingPreviewSection,
} from "./preview/booking-preview-section";

/** Wizard step indices — mirrors booking-wizard-route Steps order. */
const BOOKING_STEP = {
  master: 0,
  parties: 1,
  cargo: 2,
  ens: 3,
  insurance: 4,
  files: 5,
  references: 6,
} as const;

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function portCodeFromValue(value?: string): string {
  if (!value) return "";
  const beforeDash = value.split(" - ")[0]?.trim() ?? "";
  if (beforeDash && /^[A-Z]{5}$/i.test(beforeDash)) return beforeDash;
  const token = value.split(/[\s-]/)[0]?.trim() ?? "";
  return token || value;
}

function formatDocumentType(type: string): string {
  return type.replace(/_/g, " ");
}

function formatMoney(value?: number, currency?: string): string {
  if (value === undefined || value === null) return "—";
  const amount = value.toLocaleString();
  return currency ? `${currency} ${amount}` : amount;
}

function buildReviewSummary(
  bookingNo: string | undefined,
  route: SelectedRoute | null | undefined,
  origin: string | undefined,
  delivery: string | undefined,
): string {
  const originCode = route?.polPortId || portCodeFromValue(origin) || "—";
  const destCode = route?.podPortId || portCodeFromValue(delivery) || "—";
  const vesselVoyage = route
    ? [route.vesselName, `${route.voyage ?? ""}${route.bound ?? ""}`]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";
  const transit =
    route && typeof route.transitTimeDays === "number"
      ? `${route.transitTimeDays} days${
          route.isDirect
            ? ", Direct"
            : route.shipmentKind
            ? `, ${route.shipmentKind}`
            : ""
        }`
      : "";
  return [
    bookingNo?.trim() || "Draft",
    `${originCode} → ${destCode}`,
    vesselVoyage,
    transit,
  ]
    .filter(Boolean)
    .join(" · ");
}

interface PreviewStepProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PreviewStep({ onSubmit, isSubmitting }: PreviewStepProps) {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const navigate = useNavigate();
  const payload = useBookingStore((s) => s.payload);
  const prevStep = useBookingStore((s) => s.prevStep);
  const setCurrentStep = useBookingStore((s) => s.setCurrentStep);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const go = (step: (typeof BOOKING_STEP)[keyof typeof BOOKING_STEP]) => {
    setCurrentStep(step);
  };

  if (!payload.masterDetails || !payload.parties || !payload.cargo) {
    return (
      <Result
        status="warning"
        title={t("booking:wizard.preview.missingTitle")}
        subTitle={t("booking:wizard.preview.missingSubtitle")}
      />
    );
  }

  const {
    masterDetails,
    parties,
    cargo,
    ens,
    insurance,
    documents = [],
    referenceFields = [],
  } = payload;
  const route = masterDetails.selectedRoute;

  const partyEntries = orderedAssignedParties(parties);

  const masterRows: { label: string; value: string }[] = [
    { label: t("booking:columns.origin"), value: dash(masterDetails.origin) },
    { label: t("booking:columns.delivery"), value: dash(masterDetails.delivery) },
    { label: t("booking:labels.cargoReadyDate"), value: dash(masterDetails.cargoReadyDate) },
    { label: t("booking:labels.haulageOrigin"), value: dash(masterDetails.haulageOriginType) },
    {
      label: t("booking:labels.haulageDestination"),
      value: dash(masterDetails.haulageDestinationType),
    },
    { label: t("booking:labels.carriageContract"), value: dash(masterDetails.carriageContract) },
    { label: t("booking:wizard.master.preferredAgency"), value: dash(masterDetails.preferredAgency) },
    { label: t("booking:wizard.master.rateReference"), value: dash(masterDetails.rateReference) },
  ];

  const ensRows: { label: string; value: string }[] = ens?.euCustomsZone
    ? [
        { label: t("booking:wizard.preview.euCustomsZone"), value: t("common:actions.yes") },
        { label: t("booking:labels.blType"), value: dash(ens.blType) },
        { label: t("booking:labels.filingType"), value: dash(ens.ensFilingType) },
        { label: t("booking:wizard.preview.paymentMethod"), value: dash(ens.paymentMethod) },
        ...(ens.ensFilingType === "Single Filing"
          ? [
              { label: t("booking:wizard.preview.buyer"), value: dash(ens.buyerName) },
              { label: t("booking:wizard.preview.seller"), value: dash(ens.sellerName) },
            ]
          : [
              {
                label: t("booking:wizard.preview.declarant"),
                value: ens.declarantName
                  ? `${ens.declarantName}${
                      ens.declarantCountry ? ` (${ens.declarantCountry})` : ""
                    }`
                  : "—",
              },
            ]),
      ]
    : [{ label: t("booking:wizard.preview.ensRequired"), value: t("common:actions.no") }];

  const originCode =
    route?.polPortId || portCodeFromValue(masterDetails.origin);
  const destCode =
    route?.podPortId || portCodeFromValue(masterDetails.delivery);

  return (
    <div className="form-step-layout">
      <BookingModuleStyles />
      <div className="custom-scroll form-step-scroll booking-preview-scroll booking-review">
        <PreviewSummaryStrip
          summary={buildReviewSummary(
            masterDetails.onlineBookingNo,
            route,
            masterDetails.origin,
            masterDetails.delivery,
          )}
        />

        <BookingPreviewSection
          variant="airy"
          title={t("booking:wizard.preview.sections.routeSchedule")}
          onEdit={() => go(BOOKING_STEP.master)}
        >
          {route ? (
            <PreviewRouteBand
              route={route}
              originCode={originCode}
              destCode={destCode}
              carriageContract={masterDetails.carriageContract}
              haulageOrigin={masterDetails.haulageOriginType}
              haulageDestination={masterDetails.haulageDestinationType}
            />
          ) : (
            <BookingPreviewEmpty label={t("booking:wizard.preview.empty.noRoute")} />
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title={t("booking:sections.masterDetails")}
          onEdit={() => go(BOOKING_STEP.master)}
        >
          <BookingPreviewFieldGrid items={masterRows} />
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title={t("booking:sections.customerDetails")}
          onEdit={() => go(BOOKING_STEP.parties)}
        >
          {partyEntries.length > 0 ? (
            <div className="booking-review__party-grid">
              {partyEntries.map(([role, card]) => (
                <div key={role} className="booking-party-grid__col">
                  <BookingPreviewPartyCard role={role} card={card} />
                </div>
              ))}
            </div>
          ) : (
            <BookingPreviewEmpty label={t("booking:wizard.preview.empty.noParties")} />
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title={t("booking:sections.cargoDetails")}
          onEdit={() => go(BOOKING_STEP.cargo)}
        >
          <PreviewCargoReview containers={cargo.containers ?? []} />
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.ensDetails}
          onEdit={() => go(BOOKING_STEP.ens)}
        >
          <BookingPreviewFieldGrid items={ensRows} />
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title={t("booking:wizard.preview.sections.insuranceCharges")}
          onEdit={() => go(BOOKING_STEP.insurance)}
        >
          {insurance?.isInsuranceRequired ? (
            <div className="booking-review__grid">
              <div className="booking-review__field">
                <span className="booking-review__label">{t("booking:wizard.preview.ensRequired")}</span>
                <span className="booking-review__value">{t("common:actions.yes")}</span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">{t("booking:wizard.preview.currency")}</span>
                <span className="booking-review__value">
                  {dash(insurance.currency)}
                </span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">{t("booking:labels.termsAccepted")}</span>
                <span className="booking-review__value">
                  {insurance.termsAccepted ? t("common:actions.yes") : t("common:actions.no")}
                </span>
              </div>
              <div className="booking-review__value-tile">
                <span className="booking-review__label">{t("booking:wizard.preview.declaredValue")}</span>
                <span className="booking-review__value-tile-amount">
                  {formatMoney(insurance.cargoValue, insurance.currency)}
                </span>
              </div>
            </div>
          ) : (
            <div className="booking-review__grid">
              <div className="booking-review__field">
                <span className="booking-review__label">{t("booking:wizard.preview.ensRequired")}</span>
                <span className="booking-review__value">{t("common:actions.no")}</span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">{t("booking:wizard.preview.currency")}</span>
                <span className="booking-review__value">—</span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">{t("booking:labels.termsAccepted")}</span>
                <span className="booking-review__value">—</span>
              </div>
              <div className="booking-review__value-tile">
                <span className="booking-review__label">{t("booking:wizard.preview.declaredValue")}</span>
                <span className="booking-review__value-tile-amount">—</span>
              </div>
            </div>
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title={t("booking:sections.documents")}
          onEdit={() => go(BOOKING_STEP.files)}
        >
          {documents.length > 0 ? (
            <div className="booking-review__grid">
              {documents.map((doc) => (
                <div key={doc.id} className="booking-review__doc-chip">
                  <span className="booking-review__doc-chip-name">
                    <AppIcon icon={Icons.fileText} size={16} />
                    <span className="booking-review__value">
                      {doc.fileName}
                    </span>
                  </span>
                  <span className="booking-review__label">
                    {formatDocumentType(doc.type)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <BookingPreviewEmpty label={t("booking:wizard.preview.empty.noFiles")} />
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.references}
          onEdit={() => go(BOOKING_STEP.references)}
        >
          {referenceFields.length > 0 ? (
            <BookingPreviewFieldGrid
              items={referenceFields.map((field) => ({
                label: field.name,
                value: dash(field.value),
              }))}
            />
          ) : (
            <BookingPreviewEmpty label={t("booking:wizard.preview.empty.noReferences")} />
          )}
        </BookingPreviewSection>

        <div className="booking-review__terms">
          <Checkbox
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
          >
            {t("booking:wizard.preview.termsCheckbox")}
          </Checkbox>
        </div>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={prevStep} disabled={isSubmitting}>
            {t("common:actions.previous")}
          </AppButton>
          <AppButton
            onClick={() => navigate({ to: "/app/booking" })}
            disabled={isSubmitting}
          >
            {t("common:actions.cancel")}
          </AppButton>
        </div>
        <Flex gap="small" wrap="wrap">
          <AppButton
            type="primary"
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!termsAccepted}
          >
            {t("booking:wizard.actions.submitBooking")}
          </AppButton>
        </Flex>
      </div>
    </div>
  );
}
