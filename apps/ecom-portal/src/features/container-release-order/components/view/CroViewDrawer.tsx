// Modified by Sekar Nagarajan (2026-10-19 18:20)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavContainerReleaseIcon,
} from "../../../../components/icons";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import { useModuleTitles } from "../../../../i18n/use-module-titles";
import {
  useCRODetailQuery,
  useCRODownloadMutation,
} from "../../api/cro.queries";
import type { CROContainerRow } from "../../types/cro.types";
import {
  getCroPrintStatusColor,
  getCroPrintStatusLabel,
  getCroReleaseStatusColor,
  getCroReleaseStatusLabel,
} from "../../utils/cro-status";
import { parsePortLabel } from "../../utils/cro.utils";
import { CroLoadingCenter } from "../cro-loading-center";

const { Text, Title } = Typography;

const DAY_MS = 86_400_000;
const SOON_WITHIN_DAYS = 3;

interface CroViewDrawerProps {
  croNo: string;
  onClose: () => void;
}

interface TimelineStep {
  key: string;
  label: string;
  date: string | null;
  state: "done" | "current" | "upcoming";
}

function hasText(value?: string | null): value is string {
  return Boolean(value && value.trim() !== "");
}

function parseDate(value?: string | null): Date | null {
  if (!hasText(value)) return null;
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPast(value?: string | null, now = new Date()): boolean {
  const date = parseDate(value);
  return Boolean(date && date.getTime() <= now.getTime());
}

/** Calendar days from today to `value` (negative once past); null when unknown. */
function daysUntil(value?: string | null, now = new Date()): number | null {
  const date = parseDate(value);
  if (!date) return null;
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOf(date) - startOf(now)) / DAY_MS);
}

function MetaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="cro-meta-item">
      <span className="form-field-label">{label}</span>
      <span className="cro-meta-item__value">{children}</span>
    </div>
  );
}

function DateValue({ value }: { value?: string | null }) {
  return hasText(value) ? <FormattedDate value={value} /> : <>—</>;
}

