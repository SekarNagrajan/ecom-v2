// Created by Sekar Nagarajan (2026-08-28 00:45)
import { AppButton } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { BookingCustomerOption } from "../../booking/api/booking.api";
import { PartyEditDrawer } from "../../booking/components/party-edit-drawer";
import {
  SI_PARTY_ROLE_LABEL,
  SI_PARTY_ROLE_OPTIONS,
  type SiPartyCardData,
  type SiPartyRoleKey,
} from "../utils/si-party.utils";

const { Text } = Typography;

interface SiPartyEditDrawerProps {
  open: boolean;
  roleKey: SiPartyRoleKey | null;
  value: SiPartyCardData;
  onChange: (next: SiPartyCardData) => void;
  onSave: () => void;
  onClose: () => void;
}

export function SiPartyEditDrawer({
  open,
  roleKey,
  value,
  onChange,
  onSave,
  onClose,
}: SiPartyEditDrawerProps) {
  return (
    <PartyEditDrawer
      open={open}
      roleKey={null}
      title={roleKey ? `Edit ${SI_PARTY_ROLE_LABEL[roleKey]}` : "Edit Party"}
      value={value}
      onChange={(next) => onChange({ ...value, ...next })}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

interface SiRoleAssignPanelProps {
  customer: BookingCustomerOption;
  assignedRoles: SiPartyRoleKey[];
  onAssign: (roles: SiPartyRoleKey[]) => void;
  onClear: () => void;
}

export function SiRoleAssignPanel({
  customer,
  assignedRoles,
  onAssign,
  onClear,
}: SiRoleAssignPanelProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedCount = SI_PARTY_ROLE_OPTIONS.filter(
    (role) => selected[role.key] && !assignedRoles.includes(role.key),
  ).length;

  const toggleRole = (roleKey: SiPartyRoleKey) => {
    if (assignedRoles.includes(roleKey)) return;
    setSelected((prev) => ({
      ...prev,
      [roleKey]: !prev[roleKey],
    }));
  };

  const handleAssign = () => {
    const roles = SI_PARTY_ROLE_OPTIONS.filter(
      (role) => selected[role.key] && !assignedRoles.includes(role.key),
    ).map((role) => role.key);
    onAssign(roles);
    setSelected({});
  };

  return (
    <div className="booking-party-role-panel" key={customer.customerCode}>
      <div className="booking-party-role-panel__header">
        <div className="booking-party-role-panel__customer">
          <span className="booking-party-role-panel__customer-icon app-icon-inherit">
            <AppIcon icon={Icons.building} size={18} />
          </span>
          <div className="booking-party-role-panel__customer-info">
            <Text strong>{customer.customerName}</Text>
            <Text type="secondary" className="booking-party-role-panel__meta">
              {customer.customerCode} · {customer.city}, {customer.country}
            </Text>
          </div>
        </div>
        <AppButton
          size="small"
          danger
          icon={<AppIcon icon={Icons.x} size={14} tone="delete" />}
          onClick={() => {
            setSelected({});
            onClear();
          }}
        ></AppButton>
      </div>

      <Text type="secondary" className="booking-party-role-panel__hint">
        Select roles to assign this customer, then click Add Selected.
      </Text>

      <div className="booking-party-role-chips">
        {SI_PARTY_ROLE_OPTIONS.map((role) => {
          const already = assignedRoles.includes(role.key);
          const isSelected = !!selected[role.key] || already;
          return (
            <button
              key={role.key}
              type="button"
              disabled={already}
              className={[
                "booking-party-role-chip",
                isSelected ? "booking-party-role-chip--selected" : "",
                already ? "booking-party-role-chip--assigned" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => toggleRole(role.key)}
            >
              {isSelected ? (
                <AppIcon icon={Icons.check} size={14} />
              ) : (
                <AppIcon icon={Icons.plus} size={14} />
              )}
              <span>{role.label}</span>
              {already ? (
                <span className="booking-party-role-chip__tag">Assigned</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="booking-party-role-actions">
        <AppButton
          onClick={() => {
            setSelected({});
            onClear();
          }}
        >
          Cancel
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.userPlus} size={16} tone="view" />}
          onClick={handleAssign}
          disabled={selectedCount === 0}
        >
          Add Selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
        </AppButton>
      </div>
    </div>
  );
}
