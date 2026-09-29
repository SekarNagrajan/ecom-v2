// Modified by Sekar Nagarajan (2026-09-05 01:05)
/**
 * Preview — airy review of wizard inputs with Edit → jump to step,
 * plus BL-specific editable preview fields (AES / UAE / remarks).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Input, Radio, Select, Tag, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useWizardStepTitles } from "../../../../i18n/use-module-titles";
import { BookingModuleStyles } from "../../../booking/components/booking-module-styles";
import { SiPreviewCargoReview } from "../../../shipping-instruction/components/SiPreviewCargoReview";
import type { SiPartyRoleKey } from "../../../shipping-instruction/utils/si-party.utils";
import {
  DEFAULT_BL_WIZARD_CONFIG,
  type BLWizardStepId,
} from "../../config/bl-wizard-config";
import { useBLWizardConfig } from "../../hooks/use-bl-wizard-config";
import type { BLParty, BLPreviewStepValues } from "../../types/bl.types";
import { blPreviewStepSchema } from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import {
  BlPreviewEmpty,
  BlPreviewEmptyPartyCard,
  BlPreviewFieldGrid,
  BlPreviewPartyCard,
  BlPreviewSection,
} from "../preview/bl-preview-section";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text, Title } = Typography;

const REVIEW_PARTY_ROLES: SiPartyRoleKey[] = [
  "shipper",
  "consignee",
  "notify",
  "forwarder",
];

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function getPreviewFieldsGridClass(
  enableAesNumber?: boolean,
  enableUaeBlType?: boolean,
): string {
  let count = 2;
  if (enableAesNumber) count += 2;
  if (enableUaeBlType) count += 2;
  return `bl-master-detail-grid bl-preview-fields-grid bl-preview-fields-grid--${count}`;
}

function partyForRole(
  parties: BLWizardStepProps["data"]["parties"],
  role: SiPartyRoleKey,
): BLParty | undefined {
  switch (role) {
    case "shipper":
      return parties.shipper;
    case "consignee":
      return parties.consignee;
    case "notify":
      return parties.notify;
    case "notify2":
      return parties.notify2;
    case "notify3":
      return parties.notify3;
    case "forwarder":
      return parties.forwarder;
    case "warehouse":
      return parties.warehouse;
    case "agreementParty":
      return parties.agreementParty;
    default:
      return undefined;
  }
}

export function PreviewStep({
  data,
  onPrevious,
  onSubmit,
  onUpdate,
  onCancel,
  onGoToStep,
  isSubmitting,
}: BLWizardStepProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const toast = useToast();
  const { data: config = DEFAULT_BL_WIZARD_CONFIG } = useBLWizardConfig();
  const preview = data.preview ?? {};
  const go = (stepId: BLWizardStepId) => {
    onGoToStep?.(stepId);
  };

  const releaseLabel =
    data.releaseType === "O"
      ? t("labels.original")
      : data.releaseType === "T"
        ? t("wizard.master.telexRelease")
        : dash(data.releaseType);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BLPreviewStepValues>({
    resolver: zodResolver(blPreviewStepSchema),
    defaultValues: {
      declaredValue: preview.declaredValue,
      siCustRemarks: preview.siCustRemarks,
      siAesNumber: preview.siAesNumber,
      aesDisclaimer: preview.aesDisclaimer,
      packingList: preview.packingList,
      invoiceUpload: preview.invoiceUpload,
      blTypeUae: preview.blTypeUae,
      mpciIdUae: preview.mpciIdUae,
      acidValue: preview.acidValue,
    },
  });

  const handleSubmitBl = handleSubmit(
    (values) => {
      if (
        config.enableAesNumber &&
        data.loadPortCountry === "US" &&
        !values.siAesNumber &&
        values.aesDisclaimer !== "not_applicable"
      ) {
        toast.error(t("wizard.preview.aesUsLoadPort"));
        return;
      }
      onUpdate({ preview: { ...preview, ...values } });
      onSubmit();
    },
    () => toast.error(t("wizard.preview.completeBeforeSubmit")),
  );

  const yesNo = (value: boolean) => (value ? t("labels.yes") : t("labels.no"));

  const masterRows: { label: string; value: string }[] = [
    { label: t("columns.blNumber"), value: dash(data.blNo) },
    { label: t("labels.bookingNumber"), value: dash(data.bookingNo) },
    {
      label: t("labels.siNumber"),
      value:
        dash(data.siNo) === "—" ? t("wizard.preview.notApplicable") : dash(data.siNo),
    },
    { label: t("labels.agencyRef"), value: dash(data.agencyRefNo) },
    { label: t("labels.blType"), value: dash(data.blType) },
    { label: t("labels.releaseType"), value: releaseLabel },
    { label: t("labels.freightOption"), value: dash(data.freightOption) },
  ];
  if (config.enableNvocc) {
    masterRows.push({
      label: t("wizard.preview.nvocc"),
      value: yesNo(!!data.nvocc),
    });
  }
  if (config.enableT2LFiling) {
    masterRows.push({
      label: t("wizard.preview.t2lFiling"),
      value: yesNo(!!data.t2lFiling),
    });
  }
  if (data.origin || data.loadPort || data.dischargePort || data.delivery) {
    masterRows.push(
      { label: t("labels.origin"), value: dash(data.origin) },
      { label: t("wizard.preview.loadPort"), value: dash(data.loadPort) },
      {
        label: t("wizard.preview.dischargePort"),
        value: dash(data.dischargePort),
      },
      { label: t("labels.delivery"), value: dash(data.delivery) },
    );
  }

  const reviewRoleSet = new Set(REVIEW_PARTY_ROLES);
  const extraPartyRoles = (
    ["agreementParty", "notify2", "notify3", "warehouse"] as SiPartyRoleKey[]
  ).filter((role) => {
    const party = partyForRole(data.parties, role);
    return party?.name && !reviewRoleSet.has(role);
  });

  const summary = [
    data.blNo?.trim() ||
      data.bookingNo?.trim() ||
      t("wizard.preview.draftBl"),
    data.loadPort && data.dischargePort
      ? `${data.loadPort} → ${data.dischargePort}`
      : null,
    data.routing?.vesselVoyage,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="form-step-layout">
      <BookingModuleStyles />
      <div className="custom-scroll form-step-scroll booking-preview-scroll booking-review bl-preview-scroll">
        <BlPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.masterDetails}
          onEdit={() => go("master")}
        >
          <BlPreviewFieldGrid items={masterRows} />
        </BlPreviewSection>

        <BlPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.parties}
          onEdit={() => go("parties")}
        >
          <div className="booking-review__party-grid">
            {REVIEW_PARTY_ROLES.map((role) => {
              const party = partyForRole(data.parties, role);
              return (
                <div key={role} className="booking-party-grid__col">
                  {party?.name ? (
                    <BlPreviewPartyCard
                      roleKey={role}
                      party={party}
                      extra={
                        role === "consignee" &&
                        data.parties.consignee?.toOrder ? (
                          <Text type="warning"> {t("labels.toOrder")}</Text>
                        ) : null
                      }
                    />
                  ) : (
                    <BlPreviewEmptyPartyCard roleKey={role} />
                  )}
                </div>
              );
            })}
            {extraPartyRoles.map((role) => {
              const party = partyForRole(data.parties, role);
              if (!party?.name) return null;
              return (
                <div key={role} className="booking-party-grid__col">
                  <BlPreviewPartyCard roleKey={role} party={party} />
                </div>
              );
            })}
          </div>
        </BlPreviewSection>

        {config.showRouting ? (
          <BlPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.routing}
            onEdit={() => go("routing")}
          >
            {data.routing ? (
              <BlPreviewFieldGrid
                items={[
                  {
                    label: t("labels.vesselVoyage"),
                    value: dash(data.routing.vesselVoyage),
                  },
                  {
                    label: t("labels.origin"),
                    value: dash(data.routing.originPrint),
                  },
                  { label: t("wizard.preview.pol"), value: dash(data.routing.polPrint) },
                  { label: t("wizard.preview.pod"), value: dash(data.routing.podPrint) },
                  {
                    label: t("labels.delivery"),
                    value: dash(data.routing.deliveryPrint),
                  },
                  {
                    label: t("labels.scheduleLegs"),
                    value: String(data.routing.scheduleLegs?.length ?? 0),
                  },
                ]}
              />
            ) : (
              <BlPreviewEmpty label={t("empty.noRouting")} />
            )}
          </BlPreviewSection>
        ) : null}

        <BlPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.cargoDetails}
          onEdit={() => go("cargo")}
        >
          <SiPreviewCargoReview containers={data.containers} />
        </BlPreviewSection>

        {config.showInsurance ? (
          <BlPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.insurance}
            onEdit={() => go("insurance")}
          >
            {data.insurance ? (
              <BlPreviewFieldGrid
                items={[
                  {
                    label: t("wizard.preview.insuranceRequired"),
                    value: yesNo(data.insurance.isInsuranceRequired),
                  },
                  {
                    label: t("labels.optOut"),
                    value: yesNo(data.insurance.optOut),
                  },
                  {
                    label: t("wizard.preview.currency"),
                    value: dash(data.insurance.currency),
                  },
                  {
                    label: t("labels.cargoValue"),
                    value: dash(data.insurance.cargoValue),
                  },
                  {
                    label: t("labels.policyNo"),
                    value: dash(data.insurance.policyNo),
                  },
                ]}
              />
            ) : (
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        {config.showCargoProtect ? (
          <BlPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.cargoProtect}
            onEdit={() => go("cargoProtect")}
          >
            {data.cargoProtect && data.cargoProtect.length > 0 ? (
              <ul className="bl-preview-list">
                {data.cargoProtect.map((line) => (
                  <li key={line.id}>
                    {line.productCode} — {line.description} ({line.amount}{" "}
                    {line.currency})
                  </li>
                ))}
              </ul>
            ) : (
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        {config.showChargesInWizard ? (
          <BlPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.charges}
            onEdit={() => go("charges")}
          >
            {data.charges && data.charges.length > 0 ? (
              <ul className="bl-preview-list">
                {data.charges.map((line) => (
                  <li key={line.id}>
                    {line.chargeCode ||
                      line.description ||
                      t("wizard.preview.chargeFallback")}{" "}
                    —{" "}
                    {dash(line.amount)} {dash(line.currency)}
                  </li>
                ))}
              </ul>
            ) : (
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        {config.showEns ? (
          <BlPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.ensDetails}
            onEdit={() => go("ens")}
          >
            {data.ens?.euCustomsZone ? (
              <BlPreviewFieldGrid
                items={[
                  { label: t("wizard.preview.euCustomsZone"), value: t("labels.yes") },
                  {
                    label: t("wizard.preview.typeOfBl"),
                    value: dash(data.ens.blType),
                  },
                  {
                    label: t("wizard.preview.ensFiling"),
                    value: dash(data.ens.ensFilingType),
                  },
                  {
                    label: t("labels.paymentMethod"),
                    value: dash(data.ens.paymentMethod),
                  },
                  ...(data.ens.ensFilingType === "Single Filing"
                    ? [
                        {
                          label: t("labels.buyer"),
                          value: dash(data.ens.buyerName),
                        },
                        {
                          label: t("labels.seller"),
                          value: dash(data.ens.sellerName),
                        },
                      ]
                    : [
                        {
                          label: t("labels.declarant"),
                          value: dash(data.ens.declarantName),
                        },
                      ]),
                ]}
              />
            ) : (
              <Tag>{t("wizard.preview.ensNotRequired")}</Tag>
            )}
          </BlPreviewSection>
        ) : null}

        {config.showChargeTab ? (
          <BlPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.chargeSummary}
            onEdit={() => go("chargeTab")}
          >
            {data.charges && data.charges.length > 0 ? (
              <Text>
                {t("wizard.preview.chargeLinesOnFile", {
                  count: data.charges.length,
                })}
              </Text>
            ) : (
              <BlPreviewEmpty />
            )}
          </BlPreviewSection>
        ) : null}

        <BlPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.fileUpload}
          onEdit={() => go("files")}
        >
          {data.files && data.files.length > 0 ? (
            <ul className="bl-preview-list">
              {data.files.map((file) => (
                <li key={file.id}>
                  {file.fileName} ({file.category}) — {file.uploadedAt}
                </li>
              ))}
            </ul>
          ) : (
            <BlPreviewEmpty label={t("wizard.preview.noFilesUploaded")} />
          )}
        </BlPreviewSection>

        <BlPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.references}
          onEdit={() => go("references")}
        >
          {data.referenceFields && data.referenceFields.length > 0 ? (
            <BlPreviewFieldGrid
              items={data.referenceFields.map((field) => ({
                label: field.name,
                value: dash(field.value),
              }))}
            />
          ) : (
            <BlPreviewEmpty label={t("wizard.preview.noReferenceFields")} />
          )}
        </BlPreviewSection>

        <BlPreviewSection variant="airy" title={t("labels.previewFields")}>
          <div
            className={getPreviewFieldsGridClass(
              config.enableAesNumber,
              config.enableUaeBlType,
            )}
          >
            <div className="form-field-cell bl-master-readonly-field">
              <label className="form-field-label">{t("labels.declaredValue")}</label>
              <Controller
                control={control}
                name="declaredValue"
                render={({ field }) => <Input {...field} size="large" />}
              />
            </div>
            <div className="form-field-cell bl-master-readonly-field">
              <label className="form-field-label">
                {t("wizard.preview.customerRemarks")}
              </label>
              <Controller
                control={control}
                name="siCustRemarks"
                render={({ field }) => <Input {...field} size="large" />}
              />
            </div>
            {config.enableAesNumber ? (
              <>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">
                    {t("wizard.preview.aesNumber")}
                  </label>
                  <Controller
                    control={control}
                    name="siAesNumber"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </div>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">
                    {t("wizard.preview.aesDisclaimer")}
                  </label>
                  <Controller
                    control={control}
                    name="aesDisclaimer"
                    render={({ field }) => (
                      <Radio.Group
                        {...field}
                        className="bl-preview-radio-group"
                      >
                        <Radio value="provided">
                          {t("wizard.preview.aesProvided")}
                        </Radio>
                        <Radio value="not_applicable">
                          {t("wizard.preview.aesNotApplicable")}
                        </Radio>
                      </Radio.Group>
                    )}
                  />
                </div>
              </>
            ) : null}
            {config.enableUaeBlType ? (
              <>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">
                    {t("wizard.preview.blTypeUae")}
                  </label>
                  <Controller
                    control={control}
                    name="blTypeUae"
                    render={({ field }) => (
                      <Select
                        {...field}
                        allowClear
                        size="large"
                        className="form-field-full-width"
                        options={[
                          {
                            label: t("wizard.preview.masterBl"),
                            value: "Master BL",
                          },
                          {
                            label: t("wizard.preview.directBl"),
                            value: "Direct BL",
                          },
                        ]}
                      />
                    )}
                  />
                </div>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">
                    {t("wizard.preview.mpciIdUae")}
                  </label>
                  <Controller
                    control={control}
                    name="mpciIdUae"
                    render={({ field }) => (
                      <Input {...field} size="large" maxLength={10} />
                    )}
                  />
                  {errors.mpciIdUae ? (
                    <Text type="danger" className="form-field-error">
                      {errors.mpciIdUae.message}
                    </Text>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
        </BlPreviewSection>
      </div>

      <BlWizardFooter
        onPrevious={onPrevious}
        split
        onCancel={onCancel}
        onNext={handleSubmitBl}
        nextLabel={t("wizard.actions.submitBl")}
        nextLoading={isSubmitting}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
