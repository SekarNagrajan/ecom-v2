// Modified by Sekar Nagarajan (2026-08-26 16:15)
import { AppDrawer, FormattedDate } from "@solverminds/shared-ui";
import { Descriptions, Tag } from "antd";

import { Icons } from "../../../components/icons";
import { MODULE_TITLES } from "../../../constants/module-titles";
import type { QuoteItem } from "../types/user-modules.types";
import { UmPanelHeader } from "./um-panel-header";

const STATUS_META: Record<
  QuoteItem["status"],
  { color: string; label: string }
> = {
  QUOTED: { color: "blue", label: "Quoted" },
  ACCEPTED: { color: "green", label: "Accepted" },
  PENDING_REVIEW: { color: "gold", label: "Pending Review" },
  EXPIRED: { color: "red", label: "Expired" },
};

function formatUsd(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })} USD`;
}

export interface QuotesViewDrawerProps {
  quote: QuoteItem | null;
  onClose: () => void;
}

export function QuotesViewDrawer({ quote, onClose }: QuotesViewDrawerProps) {
  const statusMeta = quote ? STATUS_META[quote.status] : null;

  return (
    <AppDrawer
      open={Boolean(quote)}
      onClose={onClose}
      placement="right"
      dialogSize="md"
      destroyOnClose
      classNames={{
        header: "um-drawer-header-bar",
        body: "um-drawer-body custom-scroll",
        footer: "um-drawer-footer-bar",
      }}
      styles={{ body: { padding: 0 } }}
      title={
        <UmPanelHeader
          icon={Icons.fileText}
          title={MODULE_TITLES.quotes}
          description="Quote details for this trade lane, equipment, and validity."
          compact
        />
      }
    >
      {quote && statusMeta ? (
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          className="um-quote-desc"
        >
          <Descriptions.Item label="Quote No">
            {quote.quoteNo}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Port of Loading">
            {quote.polCode} — {quote.polName}
          </Descriptions.Item>
          <Descriptions.Item label="Port of Discharge">
            {quote.podCode} — {quote.podName}
          </Descriptions.Item>
          <Descriptions.Item label="Equipment">
            {quote.equipmentType}
          </Descriptions.Item>
          <Descriptions.Item label="Commodity">
            {quote.commodity}
          </Descriptions.Item>
          <Descriptions.Item label="Valid From">
            <FormattedDate value={quote.validFrom} />
          </Descriptions.Item>
          <Descriptions.Item label="Valid Until">
            <FormattedDate value={quote.validTo} />
          </Descriptions.Item>
          <Descriptions.Item label="Ocean Freight">
            <span className="um-amount-primary">
              {formatUsd(quote.oceanFreightUSD)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="THC">
            {formatUsd(quote.thcUSD)}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount" span={2}>
            <span className="um-amount-primary">
              {formatUsd(quote.totalAmountUSD)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Created" span={2}>
            <FormattedDate value={quote.createdAt} showTime />
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </AppDrawer>
  );
}
