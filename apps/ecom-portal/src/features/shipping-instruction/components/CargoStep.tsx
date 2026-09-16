// Modified by Sekar Nagarajan (2026-09-16 15:32)
import type { SIWizardStepProps } from "../types/si.types";
import { useSiWizardConfigQuery } from "../hooks/use-si-wizard-config";
import { CargoExcelImport } from "./cargo-excel-import";
import { CargoLinesEditor } from "./cargo-lines-editor";
import { CargoSmartImport } from "./cargo-smart-import";

export function CargoStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onCancel,
  isSubmitting,
}: SIWizardStepProps) {
  const { data: config } = useSiWizardConfigQuery();
  // Remount editor when container / cargo-line ids change (Excel replace or
  // Smart Import update). RHF defaultValues alone do not pick up external updates.
  const cargoEditorKey =
    data.containers
      .map(
        (container) =>
          `${container.id}:${container.containerNo}:${container.cargoLines
            .map((line) => line.id)
            .join(",")}`,
      )
      .join("|") || "empty";

  const showExcel = Boolean(config?.showExcelImport);
  const showSmart = Boolean(config?.showSmartImport);

  return (
    <div className="form-step-layout">
      {showExcel || showSmart ? (
        <div className="form-step-toolbar cargo-excel-import-toolbar">
          <div className="cargo-excel-import">
            {showExcel ? (
              <CargoExcelImport
                documentNo={data.siNo ?? data.bookingNo}
                documentKind="SI"
                containerCount={data.containers.length}
                onImported={(containers) => onUpdate({ containers })}
              />
            ) : null}
            {showSmart ? (
              <CargoSmartImport
                containers={data.containers}
                onApplied={(containers) => onUpdate({ containers })}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <CargoLinesEditor
        key={cargoEditorKey}
        containers={data.containers}
        onNext={(containers) => {
          onUpdate({ containers });
          onNext();
        }}
        onPrevious={onPrevious}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        showCancel
      />
    </div>
  );
}
