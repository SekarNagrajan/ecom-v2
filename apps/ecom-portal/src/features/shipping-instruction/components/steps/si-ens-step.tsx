// Created by Sekar Nagarajan (2026-08-31 16:13)
/**
 * ENS Details step — field parity with SIBLCommonENS.jsp
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Alert, Card, Segmented, Switch, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import { AppIcon, Icons } from "../../../../components/icons";
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

const { Text, Title } = Typography;

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
    // Modified by Sekar Nagarajan (2026-08-31 16:16) — legacy Single↔Buyer/Seller, Multiple↔Declarant
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
      <div className="custom-scroll form-step-scroll si-master-step-stack">
        <Card
          className="form-step-card form-step-section si-master-step-card"
          title={
            <Title level={5} className="form-step-card-title">
              ENS Details
            </Title>
          }
        >
          {/* Modified by Sekar Nagarajan (2026-09-01 00:21) — ENS toggle + options in one row */}
          <div className="si-ens-required-row si-ens-top-row">
            <div className="form-field-cell">
              <label className="form-field-label">ENS</label>
              <Controller
                control={control}
                name="ensRequired"
                render={({ field: { value, onChange } }) => (
                  <div className="si-ens-switch-control">
                    <Switch
                      size="medium"
                      className="si-ens-switch"
                      checked={value}
                      onChange={onChange}
                      checkedChildren={<AppIcon icon={Icons.check} size={12} />}
                      unCheckedChildren={<AppIcon icon={Icons.x} size={12} />}
                    />
                  </div>
                )}
              />
            </div>

            {ensRequired ? (
              <>
                <div className="form-field-cell">
                  <label className="form-field-label">EU Customs Zone</label>
                  <Controller
                    control={control}
                    name="euCustZone"
                    render={({ field: { value, onChange } }) => (
                      <div className="si-ens-switch-control">
                        <Switch
                          size="medium"
                          className="si-ens-switch"
                          checked={value === "Y"}
                          onChange={(checked: boolean) =>
                            onChange(checked ? "Y" : "N")
                          }
                          checkedChildren={
                            <AppIcon icon={Icons.check} size={12} />
                          }
                          unCheckedChildren={
                            <AppIcon icon={Icons.x} size={12} />
                          }
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="form-field-cell">
                  <label className="form-field-label">Type of B/L</label>
                  <Controller
                    control={control}
                    name="blTypeEns"
                    render={({ field: { value } }) => (
                      <Segmented
                        block
                        className="form-field-full-width si-master-segmented"
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
                        className="form-field-full-width si-master-segmented"
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
                        className="form-field-full-width si-master-segmented"
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

          {!ensRequired ? (
            <Text type="secondary">
              ENS filing is not required. Continue to the next step.
            </Text>
          ) : (
            <div className="si-ens-sections">
              {isMultipleFiling ? (
                <Card
                  size="small"
                  className="si-ens-subcard"
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
                    className="si-ens-subcard"
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
                    className="si-ens-subcard"
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
                className="si-ens-notes"
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
          )}
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
