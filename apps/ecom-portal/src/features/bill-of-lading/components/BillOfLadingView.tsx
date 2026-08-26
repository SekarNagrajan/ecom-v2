// Modified by Sekar Nagarajan (2026-08-26 13:04)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Row, Space, Table, Tag, Typography } from 'antd';

import { Icons } from '../../../components/icons';
import { ModuleScreenHeader } from '../../../components/shared/module-screen-header';
import { RESPONSIVE_COL } from '../../../constants/responsive-grid';
import { MODULE_TITLES, WIZARD_STEP_TITLES, formatModuleScreenTitle } from '../../../constants/module-titles';
import type { BLDTO } from '../types/bl.types';
import { BL_STATUS_LABELS } from '../types/bl.types';
import { getBLStatusColor } from '../utils/bl-status';
import { BlLoadingCenter } from './bl-loading-center';

const { Title, Text } = Typography;

const TIMELINE_STEPS: Array<{ key: BLDTO['status']; label: string }> = [
  { key: 'D', label: BL_STATUS_LABELS.D },
  { key: 'S', label: BL_STATUS_LABELS.S },
  { key: 'C', label: BL_STATUS_LABELS.C },
  { key: 'I', label: BL_STATUS_LABELS.I },
];

interface BillOfLadingViewProps {
  detail: BLDTO | undefined;
  loading: boolean;
  onBack: () => void;
  onEdit?: () => void;
  onVerify?: () => void;
  onCancel?: () => void;
  onPrint?: (type: 'draft' | 'original' | 'nn') => void;
  onCharges?: () => void;
  extra?: React.ReactNode;
}

export function BillOfLadingView({
  detail,
  loading,
  onBack,
  onEdit,
  onVerify,
  onCancel,
  onPrint,
  onCharges,
  extra,
}: BillOfLadingViewProps) {
  if (loading) {
    return <BlLoadingCenter fill />;
  }

  if (!detail) {
    return <Text type="danger">B/L not found.</Text>;
  }

  const statusIndex = TIMELINE_STEPS.findIndex((s) => s.key === detail.status);

  return (
    <Space direction="vertical" size="large" className="feature-page-stack">
      <Card className="feature-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={Icons.fileCheck}
          title={formatModuleScreenTitle(MODULE_TITLES.billOfLading, detail.blNo)}
          marginBottom={0}
          extra={
            <Space wrap>
              {onCharges ? <AppButton onClick={onCharges}>Charges</AppButton> : null}
              {onPrint && detail.status !== 'I' ? (
                <AppButton onClick={() => onPrint('draft')}>Draft Print</AppButton>
              ) : null}
              {onPrint && detail.status === 'C' && detail.printCount > 0 ? (
                <AppButton type="primary" onClick={() => onPrint('original')}>
                  Original Print
                </AppButton>
              ) : null}
              {onVerify && detail.status === 'D' ? (
                <AppButton type="primary" onClick={onVerify}>
                  Accept
                </AppButton>
              ) : null}
              {onCancel && detail.status === 'S' ? (
                <AppButton danger onClick={onCancel}>
                  Cancel
                </AppButton>
              ) : null}
              {onEdit && detail.status !== 'I' ? (
                <AppButton onClick={onEdit}>Edit</AppButton>
              ) : null}
              {extra}
              <AppButton onClick={onBack}>Back</AppButton>
            </Space>
          }
        />
        <div className="bl-view-timeline">
          {TIMELINE_STEPS.map((step, index) => (
            <span
              key={step.key}
              className={[
                'bl-view-timeline__step',
                index < statusIndex ? 'is-done' : undefined,
                index === statusIndex ? 'is-current' : undefined,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {step.label}
            </span>
          ))}
        </div>
        <Tag className="bl-status-tag" color={getBLStatusColor(detail.status)}>
          {BL_STATUS_LABELS[detail.status]}
        </Tag>
      </Card>

      <Card className="feature-page-card" title={<Title level={5}>{WIZARD_STEP_TITLES.masterDetails}</Title>} size="small">
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Booking Number</Text>
            <Text strong>{detail.bookingNo}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">SI Number</Text>
            <Text strong>{detail.siNo}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">B/L Type</Text>
            <Text strong>{detail.blType}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Release Type</Text>
            <Text strong>{detail.releaseType === 'O' ? 'Original' : 'Telex'}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Freight Option</Text>
            <Text strong>{detail.freightOption}</Text>
          </Col>
          <Col {...RESPONSIVE_COL.formThird}>
            <Text className="form-field-label">Route</Text>
            <Text strong>
              {detail.origin} → {detail.delivery}
            </Text>
          </Col>
        </Row>
      </Card>

      <Card className="feature-page-card" title={<Title level={5}>Parties</Title>} size="small">
        <Row gutter={[24, 24]}>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">SHIPPER</Text>
              <Text strong>{detail.parties.shipper.name}</Text>
              <Text>{detail.parties.shipper.address}</Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">
                CONSIGNEE{' '}
                {detail.parties.consignee.toOrder ? <Text type="warning">(TO ORDER)</Text> : null}
              </Text>
              <Text strong>{detail.parties.consignee.name}</Text>
              <Text>{detail.parties.consignee.address}</Text>
            </div>
          </Col>
          <Col {...RESPONSIVE_COL.third}>
            <div className="bl-party-block">
              <Text className="form-field-label">NOTIFY PARTY</Text>
              <Text strong>{detail.parties.notify.name}</Text>
              <Text>{detail.parties.notify.address}</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="feature-page-card" title={<Title level={5}>Cargo & Containers</Title>} size="small">
        {detail.containers.map((c, i) => (
          <div key={c.id} className="bl-container-block">
            <div className="bl-container-block__header">
              <Text strong>
                Container {i + 1}: {c.containerNo} ({c.eqpSize})
              </Text>
            </div>
            <div className="responsive-table-wrap custom-scroll">
              <Table
                size="small"
                dataSource={c.cargoLines}
                rowKey="id"
                pagination={false}
                bordered
                scroll={{ x: 640 }}
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
    </Space>
  );
}
