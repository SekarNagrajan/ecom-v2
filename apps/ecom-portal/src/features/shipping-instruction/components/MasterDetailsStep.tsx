// Modified by Sekar Nagarajan (2026-09-29 16:55)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Col, Input, Row, Segmented, Typography } from "antd";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import type { SiMasterDetailsForm, SIWizardStepProps } from "../types/si.types";
import { createSiMasterDetailsSchema } from "../types/si.types";

const { Text, Title } = Typography;

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
    <div className="form-field-cell si-master-readonly-field">
      <label className="form-field-label">{label}</label>
      {typeof value === "string" ? (
        <Text
          ellipsis={{ tooltip: value }}
          className={
            emphasis
              ? "form-step-readonly-value form-step-readonly-value--emphasis si-master-readonly-value"
              : "form-step-readonly-value si-master-readonly-value"
          }
        >
          {value || "—"}
        </Text>
      ) : (
        <div className="form-step-readonly-value si-master-readonly-value">
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
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const schema = useMemo(() => createSiMasterDetailsSchema(t), [t]);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SiMasterDetailsForm>({
    resolver: zodResolver(schema),
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

  const routing = data.routing;
  const primaryLeg = routing?.scheduleLegs?.[0];
  const vesselVoyage = routing?.vesselVoyage || "—";
  const origin =
    data.origin || routing?.originPrint || primaryLeg?.polPortName || "—";
  const loadPort = data.loadPort || routing?.polPrint || "—";
  const dischargePort = data.dischargePort || routing?.podPrint || "—";
  const delivery =
    data.delivery || routing?.deliveryPrint || primaryLeg?.podPortName || "—";

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
        {/* Modified by Sekar Nagarajan (2026-08-31 15:55) — refs + BL options, then full vessel */}
        <Row
          gutter={[24, 24]}
          className="si-master-step-row si-master-sections-row"
        >
          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="form-step-card form-step-section si-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  {t("wizard.master.documentReferences")}
                </Title>
              }
            >
              <div className="si-master-detail-grid si-master-detail-grid--3">
                <ReadonlyField
                  label={t("labels.bookingNumber")}
                  value={data.bookingNo}
                  emphasis
                />
                <ReadonlyField
                  label={t("labels.siNumber")}
                  value={data.siNo || t("labels.draft")}
                />
                <div className="form-field-cell si-master-readonly-field">
                  <label className="form-field-label">
                    {t("labels.agencyRef")}
                  </label>
                  <Controller
                    control={control}
                    name="agencyRefNo"
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="large"
                        maxLength={35}
                        placeholder={t("wizard.master.agencyRefPlaceholder")}
                        className="form-field-full-width"
                      />
                    )}
                  />
                </div>
              </div>
            </Card>
          </Col>

          <Col {...RESPONSIVE_COL.formHalf}>
            <Card
              className="form-step-card form-step-section si-master-step-card"
              title={
                <Title level={5} className="form-step-card-title">
                  {t("wizard.master.blOptions")}
                </Title>
              }
            >
              <div className="si-master-detail-grid si-master-options-grid">
                <div className="form-field-cell si-master-readonly-field">
                  <label className="form-field-label">
                    {t("labels.blType")} <Text type="danger"> *</Text>
                  </label>
                  <Controller
                    control={control}
                    name="blType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          {
                            label: t("labels.originalBl"),
                            value: "Original",
                          },
                          {
                            label: t("labels.seaWaybill"),
                            value: "Seaway",
                          },
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

                <div className="form-field-cell si-master-readonly-field">
                  <label className="form-field-label">
                    {t("labels.releaseType")} <Text type="danger"> *</Text>
                  </label>
                  <Controller
                    control={control}
                    name="releaseType"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: t("labels.original"), value: "O" },
                          {
                            label: t("labels.telexRelease"),
                            value: "T",
                          },
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

                <div className="form-field-cell si-master-readonly-field">
                  <label className="form-field-label">
                    {t("wizard.master.freightTerms")}{" "}
                    <Text type="danger"> *</Text>
                  </label>
                  <Controller
                    control={control}
                    name="freightOption"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: t("labels.prepaid"), value: "PREPAID" },
                          { label: t("labels.collect"), value: "COLLECT" },
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

        {/* Modified by Sekar Nagarajan (2026-09-01 00:00) — read-only Vessels fields (replaces schedule card) */}
        <Row gutter={[24, 24]} className="si-master-step-row">
          <Col {...RESPONSIVE_COL.full}>
            <Card
              className="form-step-card form-step-section si-master-step-card"
              title={
                <div className="si-master-card-title-row">
                  <Title level={5} className="form-step-card-title">
                    {t("wizard.master.vesselDetails")}
                  </Title>
                </div>
              }
            >
              <div className="si-master-detail-grid si-master-detail-grid--5">
                <ReadonlyField
                  label={t("wizard.master.vesselVoyageNumber")}
                  value={vesselVoyage}
                />
                <ReadonlyField
                  label={t("wizard.master.placeOfReceipt")}
                  value={origin}
                />
                <ReadonlyField
                  label={t("wizard.master.portOfLoading")}
                  value={loadPort}
                />
                <ReadonlyField
                  label={t("wizard.master.portOfDischarge")}
                  value={dischargePort}
                />
                <ReadonlyField
                  label={t("wizard.master.placeOfDelivery")}
                  value={delivery}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isFirstStep || isSubmitting}>
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </form>
  );
}
