// Modified by Sekar Nagarajan (2026-11-25 15:05)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Checkbox, Tag, Typography } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { usePaymentCheckout } from "../hooks/use-payment-checkout";
import type { CheckoutPaymentType, PayPendingItem } from "../types/payments.types";
import { groupPayPendingByAgency } from "../utils/build-pay-pending-items";
import { PaymentCheckoutBar } from "./PaymentCheckoutBar";
import { PayPendingModuleStyles } from "./pay-pending-module-styles";

const { Text, Title } = Typography;

interface PayPendingDrawerProps {
  open: boolean;
  items: PayPendingItem[];
  selectedIds?: string[];
  onClose: () => void;
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function paymentTypeLabel(type: CheckoutPaymentType, t: (key: string) => string): string {
  switch (type) {
    case "INV":
      return t("type.invoice");
    case "BL":
      return t("type.bl");
    case "BKG":
      return t("type.booking");
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function splitPort(value?: string): { code: string; name: string } {
  if (!value?.trim()) return { code: "—", name: "" };
  const parts = value
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) return { code: parts[0] ?? "—", name: "" };
  const [code, ...rest] = parts;
  return { code, name: rest.join(" ") };
}

function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation(["payments", "common"]);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const display = value.trim() || "—";
  const canCopy = Boolean(value.trim());

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!canCopy || copied) return;
    try {
      await navigator.clipboard.writeText(value.trim());
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        setCopied(false);
        resetTimer.current = null;
      }, 2000);
    } catch {
      // Silent fail — icon stays as copy so the user can retry.
    }
  };

  return (
    <div className="pay-pending-row__field">
      <Text className="pay-pending-row__field-label">{label}</Text>
      <div className="pay-pending-row__field-line">
        <Text className="pay-pending-row__field-value">{display}</Text>
        {canCopy ? (
          <AppButton
            type="text"
            size="small"
            className={["pay-pending-row__copy", copied ? "pay-pending-row__copy--done" : ""]
              .filter(Boolean)
              .join(" ")}
            aria-label={copied ? t("actions.copied", { label }) : t("actions.copy", { label })}
            icon={
              <AppIcon
                icon={copied ? Icons.check : Icons.copy}
                size={14}
                tone={copied ? "create" : "view"}
              />
            }
            onClick={() => void handleCopy()}
          />
        ) : null}
      </div>
    </div>
  );
}

