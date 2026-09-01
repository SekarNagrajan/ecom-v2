// Modified by Sekar Nagarajan (2026-09-01 12:29)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import { Card, Typography } from "antd";
import type { ColDef } from "ag-grid-community";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
import { useSiDetailQuery } from "../../api/si.queries";
import type { SIChargeLine, SIParty } from "../../types/si.types";
import { SI_CARGO_LINE_COL_DEFS } from "../../utils/si-cargo-line-col-defs";
import { SiLoadingCenter } from "../si-loading-center";

const { Title, Text } = Typography;

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

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="si-meta-item">
      <span className="si-meta-item__label">{label}</span>
      <span className="si-meta-item__value">{value}</span>
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="si-section-title-row">
      {icon}
      <Title level={5} className="si-section-title">
        {children}
      </Title>
    </span>
  );
}

function PartyBlock({
  label,
  party,
  roleClass,
  extra,
}: {
  label: string;
  party?: SIParty & { toOrder?: boolean };
  roleClass: string;
  extra?: ReactNode;
}) {
  if (!party) {
    return (
      <div className={`si-party-block ${roleClass}`}>
        <Text className="form-field-label">{label}</Text>
        <Text type="secondary">N/A</Text>
      </div>
    );
  }
  return (
    <div className={`si-party-block ${roleClass}`}>
      <Text className="form-field-label">
        {label} {extra}
      </Text>
      <Text strong>{party.name}</Text>
      <Text>{party.address}</Text>
      <Text>
        {[party.city, party.country].filter(Boolean).join(", ")}
      </Text>
    </div>
  );
}

