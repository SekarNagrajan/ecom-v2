// Modified by Sekar Nagarajan (2026-09-16 16:17)
import { CargoLinesEditor } from "../../../shipping-instruction/components/cargo-lines-editor";
import { useBLWizardConfig } from "../../hooks/use-bl-wizard-config";
import { BlCargoExtensions } from "../bl-cargo-extensions";
import { BlExcelImport } from "../bl-excel-import";
import { BlSmartImport } from "../bl-smart-import";
import type { BLWizardStepProps } from "./MasterDetailsStep";

export function ContainersCargoStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  onCancel,
  isSubmitting,
}: BLWizardStepProps) {
  const { data: config } = useBLWizardConfig();
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
              <BlExcelImport
                blNo={data.blNo}
                containerCount={data.containers.length}
                onImported={(containers) => onUpdate({ containers })}
              />
            ) : null}
            {showSmart ? (
              <BlSmartImport
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
        renderContainerFooter={(container, index) => (
          <BlCargoExtensions
            container={container}
            enableOog={config?.enableOogDetails}
            onChange={(patch) => {
              const next = data.containers.map((c, i) =>
                i === index ? { ...c, ...patch } : c,
              );
              onUpdate({ containers: next });
            }}
          />
        )}
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
