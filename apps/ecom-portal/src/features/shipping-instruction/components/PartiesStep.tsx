// Modified by Sekar Nagarajan (2026-09-05 01:05)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Switch, Tooltip, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { BookingCustomerOption } from "../../booking/api/booking.api";
import { CustomerSearchAutoComplete } from "../../booking/components/party-edit-drawer";
import { BookingModuleStyles } from "../../booking/components/booking-module-styles";
import { siPartiesSchema, type SIWizardStepProps } from "../types/si.types";
import {
  cardsToSiPartiesForm,
  DEFAULT_SI_PARTY_ROLES,
  emptySiPartyCard,
  initialSiPartyCards,
  SI_PARTY_ROLE_LABEL,
  type SiPartyCardData,
  type SiPartyRoleKey,
} from "../utils/si-party.utils";
import { SiPartyEditDrawer, SiRoleAssignPanel } from "./si-party-edit-drawer";

const { Text } = Typography;

const SI_PARTY_ROLE_ICON: Record<
  SiPartyRoleKey,
  (typeof Icons)[keyof typeof Icons]
> = {
  shipper: Icons.building,
  consignee: Icons.user,
  notify: Icons.bell,
  notify2: Icons.bell,
  notify3: Icons.bell,
  forwarder: Icons.truck,
  warehouse: Icons.boxes,
  agreementParty: Icons.handshake,
};

