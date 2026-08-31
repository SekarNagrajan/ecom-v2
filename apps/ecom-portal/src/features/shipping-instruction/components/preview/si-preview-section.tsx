// Modified by Sekar Nagarajan (2026-08-31 16:34)
import { Card, Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";

const { Title, Text } = Typography;

interface SiPreviewSectionProps {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}

export function SiPreviewSection({
  title,
  onEdit,
  children,
}: SiPreviewSectionProps) {
  return (
    <Card
      className="form-step-card form-step-section si-preview-section"
      size="small"
      title={
        <Title level={5} className="form-step-card-title">
          {title}
        </Title>
      }
      extra={
        onEdit ? (
          <ListActionsRow>
            <ListActionButton
              title={`Edit ${title}`}
              icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
              tone="edit"
              onClick={onEdit}
            />
          </ListActionsRow>
        ) : null
      }
    >
      {children}
    </Card>
  );
}

export function SiPreviewEmpty({ label }: { label?: string }) {
  return (
    <Text type="secondary" className="si-preview-empty">
      {label ?? "No data provided"}
    </Text>
  );
}

// Modified by Sekar Nagarajan (2026-08-31 23:43)
export function SiPreviewPartyBlock({
  role,
  roleKey,
  name,
  address,
  city,
  country,
  extra,
}: {
  role: string;
  roleKey?: string;
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  extra?: ReactNode;
}) {
  const blockClass = roleKey
    ? `si-party-block booking-party-card booking-party-card--${roleKey}`
    : "si-party-block";

  if (!name) {
    return (
      <div className={blockClass}>
        <span className="form-field-label">{role}</span>
        <SiPreviewEmpty />
      </div>
    );
  }

  return (
    <div className={blockClass}>
      <span className="form-field-label">
        {role}
        {extra}
      </span>
      <Text strong>{name}</Text>
      {address ? <Text>{address}</Text> : null}
      {city || country ? (
        <Text>{[city, country].filter(Boolean).join(", ")}</Text>
      ) : null}
    </div>
  );
}
