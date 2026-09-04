// Modified by Sekar Nagarajan (2026-09-04 23:45)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Tooltip, Typography } from "antd";
import type { ReactNode } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import {
  type PartyCardData,
  type PartyRoleKey,
} from "../../utils/party-role.utils";

const { Title, Text } = Typography;

/** Airy review party role labels (prototype sentence / uppercase). */
const REVIEW_PARTY_ROLE_LABEL: Record<PartyRoleKey, string> = {
  shipper: "Shipper",
  consignee: "Consignee",
  notifyParty: "Notify Party",
  notifyParty2: "Notify Party 2",
  forwarder: "Freight Forwarder",
  agreementParty: "Agreement Party",
  siSubmittingParty: "SI Submitting Party",
};

interface BookingPreviewSectionProps {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
  className?: string;
  /** Card = bordered panel; airy = title + edit + hairline divider. */
  variant?: "card" | "airy";
}

export function BookingPreviewSection({
  title,
  onEdit,
  children,
  className,
  variant = "card",
}: BookingPreviewSectionProps) {
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
        "form-step-card form-step-section booking-preview-section",
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

export function BookingPreviewEmpty({ label }: { label?: string }) {
  return (
    <Text type="secondary" className="booking-preview-empty">
      {label ?? "No data provided"}
    </Text>
  );
}

export function BookingPreviewFieldGrid({
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

function partyAddress(card: PartyCardData): string {
  return [card.address, card.city, card.country].filter(Boolean).join(", ");
}

/** Airy review party card — role · company · contact stack · address. */
export function BookingPreviewPartyCard({
  role,
  card,
}: {
  role: PartyRoleKey;
  card: PartyCardData;
}) {
  const address = partyAddress(card);

  return (
    <div className="booking-review__party">
      <span className="booking-review__party-role">
        {REVIEW_PARTY_ROLE_LABEL[role]}
      </span>
      <Text strong className="booking-review__party-company">
        {card.company}
      </Text>
      <div className="booking-review__party-contact">
        <span>{card.contact || "—"}</span>
        <span>{card.phone || "—"}</span>
        <span>{card.email || "—"}</span>
      </div>
      <div className="booking-review__party-address">{address || "—"}</div>
    </div>
  );
}

export function BookingPreviewEmptyPartyCard({ role }: { role: PartyRoleKey }) {
  return (
    <div className="booking-review__party booking-review__party--empty">
      <span className="booking-review__party-role">
        {REVIEW_PARTY_ROLE_LABEL[role]}
      </span>
      <Text type="secondary">Not assigned</Text>
    </div>
  );
}
