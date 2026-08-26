// Modified by Sekar Nagarajan (2026-08-26 16:57)
import { AppButton, AppSwitch } from "@solverminds/shared-ui";
import { Card, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { ServiceRestriction } from "../types/admin.types";
import { AdminPanelShell } from "./AdminPanelShell";

const { Title, Text } = Typography;

interface ServiceRestrictionsViewProps {
  restrictions: ServiceRestriction[];
  onSave: (items: ServiceRestriction[]) => void | Promise<void>;
}

function restrictionsSignature(items: ServiceRestriction[]) {
  return items
    .map((item) => `${item.id}:${item.isRestricted}:${item.reason ?? ""}`)
    .join("|");
}

export function ServiceRestrictionsView({
  restrictions,
  onSave,
}: ServiceRestrictionsViewProps) {
  const [draft, setDraft] = useState<ServiceRestriction[]>(restrictions);
  const [appliedSignature, setAppliedSignature] = useState(() =>
    restrictionsSignature(restrictions),
  );
  const [isSaving, setIsSaving] = useState(false);

  const nextSignature = restrictionsSignature(restrictions);
  if (nextSignature !== appliedSignature) {
    setAppliedSignature(nextSignature);
    setDraft(restrictions);
  }

  const restrictedCount = draft.filter((item) => item.isRestricted).length;
  const activeCount = draft.length - restrictedCount;

  const handleToggle = (id: string, checked: boolean) => {
    setDraft((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRestricted: checked } : item,
      ),
    );
  };

  const handleCancel = () => {
    setDraft(restrictions);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPanelShell
      icon={Icons.stopCircle}
      title="Service & Route Restrictions"
      subtitle="Enable or restrict specific origin/destination port pairs and maritime service loops."
    >
      <div className="admin-route-form">
        <div className="admin-menu-summary" aria-label="Route summary">
          <span className="admin-menu-summary__chip">
            <AppIcon icon={Icons.stopCircle} size={14} />
            <Text>
              {draft.length} Route{draft.length === 1 ? "" : "s"}
            </Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--success">
            <AppIcon icon={Icons.checkCircle} size={14} />
            <Text>{activeCount} Active</Text>
          </span>
          <span className="admin-menu-summary__chip admin-menu-summary__chip--warning">
            <AppIcon icon={Icons.lock} size={14} />
            <Text>{restrictedCount} Restricted</Text>
          </span>
        </div>

        <div className="admin-route-list custom-scroll">
          {draft.map((item) => (
            <Card key={item.id} className="admin-route-card" bordered={false}>
              <div className="admin-route-card__actions">
                <Tooltip
                  title={
                    item.isRestricted
                      ? "Allow This Route"
                      : "Restrict This Route"
                  }
                >
                  <span className="admin-toggle-row">
                    <Text type="secondary">Restrict Route</Text>
                    <AppSwitch
                      checked={item.isRestricted}
                      aria-label={
                        item.isRestricted
                          ? "Allow This Route"
                          : "Restrict This Route"
                      }
                      onChange={(checked) => handleToggle(item.id, checked)}
                    />
                    <Tag
                      className="admin-status-tag"
                      color={item.isRestricted ? "error" : "success"}
                    >
                      {item.isRestricted ? "Restricted" : "Active"}
                    </Tag>
                  </span>
                </Tooltip>
              </div>

              <div className="admin-route-strip">
                <div className="admin-route-port admin-route-port--origin">
                  <div className="admin-route-port__label">
                    <AppIcon icon={Icons.mapPin} size={14} />
                    Origin
                  </div>
                  <Title
                    level={4}
                    className="admin-route-port__code admin-route-port__code--origin"
                  >
                    {item.polCode}
                  </Title>
                </div>

                <div className="admin-route-connector">
                  <span className="admin-route-connector__label">
                    Port to Port
                  </span>
                  <div className="admin-route-connector__line">
                    <span className="admin-route-connector__dot admin-route-connector__dot--origin" />
                    <span className="admin-route-connector__track" />
                    <AppIcon icon={Icons.arrowRight} size={14} />
                    <span className="admin-route-connector__track" />
                    <span className="admin-route-connector__dot admin-route-connector__dot--delivery" />
                  </div>
                  <AppIcon icon={Icons.truck} size={16} />
                </div>

                <div className="admin-route-port admin-route-port--delivery">
                  <div className="admin-route-port__label">
                    <AppIcon icon={Icons.mapPin} size={14} />
                    Delivery
                  </div>
                  <Title
                    level={4}
                    className="admin-route-port__code admin-route-port__code--delivery"
                  >
                    {item.podCode}
                  </Title>
                </div>
              </div>

              <div className="admin-route-meta">
                <div>
                  <span className="admin-route-meta__label">Service Loop</span>
                  <span className="admin-route-meta__value">
                    {item.serviceLoop}
                  </span>
                </div>
                <div>
                  <span className="admin-route-meta__label">Tenant Code</span>
                  <span className="admin-route-meta__value">
                    <Tag className="admin-code-tag" color="gold">
                      {item.tenantId}
                    </Tag>
                  </span>
                </div>
                <div>
                  <span className="admin-route-meta__label">
                    Restriction Reason
                  </span>
                  <span className="admin-route-meta__value">
                    {item.reason || "N/A"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="admin-form-footer form-step-footer">
          <AppButton onClick={handleCancel} disabled={isSaving}>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={isSaving}
            onClick={handleUpdate}
          >
            Update
          </AppButton>
        </div>
      </div>
    </AdminPanelShell>
  );
}
