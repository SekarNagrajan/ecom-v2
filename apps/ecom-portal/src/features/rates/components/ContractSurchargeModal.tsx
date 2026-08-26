// Modified by Sekar Nagarajan (2026-08-25 19:25)
import { AppDrawer } from "@solverminds/shared-ui";
import { Table, Tag, Typography } from "antd";

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
  if (!contract) return null;

  const columns = [
    {
      title: "Charge Code",
      dataIndex: "chargeCode",
      key: "chargeCode",
      render: (code: string) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: "Charge Name",
      dataIndex: "chargeName",
      key: "chargeName",
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
    },
    {
      title: "Amount",
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
      title={`Included Surcharges for Contract ${contract.contractNo}`}
      open={open}
      onClose={onClose}
      width={600}
      classNames={{ body: "rates-drawer-body custom-scroll" }}
    >
      <div className="rates-stack">
        <div className="rates-drawer-meta">
          <Text type="secondary">
            Customer: <Text strong>{contract.customerName}</Text> (
            {contract.customerCode})
          </Text>
          <Text type="secondary">
            Route:{" "}
            <Text strong>
              {contract.originPortName} ({contract.originPort}) →{" "}
              {contract.deliveryPortName} ({contract.deliveryPort})
            </Text>
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
