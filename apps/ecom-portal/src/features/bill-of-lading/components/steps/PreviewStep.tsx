// Modified by Sekar Nagarajan (2026-09-05 01:05)
/**
 * Preview — airy review of wizard inputs with Edit → jump to step,
 * plus BL-specific editable preview fields (AES / UAE / remarks).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Input, Radio, Select, Tag, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import { AppIcon, Icons } from "../../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
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
  const toast = useToast();
  const { data: config = DEFAULT_BL_WIZARD_CONFIG } = useBLWizardConfig();
  const preview = data.preview ?? {};
  const go = (stepId: BLWizardStepId) => {
    onGoToStep?.(stepId);
  };

  const releaseLabel =
    data.releaseType === "O"
      ? "Original"
      : data.releaseType === "T"
      ? "Telex Release"
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
        toast.error(
          "Provide AES number or select not applicable for US load port",
        );
        return;
      }
      onUpdate({ preview: { ...preview, ...values } });
      onSubmit();
    },
    () => toast.error("Complete preview fields before submit"),
  );

  const masterRows: { label: string; value: string }[] = [
    { label: "B/L number", value: dash(data.blNo) },
    { label: "Booking number", value: dash(data.bookingNo) },
    {
      label: "SI number",
      value: dash(data.siNo) === "—" ? "N/A" : dash(data.siNo),
    },
    { label: "Agency ref", value: dash(data.agencyRefNo) },
    { label: "B/L type", value: dash(data.blType) },
    { label: "Release type", value: releaseLabel },
    { label: "Freight option", value: dash(data.freightOption) },
  ];
  if (config.enableNvocc) {
    masterRows.push({ label: "NVOCC", value: data.nvocc ? "Yes" : "No" });
  }
  if (config.enableT2LFiling) {
    masterRows.push({
      label: "T2L filing",
      value: data.t2lFiling ? "Yes" : "No",
    });
  }
  if (data.origin || data.loadPort || data.dischargePort || data.delivery) {
    masterRows.push(
      { label: "Origin", value: dash(data.origin) },
      { label: "Load port", value: dash(data.loadPort) },
      { label: "Discharge port", value: dash(data.dischargePort) },
      { label: "Delivery", value: dash(data.delivery) },
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
    data.blNo?.trim() || data.bookingNo?.trim() || "Draft B/L",
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
                          <Text type="warning"> (To Order)</Text>
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
                    label: "Vessel / voyage",
                    value: dash(data.routing.vesselVoyage),
                  },
                  {
                    label: "Origin",
                    value: dash(data.routing.originPrint),
                  },
                  { label: "POL", value: dash(data.routing.polPrint) },
                  { label: "POD", value: dash(data.routing.podPrint) },
                  {
                    label: "Delivery",
                    value: dash(data.routing.deliveryPrint),
                  },
                  {
                    label: "Schedule legs",
                    value: String(data.routing.scheduleLegs?.length ?? 0),
                  },
                ]}
              />
            ) : (
              <BlPreviewEmpty label="No routing details" />
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
                    label: "Required",
                    value: data.insurance.isInsuranceRequired ? "Yes" : "No",
                  },
                  {
                    label: "Opt out",
                    value: data.insurance.optOut ? "Yes" : "No",
                  },
                  {
                    label: "Currency",
                    value: dash(data.insurance.currency),
                  },
                  {
                    label: "Cargo value",
                    value: dash(data.insurance.cargoValue),
                  },
                  {
                    label: "Policy no",
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
                    {line.chargeCode || line.description || "Charge"} —{" "}
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
                  { label: "EU customs zone", value: "Yes" },
                  {
                    label: "Type of B/L",
                    value: dash(data.ens.blType),
                  },
                  {
                    label: "ENS filing",
                    value: dash(data.ens.ensFilingType),
                  },
                  {
                    label: "Payment method",
                    value: dash(data.ens.paymentMethod),
                  },
                  ...(data.ens.ensFilingType === "Single Filing"
                    ? [
                        {
                          label: "Buyer",
                          value: dash(data.ens.buyerName),
                        },
                        {
                          label: "Seller",
                          value: dash(data.ens.sellerName),
                        },
                      ]
                    : [
                        {
                          label: "Declarant",
                          value: dash(data.ens.declarantName),
                        },
                      ]),
                ]}
              />
            ) : (
              <Tag>ENS not required</Tag>
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
                {data.charges.length} charge line
                {data.charges.length === 1 ? "" : "s"} on file
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
            <BlPreviewEmpty label="No files uploaded" />
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
            <BlPreviewEmpty label="No reference fields" />
          )}
        </BlPreviewSection>

        <BlPreviewSection variant="airy" title="Preview fields">
          <div
            className={getPreviewFieldsGridClass(
              config.enableAesNumber,
              config.enableUaeBlType,
            )}
          >
            <div className="form-field-cell bl-master-readonly-field">
              <label className="form-field-label">Declared Value</label>
              <Controller
                control={control}
                name="declaredValue"
                render={({ field }) => <Input {...field} size="large" />}
              />
            </div>
            <div className="form-field-cell bl-master-readonly-field">
              <label className="form-field-label">Customer Remarks</label>
              <Controller
                control={control}
                name="siCustRemarks"
                render={({ field }) => <Input {...field} size="large" />}
              />
            </div>
            {config.enableAesNumber ? (
              <>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">AES Number</label>
                  <Controller
                    control={control}
                    name="siAesNumber"
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </div>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">AES Disclaimer</label>
                  <Controller
                    control={control}
                    name="aesDisclaimer"
                    render={({ field }) => (
                      <Radio.Group
                        {...field}
                        className="bl-preview-radio-group"
                      >
                        <Radio value="provided">Provided</Radio>
                        <Radio value="not_applicable">Not Applicable</Radio>
                      </Radio.Group>
                    )}
                  />
                </div>
              </>
            ) : null}
            {config.enableUaeBlType ? (
              <>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">B/L Type (UAE)</label>
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
                          { label: "Master BL", value: "Master BL" },
                          { label: "Direct BL", value: "Direct BL" },
                        ]}
                      />
                    )}
                  />
                </div>
                <div className="form-field-cell bl-master-readonly-field">
                  <label className="form-field-label">MPCI ID (UAE)</label>
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
        nextLabel="Submit B/L"
        nextIcon={<AppIcon icon={Icons.check} size={16} />}
        nextLoading={isSubmitting}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
