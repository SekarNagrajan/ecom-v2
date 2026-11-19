// Modified by Sekar Nagarajan (2026-09-29 16:55)
/**
 * Preview — airy review of wizard inputs with Edit → jump to step.
 */
import { AppButton } from "@solverminds/shared-ui";
import { Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useWizardStepTitles } from "../../../i18n/use-module-titles";
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

const { Text } = Typography;

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

function blTypeDisplay(
  value: string,
  t: (key: string) => string,
): string {
  if (value === "Original") return t("labels.originalBl");
  if (value === "Seaway") return t("labels.seaWaybill");
  return dash(value);
}

function freightDisplay(
  value: string,
  t: (key: string) => string,
): string {
  if (value === "PREPAID") return t("labels.prepaid");
  if (value === "COLLECT") return t("labels.collect");
  return dash(value);
}

export function PreviewStep({
  data,
  onPrevious,
  onSubmit,
  onCancel,
  onGoToStep,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const { data: config = DEFAULT_SI_WIZARD_CONFIG } = useSiWizardConfigQuery();
  const go = (stepId: SIWizardStepId) => {
    onGoToStep?.(stepId);
  };

  const releaseLabel =
    data.releaseType === "O"
      ? t("labels.original")
      : data.releaseType === "T"
        ? t("labels.telexRelease")
        : dash(data.releaseType);

  const masterRows: { label: string; value: string }[] = [
    { label: t("labels.bookingNumber"), value: dash(data.bookingNo) },
    {
      label: t("labels.siNumber"),
      value: dash(data.siNo) === "—" ? t("labels.draft") : dash(data.siNo),
    },
    { label: t("labels.agencyRefFull"), value: dash(data.agencyRefNo) },
    { label: t("labels.blType"), value: blTypeDisplay(data.blType, t) },
    { label: t("labels.releaseType"), value: releaseLabel },
    {
      label: t("labels.freightOption"),
      value: freightDisplay(data.freightOption, t),
    },
  ];
  if (config.enableNvocc) {
    masterRows.push({
      label: t("labels.nvocc"),
      value: data.nvocc ? t("common:actions.yes") : t("common:actions.no"),
    });
  }
  if (config.enableT2LFiling) {
    masterRows.push({
      label: t("labels.t2lFiling"),
      value: data.t2lFiling ? t("common:actions.yes") : t("common:actions.no"),
    });
  }
  if (data.origin || data.loadPort || data.dischargePort || data.delivery) {
    masterRows.push(
      { label: t("labels.origin"), value: dash(data.origin) },
      { label: t("labels.loadPort"), value: dash(data.loadPort) },
      { label: t("labels.dischargePort"), value: dash(data.dischargePort) },
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
                          <Text type="warning"> {t("labels.toOrder")}</Text>
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
                    label: t("labels.vesselVoyage"),
                    value: dash(data.routing.vesselVoyage),
                  },
                  {
                    label: t("labels.origin"),
                    value: dash(data.routing.originPrint),
                  },
                  { label: t("labels.pol"), value: dash(data.routing.polPrint) },
                  { label: t("labels.pod"), value: dash(data.routing.podPrint) },
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
              <SiPreviewEmpty label={t("empty.noRouting")} />
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
                    label: t("labels.insuranceRequired"),
                    value: data.insurance.isInsuranceRequired
                      ? t("common:actions.yes")
                      : t("common:actions.no"),
                  },
                  {
                    label: t("labels.optOut"),
                    value: data.insurance.optOut
                      ? t("common:actions.yes")
                      : t("common:actions.no"),
                  },
                  {
                    label: t("labels.currency"),
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
                    {line.chargeCode ||
                      line.description ||
                      t("wizard.preview.chargeFallback")}{" "}
                    — {dash(line.amount)} {dash(line.currency)}
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
                  {
                    label: t("labels.ensRequired"),
                    value: t("common:actions.yes"),
                  },
                  {
                    label: t("labels.euCustomsZone"),
                    value:
                      data.ens.euCustZone === "Y"
                        ? t("common:actions.yes")
                        : t("common:actions.no"),
                  },
                  {
                    label: t("labels.typeOfBl"),
                    value: dash(data.ens.blTypeEns),
                  },
                  {
                    label: t("labels.ensFiling"),
                    value: dash(data.ens.ensFillingType),
                  },
                  {
                    label: t("labels.paymentMethod"),
                    value: dash(data.ens.paymentMethod),
                  },
                  ...(data.ens.ensFillingType === "Single Filing"
                    ? [
                        {
                          label: t("labels.buyer"),
                          value: dash(data.ens.buyer?.name),
                        },
                        {
                          label: t("labels.seller"),
                          value: dash(data.ens.seller?.name),
                        },
                      ]
                    : [
                        {
                          label: t("labels.declarant"),
                          value: dash(data.ens.declarant?.name),
                        },
                      ]),
                ]}
              />
            ) : (
              <Tag>{t("wizard.preview.ensNotRequired")}</Tag>
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
                {t("wizard.preview.chargeLinesOnFile", {
                  count: data.charges.length,
                })}
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
              <SiPreviewEmpty label={t("empty.noFilesUploaded")} />
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
            <SiPreviewEmpty label={t("empty.noReferenceFields")} />
          )}
        </SiPreviewSection>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            {t("common:actions.previous")}
          </AppButton>
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            {t("common:actions.cancel")}
          </AppButton>
        </div>
        <AppButton
          type="primary"
          icon={<AppIcon icon={Icons.check} size={16} />}
          onClick={onSubmit}
          loading={isSubmitting}
        >
          {t("actions.submitSi")}
        </AppButton>
      </div>
    </div>
  );
}
