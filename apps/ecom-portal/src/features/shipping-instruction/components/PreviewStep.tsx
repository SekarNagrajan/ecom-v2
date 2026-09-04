// Modified by Sekar Nagarajan (2026-09-05 01:05)
/**
 * Preview — airy review of wizard inputs with Edit → jump to step.
 */
import { AppButton } from "@solverminds/shared-ui";
import { Tag, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../constants/module-titles";
import { BookingModuleStyles } from "../../booking/components/booking-module-styles";
import type { SIWizardStepId } from "../config/si-wizard-config";
import { DEFAULT_SI_WIZARD_CONFIG } from "../config/si-wizard-config";
import { useSiWizardConfigQuery } from "../hooks/use-si-wizard-config";
import type { SIParty, SIWizardStepProps } from "../types/si.types";
import type { SiPartyRoleKey } from "../utils/si-party.utils";
import {
  SiPreviewEmpty,
  SiPreviewEmptyPartyCard,
  SiPreviewFieldGrid,
  SiPreviewPartyCard,
  SiPreviewSection,
} from "./preview/si-preview-section";
import { SiPreviewCargoReview } from "./SiPreviewCargoReview";

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

function partyForRole(
  parties: SIWizardStepProps["data"]["parties"],
  role: SiPartyRoleKey,
): SIParty | undefined {
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
  onCancel,
  onGoToStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { data: config = DEFAULT_SI_WIZARD_CONFIG } = useSiWizardConfigQuery();
  const go = (stepId: SIWizardStepId) => {
    onGoToStep?.(stepId);
  };

  const releaseLabel =
    data.releaseType === "O"
      ? "Original"
      : data.releaseType === "T"
      ? "Telex Release"
      : dash(data.releaseType);

  const masterRows: { label: string; value: string }[] = [
    { label: "Booking number", value: dash(data.bookingNo) },
    {
      label: "SI number",
      value: dash(data.siNo) === "—" ? "Draft" : dash(data.siNo),
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
    data.siNo?.trim() || data.bookingNo?.trim() || "Draft SI",
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
      <div className="custom-scroll form-step-scroll booking-preview-scroll booking-review si-preview-scroll">
        <SiPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.masterDetails}
          onEdit={() => go("master")}
        >
          <SiPreviewFieldGrid items={masterRows} />
        </SiPreviewSection>

        <SiPreviewSection
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
                    <SiPreviewPartyCard
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
                    <SiPreviewEmptyPartyCard roleKey={role} />
                  )}
                </div>
              );
            })}
            {extraPartyRoles.map((role) => {
              const party = partyForRole(data.parties, role);
              if (!party?.name) return null;
              return (
                <div key={role} className="booking-party-grid__col">
                  <SiPreviewPartyCard roleKey={role} party={party} />
                </div>
              );
            })}
          </div>
        </SiPreviewSection>

        {config.showRouting ? (
          <SiPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.routing}
            onEdit={() => go("routing")}
          >
            {data.routing ? (
              <SiPreviewFieldGrid
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
              <SiPreviewEmpty label="No routing details" />
            )}
          </SiPreviewSection>
        ) : null}

        <SiPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.cargoDetails}
          onEdit={() => go("cargo")}
        >
          <SiPreviewCargoReview containers={data.containers} />
        </SiPreviewSection>

        {config.showInsurance ? (
          <SiPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.insurance}
            onEdit={() => go("insurance")}
          >
            {data.insurance ? (
              <SiPreviewFieldGrid
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
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showCargoProtect ? (
          <SiPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.cargoProtect}
            onEdit={() => go("cargoProtect")}
          >
            {data.cargoProtect && data.cargoProtect.length > 0 ? (
              <ul className="si-preview-list">
                {data.cargoProtect.map((line) => (
                  <li key={line.id}>
                    {line.productCode} — {line.description} ({line.amount}{" "}
                    {line.currency})
                  </li>
                ))}
              </ul>
            ) : (
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showChargesInWizard ? (
          <SiPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.charges}
            onEdit={() => go("charges")}
          >
            {data.charges && data.charges.length > 0 ? (
              <ul className="si-preview-list">
                {data.charges.map((line) => (
                  <li key={line.id}>
                    {line.chargeCode || line.description || "Charge"} —{" "}
                    {dash(line.amount)} {dash(line.currency)}
                  </li>
                ))}
              </ul>
            ) : (
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showEns ? (
          <SiPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.ensDetails}
            onEdit={() => go("ens")}
          >
            {data.ens?.ensRequired ? (
              <SiPreviewFieldGrid
                items={[
                  { label: "ENS required", value: "Yes" },
                  {
                    label: "EU customs zone",
                    value: data.ens.euCustZone === "Y" ? "Yes" : "No",
                  },
                  {
                    label: "Type of B/L",
                    value: dash(data.ens.blTypeEns),
                  },
                  {
                    label: "ENS filing",
                    value: dash(data.ens.ensFillingType),
                  },
                  {
                    label: "Payment method",
                    value: dash(data.ens.paymentMethod),
                  },
                  ...(data.ens.ensFillingType === "Single Filing"
                    ? [
                        {
                          label: "Buyer",
                          value: dash(data.ens.buyer?.name),
                        },
                        {
                          label: "Seller",
                          value: dash(data.ens.seller?.name),
                        },
                      ]
                    : [
                        {
                          label: "Declarant",
                          value: dash(data.ens.declarant?.name),
                        },
                      ]),
                ]}
              />
            ) : (
              <Tag>ENS not required</Tag>
            )}
          </SiPreviewSection>
        ) : null}

        {config.showChargeTab ? (
          <SiPreviewSection
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
              <SiPreviewEmpty />
            )}
          </SiPreviewSection>
        ) : null}

        {config.showFileUpload ? (
          <SiPreviewSection
            variant="airy"
            title={WIZARD_STEP_TITLES.fileUpload}
            onEdit={() => go("files")}
          >
            {data.files && data.files.length > 0 ? (
              <ul className="si-preview-list">
                {data.files.map((file) => (
                  <li key={file.id}>
                    {file.fileName} ({file.fileType}) — {file.sizeKb} KB
                  </li>
                ))}
              </ul>
            ) : (
              <SiPreviewEmpty label="No files uploaded" />
            )}
          </SiPreviewSection>
        ) : null}

        <SiPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.references}
          onEdit={() => go("references")}
        >
          {data.referenceFields && data.referenceFields.length > 0 ? (
            <SiPreviewFieldGrid
              items={data.referenceFields.map((field) => ({
                label: field.name,
                value: dash(field.value),
              }))}
            />
          ) : (
            <SiPreviewEmpty label="No reference fields" />
          )}
        </SiPreviewSection>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
        </div>
        <AppButton
          type="primary"
          icon={<AppIcon icon={Icons.check} size={16} />}
          onClick={onSubmit}
          loading={isSubmitting}
        >
          Submit SI
        </AppButton>
      </div>
    </div>
  );
}
