// Modified by Sekar Nagarajan (2026-08-24 18:24)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Descriptions, Result, Typography, theme } from "antd";
import { useBookingStore } from "../stores/booking.store";

const { Title, Text } = Typography;

interface PreviewStepProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PreviewStep({ onSubmit, isSubmitting }: PreviewStepProps) {
  const { token } = theme.useToken();
  const { payload, prevStep } = useBookingStore();

  if (!payload.masterDetails || !payload.parties || !payload.cargo) {
    return (
      <Result
        status="warning"
        title="Missing Information"
        subTitle="Please go back and complete all previous steps before submitting."
      />
    );
  }

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card
          title={
            <Title level={5} style={{ margin: 0 }}>
              Master Details
            </Title>
          }
          className="form-step-card form-step-section"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Origin">
              {payload.masterDetails.origin}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery">
              {payload.masterDetails.delivery}
            </Descriptions.Item>
            <Descriptions.Item label="Cargo Ready Date">
              {payload.masterDetails.cargoReadyDate}
            </Descriptions.Item>
            <Descriptions.Item label="Haulage Origin">
              {payload.masterDetails.haulageOriginType}
            </Descriptions.Item>
            <Descriptions.Item label="Haulage Destination">
              {payload.masterDetails.haulageDestinationType}
            </Descriptions.Item>
            <Descriptions.Item label="Carriage Contract">
              {payload.masterDetails.carriageContract || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Agreement Party">
              {payload.masterDetails.agreementParty || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Preferred Agency">
              {payload.masterDetails.preferredAgency || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Additional Info">
              {payload.masterDetails.additionalInformation || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Title level={5} style={{ margin: 0 }}>
              Parties
            </Title>
          }
          className="form-step-card form-step-section"
        >
          <Descriptions column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="Agreement Party">
              {payload.parties.agreementParty}
            </Descriptions.Item>
            <Descriptions.Item label="SI Submitting Party">
              {payload.parties.siSubmittingParty}
            </Descriptions.Item>
            <Descriptions.Item label="Shipper">
              {payload.parties.shipperName}
            </Descriptions.Item>
            <Descriptions.Item label="Consignee">
              {payload.parties.consigneeName}
            </Descriptions.Item>
            <Descriptions.Item label="Shipper Ref">
              {payload.parties.shipperReference || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Notify Party">
              {payload.parties.notifyPartyName || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          title={
            <Title level={5} style={{ margin: 0 }}>
              Cargo & Equipment
            </Title>
          }
          className="form-step-card form-step-section"
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Commodity">
              {payload.cargo.commodity}
            </Descriptions.Item>
            <Descriptions.Item label="Equipment Description">
              {payload.cargo.containerCount}x {payload.cargo.containerType}
            </Descriptions.Item>
            <Descriptions.Item label="Total Weight">
              {payload.cargo.totalWeightKg} kg
            </Descriptions.Item>
            <Descriptions.Item label="LCL">
              {payload.cargo.isLcl ? (
                <Text strong>Yes ({payload.cargo.packageType})</Text>
              ) : (
                "No"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Hazardous">
              {payload.cargo.isDangerousGoods ? (
                <Text strong style={{ color: token.colorError }}>
                  Yes (UN No: {payload.cargo.unNumber}, Class:{" "}
                  {payload.cargo.dgClass})
                </Text>
              ) : (
                "No"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Reefer">
              {payload.cargo.isReefer ? (
                <Text strong style={{ color: token.colorPrimary }}>
                  Yes (Set Temp: {payload.cargo.setTemp}{" "}
                  {payload.cargo.tempUnit})
                </Text>
              ) : (
                "No"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="OOG">
              {payload.cargo.isOog ? <Text strong>Yes</Text> : "No"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {payload.ens && payload.ens.euCustomsZone && (
          <Card
            title={
              <Title level={5} style={{ margin: 0 }}>
                ENS Details
              </Title>
            }
            className="form-step-card form-step-section"
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="BL Type">
                {payload.ens.blType}
              </Descriptions.Item>
              <Descriptions.Item label="Filing Type">
                {payload.ens.ensFilingType}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {payload.ens.paymentMethod}
              </Descriptions.Item>
              {payload.ens.declarantName && (
                <Descriptions.Item label="Declarant">
                  {payload.ens.declarantName} ({payload.ens.declarantCountry})
                </Descriptions.Item>
              )}
              {payload.ens.buyerName && (
                <Descriptions.Item label="Buyer">
                  {payload.ens.buyerName} ({payload.ens.buyerCountry})
                </Descriptions.Item>
              )}
              {payload.ens.sellerName && (
                <Descriptions.Item label="Seller">
                  {payload.ens.sellerName} ({payload.ens.sellerCountry})
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {payload.insurance && payload.insurance.isInsuranceRequired && (
          <Card
            title={
              <Title level={5} style={{ margin: 0 }}>
                Insurance
              </Title>
            }
            className="form-step-card form-step-section"
          >
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Required">Yes</Descriptions.Item>
              <Descriptions.Item label="Cargo Value">
                {payload.insurance.cargoValue} {payload.insurance.currency}
              </Descriptions.Item>
              <Descriptions.Item label="Terms Accepted">
                {payload.insurance.termsAccepted ? "Yes" : "No"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep} disabled={isSubmitting}>
          Previous
        </AppButton>
        <AppButton type="primary" onClick={onSubmit} loading={isSubmitting}>
          Submit Booking
        </AppButton>
      </div>
    </div>
  );
}
