// Created by Sekar Nagarajan (2026-08-24 14:46)
import { PrinterOutlined } from '@ant-design/icons';
import { AppDrawer } from '@solverminds/shared-ui';
import { Button, Descriptions, Space, Tag, Typography, theme } from 'antd';
import { FormattedDate } from '@solverminds/shared-ui';
import { useDOSummaryQuery, useDODownloadMutation } from '../api/delivery-order.queries';
import { useMemo } from 'react';

const { Text } = Typography;

interface DeliveryOrderDetailsProps {
  delOrdNo: string;
  onClose: () => void;
}

export function DeliveryOrderDetails({ delOrdNo, onClose }: DeliveryOrderDetailsProps) {
  const { token } = theme.useToken();

  // We read from the cache (or refetch if missing) for the details
  const { data: rows = [] } = useDOSummaryQuery();
  const doData = useMemo(() => rows.find(r => r.delordno === delOrdNo), [rows, delOrdNo]);

  const { mutate: downloadDoc, isPending: isDownloading } = useDODownloadMutation();

  if (!doData) return null;

  return (
    <AppDrawer
      title={`Delivery Order: ${delOrdNo}`}
      open={true}
      onClose={onClose}
      dialogSize="lg"
      extra={
        <Space>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            loading={isDownloading}
            onClick={() => downloadDoc(delOrdNo)}
          >
            Print
          </Button>
        </Space>
      }
    >
      <div style={{ padding: 16 }}>
        <Descriptions bordered column={1} size="small" labelStyle={{ width: 200, background: token.colorBgLayout }}>
          <Descriptions.Item label="DO No">
            <Text strong>{doData.delordno}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="DO Date">
            {doData.delorddate ? <FormattedDate value={doData.delorddate} /> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="B/L Number">
            {doData.blnumber}
          </Descriptions.Item>
          <Descriptions.Item label="Vessel">
            {doData.vessel}
          </Descriptions.Item>
          <Descriptions.Item label="Voyage">
            {doData.voyage}
          </Descriptions.Item>
          <Descriptions.Item label="Bound">
            {doData.bound}
          </Descriptions.Item>
          <Descriptions.Item label="Port of Loading">
            {doData.loadport}
          </Descriptions.Item>
          <Descriptions.Item label="Port of Discharge">
            {doData.dischargeport}
          </Descriptions.Item>
          <Descriptions.Item label="Terminal">
            {doData.terminal}
          </Descriptions.Item>
          <Descriptions.Item label="Arrival Date">
            {doData.arrdate ? <FormattedDate value={doData.arrdate} /> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Valid Till">
            {doData.dovaliditydate ? <FormattedDate value={doData.dovaliditydate} /> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Print Status">
            {doData.printstatus === 'Y' ? (
              <Tag color="success" style={{ margin: 0 }}>Printed</Tag>
            ) : (
              <Tag color="default" style={{ margin: 0 }}>Not Printed</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </AppDrawer>
  );
}
