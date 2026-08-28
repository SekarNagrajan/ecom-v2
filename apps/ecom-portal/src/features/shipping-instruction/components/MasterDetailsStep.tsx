// Modified by Sekar Nagarajan (2026-08-28 12:48)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import {
  Card,
  Checkbox,
  Col,
  Input,
  Row,
  Segmented,
  Select,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { useSiWizardConfigQuery } from "../hooks/use-si-wizard-config";
import type { SiMasterDetailsForm, SIWizardStepProps } from "../types/si.types";
import { siMasterDetailsSchema } from "../types/si.types";

const { Text, Title } = Typography;

export function MasterDetailsStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { data: config } = useSiWizardConfigQuery();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SiMasterDetailsForm>({
    resolver: zodResolver(siMasterDetailsSchema),
    defaultValues: {
      blType: data.blType,
      releaseType: data.releaseType,
      freightOption: data.freightOption,
      nvocc: data.nvocc ?? false,
      t2lFiling: data.t2lFiling ?? false,
      ensFilingHint: data.ensFilingHint ?? "N",
      agencyRefNo: data.agencyRefNo ?? "",
    },
  });

  const showCompliance =
    !!config?.enableNvocc ||
    !!config?.enableT2LFiling ||
    !!config?.enableTensDocumentation;

  const onValid = (values: SiMasterDetailsForm) => {
    onUpdate(values);
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll si-master-step-stack">
        {/* Row 1 — Document References (full width, fields in one row) */}
        <Row gutter={[24, 24]} className="si-master-step-row">
          <Col {...RESPONSIVE_COL.full}>
            <Card
              className="form-step-card form-step-section si-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  Document References
                </Title>
              }
            >
              <div className="si-master-refs-grid">
                <div className="form-field-cell">
                  <label className="form-field-label">Booking Number</label>
                  <div className="form-step-readonly-value">{data.bookingNo}</div>
                </div>
                <div className="form-field-cell">
                  <label className="form-field-label">SI Number</label>
                  <div className="form-step-readonly-value">
                    {data.siNo || "Draft"}
                  </div>
                </div>
                <div className="form-field-cell">
                  <label className="form-field-label">Agency Ref</label>
                  <Controller
                    control={control}
                    name="agencyRefNo"
                    render={({ field }) => (
                      <Input {...field} size="large" maxLength={35} />
                    )}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Row 2 — Options + Compliance side by side */}
        <Row gutter={[24, 24]} className="si-master-step-row">
          <Col {...(showCompliance ? RESPONSIVE_COL.formHalf : RESPONSIVE_COL.full)}>
            <Card
              className="form-step-card form-step-section si-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  Bill of Lading Options
                </Title>
              }
            >
              <div className="si-master-options-grid">
                <div className="form-field-cell">
                  <label className="form-field-label">
                    B/L Type <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="blType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        className="form-field-full-width si-master-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: "Original", value: "Original" },
                          { label: "Seaway", value: "Seaway" },
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

                <div className="form-field-cell">
                  <label className="form-field-label">
                    Release Type <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="releaseType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        className="form-field-full-width si-master-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: "Original", value: "O" },
                          { label: "Telex", value: "T" },
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

                <div className="form-field-cell">
                  <label className="form-field-label">
                    Freight Option <Text type="danger">*</Text>
                  </label>
                  <Controller
                    control={control}
                    name="freightOption"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        className="form-field-full-width si-master-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: "PREPAID", value: "PREPAID" },
                          { label: "COLLECT", value: "COLLECT" },
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
                className="form-step-card form-step-section si-master-step-card"
                title={
                  <Title level={5} className="form-step-card-title">
                    Compliance Flags
                  </Title>
                }
              >
                <div className="si-master-compliance-grid">
                  {config?.enableNvocc ? (
                    <div className="form-field-cell si-master-compliance-check">
                      <Controller
                        control={control}
                        name="nvocc"
                        render={({ field: { value, onChange, ...field } }) => (
                          <Checkbox
                            {...field}
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                          >
                            NVOCC House B/L
                          </Checkbox>
                        )}
                      />
                    </div>
                  ) : null}
                  {config?.enableT2LFiling ? (
                    <div className="form-field-cell si-master-compliance-check">
                      <Controller
                        control={control}
                        name="t2lFiling"
                        render={({ field: { value, onChange, ...field } }) => (
                          <Checkbox
                            {...field}
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                          >
                            T2L Filing
                          </Checkbox>
                        )}
                      />
                    </div>
                  ) : null}
                  {config?.enableTensDocumentation ? (
                    <div className="form-field-cell">
                      <label className="form-field-label">ENS Filing Hint</label>
                      <Controller
                        control={control}
                        name="ensFilingHint"
                        render={({ field }) => (
                          <Select
                            {...field}
                            size="large"
                            className="form-field-full-width"
                            options={[
                              { label: "Not required", value: "N" },
                              { label: "Shipper", value: "S" },
                              { label: "Carrier", value: "P" },
                            ]}
                          />
                        )}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>
            </Col>
          ) : null}
        </Row>
      </div>

      <div className="form-step-footer">
        <AppButton
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
        >
          Previous
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
