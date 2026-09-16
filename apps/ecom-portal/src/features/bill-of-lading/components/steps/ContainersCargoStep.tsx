// Modified by Sekar Nagarajan (2026-09-16 15:12)
import { CargoLinesEditor } from "../../../shipping-instruction/components/cargo-lines-editor";
import { useBLWizardConfig } from "../../hooks/use-bl-wizard-config";
import { BlCargoExtensions } from "../bl-cargo-extensions";
import { BlExcelImport } from "../bl-excel-import";
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
  // Remount editor when container ids change (Excel import replaces draft
  // containers). RHF defaultValues alone do not pick up external updates.
  const cargoEditorKey =
    data.containers.map((container) => container.id).join(":") || "empty";

  return (
    <div className="form-step-layout">
      {config?.showExcelImport ? (
        <div className="form-step-toolbar cargo-excel-import-toolbar">
          <BlExcelImport
            blNo={data.blNo}
            containerCount={data.containers.length}
            onImported={(containers) => onUpdate({ containers })}
          />
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
