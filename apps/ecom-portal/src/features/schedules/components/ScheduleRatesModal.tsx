// Modified by Sekar Nagarajan (2026-10-27 12:35)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { InputNumber, Select, Switch, Table, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavRatesIcon } from "../../../components/icons";
import type { ScheduleItem } from "../types/schedules.types";

const { Text, Title } = Typography;

const QTY_MIN = 0;
const QTY_MAX = 50;

interface ScheduleRatesModalProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
  onProceedBooking: (schedule: ScheduleItem) => void;
}

type EquipmentKey = "eq20" | "eq40" | "eq40hc";

interface EquipmentRowState {
  qty: number;
  reefer: boolean;
}

const EQUIPMENT_ORDER: EquipmentKey[] = ["eq20", "eq40", "eq40hc"];

const EQUIPMENT_META: Record<
  EquipmentKey,
  {
    titleKey: string;
    drySubKey: string;
    reeferSubKey: string;
    tone: "pol" | "success" | "purple";
    dryRate: number;
    reeferRate: number;
    chargeKey: string;
  }
> = {
  eq20: {
    titleKey: "ratesModal.eq20ft",
    drySubKey: "ratesModal.eq20ftSub",
    reeferSubKey: "ratesModal.eq20ftReeferSub",
    tone: "pol",
    dryRate: 1450,
    reeferRate: 2200,
    chargeKey: "ratesModal.charges.ofr20",
  },
  eq40: {
    titleKey: "ratesModal.eq40ft",
    drySubKey: "ratesModal.eq40ftSub",
    reeferSubKey: "ratesModal.eq40ftReeferSub",
    tone: "success",
    dryRate: 2100,
    reeferRate: 3400,
    chargeKey: "ratesModal.charges.ofr40",
  },
  eq40hc: {
    titleKey: "ratesModal.eq40hc",
    drySubKey: "ratesModal.eq40hcSub",
    reeferSubKey: "ratesModal.eq40hcReeferSub",
    tone: "purple",
    dryRate: 2250,
    reeferRate: 3600,
    chargeKey: "ratesModal.charges.ofr40hc",
  },
};

const DEFAULT_EQUIPMENT: Record<EquipmentKey, EquipmentRowState> = {
  eq20: { qty: 1, reefer: false },
  eq40: { qty: 0, reefer: false },
  eq40hc: { qty: 0, reefer: false },
};

const COMMODITY_OPTIONS = [
  "General Cargo (FAK)",
  "Electronics",
  "Foodstuffs",
  "Automotive Parts",
  "Textiles",
] as const;

function clampQty(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return QTY_MIN;
  return Math.min(QTY_MAX, Math.max(QTY_MIN, Math.trunc(value)));
}

