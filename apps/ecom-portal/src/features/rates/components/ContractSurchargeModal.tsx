// Modified by Sekar Nagarajan (2026-10-19 16:55)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { ContractDTO, SurchargeDTO } from "../types/rates.types";

const { Title, Text } = Typography;

interface ContractSurchargeModalProps {
  contract: ContractDTO | null;
  open: boolean;
  onClose: () => void;
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

/** Sum surcharge amounts per currency (contracts are normally single-currency). */
function totalsByCurrency(lines: SurchargeDTO[]): { currency: string; total: number }[] {
  const map = new Map<string, number>();
  for (const line of lines) {
    map.set(line.currency, (map.get(line.currency) ?? 0) + Number(line.amount || 0));
  }
  return Array.from(map, ([currency, total]) => ({ currency, total }));
}

/**
 * Side drawer listing the surcharges bundled into a service-contract rate:
 * contract summary (route · rate · validity) on top, itemised lines below.
 */
export function ContractSurchargeModal({
  contract,
  open,
  onClose,
}: ContractSurchargeModalProps) {
  const { t } = useTranslation(["rates", "common", "modules"]);

  if (!contract) return null;

  const surcharges = contract.surcharges ?? [];
  const totals = totalsByCurrency(surcharges);

  const columns: ColumnsType<SurchargeDTO> = [
    {
      title: t("surchargeView.columns.chargeName"),
      key: "charge",
      render: (_value, record) => (
        <div className="rates-surcharge-line">
          <Tag className="rates-surcharge-line__code" color="purple">
            {record.chargeCode}
          </Tag>
          <span className="rates-surcharge-line__name">{record.chargeName}</span>
        </div>
      ),
    },
    {
      title: t("contractSurcharge.columns.equipment"),
      dataIndex: "eqpType",
      key: "eqpType",
      width: 150,
      render: (value: string, record) => (
        <div className="rates-surcharge-eqp">
          <span>{dash(value)}</span>
          {record.isNor ? (
            <Tag className="rates-surcharge-nor" color="gold">
              {t("surchargeView.columns.nor")}
            </Tag>
          ) : null}
        </div>
      ),
    },
    {
      title: t("contractSurcharge.columns.validity"),
      key: "validity",
      width: 190,
      render: (_value, record) => (
        <span className="rates-surcharge-validity">
          {t("contract.validityRange", {
            from: dash(record.effectiveFrom),
            to: dash(record.effectiveTo),
          })}
        </span>
      ),
    },
    {
      title: t("tariff.columns.amount"),
      key: "amount",
      align: "right",
      width: 150,
      render: (_value, record) => (
        <Text strong className="rates-amount rates-surcharge-amount rates-surcharge-amount--primary">
          <span className="rates-surcharge-amount__currency">{record.currency}</span>
          {formatAmount(record.amount)}
        </Text>
      ),
    },
  ];

  const summaryItems = [
    { key: "rateNo", label: t("contract.columns.rateNo"), value: dash(contract.rateNo) },
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
      label: t("contract.columns.validityWindow"),
      value: t("contract.validityRange", {
        from: dash(contract.effectiveFrom),
        to: dash(contract.effectiveTo),
      }),
    },
  ];

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      width={900}
      classNames={{
        body: "rates-drawer-body custom-scroll",
        footer: "rates-drawer-footer",
      }}
      title={
        <div className="rates-drawer-title">
          <AppIcon icon={Icons.banknote} size={22} />
          <div className="rates-drawer-title__copy">
            <Title level={4} className="rates-drawer-title__text">
              {t("contractSurcharge.title", { contractNo: contract.contractNo })}
            </Title>
            <Text type="secondary" className="rates-drawer-title__meta">
              {t("contractSurcharge.customer", {
                name: contract.customerName,
                code: contract.customerCode,
              })}
            </Text>
          </div>
        </div>
      }
   
    >
      <div className="rates-stack rates-surcharge-drawer">
        {/* Contract summary — route band + key facts + rate tiles */}
        <section className="rates-surcharge-summary">
          <div className="rates-surcharge-route">
            <div className="rates-surcharge-route__stop">
              <span className="rates-surcharge-route__eyebrow">
                {t("rateList.columns.origin")}
              </span>
              <span className="rates-surcharge-route__code">{contract.originPort}</span>
              <span className="rates-surcharge-route__name">
                {dash(contract.originPortName)}
              </span>
            </div>
            <div className="rates-surcharge-route__connector" aria-hidden>
              <span className="rates-surcharge-route__track" />
              <span className="rates-surcharge-route__ship app-icon-inherit">
                <AppIcon icon={Icons.ship} size={14} />
              </span>
              <span className="rates-surcharge-route__track" />
            </div>
            <div className="rates-surcharge-route__stop rates-surcharge-route__stop--dest">
              <span className="rates-surcharge-route__eyebrow">
                {t("rateList.columns.delivery")}
              </span>
              <span className="rates-surcharge-route__code">{contract.deliveryPort}</span>
              <span className="rates-surcharge-route__name">
                {dash(contract.deliveryPortName)}
              </span>
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

          <div className="rates-surcharge-tiles">
            <div className="rates-surcharge-tile rates-surcharge-tile--freight">
              <span className="rates-surcharge-tile__label">
                {t("contract.columns.agreedRate")}
              </span>
              <span className="rates-surcharge-tile__amount text-amount-success">
                <span className="rates-surcharge-amount__currency">{contract.currency}</span>
                {formatAmount(contract.oceanFreight)}
              </span>
            </div>
            <div className="rates-surcharge-tile rates-surcharge-tile--charges">
              <span className="rates-surcharge-tile__label">
                {t("contract.columns.subjectToCharges")}
              </span>
              <span className="rates-surcharge-tile__amount text-amount-warning">
                <span className="rates-surcharge-amount__currency">{contract.currency}</span>
                {formatAmount(contract.subjectToChargesAmount)}
              </span>
            </div>
          </div>
        </section>

        {/* Surcharge lines */}
        <section className="rates-surcharge-section">
          <div className="rates-surcharge-section__head">
            <Title level={5} className="rates-surcharge-section__title">
              {t("contractSurcharge.linesTitle")}
            </Title>
            <Tag className="rates-surcharge-section__count">
              {t("contractSurcharge.lineCount", { count: surcharges.length })}
            </Tag>
          </div>

          {surcharges.length === 0 ? (
            <div className="rates-empty rates-surcharge-empty">
              <AppIcon icon={Icons.inbox} size={28} />
              <Text type="secondary" className="rates-empty__text">
                {t("contractSurcharge.noSurcharges")}
              </Text>
            </div>
          ) : (
            <div className="responsive-table-wrap custom-scroll rates-surcharge-table-wrap">
              <Table<SurchargeDTO>
                className="rates-surcharge-table"
                dataSource={surcharges}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                scroll={{ x: 640 }}
                summary={() => (
                  <Table.Summary fixed>
                    {totals.map((row, index) => (
                      <Table.Summary.Row
                        key={row.currency}
                        className="rates-surcharge-table__total"
                      >
                        <Table.Summary.Cell index={0} colSpan={3}>
                          <Text strong>
                            {index === 0 ? t("contractSurcharge.total") : ""}
                          </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="right">
                          <Text strong className="rates-amount rates-surcharge-amount rates-surcharge-amount--primary">
                            <span className="rates-surcharge-amount__currency">
                              {row.currency}
                            </span>
                            {formatAmount(row.total)}
                          </Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    ))}
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
