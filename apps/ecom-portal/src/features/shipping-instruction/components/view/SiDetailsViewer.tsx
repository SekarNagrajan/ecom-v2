// Modified by Sekar Nagarajan (2026-09-08 14:54)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import { Typography } from "antd";
import type { ColDef } from "ag-grid-community";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
import { BookingModuleStyles } from "../../../booking/components/booking-module-styles";
import { useSiDetailQuery } from "../../api/si.queries";
import type { SIChargeLine, SIParty, SIDTO } from "../../types/si.types";
import type { SiPartyRoleKey } from "../../utils/si-party.utils";
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

function getActivityStepVisual(action: string): {
  icon: LucideIcon;
  tone: ActivityTone;
} {
  const key = action.toLowerCase();
  if (key.includes("cancel") || key.includes("reject")) {
    return { icon: Icons.circleX, tone: "error" };
  }
  if (
    key.includes("confirm") ||
    key.includes("approv") ||
    key.includes("linked")
  ) {
    return { icon: Icons.checkCircle, tone: "success" };
  }
  if (key.includes("submit") || key.includes("sent")) {
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
    <ol className="si-activity-steps custom-scroll">
      {events.map((event, index) => {
        const visual = getActivityStepVisual(event.action);
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

function buildSiActivityEvents(params: {
  siNo: string | null;
  blNo?: string | null;
  fileCount: number;
  hints?: SiViewActivityHints;
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const by = "System";
  events.push({
    id: "si-created",
    action: "SI Draft Created",
    by,
    at: params.hints?.createdDate || "—",
    note: params.hints?.status ? `Status: ${params.hints.status}` : undefined,
  });
  if (params.siNo || params.hints?.submittedDate) {
    events.push({
      id: "si-submitted",
      action: "SI Submitted",
      by,
      at: params.hints?.submittedDate || "—",
      note: params.siNo ? `SI No: ${params.siNo}` : undefined,
    });
  }
  if (params.blNo) {
    events.push({
      id: "si-bl-linked",
      action: "B/L Linked",
      by,
      at: "—",
      note: `B/L No: ${params.blNo}`,
    });
  }
  if (params.fileCount > 0) {
    events.push({
      id: "si-docs",
      action: "Documents Uploaded",
      by,
      at: "—",
      note: `${params.fileCount} file(s)`,
    });
  }
  return events;
}

const CHARGE_COL_DEFS: ColDef[] = [
  { field: "chargeCode", headerName: "Code", minWidth: 100 },
  { field: "description", headerName: "Description", minWidth: 180, flex: 1 },
  { field: "prepaidCollect", headerName: "P/C/E", minWidth: 90 },
  {
    headerName: "Amount",
    minWidth: 120,
    valueGetter: (p) => {
      const row = p.data as SIChargeLine | undefined;
      return row ? `${row.amount} ${row.currency}` : "";
    },
  },
];

export function SiDetailsViewer({
  siId,
  activityHints,
}: SiDetailsViewerProps) {
  const { data, isLoading, isError } = useSiDetailQuery(siId);

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
        <Text type="danger">Unable to load Shipping Instruction details.</Text>
      </div>
    );
  }

  const files = data.files ?? [];
  const charges = data.charges ?? [];
  const insuranceRequired = Boolean(data.insurance?.isInsuranceRequired);
  const activity = buildSiActivityEvents({
    siNo: data.siNo,
    blNo: data.blNo,
    fileCount: files.length,
    hints: activityHints,
  });

  const reviewRoleSet = new Set(REVIEW_PARTY_ROLES);
  const extraPartyRoles = (
    ["agreementParty", "notify2", "notify3", "warehouse"] as SiPartyRoleKey[]
  ).filter((role) => {
    const party = partyForRole(data.parties, role);
    return party?.name && !reviewRoleSet.has(role);
  });

  const masterRows = [
    { label: "Booking number", value: dash(data.bookingNo) },
    {
      label: "SI number",
      value: dash(data.siNo) === "—" ? "Draft" : dash(data.siNo),
    },
    { label: "B/L type", value: dash(data.blType) },
    {
      label: "Release type",
      value: data.releaseType === "O" ? "Original" : "Telex",
    },
    { label: "Freight option", value: dash(data.freightOption) },
    { label: "Agency ref", value: dash(data.agencyRefNo) },
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

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.routing}>
        {data.routing ? (
          <SiPreviewFieldGrid
            items={[
              {
                label: "Vessel / voyage",
                value: dash(data.routing.vesselVoyage),
              },
              { label: "Origin", value: dash(data.routing.originPrint) },
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

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.insurance}>
        {insuranceRequired && data.insurance ? (
          <SiPreviewFieldGrid
            items={[
              {
                label: "Cargo value",
                value: `${dash(data.insurance.cargoValue)} ${dash(
                  data.insurance.currency,
                )}`,
              },
              {
                label: "Policy no",
                value: dash(data.insurance.policyNo),
              },
              {
                label: "Terms accepted",
                value: data.insurance.termsAccepted ? "Yes" : "No",
              },
              {
                label: "Opt out",
                value: data.insurance.optOut ? "Yes" : "No",
              },
            ]}
          />
        ) : (
          <SiPreviewEmpty label="Insurance not required for this shipping instruction." />
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
              { label: "EU customs zone", value: dash(data.ens.euCustZone) },
              { label: "B/L type (ENS)", value: dash(data.ens.blTypeEns) },
              { label: "Filing type", value: dash(data.ens.ensFillingType) },
              {
                label: "Payment method",
                value: dash(data.ens.paymentMethod),
              },
              {
                label: "Declarant",
                value: dash(data.ens.declarant?.name),
              },
              { label: "Buyer", value: dash(data.ens.buyer?.name) },
              { label: "Seller", value: dash(data.ens.seller?.name) },
            ]}
          />
        </SiPreviewSection>
      ) : null}

      <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.fileUpload}>
        {files.length === 0 ? (
          <SiPreviewEmpty label="No documents uploaded" />
        ) : (
          <SiPreviewFieldGrid
            items={files.map((file) => ({
              label: file.fileType || "File",
              value: `${file.fileName} (${file.sizeKb} KB)`,
            }))}
          />
        )}
      </SiPreviewSection>

      <SiPreviewSection variant="airy" title="Activity">
        {activity.length === 0 ? (
          <SiPreviewEmpty label="No activity recorded" />
        ) : (
          <ActivitySteps events={activity} />
        )}
      </SiPreviewSection>

      {charges.length > 0 ? (
        <SiPreviewSection variant="airy" title={WIZARD_STEP_TITLES.charges}>
          <div className="si-charges-grid responsive-table-wrap custom-scroll ag-theme-alpine">
            <ListView
              rowData={charges}
              columnDefs={CHARGE_COL_DEFS}
              showToolbar={false}
              pagination
              paginationPageSize={10}
              gridOptions={{ animateRows: true }}
            />
          </div>
        </SiPreviewSection>
      ) : null}
    </div>
  );
}
