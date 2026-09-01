// Modified by Sekar Nagarajan (2026-09-01 14:04)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import type { ColDef } from "ag-grid-community";
import { Card, Col, Row, Typography } from "antd";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import { WIZARD_STEP_TITLES } from "../../../../constants/module-titles";
import { SI_CARGO_LINE_COL_DEFS } from "../../../shipping-instruction/utils/si-cargo-line-col-defs";
import { useBLDetailQuery } from "../../api/bl.queries";
import type {
  BLChargeLine,
  BLParty,
  BLRowStatus,
} from "../../types/bl.types";
import { BL_STATUS_LABELS } from "../../types/bl.types";
import { BlLoadingCenter } from "../bl-loading-center";

const { Title, Text } = Typography;

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

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bl-meta-item">
      <span className="bl-meta-item__label">{label}</span>
      <span className="bl-meta-item__value">{value}</span>
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
    <span className="bl-section-title-row">
      {icon}
      <Title level={5} className="bl-section-title">
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
  party?: BLParty & { toOrder?: boolean };
  roleClass: string;
  extra?: ReactNode;
}) {
  if (!party) {
    return (
      <div className={`bl-party-block ${roleClass}`}>
        <Text className="form-field-label">{label}</Text>
        <Text type="secondary">N/A</Text>
      </div>
    );
  }
  return (
    <div className={`bl-party-block ${roleClass}`}>
      <Text className="form-field-label">
        {label} {extra}
      </Text>
      <Text strong>{party.name}</Text>
      <Text>{party.address}</Text>
      <Text>{[party.city, party.country].filter(Boolean).join(", ")}</Text>
    </div>
  );
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
      <Card className="bl-panel feature-page-card" size="small">
        <Text type="danger">Unable to load Bill of Lading details.</Text>
      </Card>
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

  return (
    <div className="bl-view-sections">
      {/* Modified by Sekar Nagarajan (2026-09-01 14:04) — Master Details and Parties as separate full-width rows */}
      <Row gutter={[16, 16]} className="bl-view-row-line">
        <Col {...RESPONSIVE_COL.full}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
            size="small"
            title={
              <SectionTitle icon={<AppIcon icon={Icons.ship} size={16} />}>
                {WIZARD_STEP_TITLES.masterDetails}
              </SectionTitle>
            }
          >
            <div className="bl-meta-grid">
              <MetaItem label="Booking Number" value={data.bookingNo} />
              <MetaItem label="SI Number" value={data.siNo} />
              <MetaItem label="B/L Type" value={data.blType} />
              <MetaItem
                label="Release Type"
                value={data.releaseType === "O" ? "Original" : "Telex"}
              />
              <MetaItem label="Freight Option" value={data.freightOption} />
              <MetaItem
                label="Route"
                value={`${data.origin} → ${data.delivery}`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="bl-view-row-line">
        <Col {...RESPONSIVE_COL.full}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
            size="small"
            title={
              <SectionTitle icon={<AppIcon icon={Icons.users} size={16} />}>
                Parties
              </SectionTitle>
            }
          >
            <div className="bl-party-grid">
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
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="bl-view-row-line">
        <Col {...RESPONSIVE_COL.formHalf}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
            size="small"
            title={
              <SectionTitle icon={<AppIcon icon={Icons.anchor} size={16} />}>
                {WIZARD_STEP_TITLES.routing}
              </SectionTitle>
            }
          >
            {data.routing ? (
              <div className="bl-meta-grid">
                <MetaItem
                  label="Vessel / Voyage"
                  value={data.routing.vesselVoyage || "N/A"}
                />
                <MetaItem
                  label="Origin (Print)"
                  value={data.routing.originPrint}
                />
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
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
            size="small"
            title={
              <SectionTitle
                icon={<AppIcon icon={Icons.shieldCheck} size={16} />}
              >
                {WIZARD_STEP_TITLES.insurance}
              </SectionTitle>
            }
          >
            {insuranceRequired && data.insurance ? (
              <div className="bl-meta-grid">
                <MetaItem
                  label="Cargo Value"
                  value={`${data.insurance.cargoValue ?? "—"} ${data.insurance.currency ?? ""}`}
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
                Insurance not required for this bill of lading.
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="bl-view-row-line">
        <Col {...RESPONSIVE_COL.full}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
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
              data.containers.map((c, i) => (
                <div key={c.id} className="bl-container-block">
                  <div className="bl-container-block__header">
                    <Text strong>
                      Container {i + 1}: {c.containerNo || "—"} (
                      {c.eqpSize || "—"})
                    </Text>
                  </div>
                  <div className="bl-cargo-grid responsive-table-wrap custom-scroll ag-theme-alpine">
                    <ListView
                      rowData={c.cargoLines}
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
        </Col>
      </Row>

      {data.ens?.euCustomsZone ? (
        <Row gutter={[16, 16]} className="bl-view-row-line">
          <Col {...RESPONSIVE_COL.full}>
            <Card
              className="bl-panel feature-page-card bl-view-section-card"
              size="small"
              title={
                <SectionTitle
                  icon={<AppIcon icon={Icons.fileText} size={16} />}
                >
                  ENS Details
                </SectionTitle>
              }
            >
              <div className="bl-meta-grid">
                <MetaItem label="B/L Type" value={data.ens.blType || "N/A"} />
                <MetaItem
                  label="Filing Type"
                  value={data.ens.ensFilingType || "N/A"}
                />
                <MetaItem
                  label="Payment Method"
                  value={data.ens.paymentMethod || "N/A"}
                />
                <MetaItem
                  label="Declarant"
                  value={data.ens.declarantName || "N/A"}
                />
                <MetaItem label="Buyer" value={data.ens.buyerName || "N/A"} />
                <MetaItem label="Seller" value={data.ens.sellerName || "N/A"} />
              </div>
            </Card>
          </Col>
        </Row>
      ) : null}

      <Row gutter={[16, 16]} className="bl-view-row-line">
        <Col {...RESPONSIVE_COL.formHalf}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
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
              <div className="bl-meta-grid">
                {files.map((f) => (
                  <MetaItem
                    key={f.id}
                    label={f.category}
                    value={`${f.fileName} · ${f.uploadedAt}`}
                  />
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col {...RESPONSIVE_COL.formHalf}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
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
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="bl-view-row-line">
        <Col {...RESPONSIVE_COL.full}>
          <Card
            className="bl-panel feature-page-card bl-view-section-card"
            size="small"
            title={
              <SectionTitle icon={<AppIcon icon={Icons.banknote} size={16} />}>
                Charges
              </SectionTitle>
            }
          >
            {charges.length === 0 ? (
              <Text type="secondary">No charges recorded.</Text>
            ) : (
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
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
