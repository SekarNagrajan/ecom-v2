// Modified by Sekar Nagarajan (2026-10-19 18:20)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Alert, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavArrivalNoticeIcon,
} from "../../../../components/icons";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";
import { useModuleTitles } from "../../../../i18n/use-module-titles";
import {
  useArrivalNoticeDetailQuery,
  useArrivalNoticeDownloadMutation,
} from "../../api/arrival-notice.queries";
import type {
  ArrivalNoticeChargeLine,
  ArrivalNoticeContainerRow,
} from "../../types/arrival-notice.types";
import {
  formatArnAmount,
  getArnPrintStatusColor,
  getArnPrintStatusLabel,
} from "../../utils/arn-status";
import { parsePortLabel } from "../../utils/arn.utils";
import { ArnLoadingCenter } from "../arn-loading-center";

const { Text, Title } = Typography;

const DAY_MS = 86_400_000;
const SOON_WITHIN_DAYS = 3;

interface AnViewDrawerProps {
  anNo: string;
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
    <div className="arn-meta-item">
      <span className="form-field-label">{label}</span>
      <span className="arn-meta-item__value">{children}</span>
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
    <section className="arn-drawer-section">
      <div className="arn-drawer-section__head">
        <AppIcon icon={icon} size={16} />
        <Text strong className="arn-drawer-section__title">
          {title}
        </Text>
        {typeof count === "number" ? (
          <Tag className="arn-drawer-section__count">{count}</Tag>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Arrival Notice view drawer — vessel → discharge hero with an arrival
 * timeline, free-time banner, then full-width detail cards (notice,
 * shipment, free time, charges, containers).
 */
export function AnViewDrawer({ anNo, onClose }: AnViewDrawerProps) {
  const { t } = useTranslation("arrival-notice");
  const MODULE_TITLES = useModuleTitles();
  const { data: arnData, isLoading } = useArrivalNoticeDetailQuery(anNo);
  const { mutate: downloadDoc, isPending: isDownloading } =
    useArrivalNoticeDownloadMutation();

  const dischargePort = parsePortLabel(arnData?.dischargePort || "");
  const chargeLines = arnData?.chargeLines ?? [];
  const containers = arnData?.containers ?? [];
  const freeTime = arnData?.freeTime;
  const lastFreeDay = freeTime?.lastFreeDay || arnData?.lastFreeDay;
  const statusLabel = arnData ? getArnPrintStatusLabel(arnData.printStatus, t) : "";
  const statusColor = arnData ? getArnPrintStatusColor(arnData.printStatus) : "default";

  const freeDaysLeft = daysUntil(lastFreeDay);
  const freeTimeAlertType =
    freeDaysLeft === null
      ? "info"
      : freeDaysLeft < 0
        ? "error"
        : freeDaysLeft <= SOON_WITHIN_DAYS
          ? "warning"
          : "info";

  const milestones: { key: string; label: string; date: string | null }[] = [
    { key: "eta", label: t("drawer.labels.eta"), date: arnData?.etaDate || null },
    { key: "arrived", label: t("drawer.labels.arrivalDate"), date: arnData?.arrivalDate || null },
    { key: "lastFreeDay", label: t("drawer.labels.lastFreeDay"), date: lastFreeDay || null },
    ...(hasText(arnData?.demurrageFrom)
      ? [
          {
            key: "demurrage",
            label: t("drawer.labels.demurrageFrom"),
            date: arnData?.demurrageFrom ?? null,
          },
        ]
      : []),
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

  const chargeTotals = Array.from(
    chargeLines.reduce((map, line) => {
      map.set(line.currency, (map.get(line.currency) ?? 0) + Number(line.amount || 0));
      return map;
    }, new Map<string, number>()),
    ([currency, total]) => ({ currency, total }),
  );

  const chargeColumns: ColumnsType<ArrivalNoticeChargeLine> = [
    {
      title: t("drawer.chargeColumns.code"),
      dataIndex: "chargeCode",
      key: "chargeCode",
      width: 110,
      render: (code: string) => (
        <Tag className="arn-charge-code" color="purple">
          {code}
        </Tag>
      ),
    },
    {
      title: t("drawer.chargeColumns.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("drawer.chargeColumns.amount"),
      key: "amount",
      align: "right",
      width: 150,
      render: (_value, row) => (
        <Text strong className="arn-amount">
          {formatArnAmount(row.amount, row.currency)}
        </Text>
      ),
    },
  ];

  const containerColumns: ColumnsType<ArrivalNoticeContainerRow> = [
    {
      title: t("drawer.containerColumns.containerNo"),
      dataIndex: "containerNo",
      key: "containerNo",
      render: (no: string) => <span className="arn-container-no">{no}</span>,
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
    downloadDoc(anNo);
  };

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="md"
      classNames={{
        body: "arn-drawer-body custom-scroll",
        footer: "arn-drawer-footer",
      }}
      title={
        <div className="arn-drawer-title">
          <span className="arn-drawer-title__icon app-icon-inherit">
            <AppIcon icon={NavArrivalNoticeIcon} size={22} />
          </span>
          <div className="arn-drawer-title__copy">
            <Text className="arn-drawer-title__eyebrow">
              {MODULE_TITLES.arrivalNotice}
            </Text>
            <Title
              level={5}
              className="arn-drawer-title__text"
              copyable={{
                text: anNo,
                tooltips: [t("actions.copyAnNumber"), t("actions.copied")],
              }}
            >
              {anNo}
            </Title>
            <div className="arn-drawer-title__meta-row">
              <Text type="secondary" className="arn-drawer-title__meta">
                {t("drawer.blPrefix")}{" "}
                <span className="arn-drawer-title__bl">{arnData?.blNumber || "—"}</span>
              </Text>
              {arnData ? (
                <Tag className="arn-status-tag" color={statusColor}>
                  {statusLabel}
                </Tag>
              ) : null}
            </div>
          </div>
        </div>
      }
      footer={
        <div className="arn-drawer-actions custom-scroll">
          <AppButton
            type="default"
            icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
            loading={isDownloading}
            disabled={!arnData}
            onClick={handleDownload}
          >
            {t("actions.downloadPdf")}
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} />}
            loading={isDownloading}
            disabled={!arnData}
            onClick={handleDownload}
          >
            {t("actions.printArrivalNotice")}
          </AppButton>
        </div>
      }
    >
      {isLoading || !arnData ? (
        <ArnLoadingCenter />
      ) : (
        <>
          {/* Hero — vessel → discharge + arrival timeline */}
          <section className="arn-hero" aria-label={t("drawer.routeEyebrow")}>
            <div className="arn-hero__route">
              <div className="arn-route-port arn-route-port--vessel">
                <span className="arn-route-port__label app-icon-inherit">
                  <AppIcon icon={Icons.ship} size={12} />
                  {t("drawer.vessel")}
                </span>
                <span className="arn-route-port__code">{arnData.vessel || "—"}</span>
                <span className="arn-route-port__name">
                  {t("drawer.labels.voyage")}: {arnData.voyage || "—"}
                </span>
              </div>
              <div className="arn-route-connector" aria-hidden>
                <span className="arn-route-connector__dot arn-route-connector__dot--vessel" />
                <span className="arn-route-connector__track" />
                <span className="arn-route-connector__ship app-icon-inherit">
                  <AppIcon icon={Icons.bell} size={14} />
                </span>
                <span className="arn-route-connector__track" />
                <span className="arn-route-connector__dot arn-route-connector__dot--discharge" />
              </div>
              <div className="arn-route-port arn-route-port--discharge">
                <span className="arn-route-port__label app-icon-inherit">
                  <AppIcon icon={Icons.mapPin} size={12} />
                  {t("drawer.discharge")}
                </span>
                <span className="arn-route-port__code">{dischargePort.code || "—"}</span>
                {dischargePort.name !== dischargePort.code ? (
                  <span className="arn-route-port__name">{dischargePort.name}</span>
                ) : null}
              </div>
            </div>

            <ol className="arn-hero__timeline">
              {timeline.map((step, index) => (
                <li
                  key={step.key}
                  className={`arn-timeline__step is-${step.state}`}
                  aria-current={step.state === "current" ? "step" : undefined}
                >
                  <span className="arn-timeline__dot app-icon-inherit">
                    {step.state === "done" ? (
                      <AppIcon icon={Icons.check} size={12} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                  <span className="arn-timeline__copy">
                    <span className="arn-timeline__name">{step.label}</span>
                    <span className="arn-timeline__date">
                      <DateValue value={step.date} />
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {hasText(lastFreeDay) ? (
            <Alert
              type={freeTimeAlertType}
              showIcon
              className="arn-drawer-alert"
              icon={
                <AppIcon
                  icon={freeTimeAlertType === "info" ? Icons.info : Icons.clock}
                  size={16}
                />
              }
              message={
                <Trans
                  i18nKey="drawer.alerts.freeTimeEndsOn"
                  ns="arrival-notice"
                  components={{ date: <FormattedDate value={lastFreeDay} /> }}
                />
              }
            />
          ) : null}

          {/* Detail cards — one per row */}
          <div className="arn-section-stack">
            <SectionCard icon={Icons.bell} title={t("drawer.sections.details")}>
              <div className="arn-meta-grid">
                <MetaField label={t("drawer.labels.anNumber")}>{arnData.anNo}</MetaField>
                <MetaField label={t("drawer.labels.blNumber")}>
                  {arnData.blNumber || "—"}
                </MetaField>
                <MetaField label={t("drawer.labels.eta")}>
                  <DateValue value={arnData.etaDate} />
                </MetaField>
                <MetaField label={t("drawer.labels.arrivalDate")}>
                  <DateValue value={arnData.arrivalDate} />
                </MetaField>
                <MetaField label={t("drawer.labels.chargesDue")}>
                  {arnData.chargesDue > 0 ? (
                    <span className="arn-amount arn-amount--due">
                      {formatArnAmount(arnData.chargesDue, arnData.currency)}
                    </span>
                  ) : (
                    "—"
                  )}
                </MetaField>
                <MetaField label={t("drawer.labels.printStatus")}>
                  <Tag className="arn-status-tag" color={statusColor}>
                    {statusLabel}
                  </Tag>
                </MetaField>
              </div>
            </SectionCard>

            <SectionCard icon={Icons.ship} title={t("drawer.sections.shipment")}>
              <div className="arn-meta-grid">
                <MetaField label={t("drawer.labels.vessel")}>{arnData.vessel || "—"}</MetaField>
                <MetaField label={t("drawer.labels.voyage")}>{arnData.voyage || "—"}</MetaField>
                <MetaField label={t("drawer.labels.terminal")}>
                  {arnData.terminal || "—"}
                </MetaField>
                <MetaField label={t("drawer.labels.consignee")}>
                  {arnData.consignee || "—"}
                </MetaField>
                <MetaField label={t("drawer.labels.notifyParty")}>
                  {arnData.notifyParty || "—"}
                </MetaField>
                <MetaField label={t("drawer.labels.manifestIgm")}>
                  {arnData.manifestRef || arnData.igmNo || "—"}
                </MetaField>
              </div>
            </SectionCard>

            {freeTime ? (
              <SectionCard icon={Icons.clock} title={t("drawer.sections.freeTime")}>
                <div className="arn-meta-grid">
                  <MetaField label={t("drawer.labels.freeDays")}>{freeTime.days}</MetaField>
                  <MetaField label={t("drawer.labels.lastFreeDay")}>
                    <DateValue value={freeTime.lastFreeDay} />
                  </MetaField>
                  <MetaField label={t("drawer.labels.demurrageFrom")}>
                    <DateValue value={arnData.demurrageFrom} />
                  </MetaField>
                </div>
              </SectionCard>
            ) : null}

            {chargeLines.length > 0 ? (
              <SectionCard
                icon={Icons.fileText}
                title={t("drawer.sections.charges")}
                count={chargeLines.length}
              >
                <div className="responsive-table-wrap custom-scroll arn-table-wrap">
                  <Table<ArrivalNoticeChargeLine>
                    className="arn-charges-table arn-table"
                    size="small"
                    pagination={false}
                    rowKey={(row) => `${row.chargeCode}-${row.description}`}
                    dataSource={chargeLines}
                    columns={chargeColumns}
                    summary={() => (
                      <Table.Summary fixed>
                        {chargeTotals.map((row, index) => (
                          <Table.Summary.Row key={row.currency} className="arn-table__total">
                            <Table.Summary.Cell index={0} colSpan={2}>
                              <Text strong>
                                {index === 0 ? t("drawer.labels.chargesDue") : ""}
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">
                              <Text strong className="arn-amount arn-amount--due">
                                {formatArnAmount(row.total, row.currency)}
                              </Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        ))}
                      </Table.Summary>
                    )}
                  />
                </div>
              </SectionCard>
            ) : null}

            <SectionCard
              icon={Icons.container}
              title={t("drawer.sections.containers")}
              count={containers.length}
            >
              <div className="responsive-table-wrap custom-scroll arn-table-wrap">
                <Table<ArrivalNoticeContainerRow>
                  className="arn-containers-table arn-table"
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