function partySecondaryLines(card: SiPartyCardData): string[] {
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

function SiPartyRoleCard({
  role,
  card,
  readOnly = false,
  canEdit = true,
  canDelete = true,
  fromAccount = false,
  onEdit,
  onDelete,
  onUpdateFlag,
}: {
  role: SiPartyRoleKey;
  card: SiPartyCardData;
  readOnly?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  fromAccount?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateFlag: (
    patch: Partial<Pick<SiPartyCardData, "printOnBl" | "toOrder">>,
  ) => void;
}) {
  const secondary = partySecondaryLines(card);
  const showEdit = !readOnly && canEdit;
  const showDelete = !readOnly && canDelete;

  return (
    <div className="booking-party-card booking-party-card--surface">
      <div className="booking-party-card__head">
        <div className="booking-party-card__role">
          <Text strong className="booking-party-card__role-label">
            {SI_PARTY_ROLE_LABEL[role]}
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
        <div className="si-party-card__flags">
          <label className="si-party-card__flag">
            <Text>Print on B/L</Text>
            <Switch
              size="small"
              checked={card.printOnBl}
              disabled={readOnly}
              onChange={(checked) => onUpdateFlag({ printOnBl: checked })}
            />
          </label>
          {role === "consignee" ? (
            <label className="si-party-card__flag">
              <Text>To Order</Text>
              <Switch
                size="small"
                checked={!!card.toOrder}
                disabled={readOnly}
                onChange={(checked) => onUpdateFlag({ toOrder: checked })}
              />
            </label>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptySiPartySlot({
  role,
  onAssign,
}: {
  role: SiPartyRoleKey;
  onAssign: () => void;
}) {
  return (
    <div className="booking-party-card booking-party-card--surface booking-party-card--empty">
      <div className="booking-party-card__head">
        <div className="booking-party-card__role">
          <span className="booking-party-card__role-icon app-icon-inherit">
            <AppIcon icon={SI_PARTY_ROLE_ICON[role]} size={16} />
          </span>
          <Text strong className="booking-party-card__role-label">
            {SI_PARTY_ROLE_LABEL[role]}
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

export function PartiesStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: SIWizardStepProps) {
  const toast = useToast();
  const [cards, setCards] = useState<
    Partial<Record<SiPartyRoleKey, SiPartyCardData>>
  >(() => initialSiPartyCards(data.parties));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<BookingCustomerOption | null>(null);
  const [editRole, setEditRole] = useState<SiPartyRoleKey | null>(null);
  const [editValue, setEditValue] = useState<SiPartyCardData>(emptySiPartyCard());

  const assignedRoles = Object.keys(cards) as SiPartyRoleKey[];
  const otherEntries = (
    Object.entries(cards) as [SiPartyRoleKey, SiPartyCardData][]
  ).filter(([role]) => !DEFAULT_SI_PARTY_ROLES.includes(role));

  const handleSelectCustomer = (customer: BookingCustomerOption) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.customerName);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setSearchQuery("");
  };

  const handleAssignRoles = (roles: SiPartyRoleKey[]) => {
    if (!selectedCustomer || roles.length === 0) {
      toast.error("Select at least one role");
      return;
    }
    const card: SiPartyCardData = {
      company: selectedCustomer.customerName,
      contact: selectedCustomer.customerCode,
      address: `${selectedCustomer.city}, ${selectedCustomer.country}`,
      city: selectedCustomer.city,
      country: selectedCustomer.country,
      email: selectedCustomer.email || "",
      phone: selectedCustomer.phone || "",
      printOnBl: true,
    };
    setCards((prev) => {
      const next = { ...prev };
      roles.forEach((role) => {
        next[role] = {
          ...card,
          toOrder: role === "consignee" ? false : undefined,
        };
      });
      return next;
    });
    clearSelectedCustomer();
    toast.success("Party roles assigned");
  };

  const handleDeleteCard = (role: SiPartyRoleKey) => {
    setCards((prev) => {
      const next = { ...prev };
      delete next[role];
      return next;
    });
  };

  const openEdit = (role: SiPartyRoleKey) => {
    setEditRole(role);
    setEditValue(cards[role] ? { ...cards[role]! } : emptySiPartyCard());
  };

  const saveEdit = () => {
    if (!editRole || !editValue.company.trim()) {
      toast.error("Company is required");
      return;
    }
    setCards((prev) => ({ ...prev, [editRole]: { ...editValue } }));
    setEditRole(null);
    setEditValue(emptySiPartyCard());
  };

  const updateCardFlag = (
    role: SiPartyRoleKey,
    patch: Partial<Pick<SiPartyCardData, "printOnBl" | "toOrder">>,
  ) => {
    setCards((prev) => {
      const current = prev[role];
      if (!current) return prev;
      return { ...prev, [role]: { ...current, ...patch } };
    });
  };

  const handleNext = () => {
    const parsed = siPartiesSchema.safeParse(cardsToSiPartiesForm(cards));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message || "Please complete required parties");
      return;
    }

    const toParty = (card: SiPartyCardData | undefined) =>
      card
        ? {
            name: card.company,
            address: card.address,
            city: card.city,
            country: card.country,
            email: card.email,
            phone: card.phone,
            printOnBl: card.printOnBl,
          }
        : undefined;

    onUpdate({
      parties: {
        shipper: toParty(cards.shipper) ?? data.parties.shipper,
        consignee: {
          ...(toParty(cards.consignee) ?? data.parties.consignee),
          toOrder: cards.consignee?.toOrder ?? false,
        },
        notify: toParty(cards.notify ?? cards.consignee) ?? data.parties.notify,
        notify2: toParty(cards.notify2),
        notify3: toParty(cards.notify3),
        forwarder: toParty(cards.forwarder) ?? data.parties.forwarder,
        warehouse: toParty(cards.warehouse) ?? data.parties.warehouse,
        agreementParty:
          toParty(cards.agreementParty) ?? data.parties.agreementParty,
      },
    });
    onNext();
  };

  return (
    <div className="form-step-layout">
      <BookingModuleStyles />
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section booking-customer-step">
          <section className="booking-customer-step__section">
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
              <SiRoleAssignPanel
                customer={selectedCustomer}
                assignedRoles={assignedRoles}
                onAssign={handleAssignRoles}
                onClear={clearSelectedCustomer}
              />
            ) : null}
          </section>

          <section className="booking-customer-step__section">
            <div className="booking-party-grid booking-party-grid--surface">
              {DEFAULT_SI_PARTY_ROLES.map((role) => {
                const card = cards[role];
                const isBookingParty = role === "shipper";
                return (
                  <div key={role} className="booking-party-grid__col">
                    {card ? (
                      <SiPartyRoleCard
                        role={role}
                        card={card}
                        readOnly={isBookingParty}
                        fromAccount={isBookingParty}
                        canEdit={!isBookingParty}
                        canDelete={false}
                        onEdit={() => openEdit(role)}
                        onDelete={() => handleDeleteCard(role)}
                        onUpdateFlag={(patch) => updateCardFlag(role, patch)}
                      />
                    ) : (
                      <EmptySiPartySlot
                        role={role}
                        onAssign={() => openEdit(role)}
                      />
                    )}
                  </div>
                );
              })}
              {otherEntries.map(([role, card]) => (
                <div key={role} className="booking-party-grid__col">
                  <SiPartyRoleCard
                    role={role}
                    card={card}
                    onEdit={() => openEdit(role)}
                    onDelete={() => handleDeleteCard(role)}
                    onUpdateFlag={(patch) => updateCardFlag(role, patch)}
                  />
                </div>
              ))}
            </div>
          </section>
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isSubmitting}>
          Previous
        </AppButton>
        <AppButton type="primary" onClick={handleNext} disabled={isSubmitting}>
          Next
        </AppButton>
      </div>

      <SiPartyEditDrawer
        open={!!editRole}
        roleKey={editRole}
        value={editValue}
        onChange={setEditValue}
        onSave={saveEdit}
        onClose={() => {
          setEditRole(null);
          setEditValue(emptySiPartyCard());
        }}
      />
    </div>
  );
}
