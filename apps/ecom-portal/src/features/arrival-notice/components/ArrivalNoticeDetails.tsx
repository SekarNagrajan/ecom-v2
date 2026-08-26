// Modified by Sekar Nagarajan (2026-08-25 12:20)
import { AppButton, AppDrawer, FormattedDate } from '@solverminds/shared-ui';
import { Space, Spin, Table, Tag, Typography } from 'antd';

import { AppIcon, Icons } from '../../../components/icons';
import { formatModuleScreenTitle, MODULE_TITLES } from '../../../constants/module-titles';
import {
  useArrivalNoticeDetailQuery,
  useArrivalNoticeDownloadMutation,
} from '../api/arrival-notice.queries';
import {
  ARN_PRINT_STATUS_LABELS,
  formatArrivalNoticeAmount,
  getArrivalNoticePrintStatusColor,
  type ArrivalNoticeChargeLine,
} from '../types/arrival-notice.types';

const { Text, Title } = Typography;

interface ArrivalNoticeDetailsProps {
  anNo: string;
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

export function ArrivalNoticeDetails({ anNo, onClose }: ArrivalNoticeDetailsProps) {
  const { data: arnData, isLoading } = useArrivalNoticeDetailQuery(anNo);
  const { mutate: downloadDoc, isPending: isDownloading } = useArrivalNoticeDownloadMutation();

  if (!isLoading && !arnData) return null;

  const dischargePort = parsePortLabel(arnData?.dischargePort || '');
  const isPrinted = arnData?.printStatus === 'Y';
  const showDischargeName = dischargePort.name !== dischargePort.code;
  const chargeLines = arnData?.chargeLines ?? [];
  const freeTime = arnData?.freeTime;

  return (
    <AppDrawer
      title={formatModuleScreenTitle(MODULE_TITLES.arrivalNotice, anNo)}
      open={true}
      onClose={onClose}
      dialogSize="md"
      styles={{ body: { overflowY: 'auto' } }}
      extra={
        <Space>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
            loading={isDownloading}
            disabled={!arnData}
            onClick={() => downloadDoc(anNo)}
          >
            Print
          </AppButton>
        </Space>
      }
    >
      <Spin spinning={isLoading}>
        <div className="arn-drawer-body custom-scroll">
          <div className="arn-route-strip">
            <div className="arn-route-port arn-route-port--vessel">
              <div className="arn-route-port__label">
                <AppIcon icon={Icons.ship} size={14} />
                Vessel / Voyage
              </div>
              <Title level={4} className="arn-route-port__code arn-route-port__code--vessel">
                {arnData?.vessel || '—'}
              </Title>
              <Text className="arn-route-port__name">{arnData?.voyage || '—'}</Text>
            </div>

            <div className="arn-route-connector">
              <span className="arn-route-connector__label">Arriving</span>
              <div className="arn-route-connector__line">
                <span className="arn-route-connector__dot arn-route-connector__dot--vessel" />
                <span className="arn-route-connector__track" />
                <AppIcon icon={Icons.arrowRight} size={14} tone="navigate" />
                <span className="arn-route-connector__track" />
                <span className="arn-route-connector__dot arn-route-connector__dot--discharge" />
              </div>
              <AppIcon icon={Icons.bell} size={16} />
            </div>

            <div className="arn-route-port arn-route-port--discharge">
              <div className="arn-route-port__label">
                <AppIcon icon={Icons.mapPin} size={14} tone="track" />
                Discharge
              </div>
              <Title level={4} className="arn-route-port__code arn-route-port__code--discharge">
                {dischargePort.code || '—'}
              </Title>
              {showDischargeName ? (
                <Text className="arn-route-port__name">{dischargePort.name}</Text>
              ) : null}
            </div>
          </div>

          <div className="arn-meta-grid">
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">AN No</span>
              <span className="arn-meta-item__value">{arnData?.anNo || '—'}</span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">B/L Number</span>
              <span className="arn-meta-item__value">{arnData?.blNumber || '—'}</span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">ETA</span>
              <span className="arn-meta-item__value">
                {arnData?.etaDate ? <FormattedDate value={arnData.etaDate} /> : '—'}
              </span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">Arrival Date</span>
              <span className="arn-meta-item__value">
                {arnData?.arrivalDate ? <FormattedDate value={arnData.arrivalDate} /> : '—'}
              </span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">Terminal</span>
              <span className="arn-meta-item__value">{arnData?.terminal || '—'}</span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">Consignee</span>
              <span className="arn-meta-item__value">{arnData?.consignee || '—'}</span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">Notify Party</span>
              <span className="arn-meta-item__value">{arnData?.notifyParty || '—'}</span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">Manifest / IGM</span>
              <span className="arn-meta-item__value">
                {arnData?.manifestRef || arnData?.igmNo || '—'}
              </span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">Charges Due</span>
              <span className="arn-meta-item__value">
                {arnData && arnData.chargesDue > 0
                  ? formatArrivalNoticeAmount(arnData.chargesDue, arnData.currency)
                  : '—'}
              </span>
            </div>
            <div className="arn-meta-item">
              <span className="arn-meta-item__label">Print Status</span>
              <span className="arn-meta-item__value">
                {arnData ? (
                  <Tag
                    className="arn-status-tag"
                    color={getArrivalNoticePrintStatusColor(arnData.printStatus)}
                  >
                    {ARN_PRINT_STATUS_LABELS[arnData.printStatus]}
                  </Tag>
                ) : (
                  '—'
                )}
              </span>
            </div>
          </div>

          {freeTime ? (
            <div className="arn-free-time-card">
              <span className="arn-free-time-card__title">Free Time</span>
              <div className="arn-free-time-card__grid">
                <div className="arn-meta-item">
                  <span className="arn-meta-item__label">Free Days</span>
                  <span className="arn-meta-item__value">{freeTime.days}</span>
                </div>
                <div className="arn-meta-item">
                  <span className="arn-meta-item__label">Last Free Day</span>
                  <span className="arn-meta-item__value">
                    <FormattedDate value={freeTime.lastFreeDay} />
                  </span>
                </div>
                {arnData?.demurrageFrom ? (
                  <div className="arn-meta-item">
                    <span className="arn-meta-item__label">Demurrage From</span>
                    <span className="arn-meta-item__value">
                      <FormattedDate value={arnData.demurrageFrom} />
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {chargeLines.length > 0 ? (
            <div>
              <Title level={5} className="arn-section-title">
                Charges
              </Title>
              <Table<ArrivalNoticeChargeLine>
                className="arn-charges-table"
                size="small"
                pagination={false}
                rowKey={(row) => `${row.chargeCode}-${row.description}`}
                dataSource={chargeLines}
                columns={[
                  { title: 'Code', dataIndex: 'chargeCode', key: 'chargeCode', width: 100 },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                  {
                    title: 'Amount',
                    key: 'amount',
                    width: 140,
                    render: (_value, row) =>
                      formatArrivalNoticeAmount(row.amount, row.currency),
                  },
                ]}
              />
            </div>
          ) : null}

          <div>
            <Title level={5} className="arn-section-title">
              Containers
            </Title>
            <Table
              className="arn-containers-table"
              size="small"
              pagination={false}
              rowKey="containerNo"
              dataSource={arnData?.containers ?? []}
              columns={[
                { title: 'Container No', dataIndex: 'containerNo', key: 'containerNo' },
                { title: 'Size/Type', dataIndex: 'eqpSize', key: 'eqpSize', width: 120 },
                { title: 'Seal No', dataIndex: 'sealNo', key: 'sealNo', width: 120 },
              ]}
              locale={{ emptyText: 'No containers on this notice' }}
            />
          </div>
        </div>
      </Spin>
    </AppDrawer>
  );
}
