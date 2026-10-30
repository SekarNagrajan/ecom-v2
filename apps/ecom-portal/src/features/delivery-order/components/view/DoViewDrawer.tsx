// Modified by Sekar Nagarajan (2026-10-19 17:55)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Tag, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavDeliveryOrderIcon,
} from "../../../../components/icons";
import { useModuleTitles } from "../../../../i18n/use-module-titles";
import { useDODownloadMutation } from "../../api/delivery-order.queries";
import type { DOSummaryRow } from "../../types/delivery-order.types";
import {
  getDoPrintStatusColor,
  getDoPrintStatusLabel,
} from "../../utils/do-status";
import {
  canPrintDoOnline,
  getDoValidity,
  parsePortLabel,
} from "../../utils/do.utils";

const { Text, Title } = Typography;

interface DoViewDrawerProps {
  record: DOSummaryRow;
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

function isPast(value?: string | null, now = new Date()): boolean {
  if (!hasText(value)) return false;
  const date = new Date(value.replace(" ", "T"));
  return !Number.isNaN(date.getTime()) && date.getTime() <= now.getTime();
}

function formatAmount(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function MetaField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="do-meta-item">
      <span className="form-field-label">{label}</span>
      <span className="do-meta-item__value">{children}</span>
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
    <section className="do-drawer-section">
      <div className="do-drawer-section__head">
        <AppIcon icon={icon} size={16} />
        <Text strong className="do-drawer-section__title">
          {title}
        </Text>
        {typeof count === "number" ? (
          <Tag className="do-drawer-section__count">{count}</Tag>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Delivery Order view drawer — route hero with lifecycle timeline, then
 * full-width detail cards stacked in rows (order, shipment, parties &
 * charges, containers, print history). Online print follows the B/L flag.
 */
export function DoViewDrawer({ record, onClose }: DoViewDrawerProps) {
  const { t } = useTranslation(["delivery-order", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const { mutate: downloadDoc, isPending: isDownloading } =
    useDODownloadMutation();

  const originPort = parsePortLabel(record.loadport || "");
  const deliveryPort = parsePortLabel(record.dischargeport || "");
  const statusLabel = getDoPrintStatusLabel(record.printstatus, t);
  const statusColor = getDoPrintStatusColor(record.printstatus);
  const canPrint = canPrintDoOnline(record);

  const validity = getDoValidity(record.dovaliditydate);

  const milestones: { key: string; label: string; date: string | null }[] = [
    { key: "issued", label: t("drawer.timeline.issued"), date: record.delorddate || null },
    { key: "arrived", label: t("drawer.timeline.arrived"), date: record.arrdate || null },
    {
      key: "validUntil",
      label: t("drawer.timeline.validUntil"),
      date: record.dovaliditydate || null,
    },
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

  const containers = record.containers ?? [];
  const invoiceNos = record.invoiceNos ?? [];
  const printHistory = record.printHistory ?? [];
  const showParties =
    hasText(record.consignee) ||
    typeof record.freeDays === "number" ||
    typeof record.balanceDue === "number" ||
    invoiceNos.length > 0;

  const handleDownload = () => {
    downloadDoc(record.delordno);
  };

  const printButtons = (
    <>
      <AppButton
        type="default"
        icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
        loading={isDownloading}
        disabled={!canPrint}
        onClick={handleDownload}
      >
        {t("actions.downloadPdf")}
      </AppButton>
      <AppButton
        type="primary"
        icon={<AppIcon icon={Icons.printer} size={16} />}
        loading={isDownloading}
        disabled={!canPrint}
        onClick={handleDownload}
      >
        {t("actions.printDeliveryOrder")}
      </AppButton>
    </>
  );

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="md"
      classNames={{
        body: "do-drawer-body custom-scroll",
        footer: "do-drawer-footer",
      }}
      title={
        <div className="do-drawer-title">
          <span className="do-drawer-title__icon app-icon-inherit">
            <AppIcon icon={NavDeliveryOrderIcon} size={22} />
          </span>
          <div className="do-drawer-title__copy">
            <Text className="do-drawer-title__eyebrow">
              {MODULE_TITLES.deliveryOrder}
            </Text>
            <Title
              level={5}
              className="do-drawer-title__text"
              copyable={{
                text: record.delordno,
                tooltips: [t("actions.copyDoNumber"), t("actions.copied")],
              }}
            >
              {record.delordno}
            </Title>
            <div className="do-drawer-title__meta-row">
              <Text type="secondary" className="do-drawer-title__meta">
                {t("drawer.blPrefix")}{" "}
                <span className="do-drawer-title__bl">{record.blnumber || "—"}</span>
              </Text>
              <Tag className="do-status-tag" color={statusColor}>
                {statusLabel}
              </Tag>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="do-drawer-actions custom-scroll">
          {canPrint ? (
            printButtons
          ) : (
            <Tooltip title={t("drawer.notPrintable")}>
              <span className="do-drawer-actions__group">{printButtons}</span>
            </Tooltip>
          )}
        </div>
      }
    >
      {/* Hero — route + lifecycle */}
      <section className="do-hero" aria-label={t("drawer.routeEyebrow")}>
        <div className="do-hero__route">
          <div className="do-route-port do-route-port--origin">
            <span className="do-route-port__label app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={12} />
              {t("drawer.origin")}
            </span>
            <span className="do-route-port__code">{originPort.code || "—"}</span>
            {originPort.name !== originPort.code ? (
              <span className="do-route-port__name">{originPort.name}</span>
            ) : null}
          </div>
          <div className="do-route-connector" aria-hidden>
            <span className="do-route-connector__dot do-route-connector__dot--origin" />
            <span className="do-route-connector__track" />
            <span className="do-route-connector__ship app-icon-inherit">
              <AppIcon icon={Icons.ship} size={14} />
            </span>
            <span className="do-route-connector__track" />
            <span className="do-route-connector__dot do-route-connector__dot--delivery" />
          </div>
          <div className="do-route-port do-route-port--delivery">
            <span className="do-route-port__label app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={12} />
              {t("drawer.delivery")}
            </span>
            <span className="do-route-port__code">{deliveryPort.code || "—"}</span>
            {deliveryPort.name !== deliveryPort.code ? (
              <span className="do-route-port__name">{deliveryPort.name}</span>
            ) : null}
          </div>
        </div>

        <ol className="do-hero__timeline">
          {timeline.map((step, index) => (
            <li
              key={step.key}
              className={`do-timeline__step is-${step.state}`}
              aria-current={step.state === "current" ? "step" : undefined}
            >
              <span className="do-timeline__dot app-icon-inherit">
                {step.state === "done" ? (
                  <AppIcon icon={Icons.check} size={12} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span className="do-timeline__copy">
                <span className="do-timeline__name">{step.label}</span>
                <span className="do-timeline__date">
                  <DateValue value={step.date} />
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Attention banners */}
      {!canPrint ? (
        <Alert
          type="warning"
          showIcon
          className="do-drawer-alert"
          icon={<AppIcon icon={Icons.lock} size={16} />}
          message={t("drawer.notPrintable")}
        />
      ) : null}
      {validity.state === "expiring" && hasText(record.dovaliditydate) ? (
        <Alert
          type="warning"
          showIcon
          className="do-drawer-alert"
          icon={<AppIcon icon={Icons.clock} size={16} />}
          message={
            <Trans
              i18nKey="drawer.alerts.expiring"
              ns="delivery-order"
              values={{ count: validity.daysLeft ?? 0 }}
              components={{ date: <FormattedDate value={record.dovaliditydate} /> }}
            />
          }
        />
      ) : null}
      {validity.state === "expired" && hasText(record.dovaliditydate) ? (
        <Alert
          type="error"
          showIcon
          className="do-drawer-alert"
          icon={<AppIcon icon={Icons.alertTriangle} size={16} />}
          message={
            <Trans
              i18nKey="drawer.alerts.expired"
              ns="delivery-order"
              components={{ date: <FormattedDate value={record.dovaliditydate} /> }}
            />
          }
        />
      ) : null}

      {/* Detail cards — one per row */}
      <div className="do-section-stack">
        <SectionCard icon={Icons.fileText} title={t("drawer.sections.details")}>
          <div className="do-meta-grid">
            <MetaField label={t("drawer.labels.doNumber")}>{record.delordno}</MetaField>
            <MetaField label={t("drawer.labels.doDate")}>
              <DateValue value={record.delorddate} />
            </MetaField>
            <MetaField label={t("drawer.labels.validUntil")}>
              <DateValue value={record.dovaliditydate} />
            </MetaField>
            <MetaField label={t("drawer.labels.printStatus")}>
              <Tag className="do-status-tag" color={statusColor}>
                {statusLabel}
              </Tag>
            </MetaField>
          </div>
        </SectionCard>

        <SectionCard icon={Icons.ship} title={t("drawer.sections.shipment")}>
          <div className="do-meta-grid">
            <MetaField label={t("drawer.labels.blNumber")}>{record.blnumber || "—"}</MetaField>
            <MetaField label={t("drawer.labels.terminal")}>{record.terminal || "—"}</MetaField>
            <MetaField label={t("drawer.labels.vessel")}>{record.vessel || "—"}</MetaField>
            <MetaField label={t("drawer.labels.voyage")}>{record.voyage || "—"}</MetaField>
            <MetaField label={t("drawer.labels.bound")}>{record.bound || "—"}</MetaField>
            <MetaField label={t("drawer.labels.arrivalDate")}>
              <DateValue value={record.arrdate} />
            </MetaField>
          </div>
        </SectionCard>

        {showParties ? (
          <SectionCard icon={Icons.users} title={t("drawer.sections.parties")}>
            <div className="do-meta-grid">
              <MetaField label={t("drawer.labels.consignee")}>
                {record.consignee || "—"}
              </MetaField>
              <MetaField label={t("drawer.labels.freeDays")}>
                {typeof record.freeDays === "number"
                  ? t("drawer.values.days", { count: record.freeDays })
                  : "—"}
              </MetaField>
              <MetaField label={t("drawer.labels.balanceDue")}>
                {typeof record.balanceDue === "number" ? (
                  record.balanceDue > 0 ? (
                    <span className="do-meta-item__value--amount">
                      {record.currency ? `${record.currency} ` : ""}
                      {formatAmount(record.balanceDue)}
                    </span>
                  ) : (
                    <Tag className="do-status-tag" color="success">
                      {t("drawer.values.settled")}
                    </Tag>
                  )
                ) : (
                  "—"
                )}
              </MetaField>
              <MetaField label={t("drawer.labels.invoices")}>
                {invoiceNos.length > 0 ? (
                  <span className="do-chip-list">
                    {invoiceNos.map((no) => (
                      <span key={no} className="do-chip">
                        {no}
                      </span>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </MetaField>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          icon={Icons.container}
          title={t("drawer.sections.containers")}
          count={containers.length}
        >
          {containers.length > 0 ? (
            <div className="do-chip-list">
              {containers.map((no) => (
                <span key={no} className="do-chip do-chip--container app-icon-inherit">
                  <AppIcon icon={Icons.container} size={12} />
                  {no}
                </span>
              ))}
            </div>
          ) : (
            <Text type="secondary" className="do-empty-note">
              {t("drawer.empty.containers")}
            </Text>
          )}
        </SectionCard>

        <SectionCard
          icon={Icons.history}
          title={t("drawer.sections.printHistory")}
          count={printHistory.length}
        >
          {printHistory.length > 0 ? (
            <ol className="do-history">
              {printHistory.map((entry) => (
                <li key={`${entry.version}-${entry.printedAt}`} className="do-history__row">
                  <Tag className="do-history__version" color="default">
                    v{entry.version}
                  </Tag>
                  <span className="do-history__by">
                    {t("drawer.labels.printedBy")}: {entry.printedBy || "—"}
                  </span>
                  <span className="do-history__at">
                    {hasText(entry.printedAt) ? (
                      <FormattedDate value={entry.printedAt} showTime />
                    ) : (
                      "—"
                    )}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <Text type="secondary" className="do-empty-note">
              {t("drawer.empty.history")}
            </Text>
          )}
        </SectionCard>
      </div>
    </AppDrawer>
  );
}
