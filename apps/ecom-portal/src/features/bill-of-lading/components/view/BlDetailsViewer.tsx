// Modified by Sekar Nagarajan (2026-10-19 19:05)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import type { ColDef } from "ag-grid-community";
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { useWizardStepTitles } from "../../../../i18n/use-module-titles";
import { BookingModuleStyles } from "../../../booking/components/booking-module-styles";
import { SiPreviewCargoReview } from "../../../shipping-instruction/components/SiPreviewCargoReview";
import type { SiPartyRoleKey } from "../../../shipping-instruction/utils/si-party.utils";
import { useBLDetailQuery } from "../../api/bl.queries";
import type {
  BLChargeLine,
  BLFileUploadItem,
  BLParty,
  BLPreviewFields,
  BLRowStatus,
  BLDTO,
} from "../../types/bl.types";
import { getBLStatusLabel } from "../../utils/bl-status";
import { BlLoadingCenter } from "../bl-loading-center";
import {
  BlPreviewEmpty,
  BlPreviewEmptyPartyCard,
  BlPreviewFieldGrid,
  BlPreviewPartyCard,
  BlPreviewSection,
} from "../preview/bl-preview-section";
import { BlRouteBand } from "./BlRouteBand";

const { Text } = Typography;

export interface BlViewActivityHints {
  createdDate?: string | null;
  confirmedDate?: string | null;
  status?: BLRowStatus;
  isLocked?: boolean;
}

interface BlDetailsViewerProps {
  blNo: string;
  activityHints?: BlViewActivityHints;
  /** Hide the Routing section when the host already shows the route (drawer hero). */
  showRouting?: boolean;
}

interface ActivityEvent {
  id: string;
  action: string;
  by: string;
  at: string;
  note?: string;
}

type ActivityTone =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted";

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

const REVIEW_PARTY_ROLES: SiPartyRoleKey[] = [
  "shipper",
  "consignee",
  "notify",
  "forwarder",
];

const EXTRA_PARTY_ROLES: SiPartyRoleKey[] = [
  "agreementParty",
  "notify2",
  "notify3",
  "warehouse",
];

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

