// Modified by Sekar Nagarajan (2026-09-05 00:18)
/**
 * Preview — airy review of all wizard inputs with Edit → jump to step.
 * Layout: header + section stack (route, master, parties, cargo, ENS,
 * insurance, documents, references) + terms + footer.
 */
import { AppButton } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Checkbox, Flex, Result } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../constants/module-titles";
import { useBookingStore } from "../stores/booking.store";
import type { SelectedRoute } from "../types/booking.types";
import { partiesToCards, type PartyRoleKey } from "../utils/party-role.utils";
import { BookingModuleStyles } from "./booking-module-styles";
import { PreviewCargoReview } from "./preview/PreviewCargoReview";
import { PreviewRouteBand } from "./preview/PreviewRouteBand";
import { PreviewSummaryStrip } from "./preview/PreviewSummaryStrip";
import {
  BookingPreviewEmpty,
  BookingPreviewEmptyPartyCard,
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

const REVIEW_PARTY_ROLES: PartyRoleKey[] = [
  "shipper",
  "consignee",
  "notifyParty",
  "forwarder",
];

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
        title="Missing Information"
        subTitle="Please go back and complete all previous steps before submitting."
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

  const partyCards = partiesToCards(parties);
  const reviewRoleSet = new Set<PartyRoleKey>(REVIEW_PARTY_ROLES);
  const extraPartyEntries = (
    Object.entries(partyCards) as [
      PartyRoleKey,
      (typeof partyCards)[PartyRoleKey],
    ][]
  ).filter(([role, card]) => card && !reviewRoleSet.has(role));

  const masterRows: { label: string; value: string }[] = [
    { label: "Origin", value: dash(masterDetails.origin) },
    { label: "Delivery", value: dash(masterDetails.delivery) },
    { label: "Cargo ready date", value: dash(masterDetails.cargoReadyDate) },
    { label: "Haulage origin", value: dash(masterDetails.haulageOriginType) },
    {
      label: "Haulage destination",
      value: dash(masterDetails.haulageDestinationType),
    },
    { label: "Carriage contract", value: dash(masterDetails.carriageContract) },
    { label: "Preferred agency", value: dash(masterDetails.preferredAgency) },
    { label: "Rate reference", value: dash(masterDetails.rateReference) },
  ];

  const ensRows: { label: string; value: string }[] = ens?.euCustomsZone
    ? [
        { label: "EU customs zone", value: "Yes" },
        { label: "BL type", value: dash(ens.blType) },
        { label: "Filing type", value: dash(ens.ensFilingType) },
        { label: "Payment method", value: dash(ens.paymentMethod) },
        ...(ens.ensFilingType === "Single Filing"
          ? [
              { label: "Buyer", value: dash(ens.buyerName) },
              { label: "Seller", value: dash(ens.sellerName) },
            ]
          : [
              {
                label: "Declarant",
                value: ens.declarantName
                  ? `${ens.declarantName}${
                      ens.declarantCountry ? ` (${ens.declarantCountry})` : ""
                    }`
                  : "—",
              },
            ]),
      ]
    : [{ label: "ENS required", value: "No" }];

  const originCode = route?.polPortId || portCodeFromValue(masterDetails.origin);
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
          title="Route & schedule"
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
            <BookingPreviewEmpty label="No route selected" />
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title="Master details"
          onEdit={() => go(BOOKING_STEP.master)}
        >
          <BookingPreviewFieldGrid items={masterRows} />
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title="Customer details"
          onEdit={() => go(BOOKING_STEP.parties)}
        >
          <div className="booking-review__party-grid">
            {REVIEW_PARTY_ROLES.map((role) => {
              const card = partyCards[role];
              return (
                <div key={role} className="booking-party-grid__col">
                  {card ? (
                    <BookingPreviewPartyCard role={role} card={card} />
                  ) : (
                    <BookingPreviewEmptyPartyCard role={role} />
                  )}
                </div>
              );
            })}
            {extraPartyEntries.map(([role, card]) =>
              card ? (
                <div key={role} className="booking-party-grid__col">
                  <BookingPreviewPartyCard role={role} card={card} />
                </div>
              ) : null,
            )}
          </div>
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title="Cargo details"
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
          title="Insurance & charges"
          onEdit={() => go(BOOKING_STEP.insurance)}
        >
          {insurance?.isInsuranceRequired ? (
            <div className="booking-review__grid">
              <div className="booking-review__field">
                <span className="booking-review__label">Required</span>
                <span className="booking-review__value">Yes</span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">Currency</span>
                <span className="booking-review__value">
                  {dash(insurance.currency)}
                </span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">Terms accepted</span>
                <span className="booking-review__value">
                  {insurance.termsAccepted ? "Yes" : "No"}
                </span>
              </div>
              <div className="booking-review__value-tile">
                <span className="booking-review__label">Declared value</span>
                <span className="booking-review__value-tile-amount">
                  {formatMoney(insurance.cargoValue, insurance.currency)}
                </span>
              </div>
            </div>
          ) : (
            <div className="booking-review__grid">
              <div className="booking-review__field">
                <span className="booking-review__label">Required</span>
                <span className="booking-review__value">No</span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">Currency</span>
                <span className="booking-review__value">—</span>
              </div>
              <div className="booking-review__field">
                <span className="booking-review__label">Terms accepted</span>
                <span className="booking-review__value">—</span>
              </div>
              <div className="booking-review__value-tile">
                <span className="booking-review__label">Declared value</span>
                <span className="booking-review__value-tile-amount">—</span>
              </div>
            </div>
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          variant="airy"
          title="Documents"
          onEdit={() => go(BOOKING_STEP.files)}
        >
          {documents.length > 0 ? (
            <div className="booking-review__grid">
              {documents.map((doc) => (
                <div key={doc.id} className="booking-review__doc-chip">
                  <span className="booking-review__doc-chip-name">
                    <AppIcon icon={Icons.fileText} size={16} />
                    <span className="booking-review__value">{doc.fileName}</span>
                  </span>
                  <span className="booking-review__label">
                    {formatDocumentType(doc.type)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <BookingPreviewEmpty label="No files uploaded" />
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
            <BookingPreviewEmpty label="No reference fields" />
          )}
        </BookingPreviewSection>

        <div className="booking-review__terms">
          <Checkbox
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
          >
            I confirm these details are accurate and accept the terms of
            carriage
          </Checkbox>
        </div>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={prevStep} disabled={isSubmitting}>
            Previous
          </AppButton>
          <AppButton
            onClick={() => navigate({ to: "/app/booking" })}
            disabled={isSubmitting}
          >
            Cancel
          </AppButton>
        </div>
        <Flex gap="small" wrap="wrap">
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.check} size={16} />}
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!termsAccepted}
          >
            Submit Booking
          </AppButton>
        </Flex>
      </div>
    </div>
  );
}
