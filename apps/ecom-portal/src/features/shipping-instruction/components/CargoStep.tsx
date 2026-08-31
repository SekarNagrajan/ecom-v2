// Modified by Sekar Nagarajan (2026-08-28 17:03)
import type { SIWizardStepProps } from "../types/si.types";
import { CargoLinesEditor } from "./cargo-lines-editor";

export function CargoStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: SIWizardStepProps) {
  return (
    <CargoLinesEditor
      containers={data.containers}
      onNext={(containers) => {
        onUpdate({ containers });
        onNext();
      }}
      onPrevious={onPrevious}
      isSubmitting={isSubmitting}
    />
  );
}
