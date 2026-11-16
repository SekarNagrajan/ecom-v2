// Modified by Sekar Nagarajan (2026-11-16 16:52) — CRO-style origin/delivery route band
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { ContractDTO, SurchargeDTO } from "../types/rates.types";

const { Title, Text } = Typography;

interface ContractSurchargeModalProps {
  contract: ContractDTO | null;
  open: boolean;
  onClose: () => void;
  onBook?: () => void;
  onShare?: () => void;
}

interface ChargeRow {
  id: string;
  chargeCode: string;
  chargeName: string;
  amount: number;
  isNor: boolean;
  isOceanFreight?: boolean;
}

function dash(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
}

function formatAmount(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function placeLine(name?: string): string {
  return String(name ?? "")
    .replace(/\s*\([^)]*\)\s*/g, "")
    .replace(/,/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Included-surcharges drawer: route band, facts grid, Code/Charge/Amount
 * lines (OFR + surcharges), subtotal + all-in, Share / Book actions.
 */
export function ContractSurchargeModal({
  contract,
  open,
  onClose,
  onBook,
  onShare,
}: ContractSurchargeModalProps) {
  const { t } = useTranslation(["rates", "common", "modules"]);

  if (!contract) return null;

  const surcharges = contract.surcharges ?? [];
  const surchargeTotal = surcharges.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const allInTotal = Number(contract.oceanFreight || 0) + surchargeTotal;

  const rows: ChargeRow[] = [
    {
      id: `${contract.id}-ofr`,
      chargeCode: "OFR",
      chargeName: t("contractSurcharge.oceanFreight"),
      amount: Number(contract.oceanFreight || 0),
      isNor: false,
      isOceanFreight: true,
    },
    ...surcharges.map((line: SurchargeDTO) => ({
      id: line.id,
      chargeCode: line.chargeCode,
      chargeName: line.chargeName,
      amount: Number(line.amount || 0),
      isNor: Boolean(line.isNor),
    })),
  ];

  const columns: ColumnsType<ChargeRow> = [
    {
      title: t("contractSurcharge.columns.code"),
      dataIndex: "chargeCode",
      key: "chargeCode",
      width: 88,
      render: (value: string) => (
        <Text strong className="rates-surcharge-code">
          {value}
        </Text>
      ),
    },
    {
      title: t("contractSurcharge.columns.charge"),
      dataIndex: "chargeName",
      key: "chargeName",
      render: (value: string, record) => (
        <div className="rates-surcharge-line">
          <span className="rates-surcharge-line__name">{value}</span>
          {record.isNor ? (
            <span className="rates-card__flag-chip rates-surcharge-nor-chip">
              <span className="rates-card__flag-chip-text">{t("surchargeView.columns.nor")}</span>
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: contract.currency || t("rateList.columns.currency"),
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 120,
      render: (value: number) => (
        <Text strong className="rates-surcharge-amount">
          {formatAmount(value)}
        </Text>
      ),
    },
  ];

  const summaryItems = [
    {
      key: "rateNo",
      label: t("contract.columns.rateNo"),
      value: dash(contract.rateNo),
    },
    {
      key: "equipment",
      label: t("contractSurcharge.columns.equipment"),
      value: dash(contract.eqpType),
    },
    {
      key: "commodity",
      label: t("rateList.columns.commodity"),
      value: contract.commodityName
        ? `${contract.commodityName} (${contract.commodity})`
        : dash(contract.commodity),
    },
    {
      key: "validity",
      label: t("contractSurcharge.columns.validity"),
      value: t("contract.validityRange", {
        from: dash(contract.effectiveFrom),
        to: dash(contract.effectiveTo),
      }),
    },
  ];

  const showActions = Boolean(onBook || onShare);
  const originPlace = placeLine(contract.originPortName);
  const deliveryPlace = placeLine(contract.deliveryPortName);

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      dialogSize="md"
      classNames={{
        body: "rates-drawer-body custom-scroll",
        footer: "rates-drawer-footer",
      }}
      title={
        <div className="rates-drawer-title">
          <div className="rates-drawer-title__copy">
            <Title level={4} className="rates-drawer-title__text">
              {t("contractSurcharge.includedTitle")}
            </Title>
            <Text type="secondary" className="rates-drawer-title__meta">
              {t("contractSurcharge.subtitle", {
                contractNo: contract.contractNo,
                name: contract.customerName,
                code: contract.customerCode,
              })}
            </Text>
          </div>
        </div>
      }
      footer={
        showActions ? (
          <div className="rates-drawer-actions custom-scroll">
            {onShare ? (
              <AppButton icon={<AppIcon icon={Icons.mail} size={16} />} onClick={onShare}>
                {t("actions.shareShort")}
              </AppButton>
            ) : null}
            {onBook ? (
              <AppButton type="primary" onClick={onBook}>
                {t("actions.bookAtThisRate")}
              </AppButton>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <div className="rates-stack rates-surcharge-drawer">
        <section className="rates-surcharge-summary">
          <div className="rates-surcharge-route">
            <div className="rates-surcharge-route__stop">
              <span className="rates-surcharge-route__eyebrow rates-surcharge-route__eyebrow--pol app-icon-inherit">
                <AppIcon icon={Icons.mapPin} size={12} />
                {t("contractSurcharge.loadPort")}
              </span>
              <span className="rates-surcharge-route__code">{contract.originPort}</span>
              {originPlace ? (
                <span className="rates-surcharge-route__name">{originPlace}</span>
              ) : null}
            </div>
            <div className="rates-surcharge-route__connector" aria-hidden>
              <span className="rates-surcharge-route__dot rates-surcharge-route__dot--origin" />
              <span className="rates-surcharge-route__track" />
              <span className="rates-surcharge-route__ship app-icon-inherit">
                <AppIcon icon={Icons.ship} size={14} />
              </span>
              <span className="rates-surcharge-route__track" />
              <span className="rates-surcharge-route__dot rates-surcharge-route__dot--dest" />
            </div>
            <div className="rates-surcharge-route__stop rates-surcharge-route__stop--dest">
              <span className="rates-surcharge-route__eyebrow rates-surcharge-route__eyebrow--pod app-icon-inherit">
                <AppIcon icon={Icons.mapPin} size={12} />
                {t("contractSurcharge.discharge")}
              </span>
              <span className="rates-surcharge-route__code">{contract.deliveryPort}</span>
              {deliveryPlace ? (
                <span className="rates-surcharge-route__name">{deliveryPlace}</span>
              ) : null}
            </div>
          </div>

          <dl className="rates-surcharge-facts">
            {summaryItems.map((item) => (
              <div key={item.key} className="rates-surcharge-fact">
                <dt className="rates-surcharge-fact__label">{item.label}</dt>
                <dd className="rates-surcharge-fact__value">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rates-surcharge-section">
          {rows.length <= 1 && surcharges.length === 0 ? (
            <div className="rates-empty rates-surcharge-empty">
              <AppIcon icon={Icons.inbox} size={28} />
              <Text type="secondary" className="rates-empty__text">
                {t("contractSurcharge.noSurcharges")}
              </Text>
            </div>
          ) : (
            <div className="responsive-table-wrap custom-scroll rates-surcharge-table-wrap">
              <Table<ChargeRow>
                className="rates-surcharge-table"
                dataSource={rows}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 420 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="rates-surcharge-table__subtotal">
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text type="secondary">{t("contractSurcharge.surchargesSubtotal")}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text type="secondary" className="rates-surcharge-amount">
                          {formatAmount(surchargeTotal)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row className="rates-surcharge-table__total">
                      <Table.Summary.Cell index={0} colSpan={2}>
                        <Text strong>{t("contractSurcharge.allInEstimate")}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <Text strong className="rates-surcharge-amount">
                          {formatAmount(allInTotal)}
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            </div>
          )}
        </section>
      </div>
    </AppDrawer>
  );
}
