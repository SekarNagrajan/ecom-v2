// Modified by Sekar Nagarajan (2026-08-25 11:50)
import { Table, Typography } from 'antd';

import type { BLChargesDTO } from '../types/bl.types';

const { Text, Title } = Typography;

interface BillOfLadingChargesProps {
  charges: BLChargesDTO | undefined;
  loading: boolean;
}

export function BillOfLadingCharges({ charges, loading }: BillOfLadingChargesProps) {
  if (loading) {
    return <Text type="secondary">Loading charge summary…</Text>;
  }

  if (!charges || charges.lines.length === 0) {
    return <Text type="secondary">No charges available for this B/L.</Text>;
  }

  return (
    <div className="bl-charges-panel">
      <Title level={5}>Charge Summary — {charges.blNo}</Title>
      <Table
        size="small"
        bordered
        pagination={false}
        loading={loading}
        rowKey="chargeCode"
        dataSource={charges.lines}
        scroll={{ y: 360 }}
        columns={[
          { title: 'Code', dataIndex: 'chargeCode', width: 80 },
          { title: 'Description', dataIndex: 'description' },
          {
            title: 'Amount',
            key: 'amount',
            render: (_, row) => `${row.currency} ${row.amount.toFixed(2)}`,
          },
          { title: 'P/C', dataIndex: 'prepaidCollect', width: 100 },
        ]}
      />
      {charges.totals.map((total) => (
        <div key={total.currency} className="bl-charges-total-row">
          <Text>
            Totals ({total.currency}): Prepaid {total.prepaid.toFixed(2)} · Collect{' '}
            {total.collect.toFixed(2)} · Grand {total.grandTotal.toFixed(2)}
          </Text>
        </div>
      ))}
    </div>
  );
}
