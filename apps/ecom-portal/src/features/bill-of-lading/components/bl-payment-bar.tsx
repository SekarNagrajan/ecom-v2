// Created by Sekar Nagarajan (2026-08-28 11:50)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, InputNumber, Space, Typography } from "antd";
import { useMemo, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import { createBLPaymentIntent } from "../api/bl.api";
import type { BLListDTO } from "../types/bl.types";

const { Text } = Typography;

interface BlPaymentBarProps {
  rows: BLListDTO[];
  selectedBlNos: string[];
  onSelectionChange: (blNos: string[]) => void;
  enabled?: boolean;
}

export function BlPaymentBar({
  rows,
  selectedBlNos,
  onSelectionChange,
  enabled = true,
}: BlPaymentBarProps) {
  const toast = useToast();
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedBlNos.includes(r.blNo)),
    [rows, selectedBlNos],
  );

  const defaultAmount = useMemo(
    () =>
      selectedRows.reduce((sum, r) => sum + (r.payAmountUsd ?? 0), 0) || null,
    [selectedRows],
  );

  const displayAmount = amountUsd ?? defaultAmount ?? 0;

  const sameAgency =
    selectedRows.length <= 1 ||
    selectedRows.every(
      (r) => r.issueAgency === selectedRows[0]?.issueAgency,
    );

  const handlePay = async () => {
    if (selectedBlNos.length === 0) {
      toast.error("Select at least one B/L for payment");
      return;
    }
    if (!sameAgency) {
      toast.error("Selected B/Ls must belong to the same issuing agency");
      return;
    }
    setPaying(true);
    try {
      const res = await createBLPaymentIntent(selectedBlNos, displayAmount);
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(
        `Mock payment intent created (${res.data?.clientSecret?.slice(0, 20)}…)`,
      );
      onSelectionChange([]);
    } finally {
      setPaying(false);
    }
  };

  if (!enabled || selectedBlNos.length === 0) return null;

  return (
    <Card size="small" className="bl-payment-bar">
      <Space wrap align="center">
        <AppIcon icon={Icons.creditCard} size={18} />
        <Text strong>{selectedBlNos.length} B/L(s) selected</Text>
        <InputNumber
          min={0}
          prefix="$"
          value={displayAmount}
          onChange={(val) => setAmountUsd(Number(val ?? 0))}
        />
        <AppButton type="primary" loading={paying} onClick={handlePay}>
          Pay with Stripe (Mock)
        </AppButton>
        {!sameAgency ? (
          <Text type="danger">Mixed agencies — payment not allowed</Text>
        ) : null}
      </Space>
    </Card>
  );
}
