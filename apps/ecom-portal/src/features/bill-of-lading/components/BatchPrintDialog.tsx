// Modified by Sekar Nagarajan (2026-09-29 12:50)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { Table, Tag, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import type { BLListDTO } from "../types/bl.types";
import {
  getBLStatusColor,
  getBLStatusLabel,
  isBatchOriginalPrintEligible,
} from "../utils/bl-status";

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
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const eligible = rows.filter(isBatchOriginalPrintEligible);
  const [selected, setSelected] = useState<string[]>([]);

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  return (
    <AppDrawer
      title={t("drawers.batchOriginalPrint")}
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
            {t("actions.printSelected", { count: selected.length })}
          </AppButton>
        </div>
      }
    >
      <div className="bl-batch-print-intro">
        <Text type="secondary">{t("batchPrint.intro")}</Text>
        <Tag color="blue">
          {t("batchPrint.eligibleCount", { count: eligible.length })}
        </Tag>
      </div>

      {eligible.length === 0 ? (
        <ModuleEmptyState
          variant="blank"
          title={t("empty.batchPrintTitle")}
          message={t("empty.batchPrintMessage")}
          artSize="sm"
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
              {
                title: t("columns.blNo"),
                dataIndex: "blNo",
                key: "blNo",
                width: 140,
              },
              {
                title: t("columns.bookingNo"),
                dataIndex: "bookingNo",
                key: "bookingNo",
                width: 140,
              },
              {
                title: t("columns.status"),
                dataIndex: "status",
                key: "status",
                width: 120,
                render: (status: BLListDTO["status"]) => (
                  <Tag
                    className="bl-status-tag"
                    color={getBLStatusColor(status)}
                  >
                    {getBLStatusLabel(status, t)}
                  </Tag>
                ),
              },
              {
                title: t("columns.route"),
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
