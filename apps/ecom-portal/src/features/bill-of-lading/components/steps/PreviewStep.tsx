// Modified by Sekar Nagarajan (2026-08-31 16:36)
/**
 * Preview — summary of all wizard step inputs with Edit → jump to step,
 * plus BL-specific editable preview fields (AES / UAE / remarks).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  Col,
  Descriptions,
  Input,
  Radio,
  Row,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
} from "../../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { SI_CARGO_LINE_COLUMNS } from "../../../shipping-instruction/utils/si-cargo-line-columns";
import {
  DEFAULT_BL_WIZARD_CONFIG,
  type BLWizardStepId,
} from "../../config/bl-wizard-config";
import { useBLWizardConfig } from "../../hooks/use-bl-wizard-config";
import type { BLPreviewStepValues } from "../../types/bl.types";
import { blPreviewStepSchema } from "../../types/bl.types";
import {
  BlPreviewEmpty,
  BlPreviewPartyBlock,
  BlPreviewSection,
} from "../preview/bl-preview-section";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Title, Text } = Typography;

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function getPreviewFieldsGridClass(
  enableAesNumber?: boolean,
  enableUaeBlType?: boolean,
): string {
  let count = 2;
  if (enableAesNumber) count += 2;
  if (enableUaeBlType) count += 2;
  return `bl-master-detail-grid bl-preview-fields-grid bl-preview-fields-grid--${count}`;
}

export function PreviewStep({
  data,
  onPrevious,
  onSubmit,
  onUpdate,
  onCancel,
  onGoToStep,
  isSubmitting,
}: BLWizardStepProps) {
  const toast = useToast();
  const { data: config = DEFAULT_BL_WIZARD_CONFIG } = useBLWizardConfig();
  const preview = data.preview ?? {};
  const go = (stepId: BLWizardStepId) => {
    onGoToStep?.(stepId);
  };

  const releaseLabel =
    data.releaseType === "O"
      ? "Original"
      : data.releaseType === "T"
        ? "Telex Release"
        : dash(data.releaseType);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BLPreviewStepValues>({
    resolver: zodResolver(blPreviewStepSchema),
    defaultValues: {
      declaredValue: preview.declaredValue,
      siCustRemarks: preview.siCustRemarks,
      siAesNumber: preview.siAesNumber,
      aesDisclaimer: preview.aesDisclaimer,
      packingList: preview.packingList,
      invoiceUpload: preview.invoiceUpload,
      blTypeUae: preview.blTypeUae,
      mpciIdUae: preview.mpciIdUae,
      acidValue: preview.acidValue,
    },
  });

  const handleSubmitBl = handleSubmit(
    (values) => {
      if (
        config.enableAesNumber &&
        data.loadPortCountry === "US" &&
        !values.siAesNumber &&
        values.aesDisclaimer !== "not_applicable"
      ) {
        toast.error(
          "Provide AES number or select not applicable for US load port",
        );
        return;
      }
      onUpdate({ preview: { ...preview, ...values } });
      onSubmit();
    },
    () => toast.error("Complete preview fields before submit"),
  );

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll bl-preview-scroll">
        <div className="bl-preview-header">
          <Title level={4} className="form-step-card-title bl-preview-title">
            {MODULE_TITLES.billOfLadingSummary}
          </Title>
          <Text type="secondary" className="bl-preview-subtitle">
            Review each section. Use Edit to jump back and update that step.
          </Text>
        </div>

        <BlPreviewSection
          title={WIZARD_STEP_TITLES.masterDetails}
          onEdit={() => go("master")}
        >
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, md: 3 }}
            className="bl-preview-descriptions"
          >
            <Descriptions.Item label="B/L Number">
              {dash(data.blNo)}
            </Descriptions.Item>
            <Descriptions.Item label="Booking Number">
              {dash(data.bookingNo)}
            </Descriptions.Item>
            <Descriptions.Item label="SI Number">
              {dash(data.siNo) === "—" ? "N/A" : dash(data.siNo)}
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
        </BlPreviewSection>

        <BlPreviewSection
          title={WIZARD_STEP_TITLES.parties}
          onEdit={() => go("parties")}
        >
          <Row gutter={[24, 24]}>
            <Col {...RESPONSIVE_COL.third}>
              <BlPreviewPartyBlock
                role="Shipper"
                name={data.parties.shipper.name}
                address={data.parties.shipper.address}
                city={data.parties.shipper.city}
                country={data.parties.shipper.country}
              />
            </Col>
            <Col {...RESPONSIVE_COL.third}>
              <BlPreviewPartyBlock
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
              <BlPreviewPartyBlock
                role="Notify Party"
                name={data.parties.notify.name}
                address={data.parties.notify.address}
                city={data.parties.notify.city}
                country={data.parties.notify.country}
              />
            </Col>
            {data.parties.forwarder ? (
              <Col {...RESPONSIVE_COL.third}>
                <BlPreviewPartyBlock
                  role="Forwarder"
                  name={data.parties.forwarder.name}
                  address={data.parties.forwarder.address}
                  city={data.parties.forwarder.city}
                  country={data.parties.forwarder.country}
                />
              </Col>
            ) : null}
            {data.parties.warehouse ? (
              <Col {...RESPONSIVE_COL.third}>
                <BlPreviewPartyBlock
                  role="Warehouse"
                  name={data.parties.warehouse.name}
                  address={data.parties.warehouse.address}
                  city={data.parties.warehouse.city}
                  country={data.parties.warehouse.country}
                />
              </Col>
            ) : null}
          </Row>
        </BlPreviewSection>

        {config.showRouting ? (
          <BlPreviewSection
            title={WIZARD_STEP_TITLES.routing}
            onEdit={() => go("routing")}
          >
            {data.routing ? (
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="bl-preview-descriptions"
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
              <BlPreviewEmpty label="No routing details" />
            )}
          </BlPreviewSection>
        ) : null}

        <BlPreviewSection
          title={WIZARD_STEP_TITLES.cargoDetails}
          onEdit={() => go("cargo")}
        >
          {data.containers.length === 0 ? (
            <BlPreviewEmpty label="No containers" />
          ) : (
            data.containers.map((container, index) => (
              <div key={container.id} className="bl-container-block">
                <div className="bl-container-block__header">
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
        </BlPreviewSection>

        {config.showInsurance ? (
          <BlPreviewSection
            title={WIZARD_STEP_TITLES.insurance}
            onEdit={() => go("insurance")}
          >
            {data.insurance ? (
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="bl-preview-descriptions"
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
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        {config.showCargoProtect ? (
          <BlPreviewSection
            title={WIZARD_STEP_TITLES.cargoProtect}
            onEdit={() => go("cargoProtect")}
          >
            {data.cargoProtect && data.cargoProtect.length > 0 ? (
              <ul className="bl-preview-list">
                {data.cargoProtect.map((line) => (
                  <li key={line.id}>
                    {line.productCode} — {line.description} ({line.amount}{" "}
                    {line.currency})
                  </li>
                ))}
              </ul>
            ) : (
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        {config.showChargesInWizard ? (
          <BlPreviewSection
            title={WIZARD_STEP_TITLES.charges}
            onEdit={() => go("charges")}
          >
            {data.charges && data.charges.length > 0 ? (
              <ul className="bl-preview-list">
                {data.charges.map((line) => (
                  <li key={line.id}>
                    {line.chargeCode || line.description || "Charge"} —{" "}
                    {dash(line.amount)} {dash(line.currency)}
                  </li>
                ))}
              </ul>
            ) : (
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        {config.showEns ? (
          <BlPreviewSection
            title={WIZARD_STEP_TITLES.ensDetails}
            onEdit={() => go("ens")}
          >
            {data.ens?.euCustomsZone ? (
              <Descriptions
                size="small"
                column={{ xs: 1, sm: 2, md: 3 }}
                className="bl-preview-descriptions"
              >
                <Descriptions.Item label="EU Customs Zone">
                  Yes
                </Descriptions.Item>
                <Descriptions.Item label="Type of B/L">
                  {dash(data.ens.blType)}
                </Descriptions.Item>
                <Descriptions.Item label="ENS Filing">
                  {dash(data.ens.ensFilingType)}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {dash(data.ens.paymentMethod)}
                </Descriptions.Item>
                {data.ens.ensFilingType === "Single Filing" ? (
                  <>
                    <Descriptions.Item label="Buyer">
                      {dash(data.ens.buyerName)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Seller">
                      {dash(data.ens.sellerName)}
                    </Descriptions.Item>
                  </>
                ) : (
                  <Descriptions.Item label="Declarant">
                    {dash(data.ens.declarantName)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Tag>ENS not required</Tag>
            )}
          </BlPreviewSection>
        ) : null}

        {config.showChargeTab ? (
          <BlPreviewSection
            title={WIZARD_STEP_TITLES.chargeSummary}
            onEdit={() => go("chargeTab")}
          >
            {data.charges && data.charges.length > 0 ? (
              <Text>
                {data.charges.length} charge line
                {data.charges.length === 1 ? "" : "s"} on file
              </Text>
            ) : (
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        <BlPreviewSection
          title={WIZARD_STEP_TITLES.fileUpload}
          onEdit={() => go("files")}
        >
          {data.files && data.files.length > 0 ? (
            <ul className="bl-preview-list">
              {data.files.map((file) => (
                <li key={file.id}>
                  {file.fileName} ({file.category}) — {file.uploadedAt}
                </li>
              ))}
            </ul>
          ) : (
            <BlPreviewEmpty label="No files uploaded" />
          )}
        </BlPreviewSection>

        <BlPreviewSection
          title={WIZARD_STEP_TITLES.references}
          onEdit={() => go("references")}
        >
          {data.referenceFields && data.referenceFields.length > 0 ? (
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2, md: 3 }}
              className="bl-preview-descriptions"
            >
              {data.referenceFields.map((field) => (
                <Descriptions.Item key={field.id} label={field.name}>
                  {dash(field.value)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          ) : (
            <BlPreviewEmpty label="No reference fields" />
          )}
        </BlPreviewSection>

        <BlPreviewSection title="Preview Fields">
          <div
            className={getPreviewFieldsGridClass(
              config.enableAesNumber,
              config.enableUaeBlType,
            )}
          >
            <div className="form-field-cell bl-master-readonly-field">
              <label className="form-field-label">Declared Value</label>
              <Controller
                control={control}
                name="declaredValue"
                render={({ field }) => <Input {...field} size="large" />}
              />
            </div>
            <div className="form-field-cell bl-master-readonly-field">
              <label className="form-field-label">Customer Remarks</label>
              <Controller
                control={control}
                name="siCustRemarks"
                render={({ field }) => <Input {...field} size="large" />}
              />
            </div>
            {config.enableAesNumber ? (
              <>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">AES Number</label>
                  <Controller
                    control={control}
                    name="siAesNumber"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </div>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">AES Disclaimer</label>
                  <Controller
                    control={control}
                    name="aesDisclaimer"
                    render={({ field }) => (
                      <Radio.Group {...field} className="bl-preview-radio-group">
                        <Radio value="provided">Provided</Radio>
                        <Radio value="not_applicable">Not Applicable</Radio>
                      </Radio.Group>
                    )}
                  />
                </div>
              </>
            ) : null}
            {config.enableUaeBlType ? (
              <>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">B/L Type (UAE)</label>
                  <Controller
                    control={control}
                    name="blTypeUae"
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        size="large"
                        className="form-field-full-width"
                        options={[
                          { label: "Master BL", value: "Master BL" },
                          { label: "Direct BL", value: "Direct BL" },
                        ]}
                      />
                    )}
                  />
                </div>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">MPCI ID (UAE)</label>
                  <Controller
                    control={control}
                    name="mpciIdUae"
                    render={({ field }) => (
                      <Input {...field} size="large" maxLength={10} />
                    )}
                  />
                  {errors.mpciIdUae ? (
                    <Text type="danger" className="form-field-error">
                      {errors.mpciIdUae.message}
                    </Text>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </BlPreviewSection>
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
          onClick={handleSubmitBl}
          loading={isSubmitting}
        >
          Submit B/L
        </AppButton>
      </div>
    </div>
  );
}
