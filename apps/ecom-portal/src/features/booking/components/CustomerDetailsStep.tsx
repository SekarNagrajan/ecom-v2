// Modified by Sekar Nagarajan (2026-08-27 23:52)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, Row, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import type { BookingCustomerOption } from "../api/booking.api";
import { useBookingStore } from "../stores/booking.store";
import { partiesSchema, type PartiesData } from "../types/booking.types";
import {
  cardsToParties,
  emptyPartyCard,
  PARTY_ROLE_LABEL,
  partiesToCards,
  type PartyCardData,
  type PartyRoleKey,
} from "../utils/party-role.utils";
import {
  CustomerSearchAutoComplete,
  PartyEditDrawer,
  RoleAssignPanel,
} from "./party-edit-drawer";

const { Text, Title } = Typography;

export function CustomerDetailsStep() {
  const toast = useToast();
  const { payload, updateParties, nextStep, prevStep } = useBookingStore();
  const [cards, setCards] = useState<
    Partial<Record<PartyRoleKey, PartyCardData>>
  >(() => partiesToCards(payload.parties));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<BookingCustomerOption | null>(null);
  const [editRole, setEditRole] = useState<PartyRoleKey | null>(null);
  const [editValue, setEditValue] = useState<PartyCardData>(emptyPartyCard());

  const assignedRoles = Object.keys(cards) as PartyRoleKey[];
  const cardEntries = Object.entries(cards) as [PartyRoleKey, PartyCardData][];

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
            <RoleAssignPanel
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
              Search and assign customers to Shipper, Consignee, and other roles.
            </Text>
          ) : (
            <Row gutter={[24, 24]} className="booking-party-grid">
              {cardEntries.map(([role, card]) => (
                <Col xs={24} md={12} key={role} className="booking-party-grid__col">
                  <Card
                    size="small"
                    className="booking-party-card"
                    title={
                      <Title level={5} className="booking-party-card__title">
                        {PARTY_ROLE_LABEL[role]}
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
                        <Text type="secondary" className="booking-party-card__meta">
                          {card.contact}
                        </Text>
                      ) : null}
                      {card.address || card.city ? (
                        <Text type="secondary" className="booking-party-card__meta">
                          {[card.address, card.city, card.country]
                            .filter(Boolean)
                            .join(", ")}
                        </Text>
                      ) : null}
                      {card.email || card.phone ? (
                        <Text type="secondary" className="booking-party-card__meta">
                          {[card.email, card.phone].filter(Boolean).join(" · ")}
                        </Text>
                      ) : null}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
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
