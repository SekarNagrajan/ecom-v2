// Modified by Sekar Nagarajan (2026-08-28 00:45)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, Row, Switch, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { CustomerSearchAutoComplete } from "../../booking/components/party-edit-drawer";
import {
  SiPartyEditDrawer,
  SiRoleAssignPanel,
} from "./si-party-edit-drawer";
import type { BookingCustomerOption } from "../../booking/api/booking.api";
import { siPartiesSchema, type SIWizardStepProps } from "../types/si.types";
import {
  cardsToSiPartiesForm,
  emptySiPartyCard,
  SI_PARTY_ROLE_LABEL,
  siPartiesToCards,
  type SiPartyCardData,
  type SiPartyRoleKey,
} from "../utils/si-party.utils";

const { Text, Title } = Typography;

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
  >(() => siPartiesToCards(data.parties));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<BookingCustomerOption | null>(null);
  const [editRole, setEditRole] = useState<SiPartyRoleKey | null>(null);
  const [editValue, setEditValue] = useState<SiPartyCardData>(emptySiPartyCard());

  const assignedRoles = Object.keys(cards) as SiPartyRoleKey[];
  const cardEntries = Object.entries(cards) as [
    SiPartyRoleKey,
    SiPartyCardData,
  ][];

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
        notify: toParty(cards.notify) ?? data.parties.notify,
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
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section" title="Customer Search">
          <label className="form-field-label">Search Customer</label>
          <CustomerSearchAutoComplete
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              if (!val.trim()) {
                setSelectedCustomer(null);
              }
            }}
            onSelectCustomer={handleSelectCustomer}
          />

          {selectedCustomer ? (
            <SiRoleAssignPanel
              customer={selectedCustomer}
              assignedRoles={assignedRoles}
              onAssign={handleAssignRoles}
              onClear={clearSelectedCustomer}
            />
          ) : (
            <Text type="secondary" className="booking-party-search-hint">
              Search and select a customer, then choose roles inline below.
            </Text>
          )}
        </Card>

        <Card
          className="form-step-card form-step-section booking-party-section"
          title={
            <div className="booking-party-section__title">
              <span>Assigned Parties</span>
              <Text type="secondary" className="booking-party-section__count">
                {cardEntries.length} assigned
              </Text>
            </div>
          }
        >
          {cardEntries.length === 0 ? (
            <Text type="secondary">
              Search and assign customers to Shipper, Consignee, and Notify
              Party.
            </Text>
          ) : (
            <Row gutter={[24, 24]} className="booking-party-grid">
              {cardEntries.map(([role, card]) => (
                <Col
                  xs={24}
                  md={12}
                  key={role}
                  className="booking-party-grid__col"
                >
                  <Card
                    size="small"
                    className="booking-party-card"
                    title={
                      <Title level={5} className="booking-party-card__title">
                        {SI_PARTY_ROLE_LABEL[role]}
                      </Title>
                    }
                    extra={
                      <ListActionsRow>
                        <ListActionButton
                          title="Edit Party"
                          icon={
                            <AppIcon icon={Icons.edit} size={16} tone="edit" />
                          }
                          onClick={() => openEdit(role)}
                        />
                        <ListActionButton
                          title="Delete Party"
                          icon={
                            <AppIcon
                              icon={Icons.trash}
                              size={16}
                              tone="delete"
                            />
                          }
                          tone="delete"
                          onClick={() => handleDeleteCard(role)}
                        />
                      </ListActionsRow>
                    }
                  >
                    <div className="booking-party-card__body">
                      <Text strong className="booking-party-card__company">
                        {card.company}
                      </Text>
                      {card.contact ? (
                        <Text
                          type="secondary"
                          className="booking-party-card__meta"
                        >
                          {card.contact}
                        </Text>
                      ) : null}
                      {card.address || card.city ? (
                        <Text
                          type="secondary"
                          className="booking-party-card__meta"
                        >
                          {[card.address, card.city, card.country]
                            .filter(Boolean)
                            .join(", ")}
                        </Text>
                      ) : null}
                      {card.email || card.phone ? (
                        <Text
                          type="secondary"
                          className="booking-party-card__meta"
                        >
                          {[card.email, card.phone].filter(Boolean).join(" · ")}
                        </Text>
                      ) : null}
                      <div className="si-party-card__flags">
                        <label className="si-party-card__flag">
                          <Text>Print on B/L</Text>
                          <Switch
                            size="small"
                            checked={card.printOnBl}
                            onChange={(checked) =>
                              updateCardFlag(role, { printOnBl: checked })
                            }
                          />
                        </label>
                        {role === "consignee" ? (
                          <label className="si-party-card__flag">
                            <Text>To Order</Text>
                            <Switch
                              size="small"
                              checked={!!card.toOrder}
                              onChange={(checked) =>
                                updateCardFlag(role, { toOrder: checked })
                              }
                            />
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>

      {/* Modified by Sekar Nagarajan (2026-08-28 12:40) */}
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
