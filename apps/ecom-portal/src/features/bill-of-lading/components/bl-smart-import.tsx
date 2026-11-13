// Created by Sekar Nagarajan (2026-09-16 16:17)
import { CargoSmartImport } from "../../shipping-instruction/components/cargo-smart-import";
import type { SIContainer } from "../../shipping-instruction/types/si.types";

interface BlSmartImportProps {
  containers: SIContainer[];
  onApplied?: (containers: SIContainer[]) => void;
}

/** B/L cargo Smart Import — shared SI CargoSmartImport. */
export function BlSmartImport({ containers, onApplied }: BlSmartImportProps) {
  return (
    <CargoSmartImport containers={containers} onApplied={onApplied} />
  );
}
