// Modified by Sekar Nagarajan (2026-09-01 16:36)
/**
 * ENS Details step — booking ENS layout parity (field model retained for SI).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Alert, Card, Segmented, Switch, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import {
  FORM_YES_NO_SWITCH_CLASS,
  yesNoSwitchInner,
} from "../../../../components/shared/yes-no-switch";
import {
  emptySiEnsDeclarant,
  emptySiEnsParty,
  siEnsStepSchema,
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
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SiEnsStepForm>({
    resolver: zodResolver(siEnsStepSchema),
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
                  <label className="form-field-label">Type of B/L</label>
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
                  <SiEnsDeclarantFields control={control} errors={errors} />
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
                        Seller
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
