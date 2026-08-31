// Modified by Sekar Nagarajan (2026-08-31 22:59)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Col, Row, Switch, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../../components/shared/list-action-button";
import { RESPONSIVE_COL } from "../../../../constants/responsive-grid";
import type { BookingCustomerOption } from "../../../booking/api/booking.api";
import { CustomerSearchAutoComplete } from "../../../booking/components/party-edit-drawer";
import {
  SiPartyEditDrawer,
  SiRoleAssignPanel,
} from "../../../shipping-instruction/components/si-party-edit-drawer";
import {
  DEFAULT_SI_PARTY_ROLES,
  emptySiPartyCard,
  initialSiPartyCards,
  SI_PARTY_ROLE_LABEL,
  siPartyRoleCardClassName,
  type SiPartyCardData,
  type SiPartyRoleKey,
} from "../../../shipping-instruction/utils/si-party.utils";
import { blPartiesStepSchema } from "../../types/bl.types";
import {
  cardsToBlParties,
  cardsToSiPartiesForm,
} from "../../utils/bl-party.utils";
import { BlPartyStyles } from "../bl-party-styles";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text, Title } = Typography;

function BlPartyRoleCard({
  role,
  card,
  readOnly = false,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
  onUpdateFlag,
}: {
  role: SiPartyRoleKey;
  card: SiPartyCardData;
  readOnly?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateFlag: (
    patch: Partial<Pick<SiPartyCardData, "printOnBl" | "toOrder">>,
  ) => void;
}) {
  const showActions = !readOnly && (canEdit || canDelete);

  return (
    <Card
      size="small"
      className={siPartyRoleCardClassName(role)}
      title={
        <Title level={5} className="booking-party-card__title">
          {SI_PARTY_ROLE_LABEL[role]}
        </Title>
      }
      extra={
        showActions ? (
          <ListActionsRow>
            {canEdit ? (
              <ListActionButton
                title="Edit Party"
                icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
                onClick={onEdit}
              />
            ) : null}
            {canDelete ? (
              <ListActionButton
                title="Delete Party"
                icon={<AppIcon icon={Icons.trash} size={16} tone="delete" />}
                tone="delete"
                onClick={onDelete}
              />
            ) : null}
          </ListActionsRow>
        ) : null
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
            {[card.address, card.city, card.country].filter(Boolean).join(", ")}
          </Text>
        ) : null}
        {card.email || card.phone ? (
          <Text type="secondary" className="booking-party-card__meta">
            {[card.email, card.phone].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
        <div className="bl-party-card__flags">
          <label className="bl-party-card__flag">
            <Text>Print on B/L</Text>
            <Switch
              size="small"
              checked={card.printOnBl}
              onChange={(checked) => onUpdateFlag({ printOnBl: checked })}
            />
          </label>
          {role === "consignee" ? (
            <label className="bl-party-card__flag">
              <Text>To Order</Text>
              <Switch
                size="small"
                checked={!!card.toOrder}
                onChange={(checked) => onUpdateFlag({ toOrder: checked })}
              />
            </label>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function EmptyBlPartySlot({
  role,
  onAssign,
}: {
  role: SiPartyRoleKey;
  onAssign: () => void;
}) {
  return (
    <Card
      size="small"
      className={siPartyRoleCardClassName(role, true)}
      title={
        <Title level={5} className="booking-party-card__title">
          {SI_PARTY_ROLE_LABEL[role]}
        </Title>
      }
    >
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
    </Card>
  );
}

export function PartiesStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: BLWizardStepProps) {
  const toast = useToast();
  const [cards, setCards] = useState<
    Partial<Record<SiPartyRoleKey, SiPartyCardData>>
  >(() => initialSiPartyCards(data.parties));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<BookingCustomerOption | null>(null);
  const [editRole, setEditRole] = useState<SiPartyRoleKey | null>(null);
  const [editValue, setEditValue] = useState<SiPartyCardData>(
    emptySiPartyCard(),
  );

  const assignedRoles = Object.keys(cards) as SiPartyRoleKey[];
  const otherEntries = (
    Object.entries(cards) as [SiPartyRoleKey, SiPartyCardData][]
  ).filter(([role]) => !DEFAULT_SI_PARTY_ROLES.includes(role));
  const assignedCount = assignedRoles.length;

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
    const parsed = blPartiesStepSchema.safeParse(cardsToSiPartiesForm(cards));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message || "Please complete required parties");
      return;
    }
    if (data.blType === "Seaway" && cards.consignee?.toOrder) {
      toast.error("Sea waybill cannot have consignee to order");
      return;
    }
    onUpdate({ parties: cardsToBlParties(cards, data.parties) });
    onNext();
  };

  return (
    <div className="form-step-layout">
      <BlPartyStyles />
      <div className="custom-scroll form-step-scroll">
        <Card
          className="form-step-card form-step-section"
          title="Customer Search"
        >
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
                {assignedCount} assigned
              </Text>
            </div>
          }
        >
          {/* Modified by Sekar Nagarajan (2026-08-31 23:55) — default sections: shipper, consignee, notify */}
          <Row gutter={[24, 24]} className="booking-party-grid">
            {DEFAULT_SI_PARTY_ROLES.map((role) => {
              const card = cards[role];
              const isBookingParty = role === "shipper";
              return (
                <Col
                  key={role}
                  {...RESPONSIVE_COL.formThird}
                  className="booking-party-grid__col"
                >
                  {card ? (
                    <BlPartyRoleCard
                      role={role}
                      card={card}
                      readOnly={isBookingParty}
                      canEdit={!isBookingParty}
                      canDelete={false}
                      onEdit={() => openEdit(role)}
                      onDelete={() => handleDeleteCard(role)}
                      onUpdateFlag={(patch) => updateCardFlag(role, patch)}
                    />
                  ) : (
                    <EmptyBlPartySlot
                      role={role}
                      onAssign={() => openEdit(role)}
                    />
                  )}
                </Col>
              );
            })}
            {otherEntries.map(([role, card]) => (
              <Col
                key={role}
                {...RESPONSIVE_COL.formThird}
                className="booking-party-grid__col"
              >
                <BlPartyRoleCard
                  role={role}
                  card={card}
                  onEdit={() => openEdit(role)}
                  onDelete={() => handleDeleteCard(role)}
                  onUpdateFlag={(patch) => updateCardFlag(role, patch)}
                />
              </Col>
            ))}
          </Row>
        </Card>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
        </div>
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
