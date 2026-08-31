// Modified by Sekar Nagarajan (2026-08-31 16:56)
import { Card, Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";

const { Title, Text } = Typography;

interface BookingPreviewSectionProps {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}

export function BookingPreviewSection({
  title,
  onEdit,
  children,
}: BookingPreviewSectionProps) {
  return (
    <Card
      className="form-step-card form-step-section booking-preview-section"
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

export function BookingPreviewEmpty({ label }: { label?: string }) {
  return (
    <Text type="secondary" className="booking-preview-empty">
      {label ?? "No data provided"}
    </Text>
  );
}

export function BookingPreviewPartyBlock({
  role,
  name,
  address,
  city,
  country,
  extra,
}: {
  role: string;
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  extra?: ReactNode;
}) {
  if (!name) {
    return (
      <div className="booking-party-block">
        <span className="form-field-label">{role}</span>
        <BookingPreviewEmpty />
      </div>
    );
  }

  return (
    <div className="booking-party-block">
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