function SectionCard({
  icon,
  title,
  count,
  children,
}: {
  icon: typeof Icons.fileText;
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="cro-drawer-section">
      <div className="cro-drawer-section__head">
        <AppIcon icon={icon} size={16} />
        <Text strong className="cro-drawer-section__title">
          {title}
        </Text>
        {typeof count === "number" ? (
          <Tag className="cro-drawer-section__count">{count}</Tag>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Container Release Order view drawer — load → discharge hero with the
 * release timeline, validity / blocked banners, then full-width detail
 * cards (release order, shipment, containers).
 */
export function CroViewDrawer({ croNo, onClose }: CroViewDrawerProps) {
  const { t } = useTranslation(["container-release-order", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const { data: croData, isLoading } = useCRODetailQuery(croNo);
  const { mutate: downloadDoc, isPending: isDownloading } =
    useCRODownloadMutation();

  const originPort = parsePortLabel(croData?.loadPort || "");
  const deliveryPort = parsePortLabel(croData?.dischargePort || "");
  const printLabel = croData ? getCroPrintStatusLabel(croData.printStatus, t) : "";
  const printColor = croData ? getCroPrintStatusColor(croData.printStatus) : "default";
  const containers = croData?.containers ?? [];
  const blockedReasons =
    croData && croData.releaseStatus === "Blocked" ? croData.eligibility?.reasons ?? [] : [];

  const validDaysLeft = daysUntil(croData?.validTo);
  const validityAlertType =
    validDaysLeft === null
      ? "info"
      : validDaysLeft < 0
        ? "error"
        : validDaysLeft <= SOON_WITHIN_DAYS
          ? "warning"
          : "info";

  const milestones: { key: string; label: string; date: string | null }[] = [
    { key: "issued", label: t("drawer.timeline.issued"), date: croData?.croDate || null },
    ...(hasText(croData?.polArrival)
      ? [{ key: "polArrival", label: t("drawer.timeline.polArrival"), date: croData?.polArrival ?? null }]
      : []),
    ...(hasText(croData?.polDeparture)
      ? [{ key: "polDeparture", label: t("drawer.timeline.polDeparture"), date: croData?.polDeparture ?? null }]
      : []),
    { key: "validUntil", label: t("drawer.timeline.validUntil"), date: croData?.validTo || null },
  ];
  let currentAssigned = false;
  const timeline: TimelineStep[] = milestones.map((step) => {
    if (isPast(step.date)) return { ...step, state: "done" };
    if (!currentAssigned) {
      currentAssigned = true;
      return { ...step, state: "current" };
    }
    return { ...step, state: "upcoming" };
  });

  const containerColumns: ColumnsType<CROContainerRow> = [
    {
      title: t("drawer.containerColumns.containerNo"),
      dataIndex: "containerNo",
      key: "containerNo",
      render: (no: string) => <span className="cro-container-no">{no}</span>,
    },
    {
      title: t("drawer.containerColumns.sizeType"),
      dataIndex: "eqpSize",
      key: "eqpSize",
      width: 130,
    },
    {
      title: t("drawer.containerColumns.sealNo"),
      dataIndex: "sealNo",
      key: "sealNo",
      width: 140,
      render: (seal?: string) => seal || "—",
    },
  ];

  const handleDownload = () => {
    downloadDoc(croNo);
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="md"
      classNames={{
        body: "cro-drawer-body custom-scroll",
        footer: "cro-drawer-footer",
      }}
      title={
        <div className="cro-drawer-title">
          <span className="cro-drawer-title__icon app-icon-inherit">
            <AppIcon icon={NavContainerReleaseIcon} size={22} />
          </span>
          <div className="cro-drawer-title__copy">
            <Text className="cro-drawer-title__eyebrow">
              {MODULE_TITLES.containerReleaseOrder}
            </Text>
            <Title
              level={5}
              className="cro-drawer-title__text"
              copyable={{
                text: croNo,
                tooltips: [t("actions.copyCroNumber"), t("actions.copied")],
              }}
            >
              {croNo}
            </Title>
            <div className="cro-drawer-title__meta-row">
              <Text type="secondary" className="cro-drawer-title__meta">
                {t("drawer.bookingPrefix")}{" "}
                <span className="cro-drawer-title__bl">{croData?.bookingNo || "—"}</span>
              </Text>
              {croData ? (
                <>
                  <Tag
                    className="cro-status-tag"
                    color={getCroReleaseStatusColor(croData.releaseStatus)}
                  >
                    {getCroReleaseStatusLabel(croData.releaseStatus, t)}
                  </Tag>
                  <Tag className="cro-status-tag" color={printColor}>
                    {printLabel}
                  </Tag>
                </>
              ) : null}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="cro-drawer-actions custom-scroll">
          <AppButton
            type="default"
            icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
            loading={isDownloading}
            disabled={!croData}
            onClick={handleDownload}
          >
            {t("actions.downloadPdf")}
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} />}
            loading={isDownloading}
            disabled={!croData}
            onClick={handleDownload}
          >
            {t("actions.printContainerReleaseOrder")}
          </AppButton>
        </div>
      }
    >
      {isLoading || !croData ? (
        <CroLoadingCenter />
      ) : (
        <>
          {/* Hero — load → discharge + release timeline */}
          <section className="cro-hero" aria-label={t("drawer.routeEyebrow")}>
            <div className="cro-hero__route">
              <div className="cro-route-port cro-route-port--origin">
                <span className="cro-route-port__label app-icon-inherit">
                  <AppIcon icon={Icons.mapPin} size={12} />
                  {t("drawer.loadPort")}
                </span>
                <span className="cro-route-port__code">{originPort.code || "—"}</span>
                {originPort.name !== originPort.code ? (
                  <span className="cro-route-port__name">{originPort.name}</span>
                ) : null}
              </div>
              <div className="cro-route-connector" aria-hidden>
                <span className="cro-route-connector__dot cro-route-connector__dot--origin" />
                <span className="cro-route-connector__track" />
                <span className="cro-route-connector__ship app-icon-inherit">
                  <AppIcon icon={Icons.ship} size={14} />
                </span>
                <span className="cro-route-connector__track" />
                <span className="cro-route-connector__dot cro-route-connector__dot--delivery" />
              </div>
              <div className="cro-route-port cro-route-port--delivery">
                <span className="cro-route-port__label app-icon-inherit">
                  <AppIcon icon={Icons.mapPin} size={12} />
                  {t("drawer.discharge")}
                </span>
                <span className="cro-route-port__code">{deliveryPort.code || "—"}</span>
                {deliveryPort.name !== deliveryPort.code ? (
                  <span className="cro-route-port__name">{deliveryPort.name}</span>
                ) : null}
              </div>
            </div>

            <ol className="cro-hero__timeline">
              {timeline.map((step, index) => (
                <li
                  key={step.key}
                  className={`cro-timeline__step is-${step.state}`}
                  aria-current={step.state === "current" ? "step" : undefined}
                >
                  <span className="cro-timeline__dot app-icon-inherit">
                    {step.state === "done" ? (
                      <AppIcon icon={Icons.check} size={12} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                  <span className="cro-timeline__copy">
                    <span className="cro-timeline__name">{step.label}</span>
                    <span className="cro-timeline__date">
                      <DateValue value={step.date} />
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {blockedReasons.length > 0 ? (
            <Alert
              type="error"
              showIcon
              className="cro-drawer-alert"
              icon={<AppIcon icon={Icons.lock} size={16} />}
              message={t("drawer.alerts.blocked")}
              description={
                <ul className="cro-drawer-alert__list">
                  {blockedReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              }
            />
          ) : null}
          {hasText(croData.validTo) ? (
            <Alert
              type={validityAlertType}
              showIcon
              className="cro-drawer-alert"
              icon={
                <AppIcon
                  icon={validityAlertType === "info" ? Icons.info : Icons.clock}
                  size={16}
                />
              }
              message={
                <Trans
                  i18nKey="drawer.alerts.validUntil"
                  ns="container-release-order"
                  components={{ date: <FormattedDate value={croData.validTo} /> }}
                />
              }
            />
          ) : null}

          {/* Detail cards — one per row */}
          <div className="cro-section-stack">
            <SectionCard icon={Icons.fileText} title={t("drawer.sections.details")}>
              <div className="cro-meta-grid">
                <MetaField label={t("drawer.labels.croNumber")}>{croData.croNo}</MetaField>
                <MetaField label={t("drawer.labels.bookingNo")}>
                  {croData.bookingNo || "—"}
                </MetaField>
                <MetaField label={t("drawer.labels.croDate")}>
                  <DateValue value={croData.croDate} />
                </MetaField>
                <MetaField label={t("drawer.labels.croValidity")}>
                  <DateValue value={croData.validTo} />
                </MetaField>
                <MetaField label={t("drawer.labels.releaseStatus")}>
                  <Tag
                    className="cro-status-tag"
                    color={getCroReleaseStatusColor(croData.releaseStatus)}
                  >
                    {getCroReleaseStatusLabel(croData.releaseStatus, t)}
                  </Tag>
                </MetaField>
                <MetaField label={t("drawer.labels.printStatus")}>
                  <span className="cro-meta-item__inline">
                    <Tag className="cro-status-tag" color={printColor}>
                      {printLabel}
                    </Tag>
                    {croData.printCount > 0 ? (
                      <Text type="secondary" className="cro-meta-item__hint">
                        {t("drawer.labels.printCount")}: {croData.printCount}
                      </Text>
                    ) : null}
                  </span>
                </MetaField>
              </div>
            </SectionCard>

            <SectionCard icon={Icons.ship} title={t("drawer.sections.shipment")}>
              <div className="cro-meta-grid">
                <MetaField label={t("drawer.labels.vessel")}>{croData.vessel || "—"}</MetaField>
                <MetaField label={t("drawer.labels.voyage")}>{croData.voyage || "—"}</MetaField>
                <MetaField label={t("drawer.labels.contType")}>
                  {croData.eqpType || "—"}
                </MetaField>
                <MetaField label={t("drawer.labels.emptyReleaseDepot")}>
                  {croData.emptyReleaseDepot || "—"}
                </MetaField>
                <MetaField label={t("drawer.labels.qtyBooked")}>{croData.qtyBooked}</MetaField>
                <MetaField label={t("drawer.labels.qtyReleased")}>
                  <span className="cro-qty">
                    <span className="cro-qty__released">{croData.qtyReleased}</span>
                    <span className="cro-qty__of">/ {croData.qtyBooked}</span>
                  </span>
                </MetaField>
              </div>
            </SectionCard>

            <SectionCard
              icon={Icons.container}
              title={t("drawer.sections.containers")}
              count={containers.length}
            >
              <div className="responsive-table-wrap custom-scroll cro-table-wrap">
                <Table<CROContainerRow>
                  className="cro-containers-table cro-table"
                  size="small"
                  pagination={false}
                  rowKey="containerNo"
                  dataSource={containers}
                  columns={containerColumns}
                  locale={{
                    emptyText: (
                      <ModuleEmptyState
                        artSize="sm"
                        variant="blank"
                        title={t("empty.noContainers")}
                      />
                    ),
                  }}
                />
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </AppDrawer>
  );
}
