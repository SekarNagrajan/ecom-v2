// Modified by Sekar Nagarajan (2026-09-02 18:21)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useRouterState } from "@tanstack/react-router";
import { Card, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { BookingCustomerOption } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import { partiesSchema, type PartiesData } from "../types/booking.types";
import {
  cardsToParties,
  DEFAULT_PARTY_ROLES,
  emptyPartyCard,
  initialPartyCards,
  PARTY_ROLE_LABEL,
  type PartyCardData,
  type PartyRoleKey,
} from "../utils/party-role.utils";
import {
  CustomerSearchAutoComplete,
  PartyEditDrawer,
  RoleAssignPanel,
} from "./party-edit-drawer";

const { Text, Title } = Typography;

const PARTY_ROLE_ICON: Record<
  PartyRoleKey,
  (typeof Icons)[keyof typeof Icons]
> = {
  shipper: Icons.building,
  agreementParty: Icons.handshake,
  consignee: Icons.user,
  notifyParty: Icons.bell,
  notifyParty2: Icons.bell,
  forwarder: Icons.truck,
  siSubmittingParty: Icons.fileText,
};

function partySecondaryLines(card: PartyCardData): string[] {
  const lines: string[] = [];
  if (card.contact?.trim()) lines.push(card.contact.trim());
  const location = [card.address, card.city, card.country]
    .filter(Boolean)
    .join(", ");
  if (location) lines.push(location);
  else if (card.email || card.phone) {
    lines.push([card.email, card.phone].filter(Boolean).join(" · "));
  }
  return lines;
}

function PartyRoleCard({
  role,
  card,
  readOnly = false,
  canEdit = true,
  canDelete = true,
  fromAccount = false,
  onEdit,
  onDelete,
}: {
  role: PartyRoleKey;
  card: PartyCardData;
  readOnly?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  fromAccount?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const secondary = partySecondaryLines(card);
  const showEdit = !readOnly && canEdit;
  const showDelete = !readOnly && canDelete;

  return (
    <div className="booking-party-card booking-party-card--surface">
      <div className="booking-party-card__head">
        <div className="booking-party-card__role">
          <span className="booking-party-card__role-icon app-icon-inherit">
            <AppIcon icon={PARTY_ROLE_ICON[role]} size={16} />
          </span>
          <Text strong className="booking-party-card__role-label">
            {PARTY_ROLE_LABEL[role]}
          </Text>
        </div>
        <div className="booking-party-card__actions">
          {fromAccount ? <AppIcon icon={Icons.lock} size={16} /> : null}
          {showEdit ? (
            <Tooltip title="Edit Party">
              <AppButton
                type="link"
                size="small"
                className="booking-party-card__edit-btn"
                aria-label="Edit Party"
                onClick={onEdit}
                icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
              />
            </Tooltip>
          ) : null}
          {showDelete ? (
            <Tooltip title="Delete Party">
              <AppButton
                type="link"
                size="small"
                className="booking-party-card__delete-btn"
                aria-label="Delete Party"
                danger
                onClick={onDelete}
                icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
              />
            </Tooltip>
          ) : null}
        </div>
      </div>

      <div className="booking-party-card__body">
        <Text strong className="booking-party-card__company">
          {card.company}
        </Text>
        {secondary.length > 0 ? (
          secondary.map((line) => (
            <Text
              key={line}
              type="secondary"
              className="booking-party-card__meta"
            >
              {line}
            </Text>
          ))
        ) : (
          <Text type="secondary" className="booking-party-card__meta">
            No additional contact details
          </Text>
        )}
      </div>
    </div>
  );
}

function EmptyPartySlot({
  role,
  onAssign,
}: {
  role: PartyRoleKey;
  onAssign: () => void;
}) {
  return (
    <div className="booking-party-card booking-party-card--surface booking-party-card--empty">
      <div className="booking-party-card__head">
        <div className="booking-party-card__role">
          <span className="booking-party-card__role-icon app-icon-inherit">
            <AppIcon icon={PARTY_ROLE_ICON[role]} size={16} />
          </span>
          <Text strong className="booking-party-card__role-label">
            {PARTY_ROLE_LABEL[role]}
          </Text>
        </div>
      </div>
      <div className="booking-party-card__empty-body">
        <Text type="secondary">Not assigned yet</Text>
        <AppButton
          size="small"
          icon={<AppIcon icon={Icons.plus} size={14} tone="create" />}
          onClick={onAssign}
        >
          Assign
        </AppButton>
      </div>
    </div>
  );
}

export function CustomerDetailsStep() {
  const toast = useToast();
  const isAmend = useRouterState({
    select: (s) => s.location.pathname.includes("/amend"),
  });
  const { payload, updateParties, nextStep, prevStep } = useBookingStore();
  const [cards, setCards] = useState<
    Partial<Record<PartyRoleKey, PartyCardData>>
  >(() => initialPartyCards(payload.parties));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<BookingCustomerOption | null>(null);
  const [editRole, setEditRole] = useState<PartyRoleKey | null>(null);
  const [editValue, setEditValue] = useState<PartyCardData>(emptyPartyCard());

  const assignedRoles = Object.keys(cards) as PartyRoleKey[];
  const otherEntries = (
    Object.entries(cards) as [PartyRoleKey, PartyCardData][]
  ).filter(([role]) => !DEFAULT_PARTY_ROLES.includes(role));
  const assignedCount = assignedRoles.length;

  const handleSelectCustomer = (customer: BookingCustomerOption) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.customerName);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setSearchQuery("");
  };

  const handleAssignRoles = (roles: PartyRoleKey[]) => {
    if (!selectedCustomer || roles.length === 0) {
      toast.error("Select at least one role");
      return;
    }
    const card: PartyCardData = {
      company: selectedCustomer.customerName,
      contact: selectedCustomer.customerCode,
      address: `${selectedCustomer.city}, ${selectedCustomer.country}`,
      city: selectedCustomer.city,
      country: selectedCustomer.country,
      email: selectedCustomer.email || "",
      phone: selectedCustomer.phone || "",
    };
    setCards((prev) => {
      const next = { ...prev };
      roles.forEach((role) => {
        next[role] = { ...card };
      });
      return next;
    });
    clearSelectedCustomer();
    toast.success("Party roles assigned");
  };

  const handleDeleteCard = (role: PartyRoleKey) => {
    setCards((prev) => {
      const next = { ...prev };
      delete next[role];
      return next;
    });
  };

  const openEdit = (role: PartyRoleKey) => {
    setEditRole(role);
    setEditValue(cards[role] ? { ...cards[role]! } : emptyPartyCard());
  };

  const saveEdit = () => {
    if (!editRole || !editValue.company.trim()) {
      toast.error("Company is required");
      return;
    }
    setCards((prev) => ({ ...prev, [editRole]: { ...editValue } }));
    setEditRole(null);
    setEditValue(emptyPartyCard());
  };

  const handleNext = () => {
    const parties: PartiesData = cardsToParties(cards);
    const parsed = partiesSchema.safeParse(parties);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message || "Please complete required parties");
      return;
    }
    updateParties(parsed.data);
    nextStep();
  };

  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section booking-customer-step">
          <section className="booking-customer-step__section">
            {/* Modified by Sekar Nagarajan (2026-09-02 18:21) */}
            <div className="booking-customer-step__search-row">
              <CustomerSearchAutoComplete
                value={searchQuery}
                placeholder="Search by customer name or code"
                onChange={(val) => {
                  setSearchQuery(val);
                  if (!val.trim()) {
                    setSelectedCustomer(null);
                  }
                }}
                onSelectCustomer={handleSelectCustomer}
              />
            </div>

            {selectedCustomer ? (
              <RoleAssignPanel
                customer={selectedCustomer}
                assignedRoles={assignedRoles}
                onAssign={handleAssignRoles}
                onClear={clearSelectedCustomer}
              />
            ) : null}
          </section>

          <section className="booking-customer-step__section">
            <div className="booking-customer-step__section-head">
              <Text strong className="booking-customer-step__section-title">
                Assigned Parties
              </Text>
              <Text
                type="secondary"
                className="booking-customer-step__section-hint"
              >
                Review the customer assigned to each booking role.
              </Text>
            </div>

            <div className="booking-party-grid booking-party-grid--surface">
              {DEFAULT_PARTY_ROLES.map((role) => {
                const card = cards[role];
                const isBookingParty = role === "shipper";
                const isAgreementParty = role === "agreementParty";
                return (
                  <div key={role} className="booking-party-grid__col">
                    {card ? (
                      <PartyRoleCard
                        role={role}
                        card={card}
                        readOnly={isBookingParty}
                        fromAccount={isBookingParty}
                        canEdit={!isBookingParty}
                        canDelete={!isBookingParty && !isAgreementParty}
                        onEdit={() => openEdit(role)}
                        onDelete={() => handleDeleteCard(role)}
                      />
                    ) : (
                      <EmptyPartySlot
                        role={role}
                        onAssign={() => openEdit(role)}
                      />
                    )}
                  </div>
                );
              })}
              {otherEntries.map(([role, card]) => (
                <div key={role} className="booking-party-grid__col">
                  <PartyRoleCard
                    role={role}
                    card={card}
                    onEdit={() => openEdit(role)}
                    onDelete={() => handleDeleteCard(role)}
                  />
                </div>
              ))}
            </div>
          </section>
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>Previous</AppButton>
        <AppButton type="primary" onClick={handleNext}>
          Next
        </AppButton>
      </div>

      <PartyEditDrawer
        open={!!editRole}
        roleKey={editRole}
        value={editValue}
        onChange={setEditValue}
        onSave={saveEdit}
        onClose={() => {
          setEditRole(null);
          setEditValue(emptyPartyCard());
        }}
      />
    </div>
  );
}
