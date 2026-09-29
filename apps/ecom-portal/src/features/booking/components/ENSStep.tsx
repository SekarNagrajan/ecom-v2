// Modified by Sekar Nagarajan (2026-09-01 16:36)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Alert, Card, Input, Segmented, Space, Switch, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../components/shared/yes-no-switch";
import { bookingApi } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import { createEnsSchema, type EnsData } from "../types/booking.types";

const { Text, Title } = Typography;

const defaults: EnsData = {
  euCustomsZone: false,
  blType: "Straight BL",
  ensFilingType: "Single Filing",
  paymentMethod: "Wire Transfer",
  declarantName: "",
  declarantAddress: "",
  declarantCity: "",
  declarantCountry: "",
  declarantEori: "",
  declarantEmail: "",
  buyerName: "",
  buyerAddress: "",
  buyerCity: "",
  buyerCountry: "",
  sellerName: "",
  sellerAddress: "",
  sellerCity: "",
  sellerCountry: "",
};

export function ENSStep() {
  const { t } = useTranslation(["booking", "common"]);
  const toast = useToast();
  const { payload, updateEns, nextStep, prevStep } = useBookingStore();
  const [validatingEori, setValidatingEori] = useState(false);

  const schema = useMemo(() => createEnsSchema((k) => t(k)), [t]);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EnsData>({
    resolver: zodResolver(schema) as Resolver<EnsData>,
    defaultValues: payload.ens || defaults,
  });

  const ensRequired = watch("euCustomsZone");
  const ensFilingType = watch("ensFilingType");
  const isMultipleFiling = ensFilingType === "Multiple Filing";

  useEffect(() => {
    if (payload.ens) reset({ ...defaults, ...payload.ens });
  }, [payload.ens, reset]);

  const syncBlAndFiling = (
    nextBl: EnsData["blType"],
    nextFiling: EnsData["ensFilingType"],
  ) => {
    setValue("blType", nextBl, { shouldValidate: true });
    setValue("ensFilingType", nextFiling, { shouldValidate: true });
    if (nextFiling === "Multiple Filing") {
      setValue("buyerName", "");
      setValue("buyerAddress", "");
      setValue("buyerCity", "");
      setValue("buyerCountry", "");
      setValue("sellerName", "");
      setValue("sellerAddress", "");
      setValue("sellerCity", "");
      setValue("sellerCountry", "");
    } else {
      setValue("declarantName", "");
      setValue("declarantAddress", "");
      setValue("declarantCity", "");
      setValue("declarantCountry", "");
      setValue("declarantEori", "");
      setValue("declarantEmail", "");
    }
  };

  const onSubmit = (data: EnsData) => {
    updateEns(
      data.euCustomsZone ? data : { ...defaults, euCustomsZone: false },
    );
    nextStep();
  };

  const handleValidateEori = async () => {
    const eori = (getValues("declarantEori") || "").trim();
    if (!eori) {
      toast.error(t("wizard.ens.eoriEnterFirst"));
      return;
    }
    setValidatingEori(true);
    try {
      const result = await bookingApi.validateEori(eori);
      if (result.valid) toast.success(result.message);
      else toast.error(result.message);
    } catch {
      toast.error(t("wizard.ens.eoriValidationFailed"));
    } finally {
      setValidatingEori(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Card
          className="form-step-card form-step-section"
          title={
            <Title level={5} className="form-step-card-title">
              {t("wizard.ens.title")}
            </Title>
          }
        >
          {/* Modified by Sekar Nagarajan (2026-09-01 16:36) — shared form-ens layout */}
          <div className="form-ens-required-row form-ens-top-row">
            <div className="form-field-cell">
              <label className="form-field-label">{t("wizard.ens.ensLabel")}</label>
              <Controller
                control={control}
                name="euCustomsZone"
                render={({ field: { value, onChange } }) => (
                  <div className="form-yes-no-switch-wrap">
                    <Switch
                      className={FORM_YES_NO_SWITCH_CLASS}
                      checked={Boolean(value)}
                      onChange={onChange}
                      {...yesNoSwitchInner}
                    />
                  </div>
                )}
              />
            </div>

            {ensRequired ? (
              <>
                <div className="form-field-cell">
                  <label className="form-field-label">{t("wizard.ens.blType")}</label>
                  <Controller
                    control={control}
                    name="blType"
                    render={({ field: { value } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={(next) => {
                          const bl = next as EnsData["blType"];
                          syncBlAndFiling(
                            bl,
                            bl === "Master BL"
                              ? "Multiple Filing"
                              : "Single Filing",
                          );
                        }}
                        options={[
                          { label: t("wizard.ens.blOptions.straight"), value: "Straight BL" },
                          { label: t("wizard.ens.blOptions.master"), value: "Master BL" },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">{t("wizard.ens.filingType")}</label>
                  <Controller
                    control={control}
                    name="ensFilingType"
                    render={({ field: { value } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={(next) => {
                          const filing = next as EnsData["ensFilingType"];
                          syncBlAndFiling(
                            filing === "Multiple Filing"
                              ? "Master BL"
                              : "Straight BL",
                            filing,
                          );
                        }}
                        options={[
                          { label: t("wizard.ens.filingOptions.single"), value: "Single Filing" },
                          {
                            label: t("wizard.ens.filingOptions.multiple"),
                            value: "Multiple Filing",
                          },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">{t("wizard.ens.paymentMethod")}</label>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field: { value, onChange } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={onChange}
                        options={[
                          { label: t("wizard.ens.paymentOptions.wire"), value: "Wire Transfer" },
                          { label: t("wizard.ens.paymentOptions.notPrepaid"), value: "Not Prepaid" },
                        ]}
                      />
                    )}
                  />
                </div>
              </>
            ) : null}
          </div>

          {ensRequired ? (
            <div className="form-ens-sections">
              {isMultipleFiling ? (
                <Card
                  size="small"
                  className="form-ens-subcard"
                  title={
                    <Title level={5} className="form-step-card-title">
                      {t("wizard.ens.declarant")}
                    </Title>
                  }
                >
                  <div className="form-ens-party-grid">
                    <div className="form-field-cell">
                      <label className="form-field-label">{t("wizard.ens.fields.name")}</label>
                      <Controller
                        control={control}
                        name="declarantName"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">{t("wizard.ens.fields.address")}</label>
                      <Controller
                        control={control}
                        name="declarantAddress"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">{t("wizard.ens.fields.city")}</label>
                      <Controller
                        control={control}
                        name="declarantCity"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">{t("wizard.ens.fields.country")}</label>
                      <Controller
                        control={control}
                        name="declarantCountry"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">{t("wizard.ens.fields.eori")}</label>
                      <Space.Compact className="form-field-full-width">
                        <Controller
                          control={control}
                          name="declarantEori"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                        <AppButton
                          loading={validatingEori}
                          onClick={handleValidateEori}
                        >
                          {t("wizard.ens.fields.validate")}
                        </AppButton>
                      </Space.Compact>
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">{t("wizard.ens.fields.email")}</label>
                      <Controller
                        control={control}
                        name="declarantEmail"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                      {errors.declarantEmail ? (
                        <Text type="danger" className="form-field-error">
                          {errors.declarantEmail.message}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  <Card
                    size="small"
                    className="form-ens-subcard"
                    title={
                      <Title level={5} className="form-step-card-title">
                        {t("wizard.ens.buyer")}
                      </Title>
                    }
                  >
                    <div className="form-ens-party-grid">
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.name")}</label>
                        <Controller
                          control={control}
                          name="buyerName"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.address")}</label>
                        <Controller
                          control={control}
                          name="buyerAddress"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.city")}</label>
                        <Controller
                          control={control}
                          name="buyerCity"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.country")}</label>
                        <Controller
                          control={control}
                          name="buyerCountry"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card
                    size="small"
                    className="form-ens-subcard"
                    title={
                      <Title level={5} className="form-step-card-title">
                        {t("wizard.ens.seller")}
                      </Title>
                    }
                  >
                    <div className="form-ens-party-grid">
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.name")}</label>
                        <Controller
                          control={control}
                          name="sellerName"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.address")}</label>
                        <Controller
                          control={control}
                          name="sellerAddress"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.city")}</label>
                        <Controller
                          control={control}
                          name="sellerCity"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">{t("wizard.ens.fields.country")}</label>
                        <Controller
                          control={control}
                          name="sellerCountry"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                    </div>
                  </Card>
                </>
              )}

              <Alert
                type="info"
                showIcon
                className="form-ens-notes"
                message={t("wizard.ens.notes.title")}
                description={
                  <>
                    <div>{t("wizard.ens.notes.singleFiling")}</div>
                    <div>{t("wizard.ens.notes.blFilingLink")}</div>
                    <div>{t("wizard.ens.notes.eoriHint")}</div>
                  </>
                }
              />
            </div>
          ) : null}
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>{t("common:actions.previous")}</AppButton>
        <AppButton type="primary" htmlType="submit">
          {t("common:actions.next")}
        </AppButton>
      </div>
    </form>
  );
}
