// Modified by Sekar Nagarajan (2026-08-28 11:36)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  Card,
  Descriptions,
  Input,
  Radio,
  Select,
  Table,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";

import {
  MODULE_TITLES,
  WIZARD_STEP_TITLES,
} from "../../../../constants/module-titles";
import { SI_CARGO_LINE_COLUMNS } from "../../../shipping-instruction/utils/si-cargo-line-columns";
import { useBLWizardConfig } from "../../hooks/use-bl-wizard-config";
import type { BLPreviewStepValues } from "../../types/bl.types";
import { blPreviewStepSchema } from "../../types/bl.types";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Title, Text } = Typography;

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
  isSubmitting,
}: BLWizardStepProps) {
  const toast = useToast();
  const { data: config } = useBLWizardConfig();
  const preview = data.preview ?? {};

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
        config?.enableAesNumber &&
        data.loadPortCountry === "US" &&
        !values.siAesNumber &&
        values.aesDisclaimer !== "not_applicable"
      ) {
        toast.error("Provide AES number or select not applicable for US load port");
        return;
      }
      onUpdate({ preview: { ...preview, ...values } });
      onSubmit();
    },
    () => toast.error("Complete preview fields before submit"),
  );

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Title
          level={4}
          className="form-step-card-title form-step-summary-title"
        >
          {MODULE_TITLES.billOfLadingSummary}
        </Title>

        <Card
          className="form-step-card form-step-section"
          title={
            <Title level={5} className="form-step-card-title">
              {WIZARD_STEP_TITLES.masterDetails}
            </Title>
          }
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="B/L Number">{data.blNo}</Descriptions.Item>
            <Descriptions.Item label="Booking Number">
              {data.bookingNo}
            </Descriptions.Item>
            <Descriptions.Item label="B/L Type">{data.blType}</Descriptions.Item>
            <Descriptions.Item label="Release Type">
              {data.releaseType}
            </Descriptions.Item>
            <Descriptions.Item label="Freight Option">
              {data.freightOption}
            </Descriptions.Item>
            <Descriptions.Item label="SI Number">
              {data.siNo || "N/A"}
            </Descriptions.Item>
            {data.routing ? (
              <Descriptions.Item label="Vessel / Voyage">
                {data.routing.vesselVoyage || "N/A"}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
        </Card>

        <Card
          className="form-step-card form-step-section"
          title={
            <Title level={5} className="form-step-card-title">
              Parties
            </Title>
          }
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Shipper">
              <div className="bl-party-block">
                <Text strong>{data.parties.shipper.name}</Text>
                <Text>{data.parties.shipper.address}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Consignee">
              <div className="bl-party-block">
                <Text strong>{data.parties.consignee.name}</Text>
                <Text>{data.parties.consignee.address}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Notify Party">
              <div className="bl-party-block">
                <Text strong>{data.parties.notify.name}</Text>
                <Text>{data.parties.notify.address}</Text>
              </div>
            </Descriptions.Item>
            {data.parties.forwarder ? (
              <Descriptions.Item label="Forwarder">
                {data.parties.forwarder.name}
              </Descriptions.Item>
            ) : null}
            {data.parties.warehouse ? (
              <Descriptions.Item label="Warehouse">
                {data.parties.warehouse.name}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
        </Card>

        <Card
          className="form-step-card form-step-section bl-preview-fields-card"
          title="Preview Fields"
        >
          <div
            className={getPreviewFieldsGridClass(
              config?.enableAesNumber,
              config?.enableUaeBlType,
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
            {config?.enableAesNumber ? (
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
            {config?.enableUaeBlType ? (
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
        </Card>

        <Card
          className="form-step-card form-step-section"
          title={
            <Title level={5} className="form-step-card-title">
              Cargo & Containers
            </Title>
          }
        >
          {data.containers.map((c, i) => (
            <div key={c.id} className="bl-container-block">
              <div className="bl-container-block__header">
                <Text strong>
                  Container {i + 1}: {c.containerNo} ({c.eqpSize})
                </Text>
              </div>
              <div className="responsive-table-wrap custom-scroll">
                <Table
                  size="small"
                  dataSource={c.cargoLines}
                  rowKey="id"
                  pagination={false}
                  bordered
                  columns={SI_CARGO_LINE_COLUMNS}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" onClick={handleSubmitBl} loading={isSubmitting}>
          Submit B/L
        </AppButton>
      </div>
    </div>
  );
}