function PayPendingRow({
  item,
  checked,
  onToggle,
}: {
  item: PayPendingItem;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const { t } = useTranslation(["payments", "common"]);
  const origin = splitPort(item.originLabel);
  const delivery = splitPort(item.deliveryLabel);
  const primaryRef = item.bookNo || item.refNo;

  return (
    <li
      className={["pay-pending-row", checked ? "pay-pending-row--selected" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pay-pending-row__select">
        <Checkbox
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          aria-label={t("rowSelectAria", { ref: primaryRef })}
        />
      </div>

      <div className="pay-pending-row__card">
        <div className="pay-pending-row__top">
          <div className="pay-pending-row__identity">
            <span className="pay-pending-row__doc-icon app-icon-inherit">
              <AppIcon icon={Icons.fileText} size={16} />
            </span>
            <Text strong className="pay-pending-row__booking">
              {primaryRef}
            </Text>
            <Tag className="pay-pending-row__type">{paymentTypeLabel(item.paymentType, t)}</Tag>
          </div>
          <div className="pay-pending-row__amount">
            <Text className="pay-pending-row__amount-label">{t("columns.amount")}</Text>
            <Text strong className="pay-pending-row__amount-value">
              {formatUsd(item.amountUsd)}
            </Text>
          </div>
        </div>

        <div className="pay-pending-row__meta">
          <CopyField label={t("columns.bl")} value={item.blNo} />
          <CopyField label={t("columns.invoice")} value={item.invNo} />
          <div className="pay-pending-row__field pay-pending-row__field--route">
            <Text className="pay-pending-row__field-label">{t("columns.route")}</Text>
            <div className="pay-pending-row__route" aria-label={t("columns.route")}>
              <span className="pay-pending-row__leg">
                <Text className="pay-pending-row__port-code">{origin.code}</Text>
                {origin.name ? (
                  <Text type="secondary" className="pay-pending-row__port-name">
                    {origin.name}
                  </Text>
                ) : null}
              </span>
              <span className="pay-pending-row__arrow" aria-hidden>
                →
              </span>
              <span className="pay-pending-row__leg">
                <Text className="pay-pending-row__port-code">{delivery.code}</Text>
                {delivery.name ? (
                  <Text type="secondary" className="pay-pending-row__port-name">
                    {delivery.name}
                  </Text>
                ) : null}
              </span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function AgencyGroup({
  agency,
  agencyItems,
  selected,
  expanded,
  onToggleExpanded,
  onToggleAgency,
  onToggleItem,
}: {
  agency: string;
  agencyItems: PayPendingItem[];
  selected: Set<string>;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleAgency: (checked: boolean) => void;
  onToggleItem: (id: string, checked: boolean) => void;
}) {
  const { t } = useTranslation(["payments", "common"]);
  const allChecked = agencyItems.every((i) => selected.has(i.id));
  const someChecked = !allChecked && agencyItems.some((i) => selected.has(i.id));
  const agencyTotal = Math.round(agencyItems.reduce((s, i) => s + i.amountUsd, 0) * 100) / 100;

  return (
    <section
      className={[
        "pay-pending-group",
        expanded ? "pay-pending-group--expanded" : "pay-pending-group--collapsed",
      ].join(" ")}
    >
      <header className="pay-pending-group__head">
        <div className="pay-pending-group__head-start">
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked}
            onChange={(e) => onToggleAgency(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="pay-pending-group__toggle"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
          >
            <span className="pay-pending-group__building app-icon-inherit">
              <AppIcon icon={Icons.building} size={16} />
            </span>
            <Text strong className="pay-pending-group__name">
              {t("agencyGroup", { agency })}
            </Text>
            <span className="pay-pending-group__badge">
              {t("agencyItemCount", { count: agencyItems.length })}
            </span>
          </button>
        </div>
        <div className="pay-pending-group__head-end">
          <Text strong className="pay-pending-group__total">
            {formatUsd(agencyTotal)}
          </Text>
          <AppButton
            type="text"
            size="small"
            className="pay-pending-group__chevron"
            aria-label={expanded ? t("actions.collapse") : t("actions.expand")}
            icon={<AppIcon icon={Icons.chevronDown} size={16} />}
            onClick={onToggleExpanded}
          />
        </div>
      </header>
      <div className="pay-pending-group__panel" aria-hidden={!expanded}>
        <div className="pay-pending-group__panel-inner">
          <ul className="pay-pending-list">
            {agencyItems.map((item) => (
              <PayPendingRow
                key={item.id}
                item={item}
                checked={selected.has(item.id)}
                onToggle={(checked) => onToggleItem(item.id, checked)}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PayPendingDrawer({
  open,
  items,
  selectedIds = [],
  onClose,
}: PayPendingDrawerProps) {
  const { t } = useTranslation(["payments", "common", "modules"]);
  const { paying, startCheckout } = usePaymentCheckout();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(selectedIds));
  const [collapsedAgencies, setCollapsedAgencies] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (open) {
      setSelected(new Set(selectedIds.length ? selectedIds : items.map((i) => i.id)));
      setCollapsedAgencies(new Set());
    }
  }, [open, selectedIds, items]);

  const groups = useMemo(() => groupPayPendingByAgency(items), [items]);
  const selectedItems = useMemo(
    () => items.filter((item) => selected.has(item.id)),
    [items, selected],
  );

  const totalOutstanding = useMemo(
    () => Math.round(items.reduce((sum, item) => sum + item.amountUsd, 0) * 100) / 100,
    [items],
  );

  const selectedTotal = useMemo(
    () => Math.round(selectedItems.reduce((sum, item) => sum + item.amountUsd, 0) * 100) / 100,
    [selectedItems],
  );

  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));
  const someSelected = !allSelected && items.some((item) => selected.has(item.id));

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAgency = (agencyItems: PayPendingItem[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of agencyItems) {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(items.map((item) => item.id)) : new Set());
  };

  const toggleAgencyExpanded = (agency: string) => {
    setCollapsedAgencies((prev) => {
      const next = new Set(prev);
      if (next.has(agency)) next.delete(agency);
      else next.add(agency);
      return next;
    });
  };

  const handlePay = async () => {
    const ok = await startCheckout(selectedItems);
    if (ok) onClose();
  };

  return (
    <>
      <PayPendingModuleStyles />
      <AppDrawer
        open={open}
        onClose={onClose}
        dialogSize="md"
        classNames={{
          header: "pay-pending-drawer__header-wrap",
          body: "pay-pending-drawer custom-scroll",
          footer: "pay-pending-drawer__footer-wrap",
        }}
        title={
          <div className="pay-pending-drawer__header">
            <span className="pay-pending-drawer__icon app-icon-inherit">
              <AppIcon icon={Icons.creditCard} size={22} />
            </span>
            <div className="pay-pending-drawer__brand-copy">
              <Text className="pay-pending-drawer__eyebrow">{t("eyebrow")}</Text>
              <Title level={5} className="pay-pending-drawer__heading">
                {t("title")}
              </Title>
            </div>
          </div>
        }
        footer={
          <PaymentCheckoutBar
            selected={selectedItems}
            paying={paying}
            onPay={() => void handlePay()}
          />
        }
      >
        {items.length === 0 ? (
          <ModuleEmptyState
            variant="blank"
            title={t("empty.title")}
            message={t("empty.message")}
            artSize="sm"
          />
        ) : (
          <div className="pay-pending-drawer__content">
            <div className="pay-pending-summary" role="group" aria-label={t("summary.label")}>
              <div className="pay-pending-summary__card pay-pending-summary__card--items">
                <span className="pay-pending-summary__icon app-icon-inherit">
                  <AppIcon icon={Icons.boxes} size={18} />
                </span>
                <div className="pay-pending-summary__copy">
                  <Text className="pay-pending-summary__label">{t("summary.items")}</Text>
                  <Text strong className="pay-pending-summary__value">
                    {items.length}
                  </Text>
                </div>
              </div>
              <div className="pay-pending-summary__card pay-pending-summary__card--due">
                <span className="pay-pending-summary__icon app-icon-inherit">
                  <AppIcon icon={Icons.dollarSign} size={18} />
                </span>
                <div className="pay-pending-summary__copy">
                  <Text className="pay-pending-summary__label">{t("summary.outstanding")}</Text>
                  <Text
                    strong
                    className="pay-pending-summary__value pay-pending-summary__value--due"
                  >
                    {formatUsd(totalOutstanding)}
                  </Text>
                </div>
              </div>
              <div className="pay-pending-summary__card pay-pending-summary__card--selected">
                <span className="pay-pending-summary__icon app-icon-inherit">
                  <AppIcon icon={Icons.checkCircle} size={18} />
                </span>
                <div className="pay-pending-summary__copy">
                  <Text className="pay-pending-summary__label">{t("summary.selected")}</Text>
                  <Text strong className="pay-pending-summary__value">
                    {selectedItems.length} · {formatUsd(selectedTotal)}
                  </Text>
                </div>
              </div>
            </div>

            <div className="pay-pending-groups">
              {[...groups.entries()].map(([agency, agencyItems]) => (
                <AgencyGroup
                  key={agency}
                  agency={agency}
                  agencyItems={agencyItems}
                  selected={selected}
                  expanded={!collapsedAgencies.has(agency)}
                  onToggleExpanded={() => toggleAgencyExpanded(agency)}
                  onToggleAgency={(checked) => toggleAgency(agencyItems, checked)}
                  onToggleItem={toggle}
                />
              ))}
            </div>
          </div>
        )}
      </AppDrawer>
    </>
  );
}
