// Modified by Sekar Nagarajan (2026-08-25 12:10)
import { AppButton, AppDrawer, FormattedDate } from '@solverminds/shared-ui';
import { Alert, Space, Spin, Table, Tag, Tooltip, Typography } from 'antd';

import { AppIcon, Icons } from '../../../components/icons';
import { formatModuleScreenTitle, MODULE_TITLES } from '../../../constants/module-titles';
import { useCRODetailQuery, useCRODownloadMutation } from '../api/cro.queries';
import { getCROReleaseStatusColor } from '../types/cro.types';

const { Text, Title } = Typography;

interface CRODetailsProps {
  croNo: string;
  onClose: () => void;
}

function parsePortLabel(value: string) {
  const parts = value.split(' - ');
  if (parts.length < 2) {
    return { code: value, name: value };
  }
  return {
    code: parts[0]?.trim() || value,
    name: parts.slice(1).join(' - ').trim() || value,
  };
}

export function CRODetails({ croNo, onClose }: CRODetailsProps) {
  const { data: croData, isLoading } = useCRODetailQuery(croNo);
  const { mutate: downloadDoc, isPending: isDownloading } = useCRODownloadMutation();

  if (!isLoading && !croData) return null;

  const originPort = parsePortLabel(croData?.loadPort || '');
  const deliveryPort = parsePortLabel(croData?.dischargePort || '');
  const isPrinted = croData?.printStatus === 'Y';
  const showOriginName = originPort.name !== originPort.code;
  const showDeliveryName = deliveryPort.name !== deliveryPort.code;
  const eligibility = croData?.eligibility;
  const alertType = eligibility?.eligible ? 'success' : 'warning';

  return (
    <AppDrawer
      title={formatModuleScreenTitle(MODULE_TITLES.containerReleaseOrder, croNo)}
      open={true}
      onClose={onClose}
      dialogSize="md"
      styles={{ body: { overflowY: 'auto' } }}
      extra={
        <Space>
          <Tooltip title="Coming in P2">
            <AppButton type="default" disabled>
              Generate
            </AppButton>
          </Tooltip>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
            loading={isDownloading}
            disabled={!croData}
            onClick={() => downloadDoc(croNo)}
          >
            Print
          </AppButton>
        </Space>
      }
    >
      <Spin spinning={isLoading}>
        <div className="cro-drawer-body custom-scroll">
          {eligibility ? (
            <Alert
              type={alertType}
              showIcon
              message={
                eligibility.eligible
                  ? 'Eligible for empty container release'
                  : 'Release blocked'
              }
              description={
                eligibility.reasons.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {eligibility.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : null
              }
            />
          ) : null}

          <div className="cro-route-strip">
            <div className="cro-route-port cro-route-port--origin">
              <div className="cro-route-port__label">
                <AppIcon icon={Icons.mapPin} size={14} tone="track" />
                Load Port
              </div>
              <Title level={4} className="cro-route-port__code cro-route-port__code--origin">
                {originPort.code || '—'}
              </Title>
              {showOriginName ? (
                <Text className="cro-route-port__name">{originPort.name}</Text>
              ) : null}
            </div>

            <div className="cro-route-connector">
              <span className="cro-route-connector__label">Port to Port</span>
              <div className="cro-route-connector__line">
                <span className="cro-route-connector__dot cro-route-connector__dot--origin" />
                <span className="cro-route-connector__track" />
                <AppIcon icon={Icons.arrowRight} size={14} tone="navigate" />
                <span className="cro-route-connector__track" />
                <span className="cro-route-connector__dot cro-route-connector__dot--delivery" />
              </div>
              <AppIcon icon={Icons.ship} size={16} />
            </div>

            <div className="cro-route-port cro-route-port--delivery">
              <div className="cro-route-port__label">
                <AppIcon icon={Icons.mapPin} size={14} tone="track" />
                Discharge
              </div>
              <Title level={4} className="cro-route-port__code cro-route-port__code--delivery">
                {deliveryPort.code || '—'}
              </Title>
              {showDeliveryName ? (
                <Text className="cro-route-port__name">{deliveryPort.name}</Text>
              ) : null}
            </div>
          </div>

          <div className="cro-meta-grid">
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Release No</span>
              <span className="cro-meta-item__value">{croData?.croNo || '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Booking No</span>
              <span className="cro-meta-item__value">{croData?.bookingNo || '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">CRO Date</span>
              <span className="cro-meta-item__value">
                {croData?.croDate ? <FormattedDate value={croData.croDate} /> : '—'}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">CRO Validity</span>
              <span className="cro-meta-item__value">
                {croData?.validTo ? <FormattedDate value={croData.validTo} /> : '—'}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Vessel</span>
              <span className="cro-meta-item__value">{croData?.vessel || '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Voyage</span>
              <span className="cro-meta-item__value">{croData?.voyage || '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Cont Type</span>
              <span className="cro-meta-item__value">{croData?.eqpType || '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Empty Release Depot</span>
              <span className="cro-meta-item__value">{croData?.emptyReleaseDepot || '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Qty Booked</span>
              <span className="cro-meta-item__value">{croData?.qtyBooked ?? '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Qty Released</span>
              <span className="cro-meta-item__value">{croData?.qtyReleased ?? '—'}</span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Release Status</span>
              <span className="cro-meta-item__value">
                {croData ? (
                  <Tag
                    className="cro-status-tag"
                    color={getCROReleaseStatusColor(croData.releaseStatus)}
                  >
                    {croData.releaseStatus}
                  </Tag>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className="cro-meta-item">
              <span className="cro-meta-item__label">Print Status</span>
              <span className="cro-meta-item__value">
                <Tag className="cro-status-tag" color={isPrinted ? 'success' : 'default'}>
                  {isPrinted ? 'Printed' : 'Not Printed'}
                </Tag>
              </span>
            </div>
          </div>

          <Table
            className="cro-containers-table"
            size="small"
            pagination={false}
            rowKey="containerNo"
            dataSource={croData?.containers ?? []}
            columns={[
              { title: 'Container No', dataIndex: 'containerNo', key: 'containerNo' },
              { title: 'Size/Type', dataIndex: 'eqpSize', key: 'eqpSize', width: 120 },
              { title: 'Seal No', dataIndex: 'sealNo', key: 'sealNo', width: 120 },
            ]}
            locale={{ emptyText: 'No containers on this release' }}
          />
        </div>
      </Spin>
    </AppDrawer>
  );
}
