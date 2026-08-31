// Modified by Sekar Nagarajan (2026-08-31 16:27)
/**
 * Preview — summary of all wizard step inputs with Edit → jump to step.
 */
import { AppButton } from "@solverminds/shared-ui";
import { Col, Descriptions, Row, Table, Tag, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
} from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { DEFAULT_SI_WIZARD_CONFIG } from "../config/si-wizard-config";
import type { SIWizardStepId } from "../config/si-wizard-config";
import { useSiWizardConfigQuery } from "../hooks/use-si-wizard-config";
import type { SIWizardStepProps } from "../types/si.types";
import { SI_CARGO_LINE_COLUMNS } from "../utils/si-cargo-line-columns";
import {
  SiPreviewEmpty,
  SiPreviewPartyBlock,
  SiPreviewSection,
} from "./preview/si-preview-section";

const { Title, Text } = Typography;

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

export function PreviewStep({
  data,
  onPrevious,
  onSubmit,
  onCancel,
  onGoToStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { data: config = DEFAULT_SI_WIZARD_CONFIG } = useSiWizardConfigQuery();
  const go = (stepId: SIWizardStepId) => {
    onGoToStep?.(stepId);
  };

  const releaseLabel =
    data.releaseType === "O"
      ? "Original"
      : data.releaseType === "T"
        ? "Telex Release"
        : dash(data.releaseType);

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll si-preview-scroll">
        <div className="si-preview-header">
          <Title level={4} className="form-step-card-title si-preview-title">
            {MODULE_TITLES.shippingInstructionSummary}
          </Title>
          <Text type="secondary" className="si-preview-subtitle">
            Review each section. Use Edit to jump back and update that step.
          </Text>
        </div>

        <SiPreviewSection
          title={WIZARD_STEP_TITLES.masterDetails}
          onEdit={() => go("master")}
        >
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, md: 3 }}
            className="si-preview-descriptions"
          >
            <Descriptions.Item label="Booking Number">
              {dash(data.bookingNo)}
            </Descriptions.Item>
            <Descriptions.Item label="SI Number">
              {dash(data.siNo) === "—" ? "Draft" : dash(data.siNo)}
            </Descriptions.Item>
            <Descriptions.Item label="Agency Ref">
              {dash(data.agencyRefNo)}
            </Descriptions.Item>
            <Descriptions.Item label="B/L Type">
              {dash(data.blType)}
            </Descriptions.Item>
            <Descriptions.Item label="Release Type">
              {releaseLabel}
            </Descriptions.Item>
            <Descriptions.Item label="Freight Option">
              {dash(data.freightOption)}
            </Descriptions.Item>
            {config.enableNvocc ? (
              <Descriptions.Item label="NVOCC">
                {data.nvocc ? "Yes" : "No"}
              </Descriptions.Item>
            ) : null}
            {config.enableT2LFiling ? (
              <Descriptions.Item label="T2L Filing">
                {data.t2lFiling ? "Yes" : "No"}
              </Descriptions.Item>
            ) : null}
            {data.origin || data.loadPort || data.dischargePort || data.delivery ? (
              <>
                <Descriptions.Item label="Origin">
                  {dash(data.origin)}
                </Descriptions.Item>
                <Descriptions.Item label="Load Port">
                  {dash(data.loadPort)}
                </Descriptions.Item>
                <Descriptions.Item label="Discharge Port">
                  {dash(data.dischargePort)}
                </Descriptions.Item>
                <Descriptions.Item label="Delivery">
                  {dash(data.delivery)}
                </Descriptions.Item>
              </>
            ) : null}
          </Descriptions>
        </SiPreviewSection>

        <SiPreviewSection
          title={WIZARD_STEP_TITLES.parties}
          onEdit={() => go("parties")}
        >
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.third}>
              <SiPreviewPartyBlock
                role="Shipper"
                name={data.parties.shipper.name}
                address={data.parties.shipper.address}
                city={data.parties.shipper.city}
                country={data.parties.shipper.country}
              />
            </Col>
            <Col {...RESPONSIVE_COL.third}>
              <SiPreviewPartyBlock
                role="Consignee"
                name={data.parties.consignee.name}
                address={data.parties.consignee.address}
                city={data.parties.consignee.city}
                country={data.parties.consignee.country}
                extra={
                  data.parties.consignee.toOrder ? (
                    <Text type="warning"> (To Order)</Text>
                  ) : null
                }
              />
            </Col>
            <Col {...RESPONSIVE_COL.third}>
              <SiPreviewPartyBlock
                role="Notify Party"
                name={data.parties.notify.name}
                address={data.parties.notify.address}
                city={data.parties.notify.city}
                country={data.parties.notify.country}
              />
            </Col>
          </Row>
        </SiPreviewSection>

        {config.showRouting ? (
          <SiPreviewSection
            title={WIZARD_STEP_TITLES.routing}
            onEdit={() => go("routing")}
          >
            {data.routing ? (
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="si-preview-descriptions"
              >
                <Descriptions.Item label="Vessel / Voyage">
                  {dash(data.routing.vesselVoyage)}
                </Descriptions.Item>
                <Descriptions.Item label="Origin">
                  {dash(data.routing.originPrint)}
                </Descriptions.Item>
                <Descriptions.Item label="POL">
                  {dash(data.routing.polPrint)}
                </Descriptions.Item>
                <Descriptions.Item label="POD">
                  {dash(data.routing.podPrint)}
                </Descriptions.Item>
                <Descriptions.Item label="Delivery">
                  {dash(data.routing.deliveryPrint)}
                </Descriptions.Item>
                <Descriptions.Item label="Schedule Legs">
                  {data.routing.scheduleLegs?.length ?? 0}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <SiPreviewEmpty label="No routing details" />
            )}
          </SiPreviewSection>
        ) : null}

        <SiPreviewSection
          title={WIZARD_STEP_TITLES.cargoDetails}
          onEdit={() => go("cargo")}
        >
          {data.containers.length === 0 ? (
            <SiPreviewEmpty label="No containers" />
          ) : (
            data.containers.map((container, index) => (
              <div key={container.id} className="si-container-block">
                <div className="si-container-block__header">
                  <Text strong>
                    Container {index + 1}: {container.containerNo || "—"} (
                    {container.eqpSize || "—"})
                  </Text>
                  <div>
                    <Text type="secondary">
                      Carrier Seal:{" "}
                      <Text strong>{container.carrierSeal || "N/A"}</Text>
                    </Text>
                    {" · "}
                    <Text type="secondary">
                      Shipper Seal:{" "}
                      <Text strong>{container.shipperSeal || "N/A"}</Text>
                    </Text>
                  </div>
                </div>
                <div className="responsive-table-wrap custom-scroll">
                  <Table
                    size="small"
                    dataSource={container.cargoLines}
                    rowKey="id"
                    pagination={false}
                    bordered
                    columns={SI_CARGO_LINE_COLUMNS}
                  />
                </div>
              </div>
            ))
          )}
        </SiPreviewSection>

        {config.showInsurance ? (
          <SiPreviewSection
            title={WIZARD_STEP_TITLES.insurance}
            onEdit={() => go("insurance")}
          >
            {data.insurance ? (
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="si-preview-descriptions"
              >
                <Descriptions.Item label="Required">
                  {data.insurance.isInsuranceRequired ? "Yes" : "No"}
                </Descriptions.Item>
                <Descriptions.Item label="Opt Out">
                  {data.insurance.optOut ? "Yes" : "No"}
                </Descriptions.Item>
                <Descriptions.Item label="Currency">
                  {dash(data.insurance.currency)}
                </Descriptions.Item>
                <Descriptions.Item label="Cargo Value">
                  {dash(data.insurance.cargoValue)}
                </Descriptions.Item>
                <Descriptions.Item label="Policy No">
                  {dash(data.insurance.policyNo)}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showCargoProtect ? (
          <SiPreviewSection
            title={WIZARD_STEP_TITLES.cargoProtect}
            onEdit={() => go("cargoProtect")}
          >
            {data.cargoProtect && data.cargoProtect.length > 0 ? (
              <ul className="si-preview-list">
                {data.cargoProtect.map((line) => (
                  <li key={line.id}>
                    {line.productCode} — {line.description} ({line.amount}{" "}
                    {line.currency})
                  </li>
                ))}
              </ul>
            ) : (
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showChargesInWizard ? (
          <SiPreviewSection
            title={WIZARD_STEP_TITLES.charges}
            onEdit={() => go("charges")}
          >
            {data.charges && data.charges.length > 0 ? (
              <ul className="si-preview-list">
                {data.charges.map((line) => (
                  <li key={line.id}>
                    {line.chargeCode || line.description || "Charge"} —{" "}
                    {dash(line.amount)} {dash(line.currency)}
                  </li>
                ))}
              </ul>
            ) : (
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showEns ? (
          <SiPreviewSection
            title={WIZARD_STEP_TITLES.ensDetails}
            onEdit={() => go("ens")}
          >
            {data.ens?.ensRequired ? (
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="si-preview-descriptions"
              >
                <Descriptions.Item label="ENS Required">Yes</Descriptions.Item>
                <Descriptions.Item label="EU Customs Zone">
                  {data.ens.euCustZone === "Y" ? "Yes" : "No"}
                </Descriptions.Item>
                <Descriptions.Item label="Type of B/L">
                  {dash(data.ens.blTypeEns)}
                </Descriptions.Item>
                <Descriptions.Item label="ENS Filing">
                  {dash(data.ens.ensFillingType)}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {dash(data.ens.paymentMethod)}
                </Descriptions.Item>
                {data.ens.ensFillingType === "Single Filing" ? (
                  <>
                    <Descriptions.Item label="Buyer">
                      {dash(data.ens.buyer?.name)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Seller">
                      {dash(data.ens.seller?.name)}
                    </Descriptions.Item>
                  </>
                ) : (
                  <Descriptions.Item label="Declarant">
                    {dash(data.ens.declarant?.name)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Tag>ENS not required</Tag>
            )}
          </SiPreviewSection>
        ) : null}

        {config.showChargeTab ? (
          <SiPreviewSection
            title={WIZARD_STEP_TITLES.chargeSummary}
            onEdit={() => go("chargeTab")}
          >
            {data.charges && data.charges.length > 0 ? (
              <Text>
                {data.charges.length} charge line
                {data.charges.length === 1 ? "" : "s"} on file
              </Text>
            ) : (
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showFileUpload ? (
          <SiPreviewSection
            title={WIZARD_STEP_TITLES.fileUpload}
            onEdit={() => go("files")}
          >
            {data.files && data.files.length > 0 ? (
              <ul className="si-preview-list">
                {data.files.map((file) => (
                  <li key={file.id}>
                    {file.fileName} ({file.fileType}) — {file.sizeKb} KB
                  </li>
                ))}
              </ul>
            ) : (
              <SiPreviewEmpty label="No files uploaded" />
            )}
          </SiPreviewSection>
        ) : null}

        <SiPreviewSection
          title={WIZARD_STEP_TITLES.references}
          onEdit={() => go("references")}
        >
          {data.referenceFields && data.referenceFields.length > 0 ? (
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2, md: 3 }}
              className="si-preview-descriptions"
            >
              {data.referenceFields.map((field) => (
                <Descriptions.Item key={field.id} label={field.name}>
                  {dash(field.value)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            <SiPreviewEmpty label="No reference fields" />
          )}
        </SiPreviewSection>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
        </div>
        <AppButton
          type="primary"
          icon={<AppIcon icon={Icons.check} size={16} />}
          onClick={onSubmit}
          loading={isSubmitting}
        >
          Submit SI
        </AppButton>
      </div>
    </div>
  );
}
