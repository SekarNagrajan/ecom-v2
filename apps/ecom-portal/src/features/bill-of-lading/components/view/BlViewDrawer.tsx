// Modified by Sekar Nagarajan (2026-10-19 19:05)
import { AppButton, AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavBillOfLadingIcon,
} from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { BLListDTO, BLRowStatus } from "../../types/bl.types";
import {
  canOpenBlWizard,
  getBLListStatusColor,
  getBLStatusLabel,
} from "../../utils/bl-status";
import { BlModuleStyles } from "../bl-module-styles";
import { BlDetailsViewer } from "./BlDetailsViewer";

const { Title, Text } = Typography;

const LIFECYCLE_KEYS: BLRowStatus[] = ["D", "S", "C", "I"];

interface BlViewDrawerProps {
  record: BLListDTO;
  onClose: () => void;
}

function dash(value?: string | null): string {
  return value && value.trim() !== "" ? value : "—";
}

/** Date-only rendering (portal date format), no time part. */
function dateOnly(value?: string | null): ReactNode {
  return value && value.trim() !== "" ? <FormattedDate value={value} /> : "—";
}

/** Split "CODE - Name" port labels; a bare code yields no separate name. */
function splitPort(value?: string | null): { code: string; name: string } {
  const raw = (value ?? "").trim();
  const parts = raw.split(" - ");
  if (parts.length < 2) return { code: raw, name: "" };
  return { code: parts[0].trim(), name: parts.slice(1).join(" - ").trim() };
}

export function BlViewDrawer({ record, onClose }: BlViewDrawerProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const navigate = useNavigate();
  const showEdit = canOpenBlWizard(record);
  const statusIndex = LIFECYCLE_KEYS.indexOf(record.status);

  const origin = splitPort(record.origin);
  const delivery = splitPort(record.delivery);

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/bl/${record.blNo}/edit` });
  };

  const facts: { key: string; label: string; value: ReactNode }[] = [
    { key: "blNo", label: t("columns.blNo"), value: dash(record.blNo) },
    { key: "siNo", label: t("columns.siNo"), value: dash(record.siNo) },
    { key: "mcn", label: t("labels.mcn"), value: dash(record.mcnNo) },
    { key: "agencyRef", label: t("labels.agencyRef"), value: dash(record.agencyRefNo) },
    { key: "created", label: t("labels.created"), value: dateOnly(record.createdDate) },
    { key: "confirmed", label: t("status.confirmed"), value: dateOnly(record.confirmedDate) },
  ];

  return (
    <>
      <BlModuleStyles />
      <AppDrawer
        open
        onClose={onClose}
        dialogSize="lg"
        classNames={{
          body: "bl-drawer-body custom-scroll",
          footer: "bl-drawer-footer-bar",
        }}
        title={
          <div className="bl-drawer-title">
            <span className="bl-drawer-title__icon">
              <AppIcon icon={NavBillOfLadingIcon} size={20} />
            </span>
            <div className="bl-drawer-title__copy">
              <Title level={4} className="bl-drawer-title__text">
                {formatModuleScreenTitle(t("drawers.viewBillOfLading"), record.blNo)}
              </Title>
              <Text type="secondary" className="bl-drawer-title__meta">
                <span className="bl-drawer-title__meta-item">
                  {t("labels.booking")}: <strong>{record.bookingNo}</strong>
                </span>
                {record.agencyRefNo ? (
                  <span className="bl-drawer-title__meta-item">
                    {t("labels.agencyRef")}: <strong>{record.agencyRefNo}</strong>
                  </span>
                ) : null}
              </Text>
            </div>
          </div>
        }
        footer={
          showEdit ? (
            <div className="bl-drawer-actions custom-scroll">
              <Tooltip title={t("actions.editBillOfLading")}>
                <AppButton
                  type="primary"
                  icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
                  onClick={handleEdit}
                >
                  {t("actions.edit")}
                </AppButton>
              </Tooltip>
            </div>
          ) : undefined
        }
      >
        <section className="bl-view-hero" aria-label={t("drawers.viewBillOfLading")}>
          {/* Status + lifecycle */}
          <div className="bl-view-hero__status">
            <div className="bl-view-hero__tags">
              <Tag className="bl-status-tag" color={getBLListStatusColor(record)}>
                {record.isLocked ? t("status.locked") : getBLStatusLabel(record.status, t)}
              </Tag>
              {record.isLocked ? (
                <Tag className="bl-status-tag" color="default">
                  {getBLStatusLabel(record.status, t)}
                </Tag>
              ) : null}
              {record.mcnNo ? (
                <Tag className="bl-status-tag" color="default">
                  {t("labels.mcn")}: {record.mcnNo}
                </Tag>
              ) : null}
            </div>

            <ol className="bl-status-stepper" aria-label={t("labels.statusProgress")}>
              {LIFECYCLE_KEYS.map((key, index) => {
                const isDone = index < statusIndex;
                const isCurrent = index === statusIndex;
                return (
                  <li
                    key={key}
                    className={[
                      "bl-status-stepper__step",
                      isDone ? "is-done" : "",
                      isCurrent ? "is-current" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span className="bl-status-stepper__dot app-icon-inherit">
                      {isDone ? <AppIcon icon={Icons.check} size={12} /> : <span>{index + 1}</span>}
                    </span>
                    <span className="bl-status-stepper__label">{getBLStatusLabel(key, t)}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Route */}
          <div className="bl-view-route">
            <div className="bl-view-route__stop">
              <span className="bl-view-route__eyebrow app-icon-inherit">
                <AppIcon icon={Icons.mapPin} size={12} />
                {t("labels.origin")}
              </span>
              <span className="bl-view-route__code">{dash(origin.code)}</span>
              {origin.name ? <span className="bl-view-route__name">{origin.name}</span> : null}
            </div>
            <div className="bl-view-route__connector" aria-hidden>
              <span className="bl-view-route__track" />
              <span className="bl-view-route__ship app-icon-inherit">
                <AppIcon icon={Icons.ship} size={14} />
              </span>
              <span className="bl-view-route__track" />
              <span className="bl-view-route__label">{t("labels.route")}</span>
            </div>
            <div className="bl-view-route__stop bl-view-route__stop--dest">
              <span className="bl-view-route__eyebrow app-icon-inherit">
                <AppIcon icon={Icons.mapPin} size={12} />
                {t("labels.delivery")}
              </span>
              <span className="bl-view-route__code">{dash(delivery.code)}</span>
              {delivery.name ? <span className="bl-view-route__name">{delivery.name}</span> : null}
            </div>
          </div>
          {/* Key references */}
          <dl className="bl-view-facts">
            {facts.map((fact) => (
              <div key={fact.key} className="bl-view-fact">
                <dt className="bl-view-fact__label">{fact.label}</dt>
                <dd className="bl-view-fact__value">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <BlDetailsViewer
          blNo={record.blNo}
          showRouting={false}
          activityHints={{
            createdDate: record.createdDate,
            confirmedDate: record.confirmedDate,
            status: record.status,
            isLocked: record.isLocked,
          }}
        />
      </AppDrawer>
    </>
  );
}
