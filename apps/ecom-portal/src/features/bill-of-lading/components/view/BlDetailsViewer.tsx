// Modified by Sekar Nagarajan (2026-09-08 15:03)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import type { ColDef } from "ag-grid-community";
import { Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
import { BookingModuleStyles } from "../../../booking/components/booking-module-styles";
import { SiPreviewCargoReview } from "../../../shipping-instruction/components/SiPreviewCargoReview";
import type { SiPartyRoleKey } from "../../../shipping-instruction/utils/si-party.utils";
import { useBLDetailQuery } from "../../api/bl.queries";
import type {
  BLChargeLine,
  BLParty,
  BLRowStatus,
  BLDTO,
} from "../../types/bl.types";
import { BL_STATUS_LABELS } from "../../types/bl.types";
import { BlLoadingCenter } from "../bl-loading-center";
import {
  BlPreviewEmpty,
  BlPreviewEmptyPartyCard,
  BlPreviewFieldGrid,
  BlPreviewPartyCard,
  BlPreviewSection,
} from "../preview/bl-preview-section";

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

function buildBlActivityEvents(params: {
  status: BLRowStatus;
  issuedAt: string | null;
  printCount: number;
  fileCount: number;
  hints?: BlViewActivityHints;
}): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const by = "System";
  events.push({
    id: "bl-created",
    action: "B/L Draft Created",
    by,
    at: params.hints?.createdDate || "—",
    note: `Status: ${BL_STATUS_LABELS[params.status]}`,
  });
  if (
    params.status === "S" ||
    params.status === "C" ||
    params.status === "I" ||
    params.hints?.confirmedDate
  ) {
    events.push({
      id: "bl-confirmed",
      action: "B/L Confirmed",
      by,
      at: params.hints?.confirmedDate || "—",
    });
  }
  if (params.issuedAt || params.status === "I") {
    events.push({
      id: "bl-issued",
      action: "B/L Issued",
      by,
      at: params.issuedAt || "—",
    });
  }
  if (params.hints?.isLocked) {
    events.push({
      id: "bl-locked",
      action: "B/L Locked",
      by,
      at: "—",
    });
  }
  if (params.printCount > 0) {
    events.push({
      id: "bl-printed",
      action: "B/L Printed",
      by,
      at: "—",
      note: `Print count: ${params.printCount}`,
    });
  }
  if (params.fileCount > 0) {
    events.push({
      id: "bl-docs",
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
      const row = p.data as BLChargeLine | undefined;
      return row ? `${row.amount} ${row.currency}` : "";
    },
  },
];

export function BlDetailsViewer({
  blNo,
  activityHints,
}: BlDetailsViewerProps) {
  const { data, isLoading, isError } = useBLDetailQuery(blNo);

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
        <Text type="danger">Unable to load Bill of Lading details.</Text>
      </div>
    );
  }

  const files = data.files ?? [];
  const charges = data.charges ?? [];
  const insuranceRequired = Boolean(data.insurance?.isInsuranceRequired);
  const activity = buildBlActivityEvents({
    status: data.status,
    issuedAt: data.issuedAt,
    printCount: data.printCount,
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
    { label: "SI number", value: dash(data.siNo) },
    { label: "B/L type", value: dash(data.blType) },
    {
      label: "Release type",
      value: data.releaseType === "O" ? "Original" : "Telex",
    },
    { label: "Freight option", value: dash(data.freightOption) },
    {
      label: "Route",
      value: `${dash(data.origin)} → ${dash(data.delivery)}`,
    },
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

      <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.routing}>
        {data.routing ? (
          <BlPreviewFieldGrid
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
          <BlPreviewEmpty label="No routing details" />
        )}
      </BlPreviewSection>

      <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.insurance}>
        {insuranceRequired && data.insurance ? (
          <BlPreviewFieldGrid
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
          <BlPreviewEmpty label="Insurance not required for this bill of lading." />
        )}
      </BlPreviewSection>

      <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.cargoDetails}>
        <SiPreviewCargoReview containers={data.containers} />
      </BlPreviewSection>

      {data.ens?.euCustomsZone ? (
        <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.ensDetails}>
          <BlPreviewFieldGrid
            items={[
              { label: "B/L type", value: dash(data.ens.blType) },
              {
                label: "Filing type",
                value: dash(data.ens.ensFilingType),
              },
              {
                label: "Payment method",
                value: dash(data.ens.paymentMethod),
              },
              {
                label: "Declarant",
                value: dash(data.ens.declarantName),
              },
              { label: "Buyer", value: dash(data.ens.buyerName) },
              { label: "Seller", value: dash(data.ens.sellerName) },
            ]}
          />
        </BlPreviewSection>
      ) : null}

      <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.fileUpload}>
        {files.length === 0 ? (
          <BlPreviewEmpty label="No documents uploaded" />
        ) : (
          <BlPreviewFieldGrid
            items={files.map((file) => ({
              label: file.category || "File",
              value: `${file.fileName} · ${file.uploadedAt}`,
            }))}
          />
        )}
      </BlPreviewSection>

      <BlPreviewSection variant="airy" title="Activity">
        {activity.length === 0 ? (
          <BlPreviewEmpty label="No activity recorded" />
        ) : (
          <ActivitySteps events={activity} />
        )}
      </BlPreviewSection>

      {charges.length > 0 ? (
        <BlPreviewSection variant="airy" title={WIZARD_STEP_TITLES.charges}>
          <div className="bl-charges-grid responsive-table-wrap custom-scroll ag-theme-alpine">
            <ListView
              rowData={charges}
              columnDefs={CHARGE_COL_DEFS}
              showToolbar={false}
              pagination
              paginationPageSize={10}
              gridOptions={{ animateRows: true }}
            />
          </div>
        </BlPreviewSection>
      ) : null}
    </div>
  );
}
