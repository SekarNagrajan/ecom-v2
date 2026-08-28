// Modified by Sekar Nagarajan (2026-08-28 12:56)
import { BlCargoExtensions } from "../../bill-of-lading/components/bl-cargo-extensions";
import { useSiWizardConfigQuery } from "../hooks/use-si-wizard-config";
import type { SIWizardStepProps } from "../types/si.types";
import { CargoLinesEditor } from "./cargo-lines-editor";

export function CargoStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: SIWizardStepProps) {
  const { data: config } = useSiWizardConfigQuery();

  return (
    <CargoLinesEditor
      containers={data.containers}
      // Modified by Sekar Nagarajan (2026-08-28 12:56) — SOC / reefer / OOG (SIBLCommonCargo.jsp)
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
    />
  );
}
