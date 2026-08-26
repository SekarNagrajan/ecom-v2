// Modified by Sekar Nagarajan (2026-08-26 14:17)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Empty, Table, Tag, Typography } from "antd";
import { useState } from "react";

import type { BLListDTO } from "../types/bl.types";
import { BL_STATUS_LABELS } from "../types/bl.types";
import { isBatchOriginalPrintEligible } from "../utils/bl-status";

const { Text } = Typography;

interface BatchPrintDialogProps {
  open: boolean;
  rows: BLListDTO[];
  onClose: () => void;
  onPrint: (blNos: string[]) => void;
  printing?: boolean;
}

export function BatchPrintDialog({
  open,
  rows,
  onClose,
  onPrint,
  printing = false,
}: BatchPrintDialogProps) {
  const eligible = rows.filter(isBatchOriginalPrintEligible);
  const [selected, setSelected] = useState<string[]>([]);

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  return (
    <AppDrawer
      title="Batch Original Print"
      open={open}
      onClose={handleClose}
      width={880}
      destroyOnClose
      classNames={{ body: "bl-drawer-body custom-scroll" }}
      footer={
        <div className="bl-drawer-footer">
          <AppButton
            type="primary"
            loading={printing}
            disabled={selected.length === 0}
            onClick={() => {
              onPrint(selected);
              setSelected([]);
            }}
          >
            Print Selected ({selected.length})
          </AppButton>
        </div>
      }
    >
      <div className="bl-batch-print-intro">
        <Text type="secondary">
          Select confirmed B/Ls that are eligible for original print. Locked or
          unprinted drafts are excluded.
        </Text>
        <Tag color="blue">{eligible.length} eligible</Tag>
      </div>

      {eligible.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No confirmed B/Ls eligible for batch original print."
        />
      ) : (
        <div className="responsive-table-wrap custom-scroll">
          <Table<BLListDTO>
            rowKey="blNo"
            size="middle"
            pagination={false}
            dataSource={eligible}
            scroll={{ y: 420 }}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: (keys) => setSelected(keys as string[]),
            }}
            columns={[
              { title: "B/L No", dataIndex: "blNo", key: "blNo", width: 140 },
              {
                title: "Booking No",
                dataIndex: "bookingNo",
                key: "bookingNo",
                width: 140,
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (status: BLListDTO["status"]) => (
                  <Tag>{BL_STATUS_LABELS[status]}</Tag>
                ),
              },
              {
                title: "Route",
                key: "route",
                render: (_, row) => (
                  <Text>
                    {row.origin} → {row.delivery}
                  </Text>
                ),
              },
            ]}
          />
        </div>
      )}
    </AppDrawer>
  );
}
