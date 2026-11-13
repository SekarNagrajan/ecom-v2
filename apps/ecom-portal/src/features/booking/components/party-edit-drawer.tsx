// Modified by Sekar Nagarajan (2026-08-28 00:45)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { AutoComplete, Col, Input, Row, Typography } from "antd";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { BookingCustomerOption } from "../api/booking.api";
import { bookingApi } from "../api/booking.api";
import {
  emptyPartyCard,
  getPartyRoleLabel,
  getPartyRoleOptions,
  PARTY_ROLE_LABEL,
  PARTY_ROLE_OPTIONS,
  type PartyCardData,
  type PartyRoleKey,
} from "../utils/party-role.utils";

const { Text } = Typography;

const SEARCH_DEBOUNCE_MS = 300; // 300ms

interface PartyEditDrawerProps {
  open: boolean;
  roleKey: PartyRoleKey | null;
  title?: string;
  value: PartyCardData;
  onChange: (next: PartyCardData) => void;
  onSave: () => void;
  onClose: () => void;
}

export function PartyEditDrawer({
  open,
  roleKey,
  title,
  value,
  onChange,
  onSave,
  onClose,
}: PartyEditDrawerProps) {
  const { t } = useTranslation(["booking", "common"]);
  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      title={
        title ?? (roleKey ? t("booking:wizard.parties.editRole", { role: getPartyRoleLabel(roleKey, t) }) : t("booking:wizard.parties.editParty"))
      }
      width={480}
      footer={
        <div className="booking-party-drawer-footer">
          <AppButton danger onClick={onClose}>
            {t("common:actions.cancel")}
          </AppButton>
          <AppButton
            type="primary"
            onClick={onSave}
            disabled={!value.company.trim()}
          >
            {t("common:actions.save")}
          </AppButton>
        </div>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <label className="form-field-label">
            {t("booking:wizard.parties.fields.company")} <Text type="danger">*</Text>
          </label>
          <Input
            size="large"
            value={value.company}
            onChange={(e) => onChange({ ...value, company: e.target.value })}
          />
        </Col>
        <Col span={24}>
          <label className="form-field-label">{t("booking:wizard.parties.fields.contactCode")}</label>
          <Input
            size="large"
            value={value.contact}
            onChange={(e) => onChange({ ...value, contact: e.target.value })}
          />
        </Col>
        <Col span={24}>
          <label className="form-field-label">{t("booking:wizard.parties.fields.address")}</label>
          <Input
            size="large"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
          />
        </Col>
        <Col span={12}>
          <label className="form-field-label">{t("booking:wizard.parties.fields.city")}</label>
          <Input
            size="large"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
          />
        </Col>
        <Col span={12}>
          <label className="form-field-label">{t("booking:wizard.parties.fields.country")}</label>
          <Input
            size="large"
            value={value.country}
            onChange={(e) => onChange({ ...value, country: e.target.value })}
          />
        </Col>
        <Col span={12}>
          <label className="form-field-label">{t("booking:wizard.parties.fields.email")}</label>
          <Input
            size="large"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
          />
        </Col>
        <Col span={12}>
          <label className="form-field-label">{t("booking:wizard.parties.fields.phone")}</label>
          <Input
            size="large"
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
          />
        </Col>
      </Row>
    </AppDrawer>
  );
}

interface CustomerSearchAutoCompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelectCustomer: (customer: BookingCustomerOption) => void;
  placeholder?: string;
}

export function CustomerSearchAutoComplete({
  value,
  onChange,
  onSelectCustomer,
  placeholder,
}: CustomerSearchAutoCompleteProps) {
  const { t } = useTranslation("booking");
  const [options, setOptions] = useState<BookingCustomerOption[]>([]);
  const [fetching, setFetching] = useState(false);
  const [innerValue, setInnerValue] = useState(value ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsRef = useRef<BookingCustomerOption[]>([]);

  const displayValue = value !== undefined ? value : innerValue;

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setOptions([]);
      optionsRef.current = [];
      return;
    }
    setFetching(true);
    try {
      const data = await bookingApi.searchCustomers(q);
      setOptions(data);
      optionsRef.current = data;
    } catch {
      setOptions([]);
      optionsRef.current = [];
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(q);
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleChange = (val: string) => {
    setInnerValue(val);
    onChange?.(val);
  };

  return (
    <AutoComplete
      value={displayValue}
      size="large"
      className="booking-party-search-input form-field-full-width"
      options={options.map((o) => ({
        value: o.customerCode,
        label: (
          <div className="booking-party-suggest-option">
            <Text strong>{o.customerName}</Text>
            <Text
              type="secondary"
              className="booking-party-suggest-option__meta"
            >
              {o.customerCode} · {o.city}, {o.country}
            </Text>
          </div>
        ),
      }))}
      onSearch={handleSearch}
      onSelect={(code) => {
        const match = optionsRef.current.find((o) => o.customerCode === code);
        if (match) {
          handleChange(match.customerName);
          onSelectCustomer(match);
        }
      }}
      onChange={(val) => handleChange(String(val ?? ""))}
      notFoundContent={
        fetching
          ? t("wizard.parties.searching")
          : displayValue.trim()
          ? t("wizard.parties.noCustomers")
          : null
      }
    >
      <Input
        size="large"
        allowClear
        placeholder={placeholder ?? t("wizard.parties.typeCustomerPlaceholder")}
        prefix={<AppIcon icon={Icons.search} size={16} />}
      />
    </AutoComplete>
  );
}

interface RoleAssignPanelProps {
  customer: BookingCustomerOption;
  assignedRoles: PartyRoleKey[];
  onAssign: (roles: PartyRoleKey[]) => void;
  onClear: () => void;
}

/** Inline role picker — no popup / modal. */
export function RoleAssignPanel({
  customer,
  assignedRoles,
  onAssign,
  onClear,
}: RoleAssignPanelProps) {
  const { t } = useTranslation(["booking", "common"]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const localizedRoleOptions = getPartyRoleOptions(t);

  const selectedCount = localizedRoleOptions.filter(
    (role) => selected[role.key] && !assignedRoles.includes(role.key),
  ).length;

  const toggleRole = (roleKey: PartyRoleKey) => {
    if (assignedRoles.includes(roleKey)) return;
    setSelected((prev) => ({
      ...prev,
      [roleKey]: !prev[roleKey],
    }));
  };

  const handleAssign = () => {
    const roles = localizedRoleOptions.filter(
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
      </div>

      <Text type="secondary" className="booking-party-role-panel__hint">
        {t("booking:wizard.parties.assignHint")}
      </Text>

      <div className="booking-party-role-chips">
        {localizedRoleOptions.map((role) => {
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
                <span className="booking-party-role-chip__tag">{t("booking:wizard.parties.assigned")}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="booking-party-role-actions">
        <AppButton
          danger
          onClick={() => {
            setSelected({});
            onClear();
          }}
        >
          {t("common:actions.cancel")}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.userPlus} size={16} tone="view" />}
          onClick={handleAssign}
          disabled={selectedCount === 0}
        >
          {selectedCount > 0 ? t("booking:wizard.parties.addSelectedCount", { count: selectedCount }) : t("booking:wizard.parties.addSelected")}
        </AppButton>
      </div>
    </div>
  );
}

export { emptyPartyCard };
