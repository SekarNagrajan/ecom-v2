// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { AppDrawer } from "@solverminds/shared-ui";
import { Table, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import type { ContractDTO, SurchargeDTO } from "../types/rates.types";

const { Text } = Typography;

interface ContractSurchargeModalProps {
  contract: ContractDTO | null;
  open: boolean;
  onClose: () => void;
}

export function ContractSurchargeModal({
  contract,
  open,
  onClose,
}: ContractSurchargeModalProps) {
  const { t } = useTranslation(["rates", "common", "modules"]);

  if (!contract) return null;

  const columns = [
    {
      title: t("surchargeView.columns.chargeCode"),
      dataIndex: "chargeCode",
      key: "chargeCode",
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: t("surchargeView.columns.chargeName"),
      dataIndex: "chargeName",
      key: "chargeName",
    },
    {
      title: t("tariff.columns.currency"),
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: t("tariff.columns.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (val: number, record: SurchargeDTO) => (
        <Text strong className="text-amount-error rates-amount">
          {record.currency} ${val.toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <AppDrawer
      title={t("contractSurcharge.title", {
        contractNo: contract.contractNo,
      })}
      open={open}
      onClose={onClose}
      width={600}
      classNames={{ body: "rates-drawer-body custom-scroll" }}
    >
      <div className="rates-stack">
        <div className="rates-drawer-meta">
          <Text type="secondary">
            {t("contractSurcharge.customer", {
              name: contract.customerName,
              code: contract.customerCode,
            })}
          </Text>
          <Text type="secondary">
            {t("contractSurcharge.route", {
              originName: contract.originPortName,
              origin: contract.originPort,
              deliveryName: contract.deliveryPortName,
              delivery: contract.deliveryPort,
            })}
          </Text>
        </div>

        <div className="responsive-table-wrap custom-scroll">
          <Table
            dataSource={contract.surcharges}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </div>
      </div>
    </AppDrawer>
  );
}