function QtyStepper({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (next: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="schedule-rates-stepper" aria-label={ariaLabel}>
      <AppButton
        type="default"
        size="small"
        className="schedule-rates-stepper__btn"
        aria-label="Decrease quantity"
        disabled={value <= QTY_MIN}
        onClick={() => onChange(clampQty(value - 1))}
        icon={
          <span className="app-icon-inherit">
            <AppIcon icon={Icons.minus} size={14} />
          </span>
        }
      />
      <InputNumber
        className="schedule-rates-stepper__input"
        size="small"
        min={QTY_MIN}
        max={QTY_MAX}
        step={1}
        precision={0}
        controls={false}
        value={value}
        aria-label={ariaLabel}
        onChange={(next) => onChange(clampQty(next))}
        onBlur={() => onChange(clampQty(value))}
      />
      <AppButton
        type="default"
        size="small"
        className="schedule-rates-stepper__btn"
        aria-label="Increase quantity"
        disabled={value >= QTY_MAX}
        onClick={() => onChange(clampQty(value + 1))}
        icon={
          <span className="app-icon-inherit">
            <AppIcon icon={Icons.plus} size={14} />
          </span>
        }
      />
    </div>
  );
}

export function ScheduleRatesModal({
  schedule,
  open,
  onClose,
  onProceedBooking,
}: ScheduleRatesModalProps) {
  const { t } = useTranslation(["schedules", "common", "modules"]);
  const [equipment, setEquipment] =
    useState<Record<EquipmentKey, EquipmentRowState>>(DEFAULT_EQUIPMENT);
  const [commodity, setCommodity] = useState<string>(COMMODITY_OPTIONS[0]);

  useEffect(() => {
    if (!open) return;
    setEquipment(DEFAULT_EQUIPMENT);
    setCommodity(COMMODITY_OPTIONS[0]);
  }, [open, schedule?.id]);

  const estimate = useMemo(() => {
    const lines: Array<{
      key: string;
      index: number;
      description: string;
      unitRate: number;
      qty: number;
      subtotal: number;
    }> = [];

    let containerCount = 0;
    let freightTotal = 0;

    EQUIPMENT_ORDER.forEach((key) => {
      const row = equipment[key];
      const meta = EQUIPMENT_META[key];
      if (row.qty <= 0) return;
      const unitRate = row.reefer ? meta.reeferRate : meta.dryRate;
      const subtotal = row.qty * unitRate;
      containerCount += row.qty;
      freightTotal += subtotal;
      lines.push({
        key,
        index: lines.length + 1,
        description: t(meta.chargeKey),
        unitRate,
        qty: row.qty,
        subtotal,
      });
    });

    const bafSurcharge = containerCount * 180;
    const thcSurcharge = containerCount * 220;

    if (containerCount > 0) {
      lines.push({
        key: "baf",
        index: lines.length + 1,
        description: t("ratesModal.charges.baf"),
        unitRate: 180,
        qty: containerCount,
        subtotal: bafSurcharge,
      });
      lines.push({
        key: "thc",
        index: lines.length + 1,
        description: t("ratesModal.charges.thc"),
        unitRate: 220,
        qty: containerCount,
        subtotal: thcSurcharge,
      });
    }

    return {
      lines,
      grandTotal: freightTotal + bafSurcharge + thcSurcharge,
      containerCount,
    };
  }, [equipment, t]);

  if (!schedule) return null;

  const updateQty = (key: EquipmentKey, qty: number) => {
    setEquipment((prev) => ({ ...prev, [key]: { ...prev[key], qty } }));
  };

  const updateReefer = (key: EquipmentKey, reefer: boolean) => {
    setEquipment((prev) => ({ ...prev, [key]: { ...prev[key], reefer } }));
  };

  const surchargeColumns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 48,
    },
    {
      title: t("ratesModal.columns.chargeDescription"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("ratesModal.columns.rateUnit"),
      dataIndex: "unitRate",
      key: "unitRate",
      align: "right" as const,
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      title: t("ratesModal.columns.qtyCont"),
      dataIndex: "qty",
      key: "qty",
      align: "center" as const,
      width: 88,
    },
    {
      title: t("ratesModal.columns.subtotal"),
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right" as const,
      render: (val: number) => (
        <Text strong className="schedule-rates-breakdown__subtotal">
          ${val.toLocaleString()} USD
        </Text>
      ),
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width={720}
      classNames={{
        body: "schedule-drawer-body schedule-rates-drawer__body custom-scroll",
        footer: "schedule-rates-drawer__footer-wrap",
      }}
      title={
        <div className="schedule-drawer-title schedule-rates-drawer__title">
          <span className="schedule-rates-drawer__title-icon app-icon-inherit">
            <AppIcon icon={NavRatesIcon} size={18} />
          </span>
          <Title level={5} className="schedule-drawer-title__text">
            {t("ratesModal.title")}
          </Title>
        </div>
      }
      footer={
        <div className="schedule-drawer-footer">
          <AppButton danger onClick={onClose}>
            {t("common:actions.cancel")}
          </AppButton>
          <AppButton
            type="primary"
            disabled={!schedule.bookingAllowed || estimate.containerCount === 0}
            onClick={() => {
              if (!schedule.bookingAllowed) return;
              onClose();
              onProceedBooking(schedule);
            }}
          >
            {t("actions.bookNow")}
          </AppButton>
        </div>
      }
    >
      <div className="schedule-rates-drawer">
        <div className="schedule-rates-route">
          <div className="schedule-rates-route__endpoint">
            <span className="schedule-rates-route__icon schedule-rates-route__icon--pol app-icon-inherit">
              <AppIcon icon={Icons.ship} size={16} />
            </span>
            <div className="schedule-rates-route__copy">
              <Text type="secondary" className="schedule-rates-route__label">
                {t("ratesModal.origin")}
              </Text>
              <Text
                strong
                className="schedule-rates-route__value"
                ellipsis={{ tooltip: schedule.polPortName }}
              >
                {schedule.polPortName}
              </Text>
            </div>
          </div>

          <span className="schedule-rates-route__arrow app-icon-inherit" aria-hidden>
            <AppIcon icon={Icons.arrowRight} size={16} />
          </span>

          <div className="schedule-rates-route__endpoint">
            <span className="schedule-rates-route__icon schedule-rates-route__icon--pod app-icon-inherit">
              <AppIcon icon={Icons.mapPin} size={16} />
            </span>
            <div className="schedule-rates-route__copy">
              <Text type="secondary" className="schedule-rates-route__label">
                {t("ratesModal.destination")}
              </Text>
              <Text
                strong
                className="schedule-rates-route__value"
                ellipsis={{ tooltip: schedule.podPortName }}
              >
                {schedule.podPortName}
              </Text>
            </div>
          </div>

          <div className="schedule-rates-route__service">
            <span className="schedule-rates-route__icon schedule-rates-route__icon--svc app-icon-inherit">
              <AppIcon icon={Icons.fileText} size={16} />
            </span>
            <div className="schedule-rates-route__copy">
              <Text type="secondary" className="schedule-rates-route__label">
                {t("ratesModal.service")}
              </Text>
              <Text strong className="schedule-rates-route__value">
                {schedule.serviceCode}
              </Text>
            </div>
          </div>
        </div>

        <section className="schedule-rates-panel">
          <Text strong className="schedule-rates-panel__title">
            {t("ratesModal.equipmentSelection")}
          </Text>

          <div className="schedule-rates-eq-list">
            {EQUIPMENT_ORDER.map((key) => {
              const meta = EQUIPMENT_META[key];
              const row = equipment[key];
              return (
                <div key={key} className="schedule-rates-eq-row">
                  <span
                    className={`schedule-rates-eq-row__icon schedule-rates-eq-row__icon--${meta.tone} app-icon-inherit`}
                  >
                    <AppIcon icon={Icons.container} size={18} />
                  </span>
                  <div className="schedule-rates-eq-row__copy">
                    <Text strong className="schedule-rates-eq-row__title">
                      {t(meta.titleKey)}
                    </Text>
                    <Text type="secondary" className="schedule-rates-eq-row__sub">
                      {t(row.reefer ? meta.reeferSubKey : meta.drySubKey)}
                    </Text>
                  </div>
                  <QtyStepper
                    value={row.qty}
                    onChange={(qty) => updateQty(key, qty)}
                    ariaLabel={t(meta.titleKey)}
                  />
                  <div className="schedule-rates-eq-row__reefer">
                    <Text type="secondary" className="schedule-rates-eq-row__reefer-label">
                      {t("ratesModal.reeferHint")}
                    </Text>
                    <Switch
                      size="small"
                      checked={row.reefer}
                      onChange={(checked) => updateReefer(key, checked)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="schedule-rates-commodity">
            <Text strong className="schedule-rates-commodity__label">
              {t("ratesModal.commodityName")}
            </Text>
            <Select
              className="schedule-rates-commodity__select"
              size="large"
              value={commodity}
              onChange={setCommodity}
              options={COMMODITY_OPTIONS.map((value) => ({
                value,
                label: value,
              }))}
            />
          </div>
        </section>

        <section className="schedule-rates-panel">
          <Text strong className="schedule-rates-panel__title">
            {t("ratesModal.breakdownTitle")}
          </Text>

          <div className="schedule-rates-breakdown responsive-table-wrap custom-scroll">
            <Table
              className="schedule-rates-breakdown__table"
              dataSource={estimate.lines}
              columns={surchargeColumns}
              pagination={false}
              size="small"
              locale={{
                emptyText: t("ratesModal.emptyBreakdown"),
              }}
              rowKey="key"
            />
          </div>

          <div className="schedule-rates-total">
            <Text className="schedule-rates-total__label">
              {t("ratesModal.totalLabel")}
            </Text>
            <Title level={4} className="schedule-rates-total__value">
              {t("ratesModal.totalValue", {
                amount: estimate.grandTotal.toLocaleString(),
              })}
            </Title>
          </div>
        </section>
      </div>
    </AppDrawer>
  );
}
