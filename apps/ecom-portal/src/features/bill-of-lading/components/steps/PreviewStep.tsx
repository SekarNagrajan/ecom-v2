// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Descriptions, Table, Typography } from 'antd';

import { MODULE_TITLES, WIZARD_STEP_TITLES } from '../../../../constants/module-titles';
import type { BLWizardStepProps } from './MasterDetailsStep';

const { Title, Text } = Typography;

export function PreviewStep({
  data,
  onPrevious,
  onSubmit,
  onCancel,
  isSubmitting,
}: BLWizardStepProps) {
  return (
    <div className="form-step-layout">
      <div className="custom-scroll form-step-scroll">
        <Title level={4} className="form-step-card-title form-step-summary-title">
          {MODULE_TITLES.billOfLadingSummary}
        </Title>

        <Card
          className="form-step-card form-step-section"
          title={<Title level={5} className="form-step-card-title">{WIZARD_STEP_TITLES.masterDetails}</Title>}
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="B/L Number">{data.blNo}</Descriptions.Item>
            <Descriptions.Item label="Booking Number">{data.bookingNo}</Descriptions.Item>
            <Descriptions.Item label="B/L Type">{data.blType}</Descriptions.Item>
            <Descriptions.Item label="Release Type">{data.releaseType}</Descriptions.Item>
            <Descriptions.Item label="Freight Option">{data.freightOption}</Descriptions.Item>
            <Descriptions.Item label="SI Number">{data.siNo || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          className="form-step-card form-step-section"
          title={<Title level={5} className="form-step-card-title">Parties</Title>}
        >
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="Shipper">
              <div className="bl-party-block">
                <Text strong>{data.parties.shipper.name}</Text>
                <Text>{data.parties.shipper.address}</Text>
                <Text>
                  {data.parties.shipper.city}, {data.parties.shipper.country}
                </Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item
              label={
                <>
                  Consignee
                  {data.parties.consignee.toOrder ? (
                    <Text type="warning"> (To Order)</Text>
                  ) : null}
                </>
              }
            >
              <div className="bl-party-block">
                <Text strong>{data.parties.consignee.name}</Text>
                <Text>{data.parties.consignee.address}</Text>
                <Text>
                  {data.parties.consignee.city}, {data.parties.consignee.country}
                </Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Notify Party">
              <div className="bl-party-block">
                <Text strong>{data.parties.notify.name}</Text>
                <Text>{data.parties.notify.address}</Text>
                <Text>
                  {data.parties.notify.city}, {data.parties.notify.country}
                </Text>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card
          className="form-step-card form-step-section"
          title={<Title level={5} className="form-step-card-title">Cargo & Containers</Title>}
        >
          {data.containers.map((c, i) => (
            <div key={c.id} className="bl-container-block">
              <div className="bl-container-block__header">
                <Text strong>
                  Container {i + 1}: {c.containerNo} ({c.eqpSize})
                </Text>
                <div>
                  <Text type="secondary">
                    Carrier Seal: <Text strong>{c.carrierSeal || 'N/A'}</Text>
                  </Text>
                  {' · '}
                  <Text type="secondary">
                    Shipper Seal: <Text strong>{c.shipperSeal || 'N/A'}</Text>
                  </Text>
                </div>
              </div>
              <div className="responsive-table-wrap custom-scroll">
                <Table
                  size="small"
                  dataSource={c.cargoLines}
                  rowKey="id"
                  pagination={false}
                  bordered
                  columns={[
                    { title: 'Marks & Numbers', dataIndex: 'marksAndNumbers', key: 'marksAndNumbers' },
                    { title: 'Description', dataIndex: 'description', key: 'description' },
                    {
                      title: 'Packages',
                      key: 'packages',
                      render: (_, record) => `${record.packageCount} ${record.packageType}`,
                    },
                    { title: 'Gross Wt (KG)', dataIndex: 'grossWeight', key: 'grossWeight' },
                  ]}
                />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="form-step-footer form-step-footer--split">
        <div className="form-step-footer__start custom-scroll">
          <AppButton onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </AppButton>
          <AppButton onClick={onPrevious} disabled={isSubmitting}>
            Previous
          </AppButton>
        </div>
        <AppButton type="primary" onClick={onSubmit} loading={isSubmitting}>
          Submit B/L
        </AppButton>
      </div>
    </div>
  );
}
