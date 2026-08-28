// Modified by Sekar Nagarajan (2026-08-28 10:32)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Descriptions, Flex, Result, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { bookingApi } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import { BookingModuleStyles } from "./booking-module-styles";

const { Title, Text } = Typography;

interface PreviewStepProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PreviewStep({ onSubmit, isSubmitting }: PreviewStepProps) {
  const toast = useToast();
  const { payload, prevStep } = useBookingStore();
  const [savingDraft, setSavingDraft] = useState(false);

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

  const { masterDetails, parties, cargo, ens, insurance, documents = [] } =
    payload;
  const route = masterDetails.selectedRoute;

  return (
    <div className="form-step-layout">
      <BookingModuleStyles />
      <div className="custom-scroll form-step-scroll">
        <Card
          title={
            <Title level={5} className="booking-preview-card-title">
              Master Details
            </Title>
          }
          className="form-step-card form-step-section"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Origin">
              {masterDetails.origin}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery">
              {masterDetails.delivery}
            </Descriptions.Item>
            <Descriptions.Item label="Cargo Ready Date">
              {masterDetails.cargoReadyDate}
            </Descriptions.Item>
            <Descriptions.Item label="Haulage Origin">
              {masterDetails.haulageOriginType}
            </Descriptions.Item>
            <Descriptions.Item label="Haulage Destination">
              {masterDetails.haulageDestinationType}
            </Descriptions.Item>
            <Descriptions.Item label="Carriage Contract">
              {masterDetails.carriageContract || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Agreement Party">
              {masterDetails.agreementParty || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Preferred Agency">
              {masterDetails.preferredAgency || "N/A"}
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
          ) : null}
        </Card>

        <Card
          title={
            <Title level={5} className="booking-preview-card-title">
              Parties
            </Title>
          }
          className="form-step-card form-step-section"
        >
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Shipper">
              {parties.shipperName}
            </Descriptions.Item>
            <Descriptions.Item label="Shipper Address">
              {[
                parties.shipperAddress,
                parties.shipperCity,
                parties.shipperCountry,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Consignee">
              {parties.consigneeName}
            </Descriptions.Item>
            <Descriptions.Item label="Consignee Address">
              {[
                parties.consigneeAddress,
                parties.consigneeCity,
                parties.consigneeCountry,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Notify Party">
              {parties.notifyPartyName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Notify Party 2">
              {parties.notifyParty2Name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Agreement Party">
              {parties.agreementParty}
            </Descriptions.Item>
            <Descriptions.Item label="SI Submitting Party">
              {parties.siSubmittingParty}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Title level={5} className="booking-preview-card-title">
              Cargo & Equipment
            </Title>
          }
          className="form-step-card form-step-section"
        >
          {cargo.containers.map((container, idx) => (
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
              <ul className="booking-cargo-commodity-list">
                {container.commodities.map((c) => (
                  <li key={c.id}>
                    {c.hsCode ? `${c.hsCode} · ` : ""}
                    {c.commodity || c.description} · {c.packageQuantity}{" "}
                    {c.packageType} · {c.weight} kg · {c.volume} m³
                    {c.marksAndNumbers ? ` · Marks: ${c.marksAndNumbers}` : ""}
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
          ))}
        </Card>

        {ens?.euCustomsZone ? (
          <Card
            title={
              <Title level={5} className="booking-preview-card-title">
                ENS Details
              </Title>
            }
            className="form-step-card form-step-section"
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="BL Type">{ens.blType}</Descriptions.Item>
              <Descriptions.Item label="Filing Type">
                {ens.ensFilingType}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {ens.paymentMethod}
              </Descriptions.Item>
              {ens.declarantName ? (
                <Descriptions.Item label="Declarant">
                  {ens.declarantName} ({ens.declarantCountry})
                </Descriptions.Item>
              ) : null}
            </Descriptions>
          </Card>
        ) : null}

        {insurance?.isInsuranceRequired ? (
          <Card
            title={
              <Title level={5} className="booking-preview-card-title">
                Insurance
              </Title>
            }
            className="form-step-card form-step-section"
          >
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Cargo Value">
                {insurance.cargoValue} {insurance.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Terms Accepted">
                {insurance.termsAccepted ? "Yes" : "No"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : null}

        {documents.length > 0 ? (
          <Card
            title={
              <Title level={5} className="booking-preview-card-title">
                Documents
              </Title>
            }
            className="form-step-card form-step-section"
          >
            <ul className="booking-preview-doc-list">
              {documents.map((d) => (
                <li key={d.id}>
                  {d.fileName} ({d.type})
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep} disabled={isSubmitting || savingDraft}>
          Previous
        </AppButton>
        <Flex gap="small" wrap="wrap">
          <AppButton
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={savingDraft}
            disabled={isSubmitting}
            onClick={() => void handleSaveDraft()}
          >
            Save Draft
          </AppButton>
          <AppButton type="primary" onClick={onSubmit} loading={isSubmitting}>
            Submit Booking
          </AppButton>
        </Flex>
      </div>
    </div>
  );
}