/** Date-only text for ISO / "YYYY-MM-DD HH:mm" strings; falls back to the raw value. */
function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function partyForRole(
  parties: BLDTO["parties"],
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

function getActivityStepVisual(action: string): {
  icon: LucideIcon;
  tone: ActivityTone;
} {
  const key = action.toLowerCase();
  if (key.includes("lock") || key.includes("cancel")) {
    return { icon: Icons.circleX, tone: "error" };
  }
  if (key.includes("confirm") || key.includes("issued") || key.includes("print")) {
    return { icon: Icons.checkCircle, tone: "success" };
  }
  if (key.includes("submit")) {
    return { icon: Icons.send, tone: "info" };
  }
  if (key.includes("document") || key.includes("upload")) {
    return { icon: Icons.inbox, tone: "warning" };
  }
  if (key.includes("creat") || key.includes("draft")) {
    return { icon: Icons.filePlus, tone: "primary" };
  }
  return { icon: Icons.history, tone: "muted" };
}

function ActivitySteps({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="bl-activity-steps custom-scroll">
      {events.map((event, index) => {
        const visual = getActivityStepVisual(event.action);
        const isLast = index === events.length - 1;
        return (
          <li
            key={event.id}
            className={[
              "bl-activity-steps__item",
              isLast ? "bl-activity-steps__item--last" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="bl-activity-steps__rail" aria-hidden>
              <span
                className={`bl-activity-steps__icon bl-activity-steps__icon--${visual.tone} app-icon-inherit`}
              >
                <AppIcon icon={visual.icon} size={14} />
              </span>
              {!isLast ? (
                <span className="bl-activity-steps__connector" />
              ) : null}
            </div>
            <div className="bl-activity-steps__body">
              <Text strong className="bl-activity-steps__action">
                {event.action}
              </Text>
              <Text type="secondary" className="bl-activity-steps__meta">
                {event.by} · {event.at}
              </Text>
              {event.note ? (
                <Text className="bl-activity-steps__note">{event.note}</Text>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DocumentChips({ files }: { files: BLFileUploadItem[] }) {
  const { t } = useTranslation("bill-of-lading");
  return (
    <div className="bl-doc-grid">
      {files.map((file) => (
        <div key={file.id} className="booking-review__doc-chip">
          <span className="booking-review__doc-chip-name">
            <AppIcon icon={Icons.fileText} size={16} />
            <Text strong ellipsis className="bl-doc-chip__file" title={file.fileName}>
              {file.fileName}
            </Text>
          </span>
          <Text type="secondary" className="bl-doc-chip__meta">
            {t(`wizard.files.categories.${file.category.toLowerCase()}`, {
              defaultValue: file.category,
            })}
            {" · "}
            {dash(file.uploadedAt)}
          </Text>
        </div>
      ))}
    </div>
  );
}

function buildPreviewRows(
  preview: BLPreviewFields | undefined,
  t: TranslateFn,
): { label: string; value: string }[] {
  if (!preview) return [];
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value?: string | null) => {
    if (value === undefined || value === null || value === "") return;
    rows.push({ label, value });
  };
  push(t("labels.declaredValue"), preview.declaredValue);
  push(t("wizard.preview.customerRemarks"), preview.siCustRemarks);
  push(t("wizard.preview.aesNumber"), preview.siAesNumber);
  if (preview.aesDisclaimer) {
    push(
      t("wizard.preview.aesDisclaimer"),
      preview.aesDisclaimer === "provided"
        ? t("wizard.preview.aesProvided")
        : t("wizard.preview.aesNotApplicable"),
    );
  }
  push(t("labels.packingList"), preview.packingList);
  push(t("labels.invoiceUpload"), preview.invoiceUpload);
  push(t("wizard.preview.blTypeUae"), preview.blTypeUae);
  push(t("wizard.preview.mpciIdUae"), preview.mpciIdUae);
  push(t("labels.acidValue"), preview.acidValue);
  return rows;
}

function buildBlActivityEvents(
  params: {
    status: BLRowStatus;
    issuedAt: string | null;
    printCount: number;
    fileCount: number;
    hints?: BlViewActivityHints;
  },
  t: TranslateFn,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const by = t("labels.system");
  events.push({
    id: "bl-created",
    action: t("activity.draftCreated"),
    by,
    at: params.hints?.createdDate || "—",
    note: t("labels.statusPrefix", {
      status: getBLStatusLabel(params.status, t),
    }),
  });
  if (
    params.status === "S" ||
    params.status === "C" ||
    params.status === "I" ||
    params.hints?.confirmedDate
  ) {
    events.push({
      id: "bl-confirmed",
      action: t("activity.confirmed"),
      by,
      at: params.hints?.confirmedDate || "—",
    });
  }
  if (params.issuedAt || params.status === "I") {
    events.push({
      id: "bl-issued",
      action: t("activity.issued"),
      by,
      at: params.issuedAt || "—",
    });
  }
  if (params.hints?.isLocked) {
    events.push({
      id: "bl-locked",
      action: t("activity.locked"),
      by,
      at: "—",
    });
  }
  if (params.printCount > 0) {
    events.push({
      id: "bl-printed",
      action: t("activity.printed"),
      by,
      at: "—",
      note: t("labels.printCount", { count: params.printCount }),
    });
  }
  if (params.fileCount > 0) {
    events.push({
      id: "bl-docs",
      action: t("activity.documentsUploaded"),
      by,
      at: "—",
      note: t("labels.fileCount", { count: params.fileCount }),
    });
  }
  return events;
}

/**
 * Read-only B/L details body shared by the full-page view and the list
 * drawer. Sections: master → routing band → parties → cargo → preview
 * fields → charges → insurance → documents | activity → ENS.
 */
export function BlDetailsViewer({
  blNo,
  activityHints,
  showRouting = true,
}: BlDetailsViewerProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const { data, isLoading, isError } = useBLDetailQuery(blNo);

  const chargeColDefs: ColDef[] = useMemo(
    () => [
      {
        field: "chargeCode",
        headerName: t("columns.code"),
        minWidth: 100,
      },
      {
        field: "description",
        headerName: t("columns.description"),
        minWidth: 180,
        flex: 1,
      },
      {
        field: "prepaidCollect",
        headerName: t("columns.pce"),
        minWidth: 90,
      },
      {
        field: "payByCustType",
        headerName: t("columns.payor"),
        minWidth: 110,
      },
      {
        headerName: t("columns.amount"),
        minWidth: 120,
        type: "rightAligned",
        valueGetter: (p) => {
          const row = p.data as BLChargeLine | undefined;
          return row ? `${row.amount} ${row.currency}` : "";
        },
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <div className="bl-panel">
        <BlLoadingCenter />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bl-panel">
        <Text type="danger">{t("empty.unableToLoadDetails")}</Text>
      </div>
    );
  }

  const files = data.files ?? [];
  const charges = data.charges ?? [];
  const insuranceRequired = Boolean(data.insurance?.isInsuranceRequired);
  const activity = buildBlActivityEvents(
    {
      status: data.status,
      issuedAt: data.issuedAt,
      printCount: data.printCount,
      fileCount: files.length,
      hints: activityHints,
    },
    t,
  );
  const previewRows = buildPreviewRows(data.preview, t);

  const extraPartyRoles = EXTRA_PARTY_ROLES.filter((role) =>
    Boolean(partyForRole(data.parties, role)?.name),
  );

  const masterRows = [
    { label: t("labels.bookingNumber"), value: dash(data.bookingNo) },
    { label: t("labels.siNumber"), value: dash(data.siNo) },
    { label: t("labels.agencyRef"), value: dash(data.agencyRefNo) },
    { label: t("labels.mcn"), value: dash(data.mcnNo) },
    { label: t("labels.blType"), value: dash(data.blType) },
    {
      label: t("labels.releaseType"),
      value:
        data.releaseType === "O" ? t("labels.original") : t("labels.telex"),
    },
    { label: t("labels.freightOption"), value: dash(data.freightOption) },
    { label: t("labels.issuedOn"), value: formatDate(data.issuedAt) },
  ];

  return (
    <div className="booking-review bl-view-sections bl-view-sections--single">
      <BookingModuleStyles />

      <BlPreviewSection
        variant="airy"
        title={WIZARD_STEP_TITLES.masterDetails}
      >
        <BlPreviewFieldGrid items={masterRows} />
      </BlPreviewSection>

      {showRouting ? (
        <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.routing}>
          {data.routing ? (
            <BlRouteBand routing={data.routing} />
          ) : (
            <BlPreviewEmpty label={t("empty.noRouting")} />
          )}
        </BlPreviewSection>
      ) : null}

      <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.parties}>
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

      <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.cargoDetails}>
        <SiPreviewCargoReview containers={data.containers} />
      </BlPreviewSection>

      {previewRows.length > 0 ? (
        <BlPreviewSection variant="airy" title={t("labels.previewFields")}>
          <BlPreviewFieldGrid items={previewRows} />
        </BlPreviewSection>
      ) : null}

      {charges.length > 0 ? (
        <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.charges}>
          <div className="bl-charges-grid responsive-table-wrap custom-scroll ag-theme-alpine">
            <ListView
              rowData={charges}
              columnDefs={chargeColDefs}
              showToolbar={false}
              sideBar={false}
              pagination
              paginationPageSize={10}
              pageSizeOptions={[10, 20, 50]}
              gridOptions={{ animateRows: true }}
            />
          </div>
        </BlPreviewSection>
      ) : null}

      <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.insurance}>
        {insuranceRequired && data.insurance ? (
          <BlPreviewFieldGrid
            items={[
              {
                label: t("labels.cargoValue"),
                value: `${dash(data.insurance.cargoValue)} ${dash(
                  data.insurance.currency,
                )}`,
              },
              {
                label: t("labels.policyNo"),
                value: dash(data.insurance.policyNo),
              },
              {
                label: t("labels.termsAccepted"),
                value: data.insurance.termsAccepted
                  ? t("labels.yes")
                  : t("labels.no"),
              },
              {
                label: t("labels.optOut"),
                value: data.insurance.optOut ? t("labels.yes") : t("labels.no"),
              },
            ]}
          />
        ) : (
          <BlPreviewEmpty label={t("empty.insuranceNotRequired")} />
        )}
      </BlPreviewSection>

      <div className="bl-view-row bl-view-row--2 bl-view-row--sections">
        <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.fileUpload}>
          {files.length === 0 ? (
            <BlPreviewEmpty label={t("empty.noDocuments")} />
          ) : (
            <DocumentChips files={files} />
          )}
        </BlPreviewSection>

        <BlPreviewSection variant="airy" title={t("labels.activity")}>
          {activity.length === 0 ? (
            <BlPreviewEmpty label={t("empty.noActivity")} />
          ) : (
            <ActivitySteps events={activity} />
          )}
        </BlPreviewSection>
      </div>

      {data.ens?.euCustomsZone ? (
        <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.ensDetails}>
          <BlPreviewFieldGrid
            items={[
              { label: t("labels.blType"), value: dash(data.ens.blType) },
              {
                label: t("labels.filingType"),
                value: dash(data.ens.ensFilingType),
              },
              {
                label: t("labels.paymentMethod"),
                value: dash(data.ens.paymentMethod),
              },
              {
                label: t("labels.declarant"),
                value: dash(data.ens.declarantName),
              },
              { label: t("labels.buyer"), value: dash(data.ens.buyerName) },
              { label: t("labels.seller"), value: dash(data.ens.sellerName) },
            ]}
          />
        </BlPreviewSection>
      ) : null}
    </div>
  );
}
