// Modified by Sekar Nagarajan (2026-08-28 12:22)
import { Card } from "antd";

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
  isSubmitting,
}: BLWizardStepProps) {
  const { data: config } = useBLWizardConfig();

  return (
    <div className="form-step-layout">
      {config?.showExcelImport ? (
        <Card size="small" className="form-step-card form-step-section">
          <BlExcelImport
            blNo={data.blNo}
            containerCount={data.containers.length}
            onImported={(containers) => onUpdate({ containers })}
          />
        </Card>
      ) : null}

      <CargoLinesEditor
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
        isSubmitting={isSubmitting}
        showCancel
      />
    </div>
  );
}
