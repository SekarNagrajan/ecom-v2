// Modified by Sekar Nagarajan (2026-09-01 16:05)
import { AppButton } from "@solverminds/shared-ui";
import { Card, Table, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { BookingRateOption } from "../api/booking.api";

const { Text } = Typography;

interface BookingSelectedRatePanelProps {
  rates: BookingRateOption[];
  selectedRate: BookingRateOption | null;
  loading: boolean;
  selecting: boolean;
  onSelect: (rate: BookingRateOption) => void;
  onChange: () => void;
}

function formatRateAmount(rate: BookingRateOption): string {
  return `${rate.amount.toLocaleString()} ${rate.currency}`;
}

export function BookingSelectedRatePanel({
  rates,
  selectedRate,
  loading,
  selecting,
  onSelect,
  onChange,
}: BookingSelectedRatePanelProps) {
  if (selectedRate) {
    return (
      <Card
        size="small"
        title="Rate"
        className="form-step-card form-step-section booking-selected-rate-panel"
        extra={
          <AppButton
            size="small"
            icon={<AppIcon icon={Icons.refreshCw} size={14} />}
            onClick={onChange}
          >
            Change
          </AppButton>
        }
      >
        <dl className="booking-selected-rate-panel__fields">
          <div className="booking-selected-rate-panel__field">
            <Text
              type="secondary"
              className="booking-selected-rate-panel__label"
            >
              Rate No
            </Text>
            <Text strong className="booking-selected-rate-panel__value">
              {selectedRate.rateNo}
            </Text>
          </div>
          <div className="booking-selected-rate-panel__field">
            <Text
              type="secondary"
              className="booking-selected-rate-panel__label"
            >
              Equipment
            </Text>
            <Text strong className="booking-selected-rate-panel__value">
              {selectedRate.eqpType}
            </Text>
          </div>
          <div className="booking-selected-rate-panel__field">
            <Text
              type="secondary"
              className="booking-selected-rate-panel__label"
            >
              Amount
            </Text>
            <Text strong className="booking-selected-rate-panel__value">
              {formatRateAmount(selectedRate)}
            </Text>
          </div>
        </dl>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title="Available Rates"
      className="form-step-card form-step-section booking-selected-rate-panel booking-selected-rate-panel--table"
    >
      <div className="booking-rates-table custom-scroll">
        <Table
          size="small"
          rowKey={(r) => `${r.rateNo}-${r.itemNo}-${r.amdNo}`}
          loading={loading}
          pagination={false}
          dataSource={rates}
          columns={[
            { title: "Rate No", dataIndex: "rateNo" },
            {
              title: "Equipment",
              dataIndex: "eqpType",
              width: 140,
            },
            {
              title: "Amount",
              key: "amount",
              width: 140,
              render: (_: unknown, row: BookingRateOption) =>
                formatRateAmount(row),
            },
            {
              title: "",
              key: "select",
              width: 110,
              render: (_: unknown, row: BookingRateOption) => (
                <AppButton
                  type="primary"
                  size="small"
                  loading={selecting}
                  disabled={selecting}
                  onClick={() => void onSelect(row)}
                >
                  Select
                </AppButton>
              ),
            },
          ]}
          locale={{ emptyText: "No rates for this lane" }}
        />
      </div>
    </Card>
  );
}
