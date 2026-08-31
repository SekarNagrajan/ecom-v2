// Created by Sekar Nagarajan (2026-08-31 16:36)
import { Card, Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";

const { Title, Text } = Typography;

interface BlPreviewSectionProps {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}

export function BlPreviewSection({
  title,
  onEdit,
  children,
}: BlPreviewSectionProps) {
  return (
    <Card
      className="form-step-card form-step-section bl-preview-section"
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

export function BlPreviewEmpty({ label }: { label?: string }) {
  return (
    <Text type="secondary" className="bl-preview-empty">
      {label ?? "No data provided"}
    </Text>
  );
}

// Modified by Sekar Nagarajan (2026-08-31 23:43)
export function BlPreviewPartyBlock({
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
    ? `bl-party-block booking-party-card booking-party-card--${roleKey}`
    : "bl-party-block";

  if (!name) {
    return (
      <div className={blockClass}>
        <span className="form-field-label">{role}</span>
        <BlPreviewEmpty />
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
