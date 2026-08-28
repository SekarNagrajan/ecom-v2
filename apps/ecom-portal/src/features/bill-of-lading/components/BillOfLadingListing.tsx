// Modified by Sekar Nagarajan (2026-08-28 11:55)
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useNavigate } from "@tanstack/react-router";
import type { RowDoubleClickedEvent, SelectionChangedEvent } from "ag-grid-community";
import { Space, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons, NavIcons } from "../../../components/icons";
import { ModuleScreenHeader } from "../../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../../constants/module-titles";
import {
  useBLBatchPrintMutation,
  useBLCancelMutation,
  useBLChargesQuery,
  useBLListQuery,
  useBLPrintMutation,
  useBLVerifyMutation,
} from "../api/bl.queries";
import { useBLWizardConfig } from "../hooks/use-bl-wizard-config";
import type { BLListDTO, BLPrintType } from "../types/bl.types";
import { canOpenBlWizard } from "../utils/bl-status";
import { BatchPrintDialog } from "./BatchPrintDialog";
import { BillOfLadingCharges } from "./BillOfLadingCharges";
import { BillOfLadingListGrid } from "./BillOfLadingListGrid";
import { BlPaymentBar } from "./bl-payment-bar";
import { ManifestDrawer } from "./ManifestDrawer";
import { BlViewDrawer } from "./view/BlViewDrawer";

const { Text } = Typography;

export function BillOfLadingListing() {
  const navigate = useNavigate();
  const { data, isLoading } = useBLListQuery({});
  const { data: config } = useBLWizardConfig();
  const rows = data?.rows ?? [];

  const [selectedRecord, setSelectedRecord] = useState<BLListDTO | null>(null);
  const [selectedBlNos, setSelectedBlNos] = useState<string[]>([]);
  const [chargesBlNo, setChargesBlNo] = useState<string | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [manifestMcnId, setManifestMcnId] = useState<string | null>(null);
  const [manifestBlNo, setManifestBlNo] = useState<string | null>(null);
  const [manifestOpen, setManifestOpen] = useState(false);

  const { mutate: printBl, isPending: printing } = useBLPrintMutation();
  const { mutate: batchPrint, isPending: batchPrinting } =
    useBLBatchPrintMutation();
  const { mutate: verifyBl } = useBLVerifyMutation();
  const { mutate: cancelBl } = useBLCancelMutation();

  const { data: charges, isLoading: chargesLoading } = useBLChargesQuery(
    chargesBlNo ?? "",
    Boolean(chargesBlNo),
  );

  const handlePrint = (blNo: string, type: BLPrintType) => {
    const row = rows.find((r) => r.blNo === blNo);
    printBl({ blNo, type, appVersion: row?.appVersion });
  };

  const openManifest = (blNo: string, mcnNo: string | null) => {
    setManifestBlNo(blNo);
    setManifestMcnId(mcnNo);
    setManifestOpen(true);
  };

  const handleView = (blNo: string) => {
    const row = rows.find((r) => r.blNo === blNo);
    if (row) {
      setSelectedRecord(row);
      return;
    }
    navigate({ to: `/app/bl/${blNo}` });
  };

  const handleRowDoubleClick = (event: RowDoubleClickedEvent<BLListDTO>) => {
    const record = event.data;
    if (!record) return;
    if (canOpenBlWizard(record) && record.status === "D") {
      navigate({ to: `/app/bl/${record.blNo}/edit` });
      return;
    }
    setSelectedRecord(record);
  };

  const handleSelectionChanged = (event: SelectionChangedEvent<BLListDTO>) => {
    const selected = event.api.getSelectedRows().map((r) => r.blNo);
    setSelectedBlNos(selected);
  };

  return (
    <div className="bl-page-layout">
      <div className="bl-page-header">
        <ModuleScreenHeader
          icon={NavIcons.billOfLading}
          title={MODULE_TITLES.billOfLading}
          subtitle="Review B/L status, verify drafts, and print transport documents."
          marginBottom={0}
        />
        <div className="bl-toolbar custom-scroll">
          <Space>
            <AppButton
              icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
              onClick={() => setBatchOpen(true)}
            >
              Batch Original Print
            </AppButton>
            <AppButton onClick={() => navigate({ to: "/app/bl/batch-print" })}>
              Batch Print Page
            </AppButton>
          </Space>
        </div>
      </div>

      <BlPaymentBar
        rows={rows}
        selectedBlNos={selectedBlNos}
        onSelectionChange={setSelectedBlNos}
        enabled={config?.enableStripePayment}
      />

      <BillOfLadingListGrid
        rows={rows}
        loading={isLoading}
        hideAgencyRefColumn={config?.hideAgencyRefColumn}
        showChargeSummary={config?.showChargeSummary}
        showNnPrint={config?.showNnPrint}
        showReadyToConfirm={config?.showReadyToConfirm}
        enableTermsOnConfirmedEdit={config?.enableTermsOnConfirmedEdit}
        rowSelection={config?.enableStripePayment ? "multiple" : undefined}
        onSelectionChanged={handleSelectionChanged}
        onView={handleView}
        onEdit={(blNo) => navigate({ to: `/app/bl/${blNo}/edit` })}
        onPrint={handlePrint}
        onVerify={(blNo) => verifyBl(blNo)}
        onCancel={(blNo) => cancelBl(blNo)}
        onCharges={setChargesBlNo}
        onManifest={openManifest}
        onRowDoubleClicked={handleRowDoubleClick}
      />

      {config?.showNonRatedBlMsg ? (
        <Text type="secondary" className="bl-list-footnote">
          * Non-rated B/L charges may differ from final invoice.
        </Text>
      ) : null}

      {selectedRecord ? (
        <BlViewDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      ) : null}

      <AppDrawer
        title="B/L Charge Summary"
        open={Boolean(chargesBlNo)}
        onClose={() => setChargesBlNo(null)}
        width={720}
        destroyOnClose
        classNames={{ body: "bl-drawer-body custom-scroll" }}
      >
        <BillOfLadingCharges charges={charges} loading={chargesLoading} />
      </AppDrawer>

      <ManifestDrawer
        open={manifestOpen}
        mcnId={manifestMcnId}
        blNo={manifestBlNo}
        onClose={() => {
          setManifestOpen(false);
          setManifestMcnId(null);
          setManifestBlNo(null);
        }}
      />

      <BatchPrintDialog
        open={batchOpen}
        rows={rows}
        onClose={() => setBatchOpen(false)}
        printing={batchPrinting || printing}
        onPrint={(blNos) => {
          batchPrint(blNos);
          setBatchOpen(false);
        }}
      />
    </div>
  );
}
