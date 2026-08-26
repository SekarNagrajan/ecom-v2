// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Empty, Tag, Typography } from "antd";
import type { LucideIcon } from "lucide-react";

import { AppIcon, Icons } from "../../../components/icons";
import { formatModuleScreenTitle } from "../../../constants/module-titles";
import { useMCNDetailQuery, useMCNPrintMutation } from "../api/bl.queries";
import type { MCNDTO } from "../types/bl.types";
import { BlLoadingCenter } from "./bl-loading-center";

const { Text, Title } = Typography;

export interface ManifestDrawerProps {
  open: boolean;
  mcnId: string | null;
  blNo?: string | null;
  onClose: () => void;
}

function parsePortLabel(value: string) {
  const parts = value.split(" - ");
  if (parts.length < 2) {
    return { code: value, name: value };
  }
  return {
    code: parts[0]?.trim() || value,
    name: parts.slice(1).join(" - ").trim() || value,
  };
}

function statusTone(status: MCNDTO["status"]): {
  color: string;
  icon: LucideIcon;
} {
  if (status === "Confirmed")
    return { color: "success", icon: Icons.badgeCheck };
  if (status === "Submitted") return { color: "processing", icon: Icons.send };
  return { color: "default", icon: Icons.clock };
}

function ManifestMetaItem({
  icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bl-manifest-meta__item">
      <div className="bl-manifest-meta__icon" aria-hidden>
        <AppIcon icon={icon} size={16} />
      </div>
      <div className="bl-manifest-meta__content">
        <span className="bl-manifest-meta__label">{label}</span>
        <span className="bl-manifest-meta__value">{children}</span>
      </div>
    </div>
  );
}

export function ManifestDrawer({
  open,
  mcnId,
  blNo,
  onClose,
}: ManifestDrawerProps) {
  const { data: detail, isLoading } = useMCNDetailQuery(
    mcnId ?? "",
    Boolean(open && mcnId),
  );
  const { mutate: printMcn, isPending } = useMCNPrintMutation();

  const loadPort = parsePortLabel(detail?.loadPort ?? "");
  const dischargePort = parsePortLabel(detail?.dischargePort ?? "");
  const status = detail ? statusTone(detail.status) : null;

  return (
    <AppDrawer
      title={
        <span className="bl-manifest-drawer-title">
          <AppIcon icon={Icons.clipboardList} size={18} />
          {formatModuleScreenTitle("Manifest", mcnId ?? blNo ?? undefined)}
        </span>
      }
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
      classNames={{ body: "bl-drawer-body custom-scroll" }}
      footer={
        <>
          {detail ? (
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
              loading={isPending}
              onClick={() => printMcn({ mcnId: detail.mcnId })}
            >
              Print Manifest
            </AppButton>
          ) : null}
        </>
      }
    >
      {!mcnId ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="bl-manifest-empty">
              <AppIcon icon={Icons.info} size={16} />
              No MCN is linked to this Bill of Lading yet.
            </span>
          }
        />
      ) : isLoading ? (
        <BlLoadingCenter />
      ) : !detail ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="bl-manifest-empty">
              <AppIcon icon={Icons.alert} size={16} />
              Manifest {mcnId} was not found.
            </span>
          }
        />
      ) : status ? (
        <>
          <div className="bl-manifest-route">
            <div className="bl-manifest-route__port bl-manifest-route__port--load">
              <div className="bl-manifest-route__label">
                <AppIcon icon={Icons.mapPin} size={14} tone="track" />
                Load Port
              </div>
              <Title
                level={4}
                className="bl-manifest-route__code bl-manifest-route__code--load"
              >
                {loadPort.code || "—"}
              </Title>
              {loadPort.name !== loadPort.code ? (
                <Text className="bl-manifest-route__name">{loadPort.name}</Text>
              ) : null}
            </div>

            <div className="bl-manifest-route__connector">
              <span className="bl-manifest-route__connector-label">Voyage</span>
              <div className="bl-manifest-route__line">
                <span className="bl-manifest-route__dot bl-manifest-route__dot--load" />
                <span className="bl-manifest-route__track" />
                <AppIcon icon={Icons.ship} size={16} />
                <span className="bl-manifest-route__track" />
                <span className="bl-manifest-route__dot bl-manifest-route__dot--discharge" />
              </div>
              <AppIcon icon={Icons.arrowRight} size={14} tone="navigate" />
            </div>

            <div className="bl-manifest-route__port bl-manifest-route__port--discharge">
              <div className="bl-manifest-route__label">
                <AppIcon icon={Icons.mapPin} size={14} tone="track" />
                Discharge Port
              </div>
              <Title
                level={4}
                className="bl-manifest-route__code bl-manifest-route__code--discharge"
              >
                {dischargePort.code || "—"}
              </Title>
              {dischargePort.name !== dischargePort.code ? (
                <Text className="bl-manifest-route__name">
                  {dischargePort.name}
                </Text>
              ) : null}
            </div>
          </div>

          <div className="bl-manifest-status">
            <AppIcon icon={status.icon} size={16} />
            <Text strong>Status</Text>
            <Tag color={status.color}>{detail.status}</Tag>
          </div>

          <div className="bl-manifest-meta">
            <ManifestMetaItem icon={Icons.barcode} label="MCN No">
              {detail.mcnId}
            </ManifestMetaItem>
            <ManifestMetaItem icon={Icons.fileCheck} label="B/L No">
              {detail.blNo}
            </ManifestMetaItem>
            <ManifestMetaItem icon={Icons.bookOpen} label="Booking No">
              {detail.bookingNo}
            </ManifestMetaItem>
            <ManifestMetaItem icon={Icons.ship} label="Vessel">
              {detail.vessel}
            </ManifestMetaItem>
            <ManifestMetaItem icon={Icons.compass} label="Voyage">
              {detail.voyage}
            </ManifestMetaItem>
            <ManifestMetaItem icon={Icons.boxes} label="Containers">
              {detail.containerCount}
            </ManifestMetaItem>
          </div>

          {detail.remarks ? (
            <div className="bl-manifest-remarks">
              <div className="bl-manifest-remarks__header">
                <AppIcon icon={Icons.fileText} size={16} tone="view" />
                <Text strong>Remarks</Text>
              </div>
              <Text type="secondary">{detail.remarks}</Text>
            </div>
          ) : null}
        </>
      ) : null}
    </AppDrawer>
  );
}
