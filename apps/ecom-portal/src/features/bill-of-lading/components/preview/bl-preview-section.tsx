// Modified by Sekar Nagarajan (2026-09-05 01:05)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import type { BLParty } from "../../types/bl.types";
import {
  SI_PARTY_ROLE_LABEL,
  type SiPartyRoleKey,
} from "../../../shipping-instruction/utils/si-party.utils";

const { Title, Text } = Typography;

interface BlPreviewSectionProps {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
  className?: string;
  /** Card = bordered panel; airy = title + edit + hairline divider. */
  variant?: "card" | "airy";
}

export function BlPreviewSection({
  title,
  onEdit,
  children,
  className,
  variant = "card",
}: BlPreviewSectionProps) {
  if (variant === "airy") {
    return (
      <section
        className={["booking-review__section", className]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="booking-review__section-head">
          <Title level={4} className="booking-review__title">
            {title}
          </Title>
          {onEdit ? (
            <Tooltip title={`Edit ${title}`}>
              <AppButton
                type="text"
                size="small"
                className="booking-review__edit"
                icon={<AppIcon icon={Icons.edit} size={16} />}
                aria-label={`Edit ${title}`}
                onClick={onEdit}
              />
            </Tooltip>
          ) : null}
        </div>
        <div className="booking-review__section-body">{children}</div>
      </section>
    );
  }

  return (
    <Card
      className={[
        "form-step-card form-step-section bl-preview-section",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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

export function BlPreviewFieldGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  const remainder = items.length % 4;
  const padded =
    remainder === 0 ? items : [...items, ...Array(4 - remainder).fill(null)];

  return (
    <div className="booking-review__grid">
      {padded.map((item, index) =>
        item ? (
          <div key={`${item.label}-${index}`} className="booking-review__field">
            <span className="booking-review__label">{item.label}</span>
            <span className="booking-review__value">{item.value}</span>
          </div>
        ) : (
          <div
            key={`pad-${index}`}
            className="booking-review__field booking-review__field--pad"
          />
        ),
      )}
    </div>
  );
}

function partyAddress(party: Pick<BLParty, "address" | "city" | "country">): string {
  return [party.address, party.city, party.country].filter(Boolean).join(", ");
}

/** Airy review party card — role · company · contact stack · address. */
export function BlPreviewPartyCard({
  roleKey,
  party,
  extra,
}: {
  roleKey: SiPartyRoleKey;
  party: BLParty;
  extra?: ReactNode;
}) {
  const address = partyAddress(party);
  const label =
    roleKey === "shipper" ? "Shipper" : SI_PARTY_ROLE_LABEL[roleKey];

  return (
    <div className="booking-review__party">
      <span className="booking-review__party-role">
        {label}
        {extra}
      </span>
      <Text strong className="booking-review__party-company">
        {party.name}
      </Text>
      <div className="booking-review__party-contact">
        <span>{party.phone || "—"}</span>
        <span>{party.email || "—"}</span>
      </div>
      <div className="booking-review__party-address">{address || "—"}</div>
    </div>
  );
}

export function BlPreviewEmptyPartyCard({
  roleKey,
}: {
  roleKey: SiPartyRoleKey;
}) {
  const label =
    roleKey === "shipper" ? "Shipper" : SI_PARTY_ROLE_LABEL[roleKey];
  return (
    <div className="booking-review__party booking-review__party--empty">
      <span className="booking-review__party-role">{label}</span>
      <Text type="secondary">Not assigned</Text>
    </div>
  );
}

/** @deprecated Prefer BlPreviewPartyCard for airy review. */
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