function getActivityStepVisual(action: string): {
  icon: LucideIcon;
  tone: ActivityTone;
} {
  const key = action.toLowerCase();
  if (key.includes("cancel") || key.includes("reject")) {
    return { icon: Icons.circleX, tone: "error" };
  }
  if (key.includes("confirm") || key.includes("approv") || key.includes("linked")) {
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
              {!isLast ? <span className="si-activity-steps__connector" /> : null}
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
      <Card className="si-panel feature-page-card" size="small">
        <Text type="danger">Unable to load Shipping Instruction details.</Text>
      </Card>
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

  return (
    <div className="booking-stack si-view-sections">
      {/* Row 1: Master | Parties */}
      <div className="si-view-row si-view-row--2">
        <Card
          className="si-panel feature-page-card"
          size="small"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.ship} size={16} />}>
              {WIZARD_STEP_TITLES.masterDetails}
            </SectionTitle>
          }
        >
          <div className="si-meta-grid">
            <MetaItem label="Booking Number" value={data.bookingNo} />
            <MetaItem label="SI Number" value={data.siNo || "Draft"} />
            <MetaItem label="B/L Type" value={data.blType} />
            <MetaItem
              label="Release Type"
              value={data.releaseType === "O" ? "Original" : "Telex"}
            />
            <MetaItem label="Freight Option" value={data.freightOption} />
            <MetaItem label="Agency Ref" value={data.agencyRefNo || "N/A"} />
          </div>
        </Card>

        <Card
          className="si-panel feature-page-card"
          size="small"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.users} size={16} />}>
              Parties
            </SectionTitle>
          }
        >
          <div className="si-party-grid">
            <PartyBlock
              label="Shipper"
              party={data.parties.shipper}
              roleClass="booking-party-card--shipper"
            />
            <PartyBlock
              label="Consignee"
              party={data.parties.consignee}
              roleClass="booking-party-card--consignee"
              extra={
                data.parties.consignee?.toOrder ? (
                  <Text type="warning">(To Order)</Text>
                ) : null
              }
            />
            <PartyBlock
              label="Notify Party"
              party={data.parties.notify}
              roleClass="booking-party-card--notify"
            />
          </div>
        </Card>
      </div>

      {/* Row 2: Routing | Insurance */}
      <div className="si-view-row si-view-row--2">
        <Card
          className="si-panel feature-page-card"
          size="small"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.anchor} size={16} />}>
              {WIZARD_STEP_TITLES.routing}
            </SectionTitle>
          }
        >
          {data.routing ? (
            <div className="si-meta-grid">
              <MetaItem
                label="Vessel / Voyage"
                value={data.routing.vesselVoyage || "N/A"}
              />
              <MetaItem label="Origin (Print)" value={data.routing.originPrint} />
              <MetaItem label="POL (Print)" value={data.routing.polPrint} />
              <MetaItem label="POD (Print)" value={data.routing.podPrint} />
              <MetaItem
                label="Delivery (Print)"
                value={data.routing.deliveryPrint}
              />
              <MetaItem
                label="Schedule Legs"
                value={String(data.routing.scheduleLegs?.length ?? 0)}
              />
            </div>
          ) : (
            <Text type="secondary">No routing details.</Text>
          )}
        </Card>

        <Card
          className="si-panel feature-page-card"
          size="small"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.shieldCheck} size={16} />}>
              {WIZARD_STEP_TITLES.insurance}
            </SectionTitle>
          }
        >
          {insuranceRequired && data.insurance ? (
            <div className="si-meta-grid">
              <MetaItem
                label="Cargo Value"
                value={`${data.insurance.cargoValue ?? "—"} ${data.insurance.currency}`}
              />
              <MetaItem
                label="Policy No"
                value={data.insurance.policyNo || "N/A"}
              />
              <MetaItem
                label="Terms Accepted"
                value={data.insurance.termsAccepted ? "Yes" : "No"}
              />
              <MetaItem
                label="Opt Out"
                value={data.insurance.optOut ? "Yes" : "No"}
              />
            </div>
          ) : (
            <Text type="secondary">
              Insurance not required for this shipping instruction.
            </Text>
          )}
        </Card>
      </div>

      {/* Cargo */}
      <div className="si-view-row si-view-row--1">
        <Card
          className="si-panel feature-page-card"
          size="small"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.boxes} size={16} />}>
              Cargo & Containers
            </SectionTitle>
          }
        >
          {data.containers.length === 0 ? (
            <Text type="secondary">No containers recorded.</Text>
          ) : (
            data.containers.map((container, index) => (
              <div key={container.id} className="si-container-block">
                <div className="si-container-block__header">
                  <Text strong className="si-container-block__title">
                    Container {index + 1}: {container.containerNo || "—"} (
                    {container.eqpSize || "—"})
                  </Text>
                  <div>
                    <Text type="secondary">
                      Carrier Seal:{" "}
                      <Text strong>{container.carrierSeal || "N/A"}</Text>
                    </Text>
                    {" · "}
                    <Text type="secondary">
                      Shipper Seal:{" "}
                      <Text strong>{container.shipperSeal || "N/A"}</Text>
                    </Text>
                  </div>
                </div>
                <div className="si-cargo-grid responsive-table-wrap custom-scroll ag-theme-alpine">
                  <ListView
                    rowData={container.cargoLines}
                    columnDefs={SI_CARGO_LINE_COL_DEFS}
                    showToolbar={false}
                    pagination
                    paginationPageSize={10}
                    gridOptions={{ animateRows: true }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* ENS */}
      {data.ens?.ensRequired ? (
        <div className="si-view-row si-view-row--1">
          <Card
            className="si-panel feature-page-card"
            size="small"
            title={
              <SectionTitle icon={<AppIcon icon={Icons.fileText} size={16} />}>
                ENS Details
              </SectionTitle>
            }
          >
            <div className="si-meta-grid">
              <MetaItem label="EU Customs Zone" value={data.ens.euCustZone} />
              <MetaItem label="B/L Type (ENS)" value={data.ens.blTypeEns} />
              <MetaItem label="Filing Type" value={data.ens.ensFillingType} />
              <MetaItem label="Payment Method" value={data.ens.paymentMethod} />
              <MetaItem
                label="Declarant"
                value={data.ens.declarant?.name || "N/A"}
              />
              <MetaItem label="Buyer" value={data.ens.buyer?.name || "N/A"} />
              <MetaItem label="Seller" value={data.ens.seller?.name || "N/A"} />
            </div>
          </Card>
        </div>
      ) : null}

      {/* Documents */}
      <div className="si-view-row si-view-row--1">
        <Card
          className="si-panel feature-page-card"
          size="small"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.inbox} size={16} />}>
              Documents
            </SectionTitle>
          }
        >
          {files.length === 0 ? (
            <Text type="secondary">No documents uploaded.</Text>
          ) : (
            <div className="si-meta-grid">
              {files.map((f) => (
                <MetaItem
                  key={f.id}
                  label={f.fileType || "File"}
                  value={`${f.fileName} (${f.sizeKb} KB)`}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Activity */}
      <div className="si-view-row si-view-row--1">
        <Card
          className="si-panel feature-page-card"
          size="small"
          title={
            <SectionTitle icon={<AppIcon icon={Icons.history} size={16} />}>
              Activity
            </SectionTitle>
          }
        >
          {activity.length === 0 ? (
            <Text type="secondary">No activity recorded.</Text>
          ) : (
            <ActivitySteps events={activity} />
          )}
        </Card>
      </div>

      {/* Charges */}
      {charges.length > 0 ? (
        <div className="si-view-row si-view-row--1">
          <Card
            className="si-panel feature-page-card"
            size="small"
            title={
              <SectionTitle icon={<AppIcon icon={Icons.banknote} size={16} />}>
                Charges
              </SectionTitle>
            }
          >
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
          </Card>
        </div>
      ) : null}
    </div>
  );
}
