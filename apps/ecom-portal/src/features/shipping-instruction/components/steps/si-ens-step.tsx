// Modified by Sekar Nagarajan (2026-09-01 16:36)
/**
 * ENS Details step — booking ENS layout parity (field model retained for SI).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Alert, Card, Segmented, Switch, Typography } from "antd";
import { useMemo } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../../components/shared/yes-no-switch";
import {
  createSiEnsStepSchema,
  emptySiEnsDeclarant,
  emptySiEnsParty,
  type SIEnsInfo,
  type SiEnsStepForm,
  type SIWizardStepProps,
} from "../../types/si.types";
import { SiEnsDeclarantFields } from "../si-ens-declarant-fields";
import { SiEnsPartyFields } from "../si-ens-party-fields";

const { Title } = Typography;

const defaults = (data?: SIEnsInfo | null): SiEnsStepForm => ({
  ensRequired: data?.ensRequired ?? false,
  euCustZone: data?.euCustZone ?? "N",
  blTypeEns: data?.blTypeEns ?? "Straight BL",
  ensFillingType: data?.ensFillingType ?? "Single Filing",
  paymentMethod: data?.paymentMethod ?? "Wire Transfer",
  declarant: data?.declarant ?? emptySiEnsDeclarant(),
  buyer: data?.buyer ?? emptySiEnsParty(),
  seller: data?.seller ?? emptySiEnsParty(),
});

export function SiEnsStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isFirstStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);

  const schema = useMemo(() => createSiEnsStepSchema(t), [t]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SiEnsStepForm>({
    resolver: zodResolver(schema) as Resolver<SiEnsStepForm>,
    defaultValues: defaults(data.ens),
  });

  const ensRequired = watch("ensRequired");
  const ensFillingType = watch("ensFillingType");
  const isMultipleFiling = ensFillingType === "Multiple Filing";

  const syncBlAndFiling = (
    nextBl: SiEnsStepForm["blTypeEns"],
    nextFiling: SiEnsStepForm["ensFillingType"],
  ) => {
    setValue("blTypeEns", nextBl, { shouldValidate: true });
    setValue("ensFillingType", nextFiling, { shouldValidate: true });
    if (nextFiling === "Multiple Filing") {
      setValue("declarant", watch("declarant") ?? emptySiEnsDeclarant());
      setValue("buyer", emptySiEnsParty());
      setValue("seller", emptySiEnsParty());
    } else {
      setValue("declarant", emptySiEnsDeclarant());
    }
  };

  const onValid = (values: SiEnsStepForm) => {
    const ens: SIEnsInfo = values.ensRequired
      ? {
          ensRequired: true,
          euCustZone: values.euCustZone,
          blTypeEns: values.blTypeEns,
          ensFillingType: values.ensFillingType,
          paymentMethod: values.paymentMethod,
          declarant:
            values.ensFillingType === "Multiple Filing"
              ? values.declarant
              : undefined,
          buyer:
            values.ensFillingType === "Single Filing"
              ? values.buyer
              : emptySiEnsParty(),
          seller:
            values.ensFillingType === "Single Filing"
              ? values.seller
              : emptySiEnsParty(),
        }
      : {
          ensRequired: false,
          euCustZone: "N",
          blTypeEns: "Straight BL",
          ensFillingType: "Single Filing",
          paymentMethod: "Wire Transfer",
          buyer: emptySiEnsParty(),
          seller: emptySiEnsParty(),
        };
    onUpdate({ ens });
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
              <label className="form-field-label">{t("wizard.ens.label")}</label>
              <Controller
                control={control}
                name="ensRequired"
                render={({ field: { value, onChange } }) => (
                  <div className="form-yes-no-switch-wrap">
                    <Switch
                      className={FORM_YES_NO_SWITCH_CLASS}
                      checked={value}
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
                    {t("wizard.ens.typeOfBl")}
                  </label>
                  <Controller
                    control={control}
                    name="blTypeEns"
                    render={({ field: { value } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={(next) => {
                          const bl = next as SiEnsStepForm["blTypeEns"];
                          syncBlAndFiling(
                            bl,
                            bl === "Master BL"
                              ? "Multiple Filing"
                              : "Single Filing",
                          );
                        }}
                        options={[
                          {
                            label: t("wizard.ens.options.straightBl"),
                            value: "Straight BL",
                          },
                          {
                            label: t("wizard.ens.options.masterBl"),
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
                    name="ensFillingType"
                    render={({ field: { value } }) => (
                      <Segmented
                        block
                        className="form-field-full-width form-segmented"
                        value={value}
                        onChange={(next) => {
                          const filing =
                            next as SiEnsStepForm["ensFillingType"];
                          syncBlAndFiling(
                            filing === "Multiple Filing"
                              ? "Master BL"
                              : "Straight BL",
                            filing,
                          );
                        }}
                        options={[
                          {
                            label: t("wizard.ens.options.singleFiling"),
                            value: "Single Filing",
                          },
                          {
                            label: t("wizard.ens.options.multipleFiling"),
                            value: "Multiple Filing",
                          },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">
                    {t("wizard.ens.methodOfPayment")}
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
                            label: t("wizard.ens.options.wireTransfer"),
                            value: "Wire Transfer",
                          },
                          {
                            label: t("wizard.ens.options.notPrepaid"),
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
                  <SiEnsDeclarantFields control={control} errors={errors} />
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
                    <SiEnsPartyFields
                      control={control}
                      prefix="buyer"
                      errors={errors}
                    />
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
                    <SiEnsPartyFields
                      control={control}
                      prefix="seller"
                      errors={errors}
                    />
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
