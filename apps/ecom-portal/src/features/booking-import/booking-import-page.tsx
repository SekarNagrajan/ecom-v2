// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { useModuleTitles } from "../../i18n/use-module-titles";
import { SpreadsheetImportWorkbench } from "../import-workbench/components/spreadsheet-import-workbench";
import type {
  SpreadsheetImportCommitResult,
  SpreadsheetImportValidateResult,
} from "../import-workbench/types/import-workbench.types";
import { readExcelFileEngine } from "../import-workbench/utils/read-excel-file-engine";
import { createBookingImportAdapter } from "./booking-import.adapter";
import { BookingImportModuleStyles } from "./components/booking-import-module-styles";
import {
  useCommitImportBookings,
  useDryRunImportBookings,
} from "./hooks/use-import-bookings";
import type {
  BookingImportPayload,
  BulkBookingImportResult,
} from "./types/booking-import.types";

function toValidateResult(
  result: BulkBookingImportResult,
): SpreadsheetImportValidateResult {
  return {
    errors: result.errors.map((error) => ({
      rowNumber: error.rowNumber,
      message: error.message,
    })),
  };
}

function toCommitResult(
  result: BulkBookingImportResult,
): SpreadsheetImportCommitResult {
  return {
    totalRows: result.totalRows,
    successCount: result.successCount,
    failedCount: result.failedCount,
    created: result.created.map((entry) => ({
      rowNumber: entry.rowNumber,
      uuid: entry.bookingReference,
    })),
    errors: result.errors.map((error) => ({
      rowNumber: error.rowNumber,
      message: error.message,
    })),
  };
}

export function BookingImportPage() {
  const { t, i18n } = useTranslation(["booking-import", "common", "modules"]);
  const MODULE_TITLES = useModuleTitles();
  const navigate = useNavigate();
  const toast = useToast();
  const { mutateAsync: dryRunImportBookings } = useDryRunImportBookings();
  const { mutateAsync: commitImportBookings } = useCommitImportBookings();
  const adapter = useMemo(
    () => createBookingImportAdapter(t),
    [t, i18n.language],
  );

  const handleCancel = () => {
    void navigate({ to: "/app/booking" });
  };

  const handleValidate = async (payloads: BookingImportPayload[]) => {
    const result = await dryRunImportBookings(payloads);
    return toValidateResult(result);
  };

  const handleCommit = async (payloads: BookingImportPayload[]) => {
    const result = await commitImportBookings(payloads);
    if (result.failedCount === 0) {
      toast.success(
        t("toasts.importSuccess", { count: result.successCount }),
      );
      void navigate({ to: "/app/booking" });
    } else if (result.successCount > 0) {
      toast.warning(
        t("toasts.importPartial", {
          successCount: result.successCount,
          totalRows: result.totalRows,
        }),
      );
    }
    return toCommitResult(result);
  };

  return (
    <FeaturePageShell>
      <BookingImportModuleStyles />
      <Card
        className="feature-page-card booking-import-page-card"
        bordered={false}
      >
        <div className="booking-import-page">
          <SpreadsheetImportWorkbench
            adapter={adapter}
            engine={readExcelFileEngine}
            onCancel={handleCancel}
            onValidate={handleValidate}
            onCommit={handleCommit}
            title={MODULE_TITLES.bookingImport}
            subtitle={t("subtitle")}
          />
        </div>
      </Card>
    </FeaturePageShell>
  );
}
