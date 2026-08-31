// Modified by Sekar Nagarajan (2026-08-31 16:41)
/**
 * Preview — summary of all wizard step inputs with Edit → jump to step.
 */
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import {
  Col,
  Descriptions,
  Flex,
  Result,
  Row,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
} from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { bookingApi } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import { BookingModuleStyles } from "./booking-module-styles";
import {
  BookingPreviewEmpty,
  BookingPreviewPartyBlock,
  BookingPreviewSection,
} from "./preview/booking-preview-section";

const { Title, Text } = Typography;

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

interface PreviewStepProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PreviewStep({ onSubmit, isSubmitting }: PreviewStepProps) {
  const toast = useToast();
  const navigate = useNavigate();
  const { payload, prevStep, setCurrentStep } = useBookingStore();
  const [savingDraft, setSavingDraft] = useState(false);

  const go = (step: (typeof BOOKING_STEP)[keyof typeof BOOKING_STEP]) => {
    setCurrentStep(step);
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const { draftId } = await bookingApi.saveDraft(payload);
      toast.success(`Draft saved (${draftId})`);
    } catch {
      toast.error("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
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
  const busy = isSubmitting || savingDraft;

  return (
    <div className="form-step-layout">
      <BookingModuleStyles />
      <div className="custom-scroll form-step-scroll booking-preview-scroll">
        <div className="booking-preview-header">
          <Title
            level={4}
            className="form-step-card-title booking-preview-title"
          >
            {MODULE_TITLES.bookingSummary}
          </Title>
          <Text type="secondary" className="booking-preview-subtitle">
            Review each section. Use Edit to jump back and update that step.
          </Text>
        </div>

        <BookingPreviewSection
          title={WIZARD_STEP_TITLES.masterDetails}
          onEdit={() => go(BOOKING_STEP.master)}
        >
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, md: 3 }}
            className="booking-preview-descriptions"
          >
            <Descriptions.Item label="Origin">
              {dash(masterDetails.origin)}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery">
              {dash(masterDetails.delivery)}
            </Descriptions.Item>
            <Descriptions.Item label="Cargo Ready Date">
              {dash(masterDetails.cargoReadyDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Haulage Origin">
              {dash(masterDetails.haulageOriginType)}
            </Descriptions.Item>
            <Descriptions.Item label="Haulage Destination">
              {dash(masterDetails.haulageDestinationType)}
            </Descriptions.Item>
            <Descriptions.Item label="Carriage Contract">
              {dash(masterDetails.carriageContract)}
            </Descriptions.Item>
            <Descriptions.Item label="Agreement Party">
              {dash(masterDetails.agreementParty)}
            </Descriptions.Item>
            <Descriptions.Item label="Preferred Agency">
              {dash(masterDetails.preferredAgency)}
            </Descriptions.Item>
          </Descriptions>

          {route ? (
            <div className="booking-selected-route">
              <div>
                <Text strong className="booking-selected-route__title">
                  Selected route: {route.serviceName} ({route.serviceCode})
                </Text>
                <Text type="secondary" className="booking-selected-route__meta">
                  {route.vesselName} · Voy {route.voyage}
                  {route.bound ? `/${route.bound}` : ""} · ETD {route.etd} · ETA{" "}
                  {route.eta} · {route.transitTimeDays} days
                </Text>
              </div>
            </div>
          ) : (
            <BookingPreviewEmpty label="No route selected" />
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          title={WIZARD_STEP_TITLES.customerDetails}
          onEdit={() => go(BOOKING_STEP.parties)}
        >
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.third}>
              <BookingPreviewPartyBlock
                role="Booking Party"
                name={parties.shipperName}
                address={parties.shipperAddress}
                city={parties.shipperCity}
                country={parties.shipperCountry}
              />
            </Col>
            <Col {...RESPONSIVE_COL.third}>
              <BookingPreviewPartyBlock
                role="Consignee"
                name={parties.consigneeName}
                address={parties.consigneeAddress}
                city={parties.consigneeCity}
                country={parties.consigneeCountry}
              />
            </Col>
            <Col {...RESPONSIVE_COL.third}>
              <BookingPreviewPartyBlock
                role="Notify Party"
                name={parties.notifyPartyName}
                address={parties.notifyPartyAddress}
                city={parties.notifyPartyCity}
                country={parties.notifyPartyCountry}
              />
            </Col>
            {parties.notifyParty2Name ? (
              <Col {...RESPONSIVE_COL.third}>
                <BookingPreviewPartyBlock
                  role="Notify Party 2"
                  name={parties.notifyParty2Name}
                />
              </Col>
            ) : null}
            <Col {...RESPONSIVE_COL.third}>
              <div className="booking-party-block">
                <span className="form-field-label">Agreement Party</span>
                <Text strong>{dash(parties.agreementParty)}</Text>
              </div>
            </Col>
            <Col {...RESPONSIVE_COL.third}>
              <div className="booking-party-block">
                <span className="form-field-label">SI Submitting Party</span>
                <Text strong>{dash(parties.siSubmittingParty)}</Text>
              </div>
            </Col>
          </Row>
        </BookingPreviewSection>

        <BookingPreviewSection
          title={WIZARD_STEP_TITLES.cargoDetails}
          onEdit={() => go(BOOKING_STEP.cargo)}
        >
          {cargo.containers.length === 0 ? (
            <BookingPreviewEmpty label="No containers" />
          ) : (
            cargo.containers.map((container, idx) => (
              <div key={container.id} className="booking-cargo-container-card">
                <Text strong>
                  Container {idx + 1}: {container.quantity}x{" "}
                  {container.containerType}
                  {container.isSoc ? " · SOC" : ""}
                  {container.reeferMode !== "none"
                    ? ` · Reefer ${container.reeferMode}`
                    : ""}
                  {container.isLcl ? " · LCL" : ""}
                  {container.isOog ? " · OOG" : ""}
                </Text>
                <ul className="booking-preview-list">
                  {container.commodities.map((c) => (
                    <li key={c.id}>
                      {c.hsCode ? `${c.hsCode} · ` : ""}
                      {c.commodity || c.description} · {c.packageQuantity}{" "}
                      {c.packageType} · {c.weight} kg · {c.volume} m³
                      {c.marksAndNumbers
                        ? ` · Marks: ${c.marksAndNumbers}`
                        : ""}
                      {c.isDangerousGoods ? (
                        <Text type="danger">
                          {" "}
                          · DG UN {c.unNumber} / Class {c.dgClass}
                        </Text>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          title={WIZARD_STEP_TITLES.ensDetails}
          onEdit={() => go(BOOKING_STEP.ens)}
        >
          {ens?.euCustomsZone ? (
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2, md: 3 }}
              className="booking-preview-descriptions"
            >
              <Descriptions.Item label="EU Customs Zone">Yes</Descriptions.Item>
              <Descriptions.Item label="BL Type">
                {dash(ens.blType)}
              </Descriptions.Item>
              <Descriptions.Item label="Filing Type">
                {dash(ens.ensFilingType)}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {dash(ens.paymentMethod)}
              </Descriptions.Item>
              {ens.ensFilingType === "Single Filing" ? (
                <>
                  <Descriptions.Item label="Buyer">
                    {dash(ens.buyerName)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Seller">
                    {dash(ens.sellerName)}
                  </Descriptions.Item>
                </>
              ) : (
                <Descriptions.Item label="Declarant">
                  {ens.declarantName
                    ? `${ens.declarantName}${
                        ens.declarantCountry
                          ? ` (${ens.declarantCountry})`
                          : ""
                      }`
                    : "—"}
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Tag>ENS not required</Tag>
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          title={WIZARD_STEP_TITLES.insurance}
          onEdit={() => go(BOOKING_STEP.insurance)}
        >
          {insurance?.isInsuranceRequired ? (
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2, md: 3 }}
              className="booking-preview-descriptions"
            >
              <Descriptions.Item label="Required">Yes</Descriptions.Item>
              <Descriptions.Item label="Cargo Value">
                {dash(insurance.cargoValue)} {dash(insurance.currency)}
              </Descriptions.Item>
              <Descriptions.Item label="Terms Accepted">
                {insurance.termsAccepted ? "Yes" : "No"}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Tag>Insurance not required</Tag>
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          title={WIZARD_STEP_TITLES.fileUpload}
          onEdit={() => go(BOOKING_STEP.files)}
        >
          {documents.length > 0 ? (
            <ul className="booking-preview-list">
              {documents.map((d) => (
                <li key={d.id}>
                  {d.fileName} ({d.type})
                </li>
              ))}
            </ul>
          ) : (
            <BookingPreviewEmpty label="No files uploaded" />
          )}
        </BookingPreviewSection>

        <BookingPreviewSection
          title={WIZARD_STEP_TITLES.references}
          onEdit={() => go(BOOKING_STEP.references)}
        >
          {referenceFields.length > 0 ? (
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2, md: 3 }}
              className="booking-preview-descriptions"
            >
              {referenceFields.map((field) => (
                <Descriptions.Item key={field.id} label={field.name}>
                  {dash(field.value)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            <BookingPreviewEmpty label="No reference fields" />
          )}
        </BookingPreviewSection>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={prevStep} disabled={busy}>
            Previous
          </AppButton>
          <AppButton
            onClick={() => navigate({ to: "/app/booking" })}
            disabled={busy}
          >
            Cancel
          </AppButton>
        </div>
        <Flex gap="small" wrap="wrap">
          <AppButton
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={savingDraft}
            disabled={isSubmitting}
            onClick={() => void handleSaveDraft()}
          >
            Save Draft
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.check} size={16} />}
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={savingDraft}
          >
            Submit Booking
          </AppButton>
        </Flex>
      </div>
    </div>
  );
}
