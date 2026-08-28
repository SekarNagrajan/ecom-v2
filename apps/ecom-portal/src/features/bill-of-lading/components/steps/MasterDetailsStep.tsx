// Modified by Sekar Nagarajan (2026-08-28 11:43)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Row, Segmented, Select, Tag, Typography } from "antd";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { useBLWizardConfig } from "../../hooks/use-bl-wizard-config";
import type { BLDTO, BLMasterStepValues } from "../../types/bl.types";
import { BL_STATUS_LABELS, blMasterStepSchema } from "../../types/bl.types";
import { getBLStatusColor } from "../../utils/bl-status";

const { Text, Title } = Typography;

const YES_NO_OPTIONS = [
  { label: "No", value: "no" },
  { label: "Yes", value: "yes" },
] as const;

export interface BLWizardStepProps {
  data: BLDTO;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onUpdate: (partial: Partial<BLDTO>) => void;
  onCancel: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
}

function FieldHint({ children }: { children: string }) {
  return (
    <Text type="secondary" className="form-step-hint">
      {children}
    </Text>
  );
}

function BooleanToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Segmented
      block
      className="form-field-full-width bl-master-segmented"
      value={value ? "yes" : "no"}
      onChange={(next) => onChange(next === "yes")}
      options={[...YES_NO_OPTIONS]}
    />
  );
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
          {value}
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
    watch,
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

  const ensFiling = watch("ensFiling");
  const showCompliance =
    config?.enableT2LFiling || config?.enableNvocc || config?.showEns;
  const complianceFieldCount =
    (config?.enableT2LFiling ? 1 : 0) +
    (config?.enableNvocc ? 1 : 0) +
    (config?.showEns ? 1 : 0) +
    (config?.showEns && ensFiling !== "N" ? 1 : 0);

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
        <Row gutter={[24, 24]} className="bl-master-step-row">
          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="form-step-card form-step-section bl-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  Shipment Route
                </Title>
              }
            >
              <div className="bl-master-detail-grid bl-master-detail-grid--4">
                <ReadonlyField label="Origin" value={data.origin} />
                <ReadonlyField label="Load Port" value={data.loadPort} />
                <ReadonlyField
                  label="Discharge Port"
                  value={data.dischargePort}
                />
                <ReadonlyField label="Delivery" value={data.delivery} />
              </div>
            </Card>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="form-step-card form-step-section bl-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  Document References
                </Title>
              }
            >
              <div className="bl-master-detail-grid bl-master-detail-grid--5">
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
        </Row>

        <Row gutter={[24, 24]} className="bl-master-step-row">
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
                    B/L Type <Text type="danger">*</Text>
                  </label>

                  <Controller
                    control={control}
                    name="blType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
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
                    Release Type <Text type="danger">*</Text>
                  </label>

                  <Controller
                    control={control}
                    name="releaseType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
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
                    Freight Terms <Text type="danger">*</Text>
                  </label>

                  <Controller
                    control={control}
                    name="freightOption"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
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

          {showCompliance ? (
            <Col {...RESPONSIVE_COL.formHalf}>
              <Card
                className="form-step-card form-step-section bl-master-step-card"
                title={
                  <Title level={5} className="form-step-card-title">
                    Compliance & Filing
                  </Title>
                }
              >
                <div
                  className={`bl-master-detail-grid bl-master-compliance-grid bl-master-compliance-grid--${Math.max(
                    complianceFieldCount,
                    1,
                  )}`}
                >
                  {config?.enableT2LFiling ? (
                    <div className="form-field-cell bl-master-readonly-field">
                      <label className="form-field-label">T2L Filing</label>

                      <Controller
                        control={control}
                        name="t2lFiling"
                        render={({ field: { value, onChange } }) => (
                          <BooleanToggle value={!!value} onChange={onChange} />
                        )}
                      />
                    </div>
                  ) : null}

                  {config?.enableNvocc ? (
                    <div className="form-field-cell bl-master-readonly-field">
                      <label className="form-field-label">
                        NVOCC House B/L
                      </label>

                      <Controller
                        control={control}
                        name="nvocc"
                        render={({ field: { value, onChange } }) => (
                          <BooleanToggle value={!!value} onChange={onChange} />
                        )}
                      />
                    </div>
                  ) : null}

                  {config?.showEns ? (
                    <>
                      <div className="form-field-cell bl-master-readonly-field">
                        <label className="form-field-label">ENS Filed By</label>

                        <Controller
                          control={control}
                          name="ensFiling"
                          render={({ field }) => (
                            <Select
                              {...field}
                              size="large"
                              className="form-field-full-width"
                              options={[
                                { label: "Not required", value: "N" },
                                { label: "Shipper files", value: "S" },
                                { label: "Carrier files", value: "P" },
                              ]}
                            />
                          )}
                        />
                      </div>
                      {ensFiling !== "N" ? (
                        <div className="form-field-cell bl-master-readonly-field">
                          <label className="form-field-label">
                            ENS Document Type
                          </label>

                          <Controller
                            control={control}
                            name="ensDocType"
                            render={({ field }) => (
                              <Select
                                {...field}
                                size="large"
                                className="form-field-full-width"
                                options={[
                                  { label: "Straight B/L", value: "S" },
                                  { label: "Consolidated B/L", value: "C" },
                                ]}
                              />
                            )}
                          />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </Card>
            </Col>
          ) : null}
        </Row>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton
            onClick={onPrevious}
            disabled={isFirstStep || isSubmitting}
          >
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
