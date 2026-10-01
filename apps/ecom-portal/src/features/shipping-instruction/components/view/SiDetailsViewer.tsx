// Modified by Sekar Nagarajan (2026-09-29 16:45)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import type { ColDef } from "ag-grid-community";
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { useWizardStepTitles } from "../../../../i18n/use-module-titles";
import { BookingModuleStyles } from "../../../booking/components/booking-module-styles";
import { useSiDetailQuery } from "../../api/si.queries";
import type { SIChargeLine, SIParty, SIDTO, SIStatus } from "../../types/si.types";
import type { SiPartyRoleKey } from "../../utils/si-party.utils";
import { getSiStatusLabel } from "../../utils/si-status";
import {
  SiPreviewEmpty,
  SiPreviewEmptyPartyCard,
  SiPreviewFieldGrid,
  SiPreviewPartyCard,
  SiPreviewSection,
} from "../preview/si-preview-section";
import { SiLoadingCenter } from "../si-loading-center";
import { SiPreviewCargoReview } from "../SiPreviewCargoReview";

const { Text } = Typography;

export interface SiViewActivityHints {
  createdDate?: string | null;
  submittedDate?: string | null;
  status?: string;
}

interface SiDetailsViewerProps {
  siId: string;
  activityHints?: SiViewActivityHints;
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

type ActivityTranslateFn = (
  key: string,
  options?: Record<string, unknown>,
) => string;

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
  parties: SIDTO["parties"],
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

function getActivityStepVisual(eventId: string): {
  icon: LucideIcon;
  tone: ActivityTone;
} {
  switch (eventId) {
    case "si-created":
      return { icon: Icons.filePlus, tone: "primary" };
    case "si-submitted":
      return { icon: Icons.send, tone: "info" };
    case "si-bl-linked":
      return { icon: Icons.checkCircle, tone: "success" };
    case "si-docs":
      return { icon: Icons.inbox, tone: "warning" };
    default:
      return { icon: Icons.history, tone: "muted" };
  }
}

function ActivitySteps({ events }: { events: ActivityEvent[] }) {
  return (
    <ol className="si-activity-steps custom-scroll">
      {events.map((event, index) => {
        const visual = getActivityStepVisual(event.id);
        const isLast = index === events.length - 1;
        return (
          <li
            key={event.id}
            className={[
              "si-activity-steps__item",
              isLast ? "si-activity-steps__item--last" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="si-activity-steps__rail" aria-hidden>
              <span
                className={`si-activity-steps__icon si-activity-steps__icon--${visual.tone} app-icon-inherit`}
              >
                <AppIcon icon={visual.icon} size={14} />
              </span>
              {!isLast ? (
                <span className="si-activity-steps__connector" />
              ) : null}
            </div>
            <div className="si-activity-steps__body">
              <Text strong className="si-activity-steps__action">
                {event.action}
              </Text>
              <Text type="secondary" className="si-activity-steps__meta">
                {event.by} · {event.at}
              </Text>
              {event.note ? (
                <Text className="si-activity-steps__note">{event.note}</Text>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function buildSiActivityEvents(
  params: {
    siNo: string | null;
    blNo?: string | null;
    fileCount: number;
    hints?: SiViewActivityHints;
  },
  t: ActivityTranslateFn,
): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const by = t("activity.system");
  const statusNote =
    params.hints?.status != null && params.hints.status !== ""
      ? t("activity.statusNote", {
          status: getSiStatusLabel(params.hints.status as SIStatus, t),
        })
      : undefined;
  events.push({
    id: "si-created",
    action: t("activity.draftCreated"),
    by,
    at: params.hints?.createdDate || "—",
    note: statusNote,
  });
  if (params.siNo || params.hints?.submittedDate) {
    events.push({
      id: "si-submitted",
      action: t("activity.submitted"),
      by,
      at: params.hints?.submittedDate || "—",
      note: params.siNo
        ? t("activity.siNoNote", { siNo: params.siNo })
        : undefined,
    });
  }
  if (params.blNo) {
    events.push({
      id: "si-bl-linked",
      action: t("activity.blLinked"),
      by,
      at: "—",
      note: t("activity.blNoNote", { blNo: params.blNo }),
    });
  }
  if (params.fileCount > 0) {
    events.push({
      id: "si-docs",
      action: t("activity.documentsUploaded"),
      by,
      at: "—",
      note: t("activity.filesNote", { count: params.fileCount }),
    });
  }
  return events;
}

export function SiDetailsViewer({
  siId,
  activityHints,
}: SiDetailsViewerProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const WIZARD_STEP_TITLES = useWizardStepTitles();
  const { data, isLoading, isError } = useSiDetailQuery(siId);

  const chargeColDefs: ColDef[] = useMemo(
    () => [
      { field: "chargeCode", headerName: t("columns.code"), minWidth: 100 },
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
        headerName: t("columns.amount"),
        minWidth: 120,
        valueGetter: (p) => {
          const row = p.data as SIChargeLine | undefined;
          return row ? `${row.amount} ${row.currency}` : "";
        },
      },
    ],
    [t],
  );

  if (isLoading) {
    return (
      <div className="si-panel">
        <SiLoadingCenter />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="si-panel">
        <Text type="danger">{t("empty.unableToLoadDetails")}</Text>
      </div>
    );
  }

  const files = data.files ?? [];
  const charges = data.charges ?? [];
  const insuranceRequired = Boolean(data.insurance?.isInsuranceRequired);
  const activity = buildSiActivityEvents(
    {
      siNo: data.siNo,
      blNo: data.blNo,
      fileCount: files.length,
      hints: activityHints,
    },
    t,
  );

  const reviewRoleSet = new Set(REVIEW_PARTY_ROLES);
  const extraPartyRoles = (
    ["agreementParty", "notify2", "notify3", "warehouse"] as SiPartyRoleKey[]
  ).filter((role) => {
    const party = partyForRole(data.parties, role);
    return party?.name && !reviewRoleSet.has(role);
  });

  const masterRows = [
    { label: t("labels.bookingNumber"), value: dash(data.bookingNo) },
    {
      label: t("labels.siNumber"),
      value: dash(data.siNo) === "—" ? t("labels.draft") : dash(data.siNo),
    },
    { label: t("labels.blType"), value: dash(data.blType) },
    {
      label: t("labels.releaseType"),
      value:
        data.releaseType === "O" ? t("labels.original") : t("labels.telex"),
    },
    { label: t("labels.freightOption"), value: dash(data.freightOption) },
    { label: t("labels.agencyRefFull"), value: dash(data.agencyRefNo) },
  ];

  return (
    <div className="booking-review si-view-sections si-view-sections--single">
      <BookingModuleStyles />

      <SiPreviewSection
        variant="airy"
        title={WIZARD_STEP_TITLES.masterDetails}
      >
        <SiPreviewFieldGrid items={masterRows} />
      </SiPreviewSection>

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.parties}>
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

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.routing}>
        {data.routing ? (
          <SiPreviewFieldGrid
            items={[
              {
                label: t("labels.vesselVoyage"),
                value: dash(data.routing.vesselVoyage),
              },
              { label: t("labels.origin"), value: dash(data.routing.originPrint) },
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

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.insurance}>
        {insuranceRequired && data.insurance ? (
          <SiPreviewFieldGrid
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
                  ? t("common:actions.yes")
                  : t("common:actions.no"),
              },
              {
                label: t("labels.optOut"),
                value: data.insurance.optOut
                  ? t("common:actions.yes")
                  : t("common:actions.no"),
              },
            ]}
          />
        ) : (
          <SiPreviewEmpty label={t("empty.insuranceNotRequired")} />
        )}
      </SiPreviewSection>

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.cargoDetails}>
        <SiPreviewCargoReview containers={data.containers} />
      </SiPreviewSection>

      {data.ens?.ensRequired ? (
        <SiPreviewSection
          variant="airy"
          title={WIZARD_STEP_TITLES.ensDetails}
        >
          <SiPreviewFieldGrid
            items={[
              {
                label: t("labels.euCustomsZone"),
                value: dash(data.ens.euCustZone),
              },
              {
                label: t("labels.blTypeEns"),
                value: dash(data.ens.blTypeEns),
              },
              {
                label: t("labels.filingType"),
                value: dash(data.ens.ensFillingType),
              },
              {
                label: t("labels.paymentMethod"),
                value: dash(data.ens.paymentMethod),
              },
              {
                label: t("labels.declarant"),
                value: dash(data.ens.declarant?.name),
              },
              { label: t("labels.buyer"), value: dash(data.ens.buyer?.name) },
              { label: t("labels.seller"), value: dash(data.ens.seller?.name) },
            ]}
          />
        </SiPreviewSection>
      ) : null}

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.fileUpload}>
        {files.length === 0 ? (
          <SiPreviewEmpty label={t("empty.noDocuments")} />
        ) : (
          <SiPreviewFieldGrid
            items={files.map((file) => ({
              label: file.fileType || t("labels.file"),
              value: `${file.fileName} (${file.sizeKb} KB)`,
            }))}
          />
        )}
      </SiPreviewSection>

      <SiPreviewSection variant="airy" title={t("labels.activity")}>
        {activity.length === 0 ? (
          <SiPreviewEmpty label={t("empty.noActivity")} />
        ) : (
          <ActivitySteps events={activity} />
        )}
      </SiPreviewSection>

      {charges.length > 0 ? (
        <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.charges}>
          <div className="si-charges-grid responsive-table-wrap custom-scroll ag-theme-alpine">
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
        </SiPreviewSection>
      ) : null}
    </div>
  );
}
