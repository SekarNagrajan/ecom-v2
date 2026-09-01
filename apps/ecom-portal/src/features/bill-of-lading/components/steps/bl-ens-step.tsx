// Modified by Sekar Nagarajan (2026-09-01 16:36)
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Card, Input, Segmented, Space, Switch, Typography } from "antd";
import { Controller, useForm, type Resolver } from "react-hook-form";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../../components/shared/yes-no-switch";
import { ensSchema, type EnsData } from "../../../booking/types/booking.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

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

export function BlEnsStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onGoToStep,
  isFirstStep,
  isSubmitting,
}: BLWizardStepProps) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnsData>({
    resolver: zodResolver(ensSchema) as Resolver<EnsData>,
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
              ENS Details
            </Title>
          }
        >
          {/* Modified by Sekar Nagarajan (2026-09-01 16:36) — booking ENS layout parity */}
          <div className="form-ens-required-row form-ens-top-row">
            <div className="form-field-cell">
              <label className="form-field-label">ENS</label>
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
                  <label className="form-field-label">Type of B/L</label>
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
                          { label: "Straight BL", value: "Straight BL" },
                          { label: "Master BL", value: "Master BL" },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">Type of ENS Filing</label>
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
                          { label: "Single Filing", value: "Single Filing" },
                          {
                            label: "Multiple Filing",
                            value: "Multiple Filing",
                          },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">Method of Payment</label>
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
                          { label: "Wire Transfer", value: "Wire Transfer" },
                          { label: "Not Prepaid", value: "Not Prepaid" },
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
                      Supplementary Declarant
                    </Title>
                  }
                >
                  <div className="form-ens-party-grid">
                    <div className="form-field-cell">
                      <label className="form-field-label">Name</label>
                      <Controller
                        control={control}
                        name="declarantName"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">Address</label>
                      <Controller
                        control={control}
                        name="declarantAddress"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">City</label>
                      <Controller
                        control={control}
                        name="declarantCity"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">Country</label>
                      <Controller
                        control={control}
                        name="declarantCountry"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">EORI</label>
                      <Controller
                        control={control}
                        name="declarantEori"
                        render={({ field }) => (
                          <Input {...field} size="large" />
                        )}
                      />
                    </div>
                    <div className="form-field-cell">
                      <label className="form-field-label">Email</label>
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
                        Buyer
                      </Title>
                    }
                  >
                    <div className="form-ens-party-grid">
                      <div className="form-field-cell">
                        <label className="form-field-label">Name</label>
                        <Controller
                          control={control}
                          name="buyerName"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">Address</label>
                        <Controller
                          control={control}
                          name="buyerAddress"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">City</label>
                        <Controller
                          control={control}
                          name="buyerCity"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">Country</label>
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
                        Seller
                      </Title>
                    }
                  >
                    <div className="form-ens-party-grid">
                      <div className="form-field-cell">
                        <label className="form-field-label">Name</label>
                        <Controller
                          control={control}
                          name="sellerName"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">Address</label>
                        <Controller
                          control={control}
                          name="sellerAddress"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">City</label>
                        <Controller
                          control={control}
                          name="sellerCity"
                          render={({ field }) => (
                            <Input {...field} size="large" />
                          )}
                        />
                      </div>
                      <div className="form-field-cell">
                        <label className="form-field-label">Country</label>
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
                message="ENS filing notes"
                description={
                  <>
                    <div>
                      Single Filing requires Buyer and Seller details. Multiple
                      Filing requires Supplementary Declarant details.
                    </div>
                    <div>
                      Straight BL uses Single Filing; Master BL uses Multiple
                      Filing.
                    </div>
                    <div>
                      Provide accurate EORI and person type where applicable for
                      EU customs processing.
                    </div>
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
