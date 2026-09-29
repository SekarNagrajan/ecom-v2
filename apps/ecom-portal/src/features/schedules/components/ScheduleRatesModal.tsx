// Modified by Sekar Nagarajan (2026-08-25 18:40)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import {
  Card,
  Col,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Table,
  Typography,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, NavRatesIcon } from "../../../components/icons";
import type { ScheduleItem } from "../types/schedules.types";

const { Text, Title } = Typography;

interface ScheduleRatesModalProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
  onProceedBooking: (schedule: ScheduleItem) => void;
}

export function ScheduleRatesModal({
  schedule,
  open,
  onClose,
  onProceedBooking,
}: ScheduleRatesModalProps) {
  const { t } = useTranslation(["schedules", "common", "modules"]);
  const [qty20ft, setQty20ft] = useState<number>(1);
  const [reefer20ft, setReefer20ft] = useState<boolean>(false);
  const [qty40ft, setQty40ft] = useState<number>(0);
  const [reefer40ft, setReefer40ft] = useState<boolean>(false);
  const [qty40hc, setQty40hc] = useState<number>(0);
  const [reefer40hc, setReefer40hc] = useState<boolean>(false);
  const [commodity, setCommodity] = useState<string>("General Cargo (FAK)");

  if (!schedule) return null;

  const basePrice20 = reefer20ft ? 2200 : 1450;
  const basePrice40 = reefer40ft ? 3400 : 2100;
  const basePrice40hc = reefer40hc ? 3600 : 2250;

  const total20 = qty20ft * basePrice20;
  const total40 = qty40ft * basePrice40;
  const total40hc = qty40hc * basePrice40hc;
  const containerCount = qty20ft + qty40ft + qty40hc;
  const bafSurcharge = containerCount * 180;
  const thcSurcharge = containerCount * 220;
  const grandTotal =
    total20 + total40 + total40hc + bafSurcharge + thcSurcharge;

  const surchargeColumns = [
    {
      title: t("ratesModal.columns.chargeDescription"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("ratesModal.columns.rateUnit"),
      dataIndex: "unitRate",
      key: "unitRate",
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      title: t("ratesModal.columns.qtyCont"),
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: t("ratesModal.columns.subtotal"),
      dataIndex: "subtotal",
      key: "subtotal",
      render: (val: number) => <b>${val.toLocaleString()} USD</b>,
    },
  ];

  const surchargeData = [
    {
      key: "1",
      description: t("ratesModal.charges.ofr20"),
      unitRate: basePrice20,
      qty: qty20ft,
      subtotal: total20,
    },
    {
      key: "2",
      description: t("ratesModal.charges.ofr40"),
      unitRate: basePrice40,
      qty: qty40ft,
      subtotal: total40,
    },
    {
      key: "3",
      description: t("ratesModal.charges.ofr40hc"),
      unitRate: basePrice40hc,
      qty: qty40hc,
      subtotal: total40hc,
    },
    {
      key: "4",
      description: t("ratesModal.charges.baf"),
      unitRate: 180,
      qty: containerCount,
      subtotal: bafSurcharge,
    },
    {
      key: "5",
      description: t("ratesModal.charges.thc"),
      unitRate: 220,
      qty: containerCount,
      subtotal: thcSurcharge,
    },
  ].filter((d) => d.qty > 0);

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width="50%"
      classNames={{ body: "schedule-drawer-body custom-scroll" }}
      title={
        <Space align="center" size={8} className="schedule-drawer-title">
          <AppIcon icon={NavRatesIcon} size={20} />
          <Title level={4} className="schedule-drawer-title__text">
            {t("ratesModal.title")}
          </Title>
        </Space>
      }
      footer={
        <div className="schedule-drawer-footer">
          <AppButton danger onClick={onClose}>
            {t("common:actions.cancel")}
          </AppButton>
          <AppButton
            type="primary"
            onClick={() => {
              onClose();
              onProceedBooking(schedule);
            }}
          >
            {t("actions.bookNow")}
          </AppButton>
        </div>
      }
    >
      <div className="schedule-route-banner">
        <Text type="secondary" className="schedule-route-banner__meta">
          {t("ratesModal.routeBanner", {
            pol: schedule.polPortName,
            pod: schedule.podPortName,
            service: schedule.serviceCode,
          })}
        </Text>
      </div>

      <Card
        size="small"
        title={t("ratesModal.equipmentSelection")}
        className="schedule-panel"
      >
        <Row gutter={[16, 12]} align="middle" className="schedule-eq-row">
          <Col xs={24} sm={8}>
            <Text className="schedule-eq-label">{t("ratesModal.eq20ft")}</Text>
          </Col>
          <Col xs={24} sm={8}>
            <InputNumber
              size="large"
              min={0}
              max={50}
              value={qty20ft}
              onChange={(val) => setQty20ft(val || 0)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Space align="center">
              <Text className="schedule-eq-hint">
                {t("ratesModal.reeferHint")}
              </Text>
              <Switch
                size="small"
                checked={reefer20ft}
                onChange={setReefer20ft}
              />
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 12]} align="middle" className="schedule-eq-row">
          <Col xs={24} sm={8}>
            <Text className="schedule-eq-label">{t("ratesModal.eq40ft")}</Text>
          </Col>
          <Col xs={24} sm={8}>
            <InputNumber
              size="large"
              min={0}
              max={50}
              value={qty40ft}
              onChange={(val) => setQty40ft(val || 0)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Space align="center">
              <Text className="schedule-eq-hint">
                {t("ratesModal.reeferHint")}
              </Text>
              <Switch
                size="small"
                checked={reefer40ft}
                onChange={setReefer40ft}
              />
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 12]} align="middle" className="schedule-eq-row">
          <Col xs={24} sm={8}>
            <Text className="schedule-eq-label">{t("ratesModal.eq40hc")}</Text>
          </Col>
          <Col xs={24} sm={8}>
            <InputNumber
              size="large"
              min={0}
              max={50}
              value={qty40hc}
              onChange={(val) => setQty40hc(val || 0)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Space align="center">
              <Text className="schedule-eq-hint">
                {t("ratesModal.reeferHint")}
              </Text>
              <Switch
                size="small"
                checked={reefer40hc}
                onChange={setReefer40hc}
              />
            </Space>
          </Col>
        </Row>

        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Text strong className="form-field-label">
              {t("ratesModal.commodityName")}
            </Text>
          </Col>
          <Col xs={24} sm={16}>
            <Input
              size="large"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder={t("ratesModal.commodityPlaceholder")}
            />
          </Col>
        </Row>
      </Card>

      <Card
        size="small"
        title={t("ratesModal.breakdownTitle")}
        className="schedule-panel"
      >
        <div className="responsive-table-wrap custom-scroll">
          <Table
            dataSource={surchargeData}
            columns={surchargeColumns}
            pagination={false}
            size="small"
          />
        </div>

        <div className="schedule-rates-total">
          <Text className="schedule-rates-total__label">
            {t("ratesModal.totalLabel")}
          </Text>
          <Title level={3} className="schedule-rates-total__value">
            {t("ratesModal.totalValue", {
              amount: grandTotal.toLocaleString(),
            })}
          </Title>
        </div>
      </Card>
    </AppDrawer>
  );
}
