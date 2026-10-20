// Modified by Sekar Nagarajan (2026-09-01 16:36)
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Card, Input, Segmented, Switch, Typography } from "antd";
import { useMemo } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../../components/shared/yes-no-switch";
import type { EnsData } from "../../../booking/types/booking.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text, Title } = Typography;

function createBlEnsSchema(t: (key: string) => string) {
  return z.object({
    euCustomsZone: z.boolean().default(false),
    blType: z.enum(["Straight BL", "Master BL"]).default("Straight BL"),
    ensFilingType: z
      .enum(["Single Filing", "Multiple Filing"])
      .default("Single Filing"),
    paymentMethod: z
      .enum(["Wire Transfer", "Not Prepaid"])
      .default("Wire Transfer"),
    declarantName: z.string().default(""),
    declarantAddress: z.string().default(""),
    declarantCity: z.string().default(""),
    declarantCountry: z.string().default(""),
    declarantEori: z.string().default(""),
    declarantEmail: z
      .string()
      .email(t("wizard.ens.validation.invalidEmail"))
      .or(z.literal(""))
      .default(""),
    buyerName: z.string().default(""),
    buyerAddress: z.string().default(""),
    buyerCity: z.string().default(""),
    buyerCountry: z.string().default(""),
    sellerName: z.string().default(""),
    sellerAddress: z.string().default(""),
    sellerCity: z.string().default(""),
    sellerCountry: z.string().default(""),
  });
}

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

export function BlEnsStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onGoToStep,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const { t } = useTranslation(["bill-of-lading", "common"]);

  const ensSchemaLocal = useMemo(() => createBlEnsSchema(t), [t]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnsData>({
    resolver: zodResolver(ensSchemaLocal) as Resolver<EnsData>,
    defaultValues: { ...defaults, ...(data.ens ?? {}) },
  });

  const ensRequired = watch("euCustomsZone");
  const ensFilingType = watch("ensFilingType");
  const isMultipleFiling = ensFilingType === "Multiple Filing";

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

  const onValid = (values: EnsData) => {
    onUpdate({
      ens: values.euCustomsZone
        ? values
        : { ...defaults, euCustomsZone: false },
    });
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
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
          <div className="form-ens-required-row form-ens-top-row">
            <div className="form-field-cell">
              <label className="form-field-label">
                {t("wizard.ens.label")}
              </label>
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
                  <label className="form-field-label">
                    {t("wizard.preview.typeOfBl")}
                  </label>
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
                          {
                            label: t("wizard.ens.straightBl"),
                            value: "Straight BL",
                          },
                          {
                            label: t("wizard.preview.masterBl"),
                            value: "Master BL",
                          },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">
                    {t("wizard.ens.filingType")}
                  </label>
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
                          {
                            label: t("wizard.ens.singleFiling"),
                            value: "Single Filing",
                          },
                          {
                            label: t("wizard.ens.multipleFiling"),
                            value: "Multiple Filing",
                          },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">
                    {t("labels.paymentMethod")}
                  </label>
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
                          {
                            label: t("wizard.ens.wireTransfer"),
                            value: "Wire Transfer",
                          },
                          {
                            label: t("wizard.ens.notPrepaid"),
                            value: "Not Prepaid",
                          },
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
                      {t("wizard.ens.supplementaryDeclarant")}
                    </Title>
                  }
                >
                  <div className="form-ens-party-grid">
                    <div className="form-field-cell">
                      <label className="form-field-label">
                        {t("wizard.ens.fields.name")}
                      </label>
                      <Controller
                        control={control}
                        name="declarantName"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">
                        {t("wizard.ens.fields.address")}
                      </label>
                      <Controller
                        control={control}
                        name="declarantAddress"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">
                        {t("wizard.ens.fields.city")}
                      </label>
                      <Controller
                        control={control}
                        name="declarantCity"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">
                        {t("wizard.ens.fields.country")}
                      </label>
                      <Controller
                        control={control}
                        name="declarantCountry"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">
                        {t("wizard.ens.fields.eori")}
                      </label>
                      <Controller
                        control={control}
                        name="declarantEori"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">
                        {t("wizard.ens.fields.email")}
                      </label>
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
                        {t("labels.buyer")}
                      </Title>
                    }
                  >
                    <div className="form-ens-party-grid">
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.name")}
                        </label>
                        <Controller
                          control={control}
                          name="buyerName"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.address")}
                        </label>
                        <Controller
                          control={control}
                          name="buyerAddress"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.city")}
                        </label>
                        <Controller
                          control={control}
                          name="buyerCity"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.country")}
                        </label>
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
                        {t("labels.seller")}
                      </Title>
                    }
                  >
                    <div className="form-ens-party-grid">
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.name")}
                        </label>
                        <Controller
                          control={control}
                          name="sellerName"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.address")}
                        </label>
                        <Controller
                          control={control}
                          name="sellerAddress"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.city")}
                        </label>
                        <Controller
                          control={control}
                          name="sellerCity"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">
                          {t("wizard.ens.fields.country")}
                        </label>
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
                message={t("wizard.ens.notesTitle")}
                description={
                  <>
                    <div>{t("wizard.ens.notesFilingRequirements")}</div>
                    <div>{t("wizard.ens.notesBlTypeMapping")}</div>
                    <div>{t("wizard.ens.notesEori")}</div>
                  </>
                }
              />
            </div>
          ) : null}
        </Card>
      </div>

      <BlWizardFooter
        onPrevious={onPrevious}
        nextHtmlType="submit"
        isFirstStep={isFirstStep}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
