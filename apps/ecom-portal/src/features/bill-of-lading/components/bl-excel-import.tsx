// Modified by Sekar Nagarajan (2026-09-16 15:12)
import {
  CargoExcelImport,
  type CargoExcelDocumentKind,
} from "../../shipping-instruction/components/cargo-excel-import";
import type { SIContainer } from "../../shipping-instruction/types/si.types";

interface BlExcelImportProps {
  blNo: string;
  containerCount?: number;
  onImported?: (containers: SIContainer[]) => void;
}

/** B/L cargo Excel toolbar — shared SI CargoExcelImport. */
export function BlExcelImport({
  blNo,
  containerCount = 0,
  onImported,
}: BlExcelImportProps) {
  return (
    <CargoExcelImport
      documentNo={blNo}
      documentKind={"B/L" satisfies CargoExcelDocumentKind}
      containerCount={containerCount}
      onImported={onImported}
    />
  );
}
