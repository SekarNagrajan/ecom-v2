// Modified by Sekar Nagarajan (2026-08-31 16:31)
/**
 * BL Master Details — SI Master Details layout parity
 * (Document References | B/L Options, then Vessel Details schedule card).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Segmented, Tag, Typography } from "antd";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import type { BLWizardStepId } from "../../config/bl-wizard-config";
import { useBLWizardConfig } from "../../hooks/use-bl-wizard-config";
import type { BLDTO, BLMasterStepValues } from "../../types/bl.types";
import { BL_STATUS_LABELS, blMasterStepSchema } from "../../types/bl.types";
import { getBLStatusColor } from "../../utils/bl-status";

const { Text, Title } = Typography;

export interface BLWizardStepProps {
  data: BLDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onUpdate: (partial: Partial<BLDTO>) => void;
  onCancel: () => void;
  /** Jump to a wizard step by id (Preview section Edit). */
  onGoToStep?: (stepId: BLWizardStepId) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}

function ReadonlyField({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}) {
  return (
    <div className="form-field-cell bl-master-readonly-field">
      <label className="form-field-label">{label}</label>
      {typeof value === "string" ? (
        <Text
          ellipsis={{ tooltip: value }}
          className={
            emphasis
              ? "form-step-readonly-value form-step-readonly-value--emphasis bl-master-readonly-value"
              : "form-step-readonly-value bl-master-readonly-value"
          }
        >
          {value || "—"}
        </Text>
      ) : (
        <div className="form-step-readonly-value bl-master-readonly-value">
          {value}
        </div>
      )}
    </div>
  );
}

export function MasterDetailsStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const { data: config } = useBLWizardConfig();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BLMasterStepValues>({
    resolver: zodResolver(blMasterStepSchema),
    defaultValues: {
      blType: data.blType,
      releaseType: data.releaseType,
      freightOption: data.freightOption,
      t2lFiling: data.t2lFiling ?? false,
      nvocc: data.nvocc ?? false,
      ensFiling: data.ensFiling ?? "N",
      ensDocType: data.ensDocType ?? "S",
    },
  });

  const routing = data.routing;
  const primaryLeg = routing?.scheduleLegs?.[0];
  const vesselVoyage = routing?.vesselVoyage || "—";
  const origin =
    data.origin || routing?.originPrint || primaryLeg?.polPortName || "—";
  const loadPort = data.loadPort || routing?.polPrint || "—";
  const dischargePort = data.dischargePort || routing?.podPrint || "—";
  const delivery =
    data.delivery || routing?.deliveryPrint || primaryLeg?.podPortName || "—";

  const onValid = (values: BLMasterStepValues) => {
    onUpdate(values);
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll bl-master-step-stack">
        <Row
          gutter={[24, 24]}
          className="bl-master-step-row bl-master-sections-row"
        >
          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="form-step-card form-step-section bl-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  Document References
                </Title>
              }
            >
              <div className="bl-master-detail-grid bl-master-detail-grid--refs">
                <ReadonlyField label="B/L Number" value={data.blNo} emphasis />
                <ReadonlyField label="Booking Number" value={data.bookingNo} />
                <ReadonlyField
                  label="SI Number"
                  value={data.siNo?.trim() || "—"}
                />
                <ReadonlyField
                  label="Agency Ref"
                  value={data.agencyRefNo?.trim() || "—"}
                />
                <ReadonlyField
                  label="Status"
                  value={
                    <Tag
                      className="bl-status-tag"
                      color={getBLStatusColor(data.status)}
                    >
                      {BL_STATUS_LABELS[data.status]}
                    </Tag>
                  }
                />
              </div>
            </Card>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="form-step-card form-step-section bl-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  Bill of Lading Options
                </Title>
              }
            >
              <div className="bl-master-detail-grid bl-master-options-grid">
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">
                    B/L Type <Text type="danger"> *</Text>
                  </label>
                  <Controller
                    control={control}
                    name="blType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        size="small"
                        className="form-field-full-width bl-master-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: "Original B/L", value: "Original" },
                          { label: "Sea Waybill", value: "Seaway" },
                        ]}
                      />
                    )}
                  />
                  {errors.blType ? (
                    <Text type="danger" className="form-field-error">
                      {errors.blType.message}
                    </Text>
                  ) : null}
                </div>

                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">
                    Release Type <Text type="danger"> *</Text>
                  </label>
                  <Controller
                    control={control}
                    name="releaseType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        size="small"
                        className="form-field-full-width bl-master-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: "Original", value: "O" },
                          { label: "Telex Release", value: "T" },
                        ]}
                      />
                    )}
                  />
                  {errors.releaseType ? (
                    <Text type="danger" className="form-field-error">
                      {errors.releaseType.message}
                    </Text>
                  ) : null}
                </div>

                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">
                    Freight Terms <Text type="danger"> *</Text>
                  </label>
                  <Controller
                    control={control}
                    name="freightOption"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        size="small"
                        className="form-field-full-width bl-master-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: "Prepaid", value: "PREPAID" },
                          { label: "Collect", value: "COLLECT" },
                        ]}
                      />
                    )}
                  />
                  {errors.freightOption ? (
                    <Text type="danger" className="form-field-error">
                      {errors.freightOption.message}
                    </Text>
                  ) : null}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Modified by Sekar Nagarajan (2026-09-01 00:06) — read-only Vessels fields (replaces schedule card) */}
        <Row gutter={[24, 24]} className="bl-master-step-row">
          <Col {...RESPONSIVE_COL.full}>
            <Card
              className="form-step-card form-step-section bl-master-step-card"
              title={
                <div className="bl-master-card-title-row">
                  <Title level={5} className="form-step-card-title">
                    Vessels
                  </Title>
                </div>
              }
            >
              <div className="bl-master-detail-grid bl-master-detail-grid--5">
                <ReadonlyField
                  label="Vessel / Voyage Number"
                  value={vesselVoyage}
                  emphasis
                />
                <ReadonlyField label="Place of Receipt" value={origin} />
                <ReadonlyField label="Port of Loading" value={loadPort} />
                <ReadonlyField
                  label="Port of Discharge"
                  value={dischargePort}
                />
                <ReadonlyField label="Place of Delivery" value={delivery} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isFirstStep || isSubmitting}>
          Previous
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
