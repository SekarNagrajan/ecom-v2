// Modified by Sekar Nagarajan (2026-10-19 17:00)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import { Tag, Tooltip, Typography } from "antd";
import { useTranslation } from "react-i18next";

import {
  AppIcon,
  Icons,
  NavShippingInstructionIcon,
} from "../../../../components/icons";
import { formatModuleScreenTitle } from "../../../../constants/module-titles";
import type { SIListDTO, SIStatus } from "../../types/si.types";
import {
  canOpenSiWizard,
  getSiBlStatusLabel,
  getSiStatusLabel,
  getSiStatusTagColor,
} from "../../utils/si-status";
import { SiDetailsViewer } from "./SiDetailsViewer";

const { Title, Text } = Typography;

interface SiViewDrawerProps {
  record: SIListDTO;
  onClose: () => void;
}

interface LifecycleStep {
  key: SIStatus;
  label: string;
  state: "done" | "current" | "upcoming" | "error";
}

function dash(value?: string | null): string {
  return value && value.trim() !== "" ? value : "—";
}

/**
 * Draft → Submitted → Accepted lifecycle. Declined replaces the last step
 * as an error marker; Locked means the SI completed and is frozen.
 */
function buildLifecycle(
  status: SIStatus,
  t: (key: string) => string,
): LifecycleStep[] {
  const base: { key: SIStatus; label: string }[] = [
    { key: "Draft", label: t("status.draft") },
    { key: "Submitted", label: t("status.submitted") },
    { key: "Accepted", label: t("status.accepted") },
  ];

  let currentIndex: number;
  switch (status) {
    case "Draft":
      currentIndex = 0;
      break;
    case "Submitted":
      currentIndex = 1;
      break;
    case "Accepted":
    case "Declined":
      currentIndex = 2;
      break;
    case "Locked":
      currentIndex = 3;
      break;
    default:
      currentIndex = -1;
  }

  return base.map((step, index) => {
    if (status === "Declined" && index === 2) {
      return { key: "Declined", label: t("status.declined"), state: "error" };
    }
    if (index < currentIndex) return { ...step, state: "done" };
    if (index === currentIndex) return { ...step, state: "current" };
    return { ...step, state: "upcoming" };
  });
}

export function SiViewDrawer({ record, onClose }: SiViewDrawerProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const navigate = useNavigate();
  const showEdit = canOpenSiWizard(record.status);
  const lifecycle = buildLifecycle(record.status, t);

  const handleEdit = () => {
    onClose();
    navigate({ to: `/app/shipping-instruction/wizard/${record.id}` });
  };

  const facts = [
    { key: "siNo", label: t("labels.siNo"), value: dash(record.siNo) },
    { key: "blNo", label: t("labels.blNo"), value: dash(record.blNo) },
    { key: "created", label: t("labels.created"), value: dash(record.createdDate) },
    {
      key: "submitted",
      label: t("labels.submitted"),
      value: dash(record.submittedDate),
    },
  ];

  return (
    <AppDrawer
      open
      onClose={onClose}
      dialogSize="lg"
      classNames={{
        body: "si-drawer-body custom-scroll",
        footer: "si-drawer-footer-bar",
      }}
      title={
        <div className="si-drawer-title">
          <span className="si-drawer-title__icon">
            <AppIcon icon={NavShippingInstructionIcon} size={20} />
          </span>
          <div className="si-drawer-title__copy">
            <Title level={4} className="si-drawer-title__text">
              {formatModuleScreenTitle(
                t("drawer.viewTitle"),
                record.siNo || record.bookingNo,
              )}
            </Title>
            <Text type="secondary" className="si-drawer-title__meta">
              <span className="si-drawer-title__meta-item">
                {t("labels.booking")}: <strong>{record.bookingNo}</strong>
              </span>
              {record.agencyRefNo ? (
                <span className="si-drawer-title__meta-item">
                  {t("labels.agencyRef")}: <strong>{record.agencyRefNo}</strong>
                </span>
              ) : null}
            </Text>
          </div>
        </div>
      }
      footer={
        showEdit ? (
          <div className="si-drawer-actions custom-scroll">
            <Tooltip title={t("actions.editShippingInstruction")}>
              <AppButton
                type="primary"
                icon={<AppIcon icon={Icons.squarePen} size={16} tone="edit" />}
                onClick={handleEdit}
              >
                {t("actions.editSi")}
              </AppButton>
            </Tooltip>
          </div>
        ) : undefined
      }
    >
      <section className="si-view-hero" aria-label={t("drawer.viewTitle")}>
        {/* Status + lifecycle */}
        <div className="si-view-hero__status">
          <div className="si-view-hero__tags">
            <Tag
              className="si-view-hero__tag"
              color={getSiStatusTagColor(record.status)}
            >
              {getSiStatusLabel(record.status, t)}
            </Tag>
            {record.blStatus ? (
              <Tag className="si-view-hero__tag" color="default">
                {t("drawer.blStatusTag", {
                  status: getSiBlStatusLabel(record.blStatus, t),
                })}
              </Tag>
            ) : null}
          </div>

          <ol className="si-status-stepper" aria-label={t("drawer.statusProgress")}>
            {lifecycle.map((step, index) => (
              <li
                key={step.key}
                className={`si-status-stepper__step is-${step.state}`}
                aria-current={step.state === "current" ? "step" : undefined}
              >
                <span className="si-status-stepper__dot app-icon-inherit">
                  {step.state === "done" ? (
                    <AppIcon icon={Icons.check} size={12} />
                  ) : step.state === "error" ? (
                    <AppIcon icon={Icons.x} size={12} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <span className="si-status-stepper__label">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Route */}
        <div className="si-view-route">
          <div className="si-view-route__stop">
            <span className="si-view-route__eyebrow app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={12} />
              {t("labels.origin")}
            </span>
            <span className="si-view-route__code">{dash(record.origin)}</span>
          </div>
          <div className="si-view-route__connector" aria-hidden>
            <span className="si-view-route__track" />
            <span className="si-view-route__ship app-icon-inherit">
              <AppIcon icon={Icons.ship} size={14} />
            </span>
            <span className="si-view-route__track" />
            <span className="si-view-route__label">{t("labels.portToPort")}</span>
          </div>
          <div className="si-view-route__stop si-view-route__stop--dest">
            <span className="si-view-route__eyebrow app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={12} />
              {t("labels.delivery")}
            </span>
            <span className="si-view-route__code">{dash(record.delivery)}</span>
          </div>
        </div>

        {/* Key references */}
        <dl className="si-view-facts">
          {facts.map((fact) => (
            <div key={fact.key} className="si-view-fact">
              <dt className="si-view-fact__label">{fact.label}</dt>
              <dd className="si-view-fact__value">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SiDetailsViewer
        siId={record.id}
        activityHints={{
          createdDate: record.createdDate,
          submittedDate: record.submittedDate,
          status: record.status,
        }}
      />
    </AppDrawer>
  );
}
